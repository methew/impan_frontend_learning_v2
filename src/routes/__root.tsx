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
  TreeDeciduous,
  Scale,
  MessageCircle,
  FileText,
  Library,
  Tags,
  Layers,
  PenTool,
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
import { checkAuth as checkAuthStatus, logout } from '@/lib/auth'
import { cn } from '@/lib/utils'

// Create auth context to share auth state
interface AuthContextType {
  isAuth: boolean | null
  refreshAuth: () => void
}

const AuthContext = createContext<AuthContextType>({ isAuth: null, refreshAuth: () => {} })


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
}

function useNavItems(): NavItem[] {
  const { t } = useTranslation()
  return [
    { to: '/', label: t('nav.home'), icon: Home },
    { 
      to: '/learning/content', 
      label: t('nav.learning'), 
      icon: BookOpen,
      children: [
        // 学习内容
        { to: '/learning/content', label: '学习内容', icon: BookOpen, description: '浏览全部学习资源' },
        { to: '/learning/flashcards', label: '闪卡练习', icon: Layers, description: '记忆卡片复习' },
        { to: '/learning/writing', label: '写作练习', icon: PenTool, description: '句子仿写练习' },
        // 分隔线（在渲染时处理）
        { to: '/learning/courses', label: '课程管理', icon: Library, description: '管理课程体系' },
        { to: '/learning/vocab', label: '词汇管理', icon: TreeDeciduous, description: '词汇树形管理' },
        { to: '/learning/grammar', label: '语法管理', icon: Scale, description: '语法点管理' },
        { to: '/learning/idioms', label: '惯用语管理', icon: MessageCircle, description: '惯用语管理' },
        { to: '/learning/texts', label: '课文管理', icon: FileText, description: '课文内容管理' },
        { to: '/learning/categories', label: '学科管理', icon: Tags, description: '分类标签管理' },
      ]
    },
    { to: '/exams', label: t('nav.exams'), icon: ClipboardList },
    { to: '/periodic', label: t('nav.periodic'), icon: GraduationCap },
    { to: '/stats', label: t('nav.stats'), icon: BarChart3 },
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
            item.children ? (
              <DropdownMenu key={item.to}>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors rounded-md hover:bg-accent data-[state=open]:bg-accent data-[state=open]:text-foreground">
                    <item.icon className="h-4 w-4" />
                    {item.label}
                    <ChevronDown className="h-3 w-3 ml-1" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-64">
                  {item.children.map((child, index) => (
                    <div key={child.to}>
                      {/* 在第三项后添加分隔线 */}
                      {index === 3 && <div className="h-px bg-border my-1" />}
                      <DropdownMenuItem asChild className="cursor-pointer">
                        <Link to={child.to} className="flex items-start gap-3 py-2">
                          <child.icon className="h-4 w-4 mt-0.5 shrink-0" />
                          <div className="flex flex-col">
                            <span className="text-sm font-medium">{child.label}</span>
                            {child.description && (
                              <span className="text-xs text-muted-foreground">{child.description}</span>
                            )}
                          </div>
                        </Link>
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
          logout()
        }} className="text-red-600">
          <LogOut className="mr-2 size-4" />
          {t('common.logout')}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
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
                onClick={() => {
                  logout()
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
  )
}

function RootComponent() {
  const [isAuth, setIsAuth] = useState<boolean | null>(null)
  const [isClient, setIsClient] = useState(false)
  const routerState = useRouterState()
  const navigate = useNavigate()
  const currentPath = routerState.location.pathname

  const doCheckAuth = async () => {
    const auth = await checkAuthStatus()
    setIsAuth(auth)
    return auth
  }

  useEffect(() => {
    setIsClient(true)
    doCheckAuth()
  }, [])

  useEffect(() => {
    if (!isClient || isAuth === null) return
    
    // 排除登录相关路由的认证检查
    const isAuthPage = currentPath === '/login' || currentPath.startsWith('/oauth/')
    
    // Only redirect if definitely not authenticated
    if (!isAuth && !isAuthPage) {
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

  // On /login or /oauth/callback route, always render outlet
  // These pages handle auth flow themselves
  if (currentPath === '/login' || currentPath.startsWith('/oauth/')) {
    return <Outlet />
  }

  return (
    <AuthContext.Provider value={{ isAuth, refreshAuth: checkAuthStatus }}>
      <div className="min-h-screen flex flex-col bg-background">
        <TopNavigation isAuth={isAuth} />
        <main className="flex-1 p-4 md:p-6 overflow-hidden">
          <Outlet />
        </main>
      </div>
    </AuthContext.Provider>
  )
}

export const Route = createRootRoute({
  component: () => <RootComponent />,
})
