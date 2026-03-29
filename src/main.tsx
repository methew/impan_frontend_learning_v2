import { StrictMode, useEffect, useCallback } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider, createRouter } from '@tanstack/react-router'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'sonner'
import { routeTree } from './routeTree.gen'
import { LearningProvider } from './contexts/LearningContext'
import './index.css'
import './i18n'

// Import auth utilities
import { checkAuth, refreshToken, TOKEN_REFRESH_INTERVAL } from '@/lib/auth'

// Create QueryClient for React Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: 1,
    },
  },
})

// Token Refresh Component
function TokenRefreshProvider({ children }: { children: React.ReactNode }) {
  const doRefresh = useCallback(async () => {
    const isAuth = await checkAuth()
    if (isAuth) {
      await refreshToken()
    }
  }, [])

  useEffect(() => {
    // Initial refresh
    doRefresh()

    // Set up interval for token refresh (every 4 minutes)
    const intervalId = setInterval(doRefresh, TOKEN_REFRESH_INTERVAL)
    return () => clearInterval(intervalId)
  }, [doRefresh])

  return <>{children}</>
}

const router = createRouter({ routeTree })

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}

const rootElement = document.getElementById('root')
if (rootElement) {
  createRoot(rootElement).render(
    <StrictMode>
      <QueryClientProvider client={queryClient}>
        <TokenRefreshProvider>
          <LearningProvider>
            <RouterProvider router={router} />
          </LearningProvider>
        </TokenRefreshProvider>
        <Toaster position="top-center" />
      </QueryClientProvider>
    </StrictMode>,
  )
}
