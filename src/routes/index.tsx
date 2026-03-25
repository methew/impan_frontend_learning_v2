import { createFileRoute, Link } from '@tanstack/react-router'
import { 
  BookOpen, 
  GraduationCap,
  ClipboardList,
  BarChart3,
  ArrowRight,
  Sparkles,
  TreeDeciduous,
  FlaskConical,
  Layers,
  PenTool,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export const Route = createFileRoute('/')({
  component: HomePage,
})

function HomePage() {
  const features = [
    {
      icon: BookOpen,
      title: '学习内容',
      description: '词汇、语法、惯用语、课文系统学习',
      to: '/learning',
      color: 'bg-blue-500',
    },
    {
      icon: Layers,
      title: '闪卡复习',
      description: 'FSRS 间隔重复记忆',
      to: '/learning/flashcards',
      color: 'bg-purple-500',
    },
    {
      icon: PenTool,
      title: '写作练习',
      description: '句子仿写、写作提示',
      to: '/learning/writing',
      color: 'bg-green-500',
    },
    {
      icon: ClipboardList,
      title: '模拟考试',
      description: '各种题型的模拟考试练习',
      to: '/exams',
      color: 'bg-orange-500',
    },
    {
      icon: GraduationCap,
      title: '周期考试',
      description: '每日/每周/每月定期考试',
      to: '/periodic',
      color: 'bg-red-500',
    },
    {
      icon: BarChart3,
      title: '学习统计',
      description: '查看学习进度和考试统计',
      to: '/stats',
      color: 'bg-cyan-500',
    },
  ]

  const learningTypes = [
    { icon: TreeDeciduous, title: '词汇', to: '/learning', color: 'bg-emerald-500' },
    { icon: FlaskConical, title: '语法', to: '/learning', color: 'bg-cyan-500' },
    { icon: BookOpen, title: '惯用语', to: '/learning', color: 'bg-indigo-500' },
    { icon: BookOpen, title: '课文', to: '/learning', color: 'bg-rose-500' },
  ]

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="text-center space-y-4 py-8">
        <div className="flex items-center justify-center gap-2">
          <Sparkles className="h-8 w-8 text-primary" />
          <h1 className="text-4xl font-bold">语言学习考试系统</h1>
        </div>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          系统化的语言学习内容，配合多样化的考试模式，助你高效学习
        </p>
        <div className="flex justify-center gap-4 pt-4">
          <Link to="/learning">
            <Button size="lg">
              开始学习
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
          <Link to="/exams">
            <Button variant="outline" size="lg">
              去考试
            </Button>
          </Link>
        </div>
      </div>

      {/* Quick Access - Learning Types */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {learningTypes.map((type) => (
          <Link key={type.to} to={type.to}>
            <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer text-center">
              <CardContent className="p-6">
                <div className={`p-3 rounded-lg ${type.color} text-white inline-flex mb-3`}>
                  <type.icon className="h-6 w-6" />
                </div>
                <h3 className="font-medium">{type.title}</h3>
              </CardContent>
            </Card>
          </Link>
        ))}
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
    </div>
  )
}
