/**
 * 统一认证中心 SDK
 * 适配后端统一认证平台，使用 HttpOnly Cookie 进行身份验证
 */

import { API_BASE_URL, AUTH_CENTER_URL, APP_ID, APP_NAME, APP_URL } from './config'

// 配置接口
interface AuthConfig {
  appId: string
  appName: string
  apiBaseUrl: string
  authCenterUrl: string
  appUrl: string
}

// 配置对象
const config: AuthConfig = {
  appId: APP_ID,
  appName: APP_NAME,
  apiBaseUrl: API_BASE_URL,
  authCenterUrl: AUTH_CENTER_URL,
  appUrl: APP_URL,
}

// 刷新间隔：80% 的 access token 生命周期（毫秒）
export const TOKEN_REFRESH_INTERVAL = 4 * 60 * 1000 // 4 分钟

export interface TokenData {
  access: string
  refresh?: string
}

export interface UserInfo {
  id: string
  email: string
  username: string
  is_staff: boolean
}

/**
 * 检查当前登录状态
 * 通过调用后端 /me/ 接口验证 Cookie 是否有效
 */
export async function checkAuth(): Promise<boolean> {
  try {
    const url = `${API_BASE_URL}/core/auth/center/me/`
    const response = await fetch(url, {
      credentials: 'include',
      headers: {
        Accept: 'application/json',
      },
    })
    return response.ok
  } catch (error) {
    return false
  }
}

/**
 * 获取当前用户信息
 */
export async function getCurrentUser(): Promise<UserInfo | null> {
  try {
    const url = `${API_BASE_URL}/core/auth/center/me/`
    const response = await fetch(url, {
      credentials: 'include',
      headers: {
        Accept: 'application/json',
      },
    })
    if (response.ok) {
      return await response.json()
    }
    return null
  } catch {
    return null
  }
}

/**
 * 从 localStorage 获取用户信息
 */
export function getUserInfo(): UserInfo | null {
  const userStr = localStorage.getItem('user_info')
  return userStr ? JSON.parse(userStr) : null
}

/**
 * 保存用户信息到 localStorage
 */
export function setUserInfo(user: UserInfo): void {
  localStorage.setItem('user_info', JSON.stringify(user))
}

/**
 * 跳转到统一登录中心
 */
export function redirectToLogin(redirectPath?: string): void {
  const currentPath = redirectPath || window.location.pathname + window.location.search
  const encodedRedirect = encodeURIComponent(currentPath)
  const loginUrl = `${AUTH_CENTER_URL}/?app=${APP_ID}&redirect=${encodedRedirect}`
  window.location.href = loginUrl
}

/**
 * 登出
 */
export async function logout(): Promise<void> {
  try {
    await fetch(`${API_BASE_URL}/core/auth/center/logout/`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'X-CSRFToken': getCsrfToken(),
      },
    })
  } catch (error) {
    console.error('[Auth] Logout failed:', error)
  }
  localStorage.removeItem('user_cache')
  localStorage.removeItem('user_info')
  window.location.href = `${APP_URL}/login`
}

/**
 * 刷新 Access Token
 */
export async function refreshToken(): Promise<string | null> {
  try {
    const response = await fetch(`${API_BASE_URL}/core/auth/center/token/refresh/`, {
      method: 'POST',
      credentials: 'include',
    })
    if (response.ok) {
      const data = await response.json()
      return data.access
    }
    return null
  } catch {
    return null
  }
}

/**
 * 获取 CSRF Token
 */
export function getCsrfToken(): string {
  const match = document.cookie.match(/csrftoken=([^;]+)/)
  return match ? match[1] : ''
}

/**
 * 启动定期 Token 刷新
 */
export function startTokenRefreshTimer(): () => void {
  const existingTimer = (window as any).__tokenRefreshTimer
  if (existingTimer) {
    clearInterval(existingTimer)
  }

  refreshToken()

  const timer = setInterval(async () => {
    const isAuth = await checkAuth()
    if (isAuth) {
      await refreshToken()
    }
  }, TOKEN_REFRESH_INTERVAL)

  ;(window as any).__tokenRefreshTimer = timer

  return () => {
    clearInterval(timer)
    ;(window as any).__tokenRefreshTimer = null
  }
}

/**
 * 停止定期 Token 刷新
 */
export function stopTokenRefreshTimer(): void {
  const timer = (window as any).__tokenRefreshTimer
  if (timer) {
    clearInterval(timer)
    ;(window as any).__tokenRefreshTimer = null
  }
}

export { config }
