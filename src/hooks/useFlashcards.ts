/**
 * 闪卡 Hooks - 从 flashcards_v2 迁移
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  getDecks,
  getDeck,
  createDeck,
  updateDeck,
  deleteDeck,
  getFlashcards,
  createFlashcard,
  updateFlashcard,
  deleteFlashcard,
  batchCreateFlashcards,
  generateFlashcardsFromNodes,
  getDueCards,
  getNewCards,
  submitReview,
  startStudySession,
  endStudySession,
  markAsMastered,
  resetCardProgress,
  skipCard,
  getDeckStats,
  getOverallStats,
} from '@/api/flashcards'
import type { Deck, Flashcard } from '@/types'

// ==================== Deck Hooks ====================

export function useDecks() {
  return useQuery({
    queryKey: ['decks'],
    queryFn: getDecks,
  })
}

export function useDeck(id: string) {
  return useQuery({
    queryKey: ['decks', id],
    queryFn: () => getDeck(id),
    enabled: !!id,
  })
}

export function useCreateDeck() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: createDeck,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['decks'] })
    },
  })
}

export function useUpdateDeck() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Deck> }) => updateDeck(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['decks'] })
      queryClient.invalidateQueries({ queryKey: ['decks', id] })
    },
  })
}

export function useDeleteDeck() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: deleteDeck,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['decks'] })
    },
  })
}

// ==================== Flashcard Hooks ====================

export function useFlashcards(deckId: string) {
  return useQuery({
    queryKey: ['flashcards', deckId],
    queryFn: () => getFlashcards(deckId),
    enabled: !!deckId,
  })
}

export function useCreateFlashcard() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: createFlashcard,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['flashcards', variables.deckId] })
    },
  })
}

export function useUpdateFlashcard() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Flashcard> }) => updateFlashcard(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['flashcards'] })
    },
  })
}

export function useDeleteFlashcard() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: deleteFlashcard,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['flashcards'] })
    },
  })
}

export function useBatchCreateFlashcards() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: batchCreateFlashcards,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['flashcards'] })
    },
  })
}

export function useGenerateFlashcardsFromNodes() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ nodeType, nodeIds }: { nodeType: string; nodeIds: string[] }) =>
      generateFlashcardsFromNodes(nodeType, nodeIds),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['flashcards'] })
    },
  })
}

// ==================== Study Hooks ====================

export function useDueCards(deckId?: string) {
  return useQuery({
    queryKey: ['study', 'due', deckId],
    queryFn: () => getDueCards(deckId),
  })
}

export function useNewCards(deckId: string, limit: number = 20) {
  return useQuery({
    queryKey: ['study', 'new', deckId, limit],
    queryFn: () => getNewCards(deckId, limit),
    enabled: !!deckId,
  })
}

export function useSubmitReview() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: submitReview,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['study'] })
      queryClient.invalidateQueries({ queryKey: ['stats'] })
    },
  })
}

export function useStartStudySession() {
  return useMutation({
    mutationFn: startStudySession,
  })
}

export function useEndStudySession() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: endStudySession,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['study'] })
      queryClient.invalidateQueries({ queryKey: ['stats'] })
    },
  })
}

export function useMarkAsMastered() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: markAsMastered,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['flashcards'] })
      queryClient.invalidateQueries({ queryKey: ['study'] })
    },
  })
}

export function useResetCardProgress() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: resetCardProgress,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['flashcards'] })
      queryClient.invalidateQueries({ queryKey: ['study'] })
    },
  })
}

export function useSkipCard() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: skipCard,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['study'] })
    },
  })
}

// ==================== Stats Hooks ====================

export function useDeckStats(deckId: string) {
  return useQuery({
    queryKey: ['stats', 'deck', deckId],
    queryFn: () => getDeckStats(deckId),
    enabled: !!deckId,
  })
}

export function useOverallStats() {
  return useQuery({
    queryKey: ['stats', 'overall'],
    queryFn: getOverallStats,
  })
}
