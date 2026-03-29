import apiClient from '@/lib/axios'
import type { 
  VocabNode, 
  GramNode, 
  IdiomNode, 
  TextLessonNode,
  ExampleSentence
} from '@/types'

// ============================================================================
// 词汇节点 API
// ============================================================================

export interface VocabNodeParams {
  search?: string
  parent?: string
  node_type?: string
  jlpt_level?: string
  hsk_level?: string
  ordering?: string
  limit?: number
  offset?: number
  created_by?: string | null  // 'null' 表示无创建者，其他为用户ID
  system_data?: boolean       // true 表示只显示系统数据（无创建者或系统用户创建）
}

export async function getVocabNodes(params?: VocabNodeParams): Promise<VocabNode[]> {
  const response = await apiClient.get('/learning/vocab-nodes/', { params })
  const data = response.data
  return Array.isArray(data) ? data : data.results || []
}

export interface PaginatedResponse<T> {
  count: number
  next: string | null
  previous: string | null
  results: T[]
}

export async function getVocabNodesPaginated(params?: VocabNodeParams): Promise<PaginatedResponse<VocabNode>> {
  const response = await apiClient.get('/learning/vocab-nodes/', { params })
  const data = response.data
  if (Array.isArray(data)) {
    return { count: data.length, next: null, previous: null, results: data }
  }
  return data
}

export async function getVocabNode(id: string): Promise<VocabNode> {
  const response = await apiClient.get(`/learning/vocab-nodes/${id}/`)
  return response.data
}

export async function createVocabNode(data: Partial<VocabNode>): Promise<VocabNode> {
  const response = await apiClient.post('/learning/vocab-nodes/', data)
  return response.data
}

export async function updateVocabNode(id: string, data: Partial<VocabNode>): Promise<VocabNode> {
  const response = await apiClient.put(`/learning/vocab-nodes/${id}/`, data)
  return response.data
}

export async function deleteVocabNode(id: string | number): Promise<void> {
  await apiClient.delete(`/learning/vocab-nodes/${id}/`)
}

export async function getVocabNodeExamples(id: string): Promise<ExampleSentence[]> {
  const response = await apiClient.get(`/learning/vocab-nodes/${id}/examples/`)
  return response.data
}

export async function getVocabNodeChildren(id: string): Promise<VocabNode[]> {
  const response = await apiClient.get(`/learning/vocab-nodes/${id}/children/`)
  return response.data
}

export async function getVocabNodePath(id: string): Promise<VocabNode[]> {
  const response = await apiClient.get(`/learning/vocab-nodes/${id}/path/`)
  return response.data
}

// ============================================================================
// Workflowy 风格操作 API
// ============================================================================

export async function getVocabNodeTree(id: string | number): Promise<VocabNode> {
  const response = await apiClient.get(`/learning/vocab-nodes/${id}/tree/`)
  return response.data
}

export async function bulkUpdateVocabNodes(updates: Array<{ id: string | number; [key: string]: any }>): Promise<{ updated: number; errors: any[]; data: VocabNode[] }> {
  const response = await apiClient.post('/learning/vocab-nodes/bulk_update/', updates)
  return response.data
}

export async function indentVocabNode(id: string | number): Promise<VocabNode> {
  const response = await apiClient.post(`/learning/vocab-nodes/${id}/indent/`)
  return response.data
}

export async function outdentVocabNode(id: string | number): Promise<VocabNode> {
  const response = await apiClient.post(`/learning/vocab-nodes/${id}/outdent/`)
  return response.data
}

export async function createVocabNodeSibling(id: string | number, data: Partial<VocabNode>): Promise<VocabNode> {
  const response = await apiClient.post(`/learning/vocab-nodes/${id}/create_sibling/`, data)
  return response.data
}

export async function createVocabNodeChild(id: string | number, data: Partial<VocabNode>): Promise<VocabNode> {
  const response = await apiClient.post(`/learning/vocab-nodes/${id}/create_child/`, data)
  return response.data
}

export async function reorderVocabNodes(orders: Record<string | number, number>): Promise<{ updated: number; errors: any[] }> {
  const response = await apiClient.post('/learning/vocab-nodes/reorder/', { orders })
  return response.data
}

// ============================================================================
// 语法节点 API
// ============================================================================

export interface GramNodeParams {
  search?: string
  parent?: string
  node_type?: string
  level?: string
  ordering?: string
  limit?: number
  offset?: number
}

export async function getGramNodes(params?: GramNodeParams): Promise<GramNode[]> {
  const response = await apiClient.get('/learning/gram-nodes/', { params })
  const data = response.data
  return Array.isArray(data) ? data : data.results || []
}

export async function getGramNodesPaginated(params?: GramNodeParams): Promise<PaginatedResponse<GramNode>> {
  const response = await apiClient.get('/learning/gram-nodes/', { params })
  const data = response.data
  if (Array.isArray(data)) {
    return { count: data.length, next: null, previous: null, results: data }
  }
  return data
}

export async function getGramNode(id: string): Promise<GramNode> {
  const response = await apiClient.get(`/learning/gram-nodes/${id}/`)
  return response.data
}

export async function getGramNodeExamples(id: string): Promise<ExampleSentence[]> {
  const response = await apiClient.get(`/learning/gram-nodes/${id}/examples/`)
  return response.data
}

export async function getGramNodeChildren(id: string): Promise<GramNode[]> {
  const response = await apiClient.get(`/learning/gram-nodes/${id}/children/`)
  return response.data
}

export async function getGramNodeTree(id: string | number): Promise<GramNode> {
  const response = await apiClient.get(`/learning/gram-nodes/${id}/tree/`)
  return response.data
}

export async function createGramNode(data: Partial<GramNode>): Promise<GramNode> {
  const response = await apiClient.post('/learning/gram-nodes/', data)
  return response.data
}

export async function updateGramNode(id: string, data: Partial<GramNode>): Promise<GramNode> {
  const response = await apiClient.put(`/learning/gram-nodes/${id}/`, data)
  return response.data
}

export async function deleteGramNode(id: string | number): Promise<void> {
  await apiClient.delete(`/learning/gram-nodes/${id}/`)
}

// ============================================================================
// 惯用语节点 API
// ============================================================================

export interface IdiomNodeParams {
  search?: string
  parent?: string
  node_type?: string
  ordering?: string
  limit?: number
  offset?: number
}

export async function getIdiomNodes(params?: IdiomNodeParams): Promise<IdiomNode[]> {
  const response = await apiClient.get('/learning/idiom-nodes/', { params })
  const data = response.data
  return Array.isArray(data) ? data : data.results || []
}

export async function getIdiomNodesPaginated(params?: IdiomNodeParams): Promise<PaginatedResponse<IdiomNode>> {
  const response = await apiClient.get('/learning/idiom-nodes/', { params })
  const data = response.data
  if (Array.isArray(data)) {
    return { count: data.length, next: null, previous: null, results: data }
  }
  return data
}

export async function getIdiomNode(id: string): Promise<IdiomNode> {
  const response = await apiClient.get(`/learning/idiom-nodes/${id}/`)
  return response.data
}

export async function getIdiomNodeExamples(id: string): Promise<ExampleSentence[]> {
  const response = await apiClient.get(`/learning/idiom-nodes/${id}/examples/`)
  return response.data
}

export async function getIdiomNodeTree(id: string | number): Promise<IdiomNode> {
  const response = await apiClient.get(`/learning/idiom-nodes/${id}/tree/`)
  return response.data
}

export async function createIdiomNode(data: Partial<IdiomNode>): Promise<IdiomNode> {
  const response = await apiClient.post('/learning/idiom-nodes/', data)
  return response.data
}

export async function updateIdiomNode(id: string, data: Partial<IdiomNode>): Promise<IdiomNode> {
  const response = await apiClient.put(`/learning/idiom-nodes/${id}/`, data)
  return response.data
}

export async function deleteIdiomNode(id: string | number): Promise<void> {
  await apiClient.delete(`/learning/idiom-nodes/${id}/`)
}

// ============================================================================
// 课文节点 API
// ============================================================================

export interface TextNodeParams {
  search?: string
  parent?: string
  node_type?: string
  ordering?: string
  limit?: number
  offset?: number
}

export async function getTextNodes(params?: TextNodeParams): Promise<TextLessonNode[]> {
  const response = await apiClient.get('/learning/text-nodes/', { params })
  const data = response.data
  return Array.isArray(data) ? data : data.results || []
}

export async function getTextNodesPaginated(params?: TextNodeParams): Promise<PaginatedResponse<TextLessonNode>> {
  const response = await apiClient.get('/learning/text-nodes/', { params })
  const data = response.data
  if (Array.isArray(data)) {
    return { count: data.length, next: null, previous: null, results: data }
  }
  return data
}

export async function getTextNode(id: string): Promise<TextLessonNode> {
  const response = await apiClient.get(`/learning/text-nodes/${id}/`)
  return response.data
}

export async function getTextNodeVocabulary(id: string): Promise<VocabNode[]> {
  const response = await apiClient.get(`/learning/text-nodes/${id}/vocabulary/`)
  return response.data
}

export async function getTextNodeGrammar(id: string): Promise<GramNode[]> {
  const response = await apiClient.get(`/learning/text-nodes/${id}/grammar/`)
  return response.data
}

export async function getTextNodeTree(id: string | number): Promise<TextLessonNode> {
  const response = await apiClient.get(`/learning/text-nodes/${id}/tree/`)
  return response.data
}

export async function createTextNode(data: Partial<TextLessonNode>): Promise<TextLessonNode> {
  const response = await apiClient.post('/learning/text-nodes/', data)
  return response.data
}

export async function updateTextNode(id: string, data: Partial<TextLessonNode>): Promise<TextLessonNode> {
  const response = await apiClient.put(`/learning/text-nodes/${id}/`, data)
  return response.data
}

export async function deleteTextNode(id: string | number): Promise<void> {
  await apiClient.delete(`/learning/text-nodes/${id}/`)
}

// ============================================================================
// 树形结构 API
// ============================================================================

export async function getTreeRoot(nodeType: 'vocab' | 'gram' | 'idiom' | 'text'): Promise<any> {
  const endpoints = {
    vocab: '/learning/vocab-nodes/',
    gram: '/learning/gram-nodes/',
    idiom: '/learning/idiom-nodes/',
    text: '/learning/text-nodes/',
  }
  const response = await apiClient.get(endpoints[nodeType], { params: { parent__isnull: true } })
  const data = response.data
  return Array.isArray(data) ? data[0] : data.results?.[0]
}

export async function getFullTree(nodeType: 'vocab' | 'gram' | 'idiom' | 'text'): Promise<any[]> {
  const endpoints = {
    vocab: '/learning/vocab-nodes/',
    gram: '/learning/gram-nodes/',
    idiom: '/learning/idiom-nodes/',
    text: '/learning/text-nodes/',
  }
  const response = await apiClient.get(endpoints[nodeType])
  const data = response.data
  return Array.isArray(data) ? data : data.results || []
}

// ============================================================================
// 统计 API
// ============================================================================

export interface LearningStats {
  vocab: number
  grammar: number
  idiom: number
  text: number
  course: number
  category: number
  language: number
}

export async function getLearningStats(): Promise<LearningStats> {
  const response = await apiClient.get('/learning/stats/')
  return response.data
}

// ============================================================================
// 课程 API
// ============================================================================

export interface Course {
  id: string
  name: string
  language: {
    code: string
    name: string
    flag_emoji?: string
  }
  course_type: 'textbook' | 'exam_prep' | 'skill' | 'theme' | 'custom'
  course_type_display: string
  description: string
  level_from: string
  level_to: string
  is_active: boolean
  is_public: boolean
  created_by_username?: string
  created_at: string
  updated_at: string
}

export interface CourseParams {
  search?: string
  language?: string
  course_type?: string
  ordering?: string
  limit?: number
  offset?: number
}

export async function getCourses(params?: CourseParams): Promise<Course[]> {
  const response = await apiClient.get('/learning/courses/', { params })
  const data = response.data
  return Array.isArray(data) ? data : data.results || []
}

export async function getCourse(id: string): Promise<Course> {
  const response = await apiClient.get(`/learning/courses/${id}/`)
  return response.data
}

export async function createCourse(data: Partial<Course>): Promise<Course> {
  const response = await apiClient.post('/learning/courses/', data)
  return response.data
}

export async function updateCourse(id: string, data: Partial<Course>): Promise<Course> {
  const response = await apiClient.put(`/learning/courses/${id}/`, data)
  return response.data
}

export async function deleteCourse(id: string): Promise<void> {
  await apiClient.delete(`/learning/courses/${id}/`)
}
