/**
 * 个性化学习推荐组件
 * 
 * 基于学习数据提供个性化推荐
 */
import { useState, useEffect } from 'react'
import { 
  Sparkles, 
  Lightbulb, 
  Target, 
  TrendingUp, 
  Clock,
  ChevronRight,
  RotateCcw,
  BookOpen,
  PenTool,
  GraduationCap
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Link } from '@tanstack/react-router'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

interface Recommendation {
  id: string
  type: 'review' | 'new' | 'practice' | 'exam' | 'streak'
  priority: 'high' | 'medium' | 'low'
  title: string
  description: string
  action: {
    label: string
    link: string
  }
  metadata?: {
    count?: number
    time?: string
    progress?: number
  }
}

// 模拟推荐数据
const mockRecommendations: Recommendation[] = [
  {
    id: '1',
    type: 'review',
    priority: 'high',
    title: '闪卡复习',
    description: '你有 12 张卡片即将到期，建议立即复习',
    action: { label: '开始复习', link: '/learning/flashcards' },
    metadata: { count: 12, time: '约 10 分钟' },
  },
  {
    id: '2',
    type: 'new',
    priority: 'medium',
    title: '学习新词汇',
    description: '基于你的学习进度，推荐学习 N4 词汇单元',
    action: { label: '开始学习', link: '/learning/content' },
    metadata: { count: 20, progress: 65 },
  },
  {
    id: '3',
    type: 'practice',
    priority: 'medium',
    title: '写作练习',
    description: '你最近学习的词汇可以进行造句练习',
    action: { label: '去练习', link: '/learning/writing' },
    metadata: { count: 8 },
  },
  {
    id: '4',
    type: 'exam',
    priority: 'low',
    title: '模拟考试',
    description: '你已准备好参加 JLPT N5 模拟测试',
    action: { label: '参加考试', link: '/exams' },
    metadata: { progress: 85 },
  },
  {
    id: '5',
    type: 'streak',
    priority: 'high',
    title: '保持连续学习',
    description: '连续学习 7 天，今天再学 15 分钟即可达到目标',
    action: { label: '立即学习', link: '/learning/content' },
    metadata: { time: '15 分钟' },
  },
]

const typeConfig = {
  review: { icon: RotateCcw, color: 'bg-blue-500', label: '复习' },
  new: { icon: BookOpen, color: 'bg-green-500', label: '新内容' },
  practice: { icon: PenTool, color: 'bg-purple-500', label: '练习' },
  exam: { icon: GraduationCap, color: 'bg-orange-500', label: '考试' },
  streak: { icon: TrendingUp, color: 'bg-red-500', label: '连续学习' },
}

const priorityConfig = {
  high: { color: 'text-red-600 bg-red-50 border-red-200', label: '高优先级' },
  medium: { color: 'text-yellow-600 bg-yellow-50 border-yellow-200', label: '中优先级' },
  low: { color: 'text-blue-600 bg-blue-50 border-blue-200', label: '低优先级' },
}

export function LearningRecommendations() {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [dismissed, setDismissed] = useState<Set<string>>(new Set())

  useEffect(() => {
    // 模拟加载推荐数据
    setTimeout(() => {
      setRecommendations(mockRecommendations)
      setIsLoading(false)
    }, 500)
  }, [])

  const handleDismiss = (id: string) => {
    setDismissed(prev => new Set(prev).add(id))
    toast.success('已忽略此推荐')
  }

  const filteredRecommendations = recommendations.filter(r => !dismissed.has(r.id))

  // 按优先级排序
  const sortedRecommendations = [...filteredRecommendations].sort((a, b) => {
    const priorityOrder = { high: 0, medium: 1, low: 2 }
    return priorityOrder[a.priority] - priorityOrder[b.priority]
  })

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-muted rounded w-1/3" />
            <div className="h-20 bg-muted rounded" />
            <div className="h-20 bg-muted rounded" />
          </div>
        </CardContent>
      </Card>
    )
  }

  if (sortedRecommendations.length === 0) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <Lightbulb className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">暂无推荐</p>
          <p className="text-sm text-muted-foreground">继续保持学习，我们会为你生成个性化推荐</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-500/10 rounded-lg">
              <Sparkles className="h-5 w-5 text-yellow-600" />
            </div>
            <div>
              <CardTitle>今日推荐</CardTitle>
              <CardDescription>基于你的学习进度为你推荐</CardDescription>
            </div>
          </div>
          <Badge variant="secondary">
            {sortedRecommendations.length} 个推荐
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {sortedRecommendations.map((rec) => {
          const config = typeConfig[rec.type]
          const Icon = config.icon
          const priorityStyle = priorityConfig[rec.priority]

          return (
            <div
              key={rec.id}
              className={cn(
                "p-4 rounded-lg border-2 transition-all hover:shadow-md",
                priorityStyle.color
              )}
            >
              <div className="flex items-start gap-4">
                <div className={cn("p-2 rounded-lg text-white shrink-0", config.color)}>
                  <Icon className="h-5 w-5" />
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold">{rec.title}</span>
                    <Badge variant="outline" className="text-xs">
                      {config.label}
                    </Badge>
                  </div>
                  
                  <p className="text-sm opacity-90 mb-3">
                    {rec.description}
                  </p>
                  
                  {/* 元数据 */}
                  {rec.metadata && (
                    <div className="flex items-center gap-4 mb-3">
                      {rec.metadata.count !== undefined && (
                        <span className="text-xs flex items-center gap-1">
                          <Target className="h-3 w-3" />
                          {rec.metadata.count} 项
                        </span>
                      )}
                      {rec.metadata.time && (
                        <span className="text-xs flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {rec.metadata.time}
                        </span>
                      )}
                      {rec.metadata.progress !== undefined && (
                        <div className="flex items-center gap-2 flex-1 max-w-[100px]">
                          <Progress value={rec.metadata.progress} className="h-1.5" />
                          <span className="text-xs">{rec.metadata.progress}%</span>
                        </div>
                      )}
                    </div>
                  )}
                  
                  <div className="flex items-center gap-2">
                    <Link to={rec.action.link}>
                      <Button size="sm" className={config.color}>
                        {rec.action.label}
                        <ChevronRight className="ml-1 h-4 w-4" />
                      </Button>
                    </Link>
                    <Button 
                      size="sm" 
                      variant="ghost"
                      onClick={() => handleDismiss(rec.id)}
                    >
                      忽略
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </CardContent>
    </Card>
  )
}

// 迷你推荐组件（用于首页）
export function MiniRecommendations() {
  const [topRecommendation, setTopRecommendation] = useState<Recommendation | null>(null)

  useEffect(() => {
    // 获取最高优先级的推荐
    const top = mockRecommendations.find(r => r.priority === 'high') || mockRecommendations[0]
    setTopRecommendation(top)
  }, [])

  if (!topRecommendation) return null

  const config = typeConfig[topRecommendation.type]
  const Icon = config.icon

  return (
    <Card className="border-l-4 border-l-yellow-500">
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <div className={cn("p-2 rounded-lg text-white", config.color)}>
            <Icon className="h-4 w-4" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-medium text-sm">{topRecommendation.title}</p>
            <p className="text-xs text-muted-foreground line-clamp-1">
              {topRecommendation.description}
            </p>
          </div>
          <Link to={topRecommendation.action.link}>
            <Button size="sm">
              {topRecommendation.action.label}
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}
