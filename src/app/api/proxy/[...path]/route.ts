import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

// Get the actual API base URL from environment
// Prefer API_BASE_URL (server-side only, not exposed to client) over NEXT_PUBLIC_API_BASE_URL
const EXTERNAL_API_BASE_URL = process.env.API_BASE_URL || process.env.NEXT_PUBLIC_API_BASE_URL || '';

if (!EXTERNAL_API_BASE_URL) {
  console.warn('Warning: API_BASE_URL or NEXT_PUBLIC_API_BASE_URL environment variable is not set. API proxy may not work correctly.');
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const resolvedParams = await params;
  return handleRequest(request, resolvedParams, 'GET');
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const resolvedParams = await params;
  return handleRequest(request, resolvedParams, 'POST');
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const resolvedParams = await params;
  return handleRequest(request, resolvedParams, 'PUT');
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const resolvedParams = await params;
  return handleRequest(request, resolvedParams, 'PATCH');
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const resolvedParams = await params;
  return handleRequest(request, resolvedParams, 'DELETE');
}

async function handleRequest(
  request: NextRequest,
  params: { path: string[] },
  method: string
) {
  try {
    // Reconstruct the API path
    const path = params.path.join('/');
    const targetUrl = `${EXTERNAL_API_BASE_URL}/${path}`;

    // Get query parameters
    const searchParams = request.nextUrl.searchParams;
    const queryString = searchParams.toString();
    const fullUrl = queryString ? `${targetUrl}?${queryString}` : targetUrl;

    // Get headers from the request
    const headers: Record<string, string> = {};
    
    // Forward authorization header if present
    const authHeader = request.headers.get('authorization');
    if (authHeader) {
      headers['Authorization'] = authHeader;
    }

    // Forward content-type if present
    const contentType = request.headers.get('content-type');
    if (contentType) {
      headers['Content-Type'] = contentType;
    }

    // Forward cookies
    const cookie = request.headers.get('cookie');
    if (cookie) {
      headers['Cookie'] = cookie;
    }

    // Get request body for POST, PUT, PATCH
    let body: any = undefined;
    if (['POST', 'PUT', 'PATCH'].includes(method)) {
      try {
        const contentType = request.headers.get('content-type');
        if (contentType?.includes('application/json')) {
          body = await request.json();
        } else if (contentType?.includes('multipart/form-data')) {
          // For form data, we need to handle it differently
          const formData = await request.formData();
          body = formData;
        } else {
          body = await request.text();
        }
      } catch (e) {
        // Body might be empty
        body = undefined;
      }
    }

    // Make the request to the external API
    const response = await axios({
      method: method as any,
      url: fullUrl,
      data: body,
      headers,
      withCredentials: true,
      responseType: 'arraybuffer', // Handle both JSON and binary responses
      validateStatus: () => true, // Don't throw on any status code
    });

    // Get response content type
    const responseContentType = response.headers['content-type'] || 'application/json';
    
    // Check if response is binary
    const isBinary = responseContentType.includes('application/pdf') || 
                     responseContentType.includes('application/octet-stream') ||
                     responseContentType.includes('image/') ||
                     responseContentType.includes('video/') ||
                     responseContentType.includes('audio/');

    // Create Next.js response with appropriate format
    let nextResponse: NextResponse;
    
    if (isBinary) {
      // For binary data, return as ArrayBuffer/Buffer
      nextResponse = new NextResponse(response.data, {
        status: response.status,
        headers: {
          'content-type': responseContentType,
        },
      });
    } else if (responseContentType.includes('application/json')) {
      // For JSON, parse and return as JSON
      try {
        const responseText = Buffer.from(response.data).toString('utf-8');
        // Check if response body is empty
        if (!responseText || responseText.trim().length === 0) {
          // Check if this is a success status (2xx) or error status
          const isSuccess = response.status >= 200 && response.status < 300;
          if (isSuccess) {
            // For successful requests with empty body, return null
            nextResponse = NextResponse.json({ success: true }, { status: response.status });
          } else {
            // For error statuses with empty body, return error object
            nextResponse = NextResponse.json(
              { 
                message: `Request failed with status ${response.status}`,
                error: `Request failed with status ${response.status}`
              },
              { status: response.status }
            );
          }
        } else {
          const responseData = JSON.parse(responseText);
          nextResponse = NextResponse.json(responseData, {
            status: response.status,
          });
        }
      } catch (parseError: any) {
        // Handle JSON parse errors (invalid JSON)
        console.error('JSON parse error in proxy:', parseError);
        const responseText = Buffer.from(response.data).toString('utf-8');
        const isSuccess = response.status >= 200 && response.status < 300;
        
        if (isSuccess) {
          // For successful requests with invalid JSON, return null (assume empty response)
          nextResponse = NextResponse.json(null, { status: response.status });
        } else {
          // For error statuses with invalid JSON, return error object
          nextResponse = NextResponse.json(
            { 
              message: parseError.message || 'Invalid JSON response from server',
              error: parseError.message || 'Invalid JSON response from server',
              rawResponse: responseText || '(empty)'
            },
            { status: response.status }
          );
        }
      }
    } else {
      // For text responses
      const responseData = Buffer.from(response.data).toString('utf-8');
      nextResponse = new NextResponse(responseData, {
        status: response.status,
        headers: {
          'content-type': responseContentType,
        },
      });
    }

    // Forward relevant response headers
    if (response.headers['set-cookie']) {
      const setCookieHeaders = Array.isArray(response.headers['set-cookie']) 
        ? response.headers['set-cookie'] 
        : [response.headers['set-cookie']];
      setCookieHeaders.forEach((cookie: string) => {
        nextResponse.headers.append('set-cookie', cookie);
      });
    }

    return nextResponse;
  } catch (error: any) {
    console.error('Proxy error:', error);
    
    // Return error response
    return NextResponse.json(
      { 
        message: error.message || 'Proxy request failed',
        error: error.response?.data || error.message 
      },
      { 
        status: error.response?.status || 500 
      }
    );
  }
}

