import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';

// Use Next.js proxy route to hide external API calls from Network tab
// All requests will go through /api/proxy/* which forwards to the external API server-side
const baseURL = '/api/proxy';

export const backApiAxios = axios.create({
  baseURL,
  withCredentials: true,
});

// Single-flight refresh control to prevent concurrent refresh calls
let refreshPromise: Promise<{ accessToken: string; refreshToken?: string } | null> | null = null;

async function performTokenRefresh(): Promise<{ accessToken: string; refreshToken?: string } | null> {
  if (typeof window === 'undefined') return null;
  const storedRefreshToken = sessionStorage.getItem('refreshToken');
  if (!storedRefreshToken) return null;

  if (!refreshPromise) {
    refreshPromise = (async () => {
      try {
        // Call refresh endpoint directly via backApiAxios to avoid circular deps
        const res = await backApiAxios.post(
          '/api/v1/web/authorization/refresh',
          { refreshToken: storedRefreshToken },
          { headers: { 'Content-Type': 'application/json' } }
        );

        const newAccessToken: string | undefined = res?.data?.accessToken;
        const newRefreshToken: string | undefined = res?.data?.refreshToken;
        if (!newAccessToken) {
          return null;
        }

        sessionStorage.setItem('accessToken', newAccessToken);
        if (newRefreshToken) {
          sessionStorage.setItem('refreshToken', newRefreshToken);
        }

        return { accessToken: newAccessToken, refreshToken: newRefreshToken };
      } catch (e) {
        return null;
      } finally {
        // Reset after completion so future failures can retry refresh
        refreshPromise = null;
      }
    })();
  }

  return refreshPromise;
}

export type ApiCallOptions = AxiosRequestConfig & {
  body?: unknown;
};

function extractErrorMessage(errorData: any): string | undefined {
  // Check if errors object exists
  if (errorData?.errors && typeof errorData.errors === 'object') {
    // Iterate through all keys in errors object
    for (const key in errorData.errors) {
      const errorArray = errorData.errors[key];
      // Check if it's an array with at least one element
      if (Array.isArray(errorArray) && errorArray.length > 0) {
        // Return the first error message (assuming it's a string)
        const firstError = errorArray[0];
        if (typeof firstError === 'string') {
          return firstError;
        }
      }
    }
  }
  
  // Fall back to message field if no errors found
  return errorData?.message;
}

export async function apiCall<T>(endpoint: string, options: ApiCallOptions = {}): Promise<T> {
  try {
    const { body, headers, responseType, method, ...rest } = options;

    const defaultHeaders: Record<string, string> = body ? { 'Content-Type': 'application/json' } : {};
    
    // Add authorization header if access token exists in sessionStorage
    if (typeof window !== 'undefined') {
      const accessToken = sessionStorage.getItem('accessToken');
      if (accessToken) {
        defaultHeaders['Authorization'] = `Bearer ${accessToken}`;
      }
    }

    const response: AxiosResponse<T> = await backApiAxios({
      method: method || 'GET',
      url: endpoint,
      data: body,
      headers: { ...defaultHeaders, ...(headers as Record<string, string> | undefined) },
      responseType: (responseType as any) || 'json',
      ...rest,
    });

    // Handle empty responses (null or undefined) - return null for successful requests
    // This handles cases where server returns 200 with no body
    if (response.data === null || response.data === undefined) {
      return null as T;
    }

    return response.data;
  } catch (error: any) {
    console.log(error);
    if (axios.isAxiosError(error) && error.code === 'ERR_NETWORK') {
      throw 'No internet connection';
    }
    // On 401, try refresh once, then retry original request
    if (axios.isAxiosError(error) && error.response?.status === 401 && typeof window !== 'undefined') {
      const refreshed = await performTokenRefresh();
      if (refreshed?.accessToken) {
        // Retry original request with updated Authorization header
        const originalConfig: AxiosRequestConfig = (error.config ?? {}) as AxiosRequestConfig;
        const retryHeaders: Record<string, string> = {
          ...((originalConfig.headers as Record<string, string> | undefined) || {}),
          Authorization: `Bearer ${refreshed.accessToken}`,
        };
        const retryResponse: AxiosResponse<T> = await backApiAxios({
          ...originalConfig,
          method: (originalConfig.method as any) || (options.method as any) || 'GET',
          url: (originalConfig.url as string) || endpoint,
          data: originalConfig.data !== undefined ? originalConfig.data : options.body,
          responseType: (originalConfig.responseType as any) || (options.responseType as any) || 'json',
          headers: {
            ...((originalConfig.headers as Record<string, string> | undefined) || {}),
            ...retryHeaders,
          },
        });
        return retryResponse.data;
      }

      // Refresh failed → follow existing logic
      window.location.href = '/';
    }
    
    // Extract error message from errors object or fall back to message
    // Handle case where error.response?.data might be empty or invalid
    let errorMessage: string | undefined;
    try {
      errorMessage = extractErrorMessage(error.response?.data);
    } catch (e) {
      // If we can't extract error message, use a default
      errorMessage = error.response?.data?.message || error.message || 'An error occurred';
    }
    
    // If no error message found, provide a default based on status code
    if (!errorMessage) {
      if (error.response?.status === 500) {
        errorMessage = 'Server error occurred';
      } else if (error.response?.status) {
        errorMessage = `Request failed with status ${error.response.status}`;
      } else {
        errorMessage = 'An unexpected error occurred';
      }
    }
    
    throw errorMessage;
  }
}

// Convenience helpers for common verbs
export const api = {
  get: <T>(endpoint: string, config?: AxiosRequestConfig) => apiCall<T>(endpoint, { ...config, method: 'GET' }),
  getBlob: <T>(endpoint: string, config?: AxiosRequestConfig) => apiCall<Blob>(endpoint, { ...config, method: 'GET', responseType: 'blob' }),
  post: <T>(endpoint: string, body?: unknown, config?: AxiosRequestConfig) =>
    apiCall<T>(endpoint, { ...config, method: 'POST', body }),
  put: <T>(endpoint: string, body?: unknown, config?: AxiosRequestConfig) =>
    apiCall<T>(endpoint, { ...config, method: 'PUT', body }),
  patch: <T>(endpoint: string, body?: unknown, config?: AxiosRequestConfig) =>
    apiCall<T>(endpoint, { ...config, method: 'PATCH', body }),
  delete: <T>(endpoint: string, config?: AxiosRequestConfig) => apiCall<T>(endpoint, { ...config, method: 'DELETE' }),
};

export default api;


