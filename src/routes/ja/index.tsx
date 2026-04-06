import { createFileRoute, Link } from '@tanstack/react-router'
import { BookOpen, GitBranch, Pencil, Quote, ArrowLeft, Settings, Upload } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { japaneseConfig } from '@/config/languages'

export const Route = createFileRoute('/ja/')({
  component: JapaneseDashboard,
})

const moduleIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  vocabulary: BookOpen,
  grammar: GitBranch,
  kanji: Pencil,
  idioms: Quote,
}

function JapaneseDashboard() {
  const lang = japaneseConfig

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link to="/">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div className="flex items-center gap-3">
            <span className="text-4xl">{lang.flag}</span>
            <div>
              <h1 className="text-2xl font-bold">{lang.nativeName}</h1>
              <p className="text-sm text-muted-foreground">{lang.name} · {lang.writingSystem}</p>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <Link to="/ja/import">
            <Button variant="outline" size="sm">
              <Upload className="mr-2 h-4 w-4" />
              导入资料
            </Button>
          </Link>
          <Button variant="ghost" size="icon">
            <Settings className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Learning Progress */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <ProgressCard 
          title="词汇 N5" 
          current={320} 
          total={675} 
          percentage={47} 
          color="bg-red-500"
        />
        <ProgressCard 
          title="语法 N5" 
          current={45} 
          total={100} 
          percentage={45} 
          color="bg-blue-500"
        />
        <ProgressCard 
          title="汉字 N5" 
          current={40} 
          total={100} 
          percentage={40} 
          color="bg-orange-500"
        />
      </div>

      {/* Learning Modules */}
      <div>
        <h2 className="text-lg font-semibold mb-4">学习模块</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {lang.modules.map((module) => {
            const Icon = moduleIcons[module.id] || BookOpen
            return (
              <ModuleCard 
                key={module.id} 
                module={module} 
                icon={Icon}
                langCode={lang.code}
              />
            )
          })}
        </div>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>最近学习</CardTitle>
          <CardDescription>你最近学习的日语内容</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          <ActivityItem 
            term="食べる" 
            reading="たべる" 
            module="词汇" 
            time="2小时前"
          />
          <ActivityItem 
            term="～てください" 
            module="语法" 
            time="昨天"
          />
          <ActivityItem 
            term="間" 
            reading="あいだ/ま" 
            module="汉字" 
            time="3天前"
          />
        </CardContent>
      </Card>
    </div>
  )
}

function ProgressCard({ title, current, total, percentage }: {
  title: string
  current: number
  total: number
  percentage: number
  color?: string
}) {
  return (
    <Card>
      <CardContent className="p-4 space-y-3">
        <div className="flex justify-between items-center">
          <span className="font-medium">{title}</span>
          <Badge variant="secondary">{current}/{total}</Badge>
        </div>
        <div className="space-y-1">
          <Progress value={percentage} className="h-2" />
          <p className="text-xs text-muted-foreground text-right">{percentage}%</p>
        </div>
      </CardContent>
    </Card>
  )
}

function ModuleCard({ module, icon: Icon }: {
  module: typeof japaneseConfig.modules[0]
  icon: React.ComponentType<{ className?: string }>
  langCode?: string
}) {
  return (
    <Card className="group hover:shadow-lg transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Icon className="h-6 w-6 text-primary" />
            </div>
            <div>
              <CardTitle className="text-lg">{module.name}</CardTitle>
              <CardDescription className="line-clamp-1">{module.description}</CardDescription>
            </div>
          </div>
          <div className="flex gap-1">
            <Button variant="ghost" size="icon" className="h-8 w-8" title="导入">
            <Upload className="h-4 w-4" />
          </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-2 mb-4">
          {module.submodules?.slice(0, 4).map((sub) => (
            <Badge key={sub} variant="outline" className="text-xs">
              {sub.toUpperCase()}
            </Badge>
          ))}
        </div>
        <div className="flex gap-2">
          <Link to={'/ja/vocabulary' as any} className="flex-1">
            <Button variant="default" className="w-full">
              进入学习
            </Button>
          </Link>
          <Button variant="outline">添加</Button>
        </div>
      </CardContent>
    </Card>
  )
}

function ActivityItem({ term, reading, module, time }: {
  term: string
  reading?: string
  module: string
  time: string
}) {
  return (
    <div className="flex items-center justify-between py-2 border-b last:border-0">
      <div className="flex items-center gap-3">
        <div>
          <p className="font-medium">
            {term}
            {reading && <span className="text-muted-foreground ml-2">[{reading}]</span>}
          </p>
          <p className="text-xs text-muted-foreground">{module}</p>
        </div>
      </div>
      <span className="text-xs text-muted-foreground">{time}</span>
    </div>
  )
}
