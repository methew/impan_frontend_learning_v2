// Token management utilities
const ACCESS_TOKEN_KEY = 'access_token'
const REFRESH_TOKEN_KEY = 'refresh_token'
const TOKEN_EXPIRES_KEY = 'token_expires_at'
const REMEMBER_ME_KEY = 'remember_me'
const USER_KEY = 'user'

// Token lifetime configuration (in minutes)
const ACCESS_TOKEN_LIFETIME = 30 // 30 minutes
const TOKEN_REFRESH_INTERVAL = ACCESS_TOKEN_LIFETIME * 0.8 * 60 * 1000

export interface TokenData {
  access: string
  refresh: string
}

export interface AuthConfig {
  rememberMe: boolean
}

export interface User {
  id: string
  email: string
  username: string
}

export const setTokens = (data: TokenData, config?: AuthConfig): void => {
  localStorage.setItem(ACCESS_TOKEN_KEY, data.access)
  localStorage.setItem(REFRESH_TOKEN_KEY, data.refresh)
  
  if (config?.rememberMe) {
    localStorage.setItem(REMEMBER_ME_KEY, 'true')
  }
  
  const expiresAt = Date.now() + ACCESS_TOKEN_LIFETIME * 60 * 1000
  localStorage.setItem(TOKEN_EXPIRES_KEY, expiresAt.toString())
}

export const getAccessToken = (): string | null => {
  if (typeof window === 'undefined') return null
  return localStorage.getItem(ACCESS_TOKEN_KEY)
}

export const getRefreshToken = (): string | null => {
  if (typeof window === 'undefined') return null
  return localStorage.getItem(REFRESH_TOKEN_KEY)
}

export const clearTokens = (): void => {
  if (typeof window === 'undefined') return
  localStorage.removeItem(ACCESS_TOKEN_KEY)
  localStorage.removeItem(REFRESH_TOKEN_KEY)
  localStorage.removeItem(TOKEN_EXPIRES_KEY)
  localStorage.removeItem(REMEMBER_ME_KEY)
  localStorage.removeItem(USER_KEY)
}

export const isTokenExpired = (): boolean => {
  if (typeof window === 'undefined') return true
  const expiresAt = localStorage.getItem(TOKEN_EXPIRES_KEY)
  if (!expiresAt) return true
  return Date.now() > parseInt(expiresAt) - 60000
}

export const isAuthenticated = (): boolean => {
  return !!getAccessToken() && !!getRefreshToken()
}

export const setUser = (user: User): void => {
  localStorage.setItem(USER_KEY, JSON.stringify(user))
}

// Backward compatibility aliases
export const setToken = (token: string): void => {
  localStorage.setItem(ACCESS_TOKEN_KEY, token)
}

export const getUser = (): User | null => {
  if (typeof window === 'undefined') return null
  const user = localStorage.getItem(USER_KEY)
  return user ? JSON.parse(user) : null
}

const getApiBaseUrl = (): string => {
  const envUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1'
  const match = envUrl.match(/^(.*?\/api\/v1)/)
  return match ? match[1] : 'http://localhost:8000/api/v1'
}

export const refreshTokenApi = async (refresh: string): Promise<{ access: string; refresh?: string }> => {
  const API_BASE_URL = getApiBaseUrl()
  
  const response = await fetch(`${API_BASE_URL}/core/auth/token/refresh/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ refresh }),
  })

  if (!response.ok) {
    throw new Error('Token refresh failed')
  }

  const data = await response.json()
  
  localStorage.setItem(ACCESS_TOKEN_KEY, data.access)
  
  const expiresAt = Date.now() + ACCESS_TOKEN_LIFETIME * 60 * 1000
  localStorage.setItem(TOKEN_EXPIRES_KEY, expiresAt.toString())
  
  if (data.refresh) {
    localStorage.setItem(REFRESH_TOKEN_KEY, data.refresh)
  }
  
  return data
}

export const startTokenRefreshTimer = (): (() => void) => {
  const existingTimer = (window as any).__tokenRefreshTimer
  if (existingTimer) {
    clearInterval(existingTimer)
  }
  
  const checkAndRefresh = async () => {
    if (!isAuthenticated()) return
    
    if (isTokenExpired()) {
      try {
        const refreshToken = getRefreshToken()
        if (refreshToken) {
          await refreshTokenApi(refreshToken)
          console.log('[Auth] Token refreshed successfully')
        }
      } catch (error) {
        console.error('[Auth] Token refresh failed:', error)
      }
    }
  }
  
  checkAndRefresh()
  
  const timer = setInterval(checkAndRefresh, TOKEN_REFRESH_INTERVAL)
  ;(window as any).__tokenRefreshTimer = timer
  
  return () => {
    clearInterval(timer)
    ;(window as any).__tokenRefreshTimer = null
  }
}

export const stopTokenRefreshTimer = (): void => {
  const timer = (window as any).__tokenRefreshTimer
  if (timer) {
    clearInterval(timer)
    ;(window as any).__tokenRefreshTimer = null
  }
}
