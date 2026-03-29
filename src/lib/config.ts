/**
 * 全局配置文件
 * 所有环境变量通过此文件统一管理
 */

// API 基础 URL
// 开发环境使用 localhost:8000，生产环境使用环境变量配置的 URL
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1'

// 认证中心 URL
export const AUTH_CENTER_URL = import.meta.env.VITE_AUTH_CENTER_URL || 'http://localhost:8000/api/v1/core/auth/center'

// 应用配置
export const APP_ID = import.meta.env.VITE_APP_ID || 'learning'
export const APP_NAME = import.meta.env.VITE_APP_NAME || 'Learning'
export const APP_URL = import.meta.env.VITE_APP_URL || (typeof window !== 'undefined' ? window.location.origin : '')

// 是否为开发环境
export const IS_DEV = import.meta.env.DEV

// 是否为生产环境
export const IS_PROD = import.meta.env.PROD

// API 端点构造器
export function getApiUrl(path: string): string {
  // 如果 path 以 / 开头，去掉开头的 /
  const cleanPath = path.startsWith('/') ? path.slice(1) : path
  return `${API_BASE_URL}/${cleanPath}`
}

// 认证端点构造器
export function getAuthUrl(path: string): string {
  const cleanPath = path.startsWith('/') ? path.slice(1) : path
  return `${AUTH_CENTER_URL}/${cleanPath}`
}
