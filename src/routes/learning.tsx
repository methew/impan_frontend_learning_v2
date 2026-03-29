import { createFileRoute, Outlet } from '@tanstack/react-router'

export const Route = createFileRoute('/learning')({
  component: LearningLayout,
})

function LearningLayout() {
  return (
    <div className="h-full overflow-hidden">
      <Outlet />
    </div>
  )
}
