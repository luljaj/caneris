import { useState, useEffect, useCallback } from 'react'
import { startAuthFlow, exchangeCodeForToken, validateToken } from '../utils/spotify'

const TOKEN_KEY = 'spotify_token'

export function useSpotifyAuth() {
  const [token, setToken] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  // Handle OAuth callback and token validation on mount
  useEffect(() => {
    const handleAuth = async () => {
      // Check for authorization code in URL (OAuth callback)
      const urlParams = new URLSearchParams(window.location.search)
      const code = urlParams.get('code')
      const error = urlParams.get('error')
      
      if (error) {
        console.error('OAuth error:', error)
        // Clear URL params
        window.history.replaceState({}, document.title, window.location.pathname)
        setIsLoading(false)
        return
      }
      
      if (code) {
        try {
          // Exchange code for token
          const { accessToken } = await exchangeCodeForToken(code)
          localStorage.setItem(TOKEN_KEY, accessToken)
          setToken(accessToken)
          
          // Clear URL params
          window.history.replaceState({}, document.title, window.location.pathname)
        } catch (err) {
          console.error('Token exchange failed:', err)
        }
        setIsLoading(false)
        return
      }
      
      // Check for existing token
      const storedToken = localStorage.getItem(TOKEN_KEY)
      
      if (storedToken) {
        const isValid = await validateToken(storedToken)
        
        if (isValid) {
          setToken(storedToken)
        } else {
          localStorage.removeItem(TOKEN_KEY)
        }
      }
      
      setIsLoading(false)
    }

    handleAuth()
  }, [])

  // Start Spotify OAuth flow with PKCE
  const login = useCallback(() => {
    startAuthFlow()
  }, [])

  // Clear token and logout
  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY)
    setToken(null)
  }, [])

  return {
    token,
    isLoading,
    login,
    logout,
    isAuthenticated: !!token
  }
}
