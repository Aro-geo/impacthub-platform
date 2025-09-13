/**
 * JWT Configuration for Supabase Authentication
 * This file contains JWT verification settings and public keys
 */

// NOTE: All values now sourced from environment to avoid hard-coding project identifiers.
// Provide minimal safe fallbacks for local dev only (non-secret). Do NOT commit real keys.
export const jwtConfig = {
  // Discovery URL for JWKS (public) – constructed from Supabase URL if provided
  discoveryUrl: `${import.meta.env.VITE_SUPABASE_URL || ''}/auth/v1/.well-known/jwks.json`,
  // Key ID (public identifier) – optional
  keyId: import.meta.env.VITE_SUPABASE_JWT_KID || undefined,
  // Public key (JWK) optionally injected for offline verification caching
  publicKey: (() => {
    try {
      const raw = import.meta.env.VITE_SUPABASE_JWT_JWK;
      if (raw) return JSON.parse(raw);
    } catch (e) {
      console.warn('[jwtConfig] Failed to parse VITE_SUPABASE_JWT_JWK');
    }
    return undefined; // Will fetch dynamically
  })(),
  algorithm: 'ES256',
  curve: 'P-256'
};

/**
 * Fetch the current JWKS from Supabase
 * This can be used to verify JWT tokens server-side
 */
export const fetchJWKS = async (): Promise<any> => {
  try {
    if (!jwtConfig.discoveryUrl) {
      throw new Error('JWKS discovery URL is not configured. Set VITE_SUPABASE_URL.');
    }
    const response = await fetch(jwtConfig.discoveryUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch JWKS: ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching JWKS:', error);
    throw error;
  }
};

/**
 * Verify JWT token using the public key
 * Note: This is a basic structure - you'd need a proper JWT library for actual verification
 */
export const verifyJWTToken = async (token: string): Promise<boolean> => {
  try {
    // In a real implementation, you would use a JWT library like jsonwebtoken
    // to verify the token against the public key
    console.log('JWT verification would happen here with token:', token.substring(0, 20) + '...');
    
    // Fetch current JWKS to ensure we have the latest keys
    const jwks = await fetchJWKS();
    console.log('JWKS fetched successfully:', jwks);
    
    return true; // Placeholder - implement actual verification
  } catch (error) {
    console.error('JWT verification failed:', error);
    return false;
  }
};

export default jwtConfig;