import { createFileRoute } from '@tanstack/react-router'
import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { GraduationCap } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { startOAuth2Login } from '@/lib/oauth2'

export const Route = createFileRoute('/login')({
  component: LoginPage,
})

function LoginPage() {
  const { t } = useTranslation()

  useEffect(() => {
    // 启动 OAuth 2.0 登录流程
    // 注意：OAuth 回调在 /oauth/callback 路由处理
    startOAuth2Login()
  }, [])

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="p-3 rounded-xl bg-primary">
              <GraduationCap className="h-8 w-8 text-primary-foreground" />
            </div>
          </div>
          <CardTitle className="text-2xl">
            {t('login.redirecting') || 'Redirecting...'}
          </CardTitle>
          <CardDescription>
            {t('login.redirectingToLogin') || 'Redirecting to login page...'}
          </CardDescription>
          <CardDescription className="text-xs text-muted-foreground mt-2">
            OAuth 2.0 + PKCE 安全登录
          </CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center pb-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </CardContent>
      </Card>
    </div>
  )
}

// 组件已内联在 Route 配置中，不需要单独导出
