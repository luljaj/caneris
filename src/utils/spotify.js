// Spotify API configuration
const CLIENT_ID = import.meta.env.VITE_SPOTIFY_CLIENT_ID
const REDIRECT_URI = import.meta.env.VITE_SPOTIFY_REDIRECT_URI || 'http://localhost:3000'
const SCOPES = [
  'user-top-read',
  'user-read-private',
  'user-read-email'
].join(' ')

const SPOTIFY_AUTH_URL = 'https://accounts.spotify.com/authorize'
const SPOTIFY_TOKEN_URL = 'https://accounts.spotify.com/api/token'
const SPOTIFY_API_BASE = 'https://api.spotify.com/v1'

/**
 * Generate a random string for PKCE code verifier
 */
function generateCodeVerifier(length = 64) {
  const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~'
  let verifier = ''
  for (let i = 0; i < length; i++) {
    verifier += possible.charAt(Math.floor(Math.random() * possible.length))
  }
  return verifier
}

/**
 * Generate SHA-256 hash and base64url encode it for PKCE code challenge
 */
async function generateCodeChallenge(verifier) {
  const encoder = new TextEncoder()
  const data = encoder.encode(verifier)
  const digest = await crypto.subtle.digest('SHA-256', data)
  
  // Base64url encode
  const base64 = btoa(String.fromCharCode(...new Uint8Array(digest)))
  return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

/**
 * Start OAuth flow with PKCE
 * Stores code verifier and redirects to Spotify
 */
export async function startAuthFlow() {
  const codeVerifier = generateCodeVerifier()
  const codeChallenge = await generateCodeChallenge(codeVerifier)
  
  // Store verifier for token exchange
  localStorage.setItem('spotify_code_verifier', codeVerifier)
  
  const params = new URLSearchParams({
    client_id: CLIENT_ID,
    response_type: 'code',
    redirect_uri: REDIRECT_URI,
    scope: SCOPES,
    code_challenge_method: 'S256',
    code_challenge: codeChallenge,
    show_dialog: 'true'
  })
  
  window.location.href = `${SPOTIFY_AUTH_URL}?${params.toString()}`
}

/**
 * Exchange authorization code for access token
 */
export async function exchangeCodeForToken(code) {
  const codeVerifier = localStorage.getItem('spotify_code_verifier')
  
  if (!codeVerifier) {
    throw new Error('No code verifier found. Please try logging in again.')
  }
  
  const response = await fetch(SPOTIFY_TOKEN_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: new URLSearchParams({
      client_id: CLIENT_ID,
      grant_type: 'authorization_code',
      code: code,
      redirect_uri: REDIRECT_URI,
      code_verifier: codeVerifier
    })
  })
  
  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error_description || 'Failed to exchange code for token')
  }
  
  const data = await response.json()
  
  // Clean up verifier
  localStorage.removeItem('spotify_code_verifier')
  
  return {
    accessToken: data.access_token,
    refreshToken: data.refresh_token,
    expiresIn: data.expires_in
  }
}

/**
 * Fetch user's top artists from Spotify API
 * @param {string} token - Spotify access token
 * @param {number} limit - Number of artists to fetch (max 50 per request)
 * @param {string} timeRange - Time range: short_term, medium_term, long_term
 */
export async function fetchTopArtists(token, limit = 50, timeRange = 'medium_term') {
  const response = await fetch(
    `${SPOTIFY_API_BASE}/me/top/artists?limit=${limit}&time_range=${timeRange}`,
    {
      headers: {
        Authorization: `Bearer ${token}`
      }
    }
  )
  
  if (!response.ok) {
    if (response.status === 401) {
      throw new Error('Session expired. Please login again.')
    }
    throw new Error('Failed to fetch top artists')
  }
  
  const data = await response.json()
  return data.items
}

/**
 * Fetch additional artists to get up to 200
 * Uses offset pagination
 */
export async function fetchAllTopArtists(token, total = 200, timeRange = 'medium_term') {
  const artists = []
  const limit = 50 // Spotify max per request
  const numBatches = Math.ceil(total / limit)
  
  for (let i = 0; i < numBatches; i++) {
    const offset = i * limit
    const response = await fetch(
      `${SPOTIFY_API_BASE}/me/top/artists?limit=${limit}&offset=${offset}&time_range=${timeRange}`,
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    )
    
    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('Session expired. Please login again.')
      }
      break // Stop if we hit an error
    }
    
    const data = await response.json()
    artists.push(...data.items)
    
    // Stop if we got fewer than requested (no more artists available)
    if (data.items.length < limit) {
      break
    }
  }
  
  return artists.slice(0, total)
}

/**
 * Fetch current user profile
 */
export async function fetchUserProfile(token) {
  const response = await fetch(`${SPOTIFY_API_BASE}/me`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  })
  
  if (!response.ok) {
    throw new Error('Failed to fetch user profile')
  }
  
  return response.json()
}

/**
 * Validate token is still valid
 */
export async function validateToken(token) {
  try {
    await fetchUserProfile(token)
    return true
  } catch {
    return false
  }
}
