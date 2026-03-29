/**
 * 学习统计 Hooks
 */
import { useQuery } from '@tanstack/react-query'
import { getLearningStats } from '@/api/learning'

export function useLearningStats() {
  return useQuery({
    queryKey: ['learning', 'stats'],
    queryFn: getLearningStats,
    retry: (failureCount, error: any) => {
      // 401 错误不重试
      if (error?.response?.status === 401) return false
      return failureCount < 3
    },
    staleTime: 5 * 60 * 1000, // 5分钟内不重新获取
  })
}
