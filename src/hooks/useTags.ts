import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import type { Tag } from '@/types'
import * as api from '@/api/tags'

const TAGS_KEY = 'tags'

export function useTags(params?: Parameters<typeof api.getTags>[0]) {
  return useQuery<Tag[]>({
    queryKey: [TAGS_KEY, params],
    queryFn: () => api.getTags(params),
    select: (data) => data || [],
  })
}

export function useTag(id: number) {
  return useQuery<Tag>({
    queryKey: [TAGS_KEY, id],
    queryFn: () => api.getTag(id),
    enabled: !!id,
  })
}

export function useCreateTag() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: api.createTag,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [TAGS_KEY] })
    },
  })
}

export function useUpdateTag() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<Tag> }) =>
      api.updateTag(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [TAGS_KEY] })
    },
  })
}

export function useDeleteTag() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: api.deleteTag,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [TAGS_KEY] })
    },
  })
}
