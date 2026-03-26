import { createFileRoute, Link, Outlet, useRouterState } from '@tanstack/react-router'
import { 
  TreeDeciduous, 
  BookOpen,
  Layers,
  PenTool,
  GraduationCap,
  BarChart3,
  ChevronRight,
  Library,
  FlaskConical,
  Upload,
  Menu,
  X
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'

export const Route = createFileRoute('/learning')({
  component: LearningLayout,
})

function LearningLayout() {
  const { t } = useTranslation()
  const router = useRouterState()
  const currentPath = router.location.pathname
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const navItems = [
    {
      label: t('nav.content'),
      href: '/learning/content',
      icon: TreeDeciduous,
      color: 'text-emerald-500',
      description: `${t('learning.vocabulary')}、${t('learning.grammar')}、${t('learning.idioms')}、${t('learning.lessons')}`,
    },
    {
      label: t('learning.courseManagement'),
      href: '/learning/courses',
      icon: Library,
      color: 'text-blue-500',
      description: t('learning.courseDescription'),
    },
    {
      label: t('learning.subjectManagement'),
      href: '/learning/subjects',
      icon: FlaskConical,
      color: 'text-purple-500',
      description: t('learning.subjectDescription'),
    },
    {
      label: t('learning.flashcards'),
      href: '/learning/flashcards',
      icon: Layers,
      color: 'text-indigo-500',
      description: t('learning.flashcardsDescription'),
    },
    {
      label: t('learning.writing'),
      href: '/learning/writing',
      icon: PenTool,
      color: 'text-green-500',
      description: t('learning.writingDescription'),
    },
    {
      label: t('learning.batchImport'),
      href: '/learning/import',
      icon: Upload,
      color: 'text-orange-500',
      description: t('learning.importDescription'),
    },
  ]

  const externalLinks = [
    {
      label: t('learning.mockExam'),
      href: '/exams',
      icon: GraduationCap,
      color: 'text-orange-500',
    },
    {
      label: t('learning.statistics'),
      href: '/stats',
      icon: BarChart3,
      color: 'text-cyan-500',
    },
  ]

  const isActive = (href: string) => {
    if (href === '/learning') {
      return currentPath === '/learning'
    }
    return currentPath.startsWith(href)
  }

  return (
    <div className="flex h-[calc(100vh-64px)]">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-64 flex-col border-r bg-card">
        <div className="p-4 border-b">
          <Link to="/learning" className="flex items-center gap-2">
            <div className="p-2 bg-primary rounded-lg">
              <BookOpen className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <h2 className="font-bold">{t('learning.center')}</h2>
              <p className="text-xs text-muted-foreground">Learning Platform</p>
            </div>
          </Link>
        </div>

        <nav className="flex-1 overflow-auto p-3 space-y-1">
          <p className="px-3 py-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">
            {t('learning.coreFeatures')}
          </p>
          {navItems.map((item) => (
            <Link
              key={item.href}
              to={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors",
                isActive(item.href)
                  ? "bg-primary text-primary-foreground"
                  : "hover:bg-accent"
              )}
            >
              <item.icon className={cn("h-5 w-5", !isActive(item.href) && item.color)} />
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm">{item.label}</p>
                <p className={cn(
                  "text-xs truncate",
                  isActive(item.href) ? "text-primary-foreground/80" : "text-muted-foreground"
                )}>
                  {item.description}
                </p>
              </div>
              {isActive(item.href) && <ChevronRight className="h-4 w-4" />}
            </Link>
          ))}

          <p className="px-3 py-2 mt-6 text-xs font-medium text-muted-foreground uppercase tracking-wider">
            {t('common.others')}
          </p>
          {externalLinks.map((item) => (
            <Link
              key={item.href}
              to={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors",
                isActive(item.href)
                  ? "bg-primary text-primary-foreground"
                  : "hover:bg-accent"
              )}
            >
              <item.icon className={cn("h-5 w-5", !isActive(item.href) && item.color)} />
              <span className="font-medium text-sm">{item.label}</span>
            </Link>
          ))}
        </nav>

        {/* {t('learning.footerInfo')} */}
        <div className="p-4 border-t">
          <div className="bg-muted rounded-lg p-3">
            <p className="text-xs font-medium mb-1">{t('learning.progress')}</p>
            <div className="flex items-center gap-2">
              <div className="flex-1 h-2 bg-background rounded-full overflow-hidden">
                <div className="h-full bg-primary w-[35%] rounded-full" />
              </div>
              <span className="text-xs text-muted-foreground">35%</span>
            </div>
            <p className="text-xs text-muted-foreground mt-2">{t('learning.todayLearned', { minutes: 12 })}</p>
          </div>
        </div>
      </aside>

      {/* Mobile Header */}
      <div className="lg:hidden fixed top-16 left-0 right-0 z-40 bg-card border-b">
        <div className="flex items-center justify-between p-4">
          <h2 className="font-bold">{t('learning.center')}</h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
        
        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <nav className="border-t p-3 space-y-1 max-h-[calc(100vh-140px)] overflow-auto">
            {navItems.map((item) => (
              <Link
                key={item.href}
                to={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors",
                  isActive(item.href)
                    ? "bg-primary text-primary-foreground"
                    : "hover:bg-accent"
                )}
              >
                <item.icon className={cn("h-5 w-5", !isActive(item.href) && item.color)} />
                <div className="flex-1">
                  <p className="font-medium">{item.label}</p>
                  <p className={cn(
                    "text-xs",
                    isActive(item.href) ? "text-primary-foreground/80" : "text-muted-foreground"
                  )}>
                    {item.description}
                  </p>
                </div>
              </Link>
            ))}
            <div className="border-t my-2" />
            {externalLinks.map((item) => (
              <Link
                key={item.href}
                to={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors",
                  isActive(item.href)
                    ? "bg-primary text-primary-foreground"
                    : "hover:bg-accent"
                )}
              >
                <item.icon className={cn("h-5 w-5", !isActive(item.href) && item.color)} />
                <span className="font-medium">{item.label}</span>
              </Link>
            ))}
          </nav>
        )}
      </div>

      {/* Main Content */}
      <main className="flex-1 overflow-auto p-6 lg:p-8 pt-20 lg:pt-8">
        <Outlet />
      </main>
    </div>
  )
}
