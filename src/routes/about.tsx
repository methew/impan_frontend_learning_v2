import { createFileRoute, Link } from '@tanstack/react-router'
import { 
  GraduationCap, 
  BookOpen, 
  BrainCircuit,
  Target,
  ArrowRight,
  Sparkles
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'

export const Route = createFileRoute('/about')({
  component: AboutPage,
})

function AboutPage() {
  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      {/* Hero Section */}
      <div className="text-center mb-12">
        <div className="inline-flex items-center justify-center p-3 bg-primary/10 rounded-full mb-4">
          <GraduationCap className="h-10 w-10 text-primary" />
        </div>
        <h1 className="text-4xl font-bold mb-4">关于学习系统</h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          一个基于间隔重复和主动回忆的高效学习平台，帮助你更智能地学习
        </p>
      </div>

      {/* Features Grid */}
      <div className="grid gap-6 md:grid-cols-2 mb-12">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-blue-500" />
              闪卡学习
            </CardTitle>
            <CardDescription>
              基于艾宾浩斯遗忘曲线的智能复习系统
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-yellow-500" />
                智能安排复习时间
              </li>
              <li className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-yellow-500" />
                多种卡片类型支持
              </li>
              <li className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-yellow-500" />
                学习进度追踪
              </li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BrainCircuit className="h-5 w-5 text-purple-500" />
              写作练习
            </CardTitle>
            <CardDescription>
              通过仿写练习提升语言表达能力
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-yellow-500" />
                AI 辅助句子分析
              </li>
              <li className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-yellow-500" />
                智能评分反馈
              </li>
              <li className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-yellow-500" />
                渐进式难度提升
              </li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-green-500" />
              模拟考试
            </CardTitle>
            <CardDescription>
              模拟真实考试环境，检验学习成果
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-yellow-500" />
                多种题型支持
              </li>
              <li className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-yellow-500" />
                详细成绩分析
              </li>
              <li className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-yellow-500" />
                错题本自动整理
              </li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <GraduationCap className="h-5 w-5 text-orange-500" />
              课程管理
            </CardTitle>
            <CardDescription>
              系统化的课程组织和知识体系
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-yellow-500" />
                树形知识结构
              </li>
              <li className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-yellow-500" />
                标签分类管理
              </li>
              <li className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-yellow-500" />
                学习路径规划
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>

      {/* CTA Section */}
      <div className="text-center bg-gradient-to-r from-primary/5 to-primary/10 rounded-2xl p-8">
        <h2 className="text-2xl font-bold mb-4">开始学习之旅</h2>
        <p className="text-muted-foreground mb-6 max-w-lg mx-auto">
          无论你是学生、职场人士还是终身学习者，这里都有适合你的学习工具
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <Button asChild size="lg">
            <Link to="/learning/content">
              浏览学习内容
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
          <Button variant="outline" size="lg" asChild>
            <Link to="/learning/flashcards">
              开始闪卡练习
            </Link>
          </Button>
        </div>
      </div>

      {/* Footer */}
      <div className="text-center mt-12 text-sm text-muted-foreground">
        <p>基于科学的学习方法，让学习更高效、更有趣</p>
      </div>
    </div>
  )
}

export default AboutPage
