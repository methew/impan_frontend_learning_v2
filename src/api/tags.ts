import apiClient from '@/lib/axios'
import type { Tag } from '@/types'

export interface CreateTagRequest {
  type: string
  code: string
  abbreviation: string
  title: string
  title_zh?: string
  title_ja?: string
  parent?: number | null
  details?: Record<string, unknown>
  is_valid?: boolean
}

// Get all tags
export async function getTags(params?: {
  type?: string
  search?: string
}): Promise<Tag[]> {
  const response = await apiClient.get<Tag[]>('/core/tags/', { params })
  return response.data || []
}

// Get single tag
export async function getTag(id: number): Promise<Tag> {
  const response = await apiClient.get<Tag>(`/core/tags/${id}/`)
  return response.data
}

// Create tag
export async function createTag(data: CreateTagRequest): Promise<Tag> {
  const response = await apiClient.post<Tag>('/core/tags/', data)
  return response.data
}

// Update tag
export async function updateTag(id: number, data: Partial<Tag>): Promise<Tag> {
  const response = await apiClient.patch<Tag>(`/core/tags/${id}/`, data)
  return response.data
}

// Delete tag
export async function deleteTag(id: number): Promise<void> {
  await apiClient.delete(`/core/tags/${id}/`)
}
