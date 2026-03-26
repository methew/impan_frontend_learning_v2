import { createRootRoute, Link, Outlet, useRouterState, useNavigate } from '@tanstack/react-router'
import { 
  BookOpen, 
  GraduationCap,
  ClipboardList,
  BarChart3,
  ChevronDown,
  LogOut,
  Menu,
  Home,
  Loader2,
  Settings,
  FlaskConical
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from '@/components/ui/sheet'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useState, useEffect, createContext } from 'react'
import { useTranslation } from 'react-i18next'
import { isAuthenticated } from '@/lib/auth'

// Create auth context to share auth state
interface AuthContextType {
  isAuth: boolean | null
  refreshAuth: () => void
}

const AuthContext = createContext<AuthContextType>({ isAuth: null, refreshAuth: () => {} })


function useNavItems() {
  const { t } = useTranslation()
  return [
    { to: '/', label: t('nav.home'), icon: Home },
    { 
      to: '/learning/content', 
      label: t('nav.learning'), 
      icon: BookOpen,
      children: [
        { to: '/learning/content', label: t('nav.content'), icon: BookOpen },
        { to: '/learning/courses', label: t('nav.courses'), icon: GraduationCap },
        { to: '/learning/subjects', label: t('nav.subjects'), icon: FlaskConical },
      ]
    },
    { to: '/exams', label: t('nav.exams'), icon: ClipboardList },
    { to: '/periodic', label: t('nav.periodic'), icon: GraduationCap },
    { to: '/stats', label: t('nav.stats'), icon: BarChart3 },
  ]
}

function TopNavigation({ isAuth }: { isAuth: boolean | null }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const { t } = useTranslation()
  const navItems = useNavItems()

  if (isAuth === null) {
    // Still loading auth state
    return (
      <div className="p-4 flex items-center justify-between border-b bg-card">
        <Link to="/" className="flex items-center gap-2 font-bold text-lg">
          <GraduationCap className="h-6 w-6" />
          {t('login.title')}
        </Link>
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!isAuth) {
    return (
      <div className="p-4 flex items-center justify-between border-b bg-card">
        <Link to="/" className="flex items-center gap-2 font-bold text-lg">
          <GraduationCap className="h-6 w-6" />
          {t('login.title')}
        </Link>
        <Link to="/login">
          <Button variant="default" size="sm">{t('common.login')}</Button>
        </Link>
      </div>
    )
  }

  return (
    <>
      {/* Desktop Navigation */}
      <div className="hidden md:flex p-4 gap-4 items-center justify-between border-b bg-card">
        <div className="flex items-center gap-2">
          <Link to="/" className="flex items-center gap-2 font-bold text-lg mr-6">
            <GraduationCap className="h-6 w-6" />
            {t('login.title')}
          </Link>
          {navItems.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors [&.active]:text-foreground [&.active]:bg-accent rounded-md"
              activeProps={{ className: 'text-foreground bg-accent' }}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-4">
          <UserMenu />
        </div>
      </div>

      {/* Mobile Navigation */}
      <div className="md:hidden flex items-center justify-between p-4 border-b bg-card h-16">
        <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="h-10 w-10">
              <Menu className="size-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-64 p-0">
            <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
            <div className="flex flex-col h-full">
              <div className="p-4 border-b">
                <Link to="/" className="flex items-center gap-2 font-bold text-lg">
                  <GraduationCap className="h-6 w-6" />
                  {t('login.title')}
                </Link>
              </div>
              
              <nav className="flex-1 p-2">
                {navItems.map((item) => {
                  const Icon = item.icon
                  return (
                    <Link
                      key={item.to}
                      to={item.to}
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center gap-3 px-3 py-3 rounded-md text-sm font-medium transition-colors hover:bg-accent [&.active]:bg-accent"
                    >
                      <Icon className="size-5" />
                      {item.label}
                    </Link>
                  )
                })}
              </nav>
              
              <div className="p-2 border-t">
                <button
                  onClick={() => {
                    localStorage.clear()
                    window.location.href = '/login'
                  }}
                  className="flex items-center gap-3 px-3 py-3 rounded-md text-sm font-medium text-red-600 w-full transition-colors hover:bg-red-50"
                >
                  <LogOut className="size-5" />
                  {t('common.logout')}
                </button>
              </div>
            </div>
          </SheetContent>
        </Sheet>

        <Link to="/" className="font-bold text-lg flex items-center gap-2">
          <GraduationCap className="h-5 w-5" />
          {t('login.title')}
        </Link>

        <UserMenu />
      </div>
    </>
  )
}

function UserMenu() {
  const navigate = useNavigate()
  const { t } = useTranslation()
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="gap-2">
          <Avatar className="h-8 w-8">
            <AvatarFallback className="text-xs bg-primary text-primary-foreground">
              U
            </AvatarFallback>
          </Avatar>
          <ChevronDown className="size-3" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuItem onClick={() => navigate({ to: '/settings' })}>
          <Settings className="mr-2 size-4" />
          {t('nav.settings')}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => {
          localStorage.clear()
          window.location.href = '/login'
        }} className="text-red-600">
          <LogOut className="mr-2 size-4" />
          {t('common.logout')}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

function RootComponent() {
  const [isAuth, setIsAuth] = useState<boolean | null>(null)
  const [isClient, setIsClient] = useState(false)
  const routerState = useRouterState()
  const navigate = useNavigate()
  const currentPath = routerState.location.pathname

  const checkAuth = () => {
    const auth = isAuthenticated()
    setIsAuth(auth)
    return auth
  }

  useEffect(() => {
    setIsClient(true)
    checkAuth()
  }, [])

  useEffect(() => {
    if (!isClient || isAuth === null) return
    
    // Only redirect if definitely not authenticated
    if (!isAuth && currentPath !== '/login') {
      navigate({ to: '/login' })
    }
  }, [isAuth, isClient, currentPath, navigate])

  if (!isClient) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (currentPath === '/login') {
    return <Outlet />
  }

  return (
    <AuthContext.Provider value={{ isAuth, refreshAuth: checkAuth }}>
      <div className="min-h-screen flex flex-col bg-background">
        <TopNavigation isAuth={isAuth} />
        <main className="flex-1 p-4 md:p-6">
          <Outlet />
        </main>
      </div>
    </AuthContext.Provider>
  )
}

export const Route = createRootRoute({
  component: () => <RootComponent />,
})
