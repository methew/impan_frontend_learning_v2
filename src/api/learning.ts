import apiClient from '@/lib/axios'
import type { 
  VocabNode, 
  GramNode, 
  IdiomNode, 
  TextLessonNode,
  ExampleSentence,
  PaginatedResponse 
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
}

export async function getVocabNodes(params?: VocabNodeParams): Promise<VocabNode[]> {
  const response = await apiClient.get('/learning/vocab-nodes/', { params })
  const data = response.data
  return Array.isArray(data) ? data : data.results || []
}

export async function getVocabNode(id: string): Promise<VocabNode> {
  const response = await apiClient.get(`/learning/vocab-nodes/${id}/`)
  return response.data
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
// 语法节点 API
// ============================================================================

export interface GramNodeParams {
  search?: string
  parent?: string
  node_type?: string
  level?: string
  ordering?: string
}

export async function getGramNodes(params?: GramNodeParams): Promise<GramNode[]> {
  const response = await apiClient.get('/learning/gram-nodes/', { params })
  const data = response.data
  return Array.isArray(data) ? data : data.results || []
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

// ============================================================================
// 惯用语节点 API
// ============================================================================

export interface IdiomNodeParams {
  search?: string
  parent?: string
  node_type?: string
  ordering?: string
}

export async function getIdiomNodes(params?: IdiomNodeParams): Promise<IdiomNode[]> {
  const response = await apiClient.get('/learning/idiom-nodes/', { params })
  const data = response.data
  return Array.isArray(data) ? data : data.results || []
}

export async function getIdiomNode(id: string): Promise<IdiomNode> {
  const response = await apiClient.get(`/learning/idiom-nodes/${id}/`)
  return response.data
}

export async function getIdiomNodeExamples(id: string): Promise<ExampleSentence[]> {
  const response = await apiClient.get(`/learning/idiom-nodes/${id}/examples/`)
  return response.data
}

// ============================================================================
// 课文节点 API
// ============================================================================

export interface TextNodeParams {
  search?: string
  parent?: string
  node_type?: string
  ordering?: string
}

export async function getTextNodes(params?: TextNodeParams): Promise<TextLessonNode[]> {
  const response = await apiClient.get('/learning/text-nodes/', { params })
  const data = response.data
  return Array.isArray(data) ? data : data.results || []
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
