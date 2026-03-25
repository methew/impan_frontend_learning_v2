/**
 * 闪卡 API - 从 flashcards_v2 迁移
 */
import apiClient from '@/lib/axios'
import type { Deck, Flashcard, FlashcardStats, ReviewPayload, FlashcardStudySession } from '@/types'

// ==================== Deck CRUD ====================

export async function getDecks(): Promise<Deck[]> {
  const response = await apiClient.get('/flashcards/decks/')
  return response.data
}

export async function getDeck(id: string): Promise<Deck> {
  const response = await apiClient.get(`/flashcards/decks/${id}/`)
  return response.data
}

export async function createDeck(data: Partial<Deck>): Promise<Deck> {
  const response = await apiClient.post('/flashcards/decks/', data)
  return response.data
}

export async function updateDeck(id: string, data: Partial<Deck>): Promise<Deck> {
  const response = await apiClient.patch(`/flashcards/decks/${id}/`, data)
  return response.data
}

export async function deleteDeck(id: string): Promise<void> {
  await apiClient.delete(`/flashcards/decks/${id}/`)
}

// ==================== Flashcard CRUD ====================

export async function getFlashcards(deckId: string): Promise<Flashcard[]> {
  const response = await apiClient.get('/flashcards/cards/', {
    params: { deck_id: deckId }
  })
  return response.data
}

export async function createFlashcard(data: Partial<Flashcard>): Promise<Flashcard> {
  const response = await apiClient.post('/flashcards/cards/', data)
  return response.data
}

export async function updateFlashcard(id: string, data: Partial<Flashcard>): Promise<Flashcard> {
  const response = await apiClient.patch(`/flashcards/cards/${id}/`, data)
  return response.data
}

export async function deleteFlashcard(id: string): Promise<void> {
  await apiClient.delete(`/flashcards/cards/${id}/`)
}

// 批量创建闪卡
export async function batchCreateFlashcards(cards: Partial<Flashcard>[]): Promise<Flashcard[]> {
  const response = await apiClient.post('/flashcards/cards/batch/', { cards })
  return response.data
}

// 从学习节点生成闪卡
export async function generateFlashcardsFromNodes(
  nodeType: string,
  nodeIds: string[]
): Promise<Flashcard[]> {
  const response = await apiClient.post('/flashcards/generate-from-nodes/', {
    node_type: nodeType,
    node_ids: nodeIds
  })
  return response.data
}

// ==================== 学习相关 API ====================

// 获取待复习卡片
export async function getDueCards(deckId?: string): Promise<Flashcard[]> {
  const params = deckId ? { deck_id: deckId } : {}
  const response = await apiClient.get('/flashcards/study/due/', { params })
  return response.data
}

// 获取新卡片
export async function getNewCards(deckId: string, limit: number = 20): Promise<Flashcard[]> {
  const response = await apiClient.get('/flashcards/study/new/', {
    params: { deck_id: deckId, limit }
  })
  return response.data
}

// 提交复习结果
export async function submitReview(payload: ReviewPayload): Promise<void> {
  await apiClient.post('/flashcards/study/review/', payload)
}

// 批量提交复习结果
export async function batchSubmitReviews(reviews: ReviewPayload[]): Promise<void> {
  await apiClient.post('/flashcards/study/review/batch/', { reviews })
}

// 开始学习会话
export async function startStudySession(deckId: string): Promise<FlashcardStudySession> {
  const response = await apiClient.post('/flashcards/study/sessions/', { deck_id: deckId })
  return response.data
}

// 结束学习会话
export async function endStudySession(sessionId: string): Promise<void> {
  await apiClient.patch(`/flashcards/study/sessions/${sessionId}/end/`)
}

// 跳过卡片
export async function skipCard(cardId: string): Promise<void> {
  await apiClient.post(`/flashcards/cards/${cardId}/skip/`)
}

// 标记卡片为已掌握
export async function markAsMastered(cardId: string): Promise<void> {
  await apiClient.post(`/flashcards/cards/${cardId}/master/`)
}

// 重置卡片进度
export async function resetCardProgress(cardId: string): Promise<void> {
  await apiClient.post(`/flashcards/cards/${cardId}/reset/`)
}

// ==================== 统计 API ====================

export async function getDeckStats(deckId: string): Promise<FlashcardStats> {
  const response = await apiClient.get(`/flashcards/decks/${deckId}/stats/`)
  return response.data
}

export async function getOverallStats(): Promise<FlashcardStats> {
  const response = await apiClient.get('/flashcards/stats/overall/')
  return response.data
}
