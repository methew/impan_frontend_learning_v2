import { createFileRoute, Navigate, useRouterState } from '@tanstack/react-router'

export const Route = createFileRoute('/learning/')({
  component: LearningIndexRedirect,
})

function LearningIndexRedirect() {
  const routerState = useRouterState()
  const isRedirecting = routerState.location.pathname === '/learning'
  
  // Prevent infinite redirect loop
  if (isRedirecting) {
    return <Navigate to="/learning/content" replace />
  }
  
  return null
}
