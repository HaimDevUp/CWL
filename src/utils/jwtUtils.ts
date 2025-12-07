/**
 * JWT utility functions for parsing tokens and extracting claims
 */

export interface JwtPayload {
  sub?: string;
  exp?: number;
  iat?: number;
  [key: string]: any;
}

/**
 * Decodes a JWT token and returns the payload
 * @param token - The JWT token to decode
 * @returns The decoded payload or null if invalid
 */
export function decodeJwtPayload(token: string): JwtPayload | null {
  try {
    // JWT tokens have 3 parts separated by dots: header.payload.signature
    const parts = token.split('.');
    
    if (parts.length !== 3) {
      console.error('Invalid JWT token format');
      return null;
    }

    // Decode the payload (second part)
    const payload = parts[1];
    
    // Add padding if needed for base64 decoding
    const paddedPayload = payload + '='.repeat((4 - payload.length % 4) % 4);
    
    // Decode from base64url
    const decodedPayload = atob(paddedPayload.replace(/-/g, '+').replace(/_/g, '/'));
    
    return JSON.parse(decodedPayload);
  } catch (error) {
    console.error('Error decoding JWT token:', error);
    return null;
  }
}

/**
 * Extracts the user ID from the 'sub' claim of a JWT token
 * @param token - The JWT access token
 * @returns The user ID from the 'sub' claim or null if not found
 */
export function getUserIdFromToken(token: string): string | null {
  const payload = decodeJwtPayload(token);
  return payload?.sub || null;
}

/**
 * Checks if a JWT token is expired
 * @param token - The JWT token to check
 * @returns True if the token is expired, false otherwise
 */
export function isTokenExpired(token: string): boolean {
  const payload = decodeJwtPayload(token);
  
  if (!payload?.exp) {
    return true; // Consider expired if no expiration claim
  }
  
  // exp is in seconds, Date.now() is in milliseconds
  const currentTime = Math.floor(Date.now() / 1000);
  return payload.exp < currentTime;
}
