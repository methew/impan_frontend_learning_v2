import { createRootRoute, Link, Outlet, useRouterState, useNavigate } from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools'
import { Toaster } from 'sonner'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import '@/styles.css'
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
  TreeDeciduous,
  Scale,
  MessageCircle,
  FileText,
  Library,
  Tags,
  Layers,
  PenTool,
  Languages,
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
import '@/i18n'
import { APP_VERSION } from '@/version'
import { checkAuth as checkAuthStatus, logout, startTokenRefreshTimer, performTokenRefresh, getCurrentUser, type UserInfo } from '@/lib/auth'
import { cn } from '@/lib/utils'

// Create auth context to share auth state
interface AuthContextType {
  isAuth: boolean | null
  refreshAuth: () => void
}

const AuthContext = createContext<AuthContextType>({ isAuth: null, refreshAuth: () => { } })

// Create Query Client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5000,
      refetchOnWindowFocus: false,
    },
  },
})

interface NavItem {
  to: string
  label: string
  icon: React.ElementType
  children?: {
    to: string
    label: string
    icon: React.ElementType
    description?: string
  }[]
  isDropdownOnly?: boolean  // 仅作为下拉菜单触发器，不跳转
}

function useNavItems(): NavItem[] {
  const { t } = useTranslation()
  return [
    { to: '/', label: t('nav.home'), icon: Home },
    // { 
    //   to: '#language', 
    //   label: '语言学习', 
    //   icon: Languages,
    //   isDropdownOnly: true,
    //   children: [
    //     { to: '/ja', label: '日语', icon: BookOpen, description: '日本語学习 N5-N1' },
    //     { to: '/en', label: '英语', icon: BookOpen, description: 'English学习' },
    //   ]
    // },
    // { 
    //   to: '#subject', 
    //   label: '学科考试', 
    //   icon: GraduationCap,
    //   isDropdownOnly: true,
    //   children: [
    //     { to: '/engineer', label: '工程师考试', icon: GraduationCap, description: '工程师资格考试备考' },
    //   ]
    // },
  ]
}

function TopNavigation({ isAuth }: { isAuth: boolean | null }) {
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
            item?.children ? (
              <DropdownMenu key={item.to} modal={false}>
                <DropdownMenuTrigger asChild>
                  <button type="button" className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors rounded-md hover:bg-accent data-[state=open]:bg-accent data-[state=open]:text-foreground">
                    <item.icon className="h-4 w-4" />
                    {item.label}
                    <ChevronDown className="h-3 w-3 ml-1" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-64">
                  {item.children.map((child, index) => (
                    <div key={child.to}>
                      {index === 3 && <div className="h-px bg-border my-1" />}
                      <DropdownMenuItem
                        className="cursor-pointer"
                        onClick={() => { window.location.href = child.to }}
                      >
                        <div className="flex items-start gap-3 py-2">
                          <child.icon className="h-4 w-4 mt-0.5 shrink-0" />
                          <div className="flex flex-col">
                            <span className="text-sm font-medium">{child.label}</span>
                            {child.description && (
                              <span className="text-xs text-muted-foreground">{child.description}</span>
                            )}
                          </div>
                        </div>
                      </DropdownMenuItem>
                    </div>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link
                key={item.to}
                to={item.to}
                className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors [&.active]:text-foreground [&.active]:bg-accent rounded-md"
                activeProps={{ className: 'text-foreground bg-accent' }}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            )
          ))}
        </div>

        <div className="flex items-center gap-4">
          <UserMenu />
        </div>
      </div>

      {/* Mobile Navigation */}
      <MobileNavigation navItems={navItems} />
    </>
  )
}

function UserMenu() {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const [user, setUser] = useState<UserInfo | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // 检查登录状态
    const checkUser = async () => {
      const userInfo = await getCurrentUser()
      setUser(userInfo)
      setLoading(false)

      // 未登录时跳转到登录页
      if (!userInfo) {
        navigate({ to: '/login' })
      }
    }
    checkUser()
  }, [navigate])

  const handleLogout = () => {
    if (window.confirm('确定要退出登录吗？')) {
      logout()
    }
  }

  // 加载中显示简化版本
  if (loading) {
    return (
      <Button variant="ghost" size="sm" className="gap-2" disabled>
        <Avatar className="h-8 w-8">
          <AvatarFallback className="text-xs bg-primary text-primary-foreground">
            U
          </AvatarFallback>
        </Avatar>
      </Button>
    )
  }

  // 未登录时跳转到登录页（在 useEffect 中处理）
  if (!user) {
    return null
  }

  // 获取用户名的首字母或前两个字符作为头像
  const userInitial = user.username?.charAt(0).toUpperCase() ||
    user.email?.charAt(0).toUpperCase() || 'U'

  return (
    <div className='flex gap-4'>
      <Button
        size="lg" variant="outline"
      >

        <span className="hidden sm:inline max-w-25 truncate">
          {user.username || user.email}
        </span>

      </Button>
      <Button
        size="lg" variant="destructive"
        onClick={() => {
          if (window.confirm("是否退出")) {
            handleLogout()
          }
        }}
      >
        退出
      </Button>
    </div>



    //  <DropdownMenuTrigger asChild>
    //       <Button variant="ghost" size="sm" className="gap-2">
    //         <Avatar className="h-8 w-8">
    //           <AvatarFallback className="text-xs bg-primary text-primary-foreground">
    //             {userInitial}
    //           </AvatarFallback>
    //         </Avatar>
    //         <span className="hidden sm:inline max-w-25 truncate">
    //           {user.username || user.email}
    //         </span>
    //         <ChevronDown className="size-3" />
    //       </Button>
    //     </DropdownMenuTrigger> 
    //   <DropdownMenuContent align="end" className="w-56">
    //     <div className="px-2 py-1.5 text-sm font-medium text-muted-foreground border-b mb-1">
    //       {user.username || user.email}
    //     </div>
    //     <DropdownMenuItem onClick={() => navigate({ to: '/settings' })}>
    //       <Settings className="mr-2 size-4" />
    //       {t('nav.settings')}
    //     </DropdownMenuItem>
    //     <DropdownMenuItem onClick={handleLogout} className="text-red-600">
    //       <LogOut className="mr-2 size-4" />
    //       {t('common.logout')}
    //     </DropdownMenuItem>
    //   </DropdownMenuContent>
    // </DropdownMenu>
  )
}

// 移动端导航组件
function MobileNavigation({ navItems }: { navItems: NavItem[] }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set())
  const { t } = useTranslation()

  const toggleExpand = (to: string) => {
    setExpandedItems(prev => {
      const next = new Set(prev)
      if (next.has(to)) {
        next.delete(to)
      } else {
        next.add(to)
      }
      return next
    })
  }

  return (
    <div className="md:hidden flex items-center justify-between p-4 border-b bg-card h-16">
      <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="h-10 w-10">
            <Menu className="size-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-72 p-0">
          <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
          <div className="flex flex-col h-full">
            <div className="p-4 border-b">
              <Link to="/" className="flex items-center gap-2 font-bold text-lg">
                <GraduationCap className="h-6 w-6" />
                {t('login.title')}
              </Link>
            </div>

            <nav className="flex-1 overflow-y-auto p-2">
              {navItems.map((item) => {
                const Icon = item.icon
                const isExpanded = expandedItems.has(item.to)

                if (item.children) {
                  return (
                    <div key={item.to}>
                      <button
                        type="button"
                        onClick={() => toggleExpand(item.to)}
                        className="flex items-center justify-between w-full gap-3 px-3 py-3 rounded-md text-sm font-medium transition-colors hover:bg-accent"
                      >
                        <div className="flex items-center gap-3">
                          <Icon className="size-5" />
                          {item.label}
                        </div>
                        <ChevronDown className={cn("size-4 transition-transform", isExpanded && "rotate-180")} />
                      </button>

                      {isExpanded && (
                        <div className="ml-4 border-l-2 pl-2 my-1">
                          {item.children.map((child, index) => (
                            <div key={child.to}>
                              {index === 3 && (
                                <div className="px-3 py-1 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                  管理
                                </div>
                              )}
                              <Link
                                to={child.to}
                                onClick={() => setMobileMenuOpen(false)}
                                className="flex items-start gap-3 px-3 py-2 rounded-md text-sm transition-colors hover:bg-accent [&.active]:bg-accent"
                              >
                                <child.icon className="size-4 mt-0.5 shrink-0" />
                                <div className="flex flex-col">
                                  <span>{child.label}</span>
                                  {child.description && (
                                    <span className="text-xs text-muted-foreground">{child.description}</span>
                                  )}
                                </div>
                              </Link>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )
                }

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
                type="button"
                onClick={() => logout()}
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
  )
}

function RootComponent() {
  const [isAuth, setIsAuth] = useState<boolean | null>(null)
  const [lastRedirectTime, setLastRedirectTime] = useState<number>(0)
  const routerState = useRouterState()
  const currentPath = routerState.location.pathname

  useEffect(() => {
    // Check auth status on mount
    const check = async () => {
      const auth = await checkAuthStatus()
      setIsAuth(auth)
    }
    check()
  }, [])

  // Start token refresh timer when authenticated
  useEffect(() => {
    if (isAuth) {
      const cleanup = startTokenRefreshTimer()
      return cleanup
    }
  }, [isAuth])

  // Show loading while checking auth
  if (isAuth === null) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  // On /login or /oauth/callback route, always render outlet
  // These pages handle auth flow themselves
  if (currentPath === '/login' || currentPath.startsWith('/oauth/')) {
    return (
      <QueryClientProvider client={queryClient}>
        <AuthContext.Provider value={{ isAuth, refreshAuth: checkAuthStatus }}>
          <Outlet />
        </AuthContext.Provider>
        <ReactQueryDevtools initialIsOpen={false} />
      </QueryClientProvider>
    )
  }

  // On other routes, redirect to login if not authenticated
  // 添加冷却期，防止无限重定向循环
  if (!isAuth) {
    if (typeof window !== 'undefined') {
      const now = Date.now()
      // 5秒内不重定向超过一次
      if (now - lastRedirectTime > 5000) {
        setLastRedirectTime(now)
        window.location.href = '/login'
      }
    }
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="ml-2 text-muted-foreground">正在跳转...</p>
      </div>
    )
  }

  // Authenticated layout
  return (
    <QueryClientProvider client={queryClient}>
      <AuthContext.Provider value={{ isAuth, refreshAuth: checkAuthStatus }}>
        <div className="min-h-screen flex flex-col bg-background">
          <TopNavigation isAuth={isAuth} />
          <main className="flex-1 p-4 md:p-6 overflow-hidden relative">
            <Outlet />
            <div className="fixed bottom-2 right-2 text-[10px] text-muted-foreground/60 pointer-events-none select-none z-50">
              {APP_VERSION}
            </div>
          </main>
        </div>
        <TanStackRouterDevtools />
      </AuthContext.Provider>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  )
}

export const Route = createRootRoute({
  component: RootComponent,
})
