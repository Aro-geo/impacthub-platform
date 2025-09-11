/**
 * JWT Configuration for Supabase Authentication
 * This file contains JWT verification settings and public keys
 */

export const jwtConfig = {
  // Discovery URL for fetching JSON Web Key Set (JWKS)
  discoveryUrl: 'https://otxttowidmshxzzfxpdu.supabase.co/auth/v1/.well-known/jwks.json',
  
  // JWT Key ID for this Supabase project
  keyId: 'ea850cb6-6488-49dc-8a38-c8121457ba54',
  
  // Public key for JWT verification (JSON Web Key format)
  publicKey: {
    "x": "UHfi96E-Mf8_pO8Mnc-_FmKk68d6AN7o3Pww2-W1o7s",
    "y": "5KfP0xY6zeP-1EukVW6627QB-gDEjF1lk_tMJUb7hXU",
    "alg": "ES256",
    "crv": "P-256",
    "ext": true,
    "kid": "ea850cb6-6488-49dc-8a38-c8121457ba54",
    "kty": "EC",
    "key_ops": [
      "verify"
    ]
  },
  
  // JWT Algorithm used by Supabase
  algorithm: 'ES256',
  
  // Curve type for elliptic curve cryptography
  curve: 'P-256'
};

/**
 * Fetch the current JWKS from Supabase
 * This can be used to verify JWT tokens server-side
 */
export const fetchJWKS = async (): Promise<any> => {
  try {
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