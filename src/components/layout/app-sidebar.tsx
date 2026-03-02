"use client"

import { Link } from "@tanstack/react-router"
import { useTranslation } from 'react-i18next'
import {
  BookOpen,
  Brain,
  ChevronDown,
  ChevronUp,
  GraduationCap,
  LayoutDashboard,
  Library,
  LogOut,
  Settings,
  Trophy,
  User,
  Users,
  Loader2,
} from "lucide-react"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Skeleton } from "@/components/ui/skeleton"
import { useAuthUser, useLogout, getUserDisplayName, getUserInitials } from "@/hooks/useAuthUser"

const courses = [
  { nameKey: "course.japaneseN3", id: "japanese-n3" },
  { nameKey: "course.englishBusiness", id: "english-business" },
  { nameKey: "course.pythonProgramming", id: "python" },
]

export function AppSidebar() {
  const { t } = useTranslation()
  const { data: user, isLoading: isLoadingUser } = useAuthUser()
  const logout = useLogout()

  const handleLogout = () => {
    logout.mutate()
  }

  const mainNavItems = [
    { titleKey: "nav.dashboard", url: "/", icon: LayoutDashboard },
    { titleKey: "nav.courses", url: "/courses", icon: Library },
    { titleKey: "nav.flashcards", url: "/flashcards", icon: Brain },
    { titleKey: "nav.progress", url: "/progress", icon: Trophy },
  ]

  const settingsNavItems = [
    { titleKey: "nav.settings", url: "/settings", icon: Settings },
    { titleKey: "nav.studyGroup", url: "/study-group", icon: Users },
  ]

  return (
    <Sidebar variant="inset" collapsible="icon">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link to="/">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                  <GraduationCap className="size-4" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">{t('common.appName')}</span>
                  <span className="truncate text-xs">{t('common.appSubtitle')}</span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>{t('study.study')}</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainNavItems.map((item) => (
                <SidebarMenuItem key={item.url}>
                  <SidebarMenuButton asChild tooltip={t(item.titleKey)}>
                    <Link to={item.url}>
                      <item.icon />
                      <span>{t(item.titleKey)}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>{t('settings.coreSettings')}</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {settingsNavItems.map((item) => (
                <SidebarMenuItem key={item.url}>
                  <SidebarMenuButton asChild tooltip={t(item.titleKey)}>
                    <Link to={item.url}>
                      <item.icon />
                      <span>{t(item.titleKey)}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        {/* Course Switcher */}
        <SidebarGroup>
          <SidebarGroupLabel>{t('common.currentCourse')}</SidebarGroupLabel>
          <SidebarGroupContent>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton variant="outline">
                  <BookOpen className="size-4" />
                  <span>{t('course.japaneseN3')}</span>
                  <ChevronDown className="ml-auto size-4" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                side="top"
                className="w-[--radix-popper-anchor-width]"
              >
                {courses.map((course) => (
                  <DropdownMenuItem key={course.id}>
                    <span>{t(course.nameKey)}</span>
                  </DropdownMenuItem>
                ))}
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <span>{t('common.startNewCourse')}</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* User Menu */}
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton
                  size="lg"
                  className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                >
                  <Avatar className="h-8 w-8 rounded-lg">
                    <AvatarFallback className="rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                      {isLoadingUser ? (
                        <Loader2 className="size-4 animate-spin" />
                      ) : (
                        getUserInitials(user)
                      )}
                    </AvatarFallback>
                  </Avatar>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    {isLoadingUser ? (
                      <>
                        <Skeleton className="h-4 w-20 mb-1" />
                        <Skeleton className="h-3 w-24" />
                      </>
                    ) : (
                      <>
                        <span className="truncate font-semibold">{getUserDisplayName(user)}</span>
                        <span className="truncate text-xs">{user?.email}</span>
                      </>
                    )}
                  </div>
                  <ChevronUp className="ml-auto size-4" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                side="top"
                className="w-[--radix-popper-anchor-width]"
              >
                <DropdownMenuItem asChild>
                  <Link to="/profile">
                    <User className="mr-2 size-4" />
                    {t('nav.profile')}
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/settings">
                    <Settings className="mr-2 size-4" />
                    {t('nav.settings')}
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  onClick={handleLogout}
                  disabled={logout.isPending}
                >
                  {logout.isPending ? (
                    <Loader2 className="mr-2 size-4 animate-spin" />
                  ) : (
                    <LogOut className="mr-2 size-4" />
                  )}
                  {t('nav.logout')}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}
