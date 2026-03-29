import { createFileRoute, Link } from '@tanstack/react-router'
import { PenTool, BookOpen, AlertCircle, FileText } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export const Route = createFileRoute('/learning/writing/')({
  component: WritingPage,
})

function WritingPage() {
  const features = [
    {
      icon: PenTool,
      title: '写作练习',
      description: '看义写句、听写、填空、翻译等多种练习',
      to: '/learning/writing/practice',
      color: 'bg-blue-500',
    },
    {
      icon: BookOpen,
      title: '句子学习',
      description: '通过填空学习经典句子',
      to: '/learning/writing/sentences',
      color: 'bg-green-500',
    },
    {
      icon: AlertCircle,
      title: '错题本',
      description: '复习写作中的错误',
      to: '/learning/writing/mistakes',
      color: 'bg-orange-500',
    },
    {
      icon: FileText,
      title: '写作提示',
      description: '管理和使用写作提示',
      to: '/learning/writing/prompts',
      color: 'bg-purple-500',
    },
  ]

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center space-y-4 py-8">
        <div className="flex items-center justify-center gap-2">
          <PenTool className="h-8 w-8 text-primary" />
          <h1 className="text-4xl font-bold">写作练习</h1>
        </div>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          通过多种练习模式提升写作能力
        </p>
      </div>

      {/* Features Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {features.map((feature) => (
          <Link key={feature.to} to={feature.to}>
            <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader className="flex flex-row items-center gap-4">
                <div className={`p-3 rounded-lg ${feature.color} text-white`}>
                  <feature.icon className="h-6 w-6" />
                </div>
                <div>
                  <CardTitle>{feature.title}</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{feature.description}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Coming Soon */}
      <Card className="bg-muted/50">
        <CardContent className="py-8 text-center">
          <p className="text-muted-foreground">
            Writing 模块功能正在完善中，敬请期待...
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
