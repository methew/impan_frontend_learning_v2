/**
 * 无限滚动列表组件
 */
import { useEffect, useRef, useCallback, useState } from 'react'
import { Loader2 } from 'lucide-react'


interface InfiniteListProps {
  children: React.ReactNode
  onLoadMore: () => void
  hasMore: boolean
  isLoading: boolean
  className?: string
  emptyState?: React.ReactNode
  loadingState?: React.ReactNode
}

export function InfiniteList({
  children,
  onLoadMore,
  hasMore,
  isLoading,
  className,
  emptyState,
  loadingState,
}: InfiniteListProps) {
  const observerRef = useRef<IntersectionObserver | null>(null)
  const loadMoreRef = useRef<HTMLDivElement>(null)

  const handleIntersection = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      const [target] = entries
      if (target.isIntersecting && hasMore && !isLoading) {
        onLoadMore()
      }
    },
    [hasMore, isLoading, onLoadMore]
  )

  useEffect(() => {
    const element = loadMoreRef.current
    if (!element) return

    observerRef.current = new IntersectionObserver(handleIntersection, {
      root: null,
      rootMargin: '100px',
      threshold: 0,
    })

    observerRef.current.observe(element)

    return () => {
      observerRef.current?.disconnect()
    }
  }, [handleIntersection])

  return (
    <div className={className}>
      {children}
      
      {/* Load more sentinel */}
      <div ref={loadMoreRef} className="h-4" />
      
      {/* Loading state */}
      {isLoading && (
        <div className="py-4 flex justify-center">
          {loadingState || (
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          )}
        </div>
      )}
      
      {/* Empty state */}
      {!isLoading && !hasMore && emptyState}
    </div>
  )
}

interface PaginationState {
  page: number
  pageSize: number
  count: number
  hasMore: boolean
}

export function usePagination(initialPageSize = 50) {
  const [state, setState] = useState<PaginationState>({
    page: 1,
    pageSize: initialPageSize,
    count: 0,
    hasMore: true,
  })

  const reset = useCallback(() => {
    setState({
      page: 1,
      pageSize: initialPageSize,
      count: 0,
      hasMore: true,
    })
  }, [initialPageSize])

  const nextPage = useCallback(() => {
    setState(prev => ({
      ...prev,
      page: prev.page + 1,
    }))
  }, [])

  const updateCount = useCallback((count: number) => {
    setState(prev => ({
      ...prev,
      count,
      hasMore: count > prev.page * prev.pageSize,
    }))
  }, [])

  const updateHasMore = useCallback((hasMore: boolean) => {
    setState(prev => ({ ...prev, hasMore }))
  }, [])

  return {
    ...state,
    reset,
    nextPage,
    updateCount,
    updateHasMore,
    offset: (state.page - 1) * state.pageSize,
    limit: state.pageSize,
  }
}
