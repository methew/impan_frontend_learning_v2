import axios, { AxiosError } from 'axios'
import { API_BASE_URL } from './config'
import { refreshToken, redirectToLogin, getCsrfToken } from './auth'

// 创建 Axios 实例
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
  timeout: 30000,
})

// 请求拦截器
apiClient.interceptors.request.use((config) => {
  if (
    ['post', 'put', 'patch', 'delete'].includes(
      config.method?.toLowerCase() || ''
    )
  ) {
    const csrfToken = getCsrfToken()
    if (csrfToken) {
      config.headers['X-CSRFToken'] = csrfToken
    }
  }
  return config
})

// 响应拦截器
let isRefreshing = false
let refreshSubscribers: ((success: boolean) => void)[] = []

function subscribeTokenRefresh(callback: (success: boolean) => void) {
  refreshSubscribers.push(callback)
}

function onTokenRefreshed(success: boolean) {
  refreshSubscribers.forEach((callback) => callback(success))
  refreshSubscribers = []
}

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as any & { _retry?: boolean }

    if (
      error.response?.status === 401 &&
      originalRequest &&
      !originalRequest._retry
    ) {
      if (originalRequest.url?.includes('/auth/')) {
        redirectToLogin()
        return Promise.reject(error)
      }

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          subscribeTokenRefresh((success) => {
            if (success) {
              resolve(apiClient(originalRequest))
            } else {
              reject(error)
            }
          })
        })
      }

      originalRequest._retry = true
      isRefreshing = true

      try {
        const newToken = await refreshToken()
        if (newToken) {
          onTokenRefreshed(true)
          isRefreshing = false
          return apiClient(originalRequest)
        }
      } catch {
        // ignore
      }

      isRefreshing = false
      onTokenRefreshed(false)
      redirectToLogin()
      return Promise.reject(error)
    }

    return Promise.reject(error)
  }
)

export default apiClient
