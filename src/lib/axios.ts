import axios from 'axios'
import { 
  getAccessToken, 
  getRefreshToken, 
  clearTokens,
  isTokenExpired,
  refreshTokenApi 
} from './auth'

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
})

// Global flag to prevent concurrent token refresh
let isRefreshing = false
let refreshSubscribers: Array<(token: string | null) => void> = []

function subscribeTokenRefresh(callback: (token: string | null) => void) {
  refreshSubscribers.push(callback)
}

function onTokenRefreshed(newToken: string | null) {
  refreshSubscribers.forEach((callback) => callback(newToken))
  refreshSubscribers = []
}

// Request interceptor
apiClient.interceptors.request.use(
  async (config) => {
    const token = getAccessToken()
    console.log('[API] Request to:', config.url, 'Token:', token ? 'present' : 'missing')
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    
    // Check if token is about to expire and refresh proactively
    if (isTokenExpired() && token) {
      const refreshToken = getRefreshToken()
      if (refreshToken) {
        try {
          const response = await refreshTokenApi(refreshToken)
          config.headers.Authorization = `Bearer ${response.access}`
        } catch {
          // Continue with current token
        }
      }
    }
    
    return config
  },
  (error) => Promise.reject(error)
)

// Flag to prevent multiple redirects
let isRedirecting = false

// Response interceptor
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config
    
    if (error.response?.status !== 401 || originalRequest._retry) {
      return Promise.reject(error)
    }
    
    originalRequest._retry = true
    
    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        subscribeTokenRefresh((newToken: string | null) => {
          if (newToken) {
            originalRequest.headers.Authorization = `Bearer ${newToken}`
            resolve(apiClient(originalRequest))
          } else {
            reject(new Error('Token refresh failed'))
          }
        })
      })
    }
    
    isRefreshing = true
    
    try {
      const refreshToken = getRefreshToken()
      if (!refreshToken) {
        throw new Error('No refresh token')
      }
      
      const response = await refreshTokenApi(refreshToken)
      onTokenRefreshed(response.access)
      
      originalRequest.headers.Authorization = `Bearer ${response.access}`
      return apiClient(originalRequest)
    } catch (refreshError) {
      onTokenRefreshed(null)
      clearTokens()
      
      const currentPath = window.location.pathname
      if (currentPath !== '/login' && !isRedirecting) {
        isRedirecting = true
        setTimeout(() => {
          window.location.href = '/login'
          setTimeout(() => { isRedirecting = false }, 500)
        }, 100)
      }
      
      return Promise.reject(refreshError)
    } finally {
      isRefreshing = false
    }
  }
)

export default apiClient
