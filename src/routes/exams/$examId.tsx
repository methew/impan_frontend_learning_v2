import { createFileRoute, useParams, Link, useNavigate } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import { 
  ArrowLeft,
  Clock,
  BookOpen,
  Target,
  GraduationCap,
  Play,
  AlertCircle,
  CheckCircle,
  Star,
  Trophy,
  HelpCircle
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { toast } from 'sonner'
import type { ExamType } from '@/types'
import { cn } from '@/lib/utils'

export const Route = createFileRoute('/exams/$examId')({
  component: ExamDetailPage,
})

// 模拟考试数据
const mockExam: ExamType = {
  id: '1',
  name: 'JLPT N5 模拟测试',
  code: 'jlpt-n5',
  description: '日本语能力测试 N5 级别模拟考试，包含词汇、语法、阅读和听力。本测试旨在帮助考生熟悉考试形式和题型，评估当前日语水平。',
  language: { code: 'ja', name: '日语', name_local: '日本語', writing_system: 'kana', has_spaces: false, is_rtl: false },
  category: {
    id: '1',
    name: 'JLPT',
    abbreviation: 'JLPT',
    slug: 'jlpt',
    category_type: 'exam',
    content_count: 5,
  },
  total_questions: 50,
  duration_minutes: 60,
  passing_score: 60,
  max_attempts: 3,
  is_active: true,
  status: 'published',
  created_at: '2024-01-01',
}

// 模拟考试结构
const examSections = [
  {
    name: '文字词汇',
    description: '测试平假名、片假名、汉字的读写能力',
    questions: 15,
    duration: 15,
    types: ['读音', '汉字', '词汇'],
  },
  {
    name: '语法',
    description: '测试基础语法知识的掌握',
    questions: 15,
    duration: 15,
    types: ['语法选择', '句子排序'],
  },
  {
    name: '阅读',
    description: '测试阅读理解能力',
    questions: 10,
    duration: 20,
    types: ['短文阅读', '信息检索'],
  },
  {
    name: '听力',
    description: '测试听力理解能力',
    questions: 10,
    duration: 10,
    types: ['听选', '听答'],
  },
]

// 模拟历史成绩
const mockHistory = [
  { date: '2024-03-15', score: 65, passed: true },
  { date: '2024-02-28', score: 45, passed: false },
]

function ExamDetailPage() {
  const { examId } = useParams({ from: '/exams/$examId' })
  const navigate = useNavigate()
  const [exam, setExam] = useState<ExamType | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [showConfirm, setShowConfirm] = useState(false)

  useEffect(() => {
    // 模拟 API 调用
    setTimeout(() => {
      setExam(mockExam)
      setIsLoading(false)
    }, 500)
  }, [examId])

  const handleStartExam = () => {
    if (!showConfirm) {
      setShowConfirm(true)
      return
    }
    // 开始考试，跳转到考试页面
    toast.success('考试开始', {
      description: '祝你好运！',
    })
    navigate({ to: `/exams/session/${examId}` })
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-200px)]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!exam) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">考试不存在</p>
        <Link to="/exams">
          <Button className="mt-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            返回考试列表
          </Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* 顶部导航 */}
      <Link to="/exams">
        <Button variant="ghost" size="sm">
          <ArrowLeft className="mr-2 h-4 w-4" />
          返回考试列表
        </Button>
      </Link>

      {/* 考试标题卡片 */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-primary/10 rounded-lg">
                <GraduationCap className="h-8 w-8 text-primary" />
              </div>
              <div>
                <CardTitle className="text-2xl">{exam.name}</CardTitle>
                <CardDescription className="flex items-center gap-2 mt-2">
                  <Badge variant="outline">{exam.code}</Badge>
                  <Badge variant="secondary">{exam.language.name}</Badge>
                  {exam.category && (
                    <Badge variant="outline">{exam.category.name}</Badge>
                  )}
                </CardDescription>
              </div>
            </div>
            <div className="text-right">
              <div className="flex items-center gap-1 text-yellow-500">
                <Star className="h-4 w-4 fill-current" />
                <span className="font-medium">难度适中</span>
              </div>
              <p className="text-sm text-muted-foreground">已有 1,234 人参加</p>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* 描述 */}
          <p className="text-muted-foreground leading-relaxed">
            {exam.description}
          </p>

          {/* 关键信息 */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <InfoBox 
              icon={BookOpen} 
              label="题目数量" 
              value={`${exam.total_questions} 题`} 
            />
            <InfoBox 
              icon={Clock} 
              label="考试时长" 
              value={`${exam.duration_minutes} 分钟`} 
            />
            <InfoBox 
              icon={Target} 
              label="及格分数" 
              value={`${exam.passing_score}%`} 
              highlight
            />
            <InfoBox 
              icon={Trophy} 
              label="最高尝试" 
              value={exam.max_attempts ? `${exam.max_attempts} 次` : '无限制'} 
            />
          </div>

          <Separator />

          {/* 考试结构 */}
          <div>
            <h3 className="text-lg font-semibold mb-4">考试结构</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {examSections.map((section, index) => (
                <Card key={index} className="bg-muted/50">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium">{section.name}</h4>
                      <Badge variant="outline">{section.questions} 题</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">
                      {section.description}
                    </p>
                    <div className="flex items-center gap-2 flex-wrap">
                      <Clock className="h-3 w-3 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">{section.duration} 分钟</span>
                      <span className="text-muted-foreground">·</span>
                      {section.types.map((type, i) => (
                        <Badge key={i} variant="secondary" className="text-xs">
                          {type}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          <Separator />

          {/* 历史成绩 */}
          {mockHistory.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-4">历史成绩</h3>
              <div className="space-y-2">
                {mockHistory.map((record, index) => (
                  <div 
                    key={index}
                    className="flex items-center justify-between p-3 bg-muted rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      {record.passed ? (
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      ) : (
                        <AlertCircle className="h-5 w-5 text-red-500" />
                      )}
                      <span className="text-sm text-muted-foreground">{record.date}</span>
                    </div>
                    <span className={cn(
                      "font-bold",
                      record.passed ? "text-green-600" : "text-red-600"
                    )}>
                      {record.score}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 开始考试 */}
          <Card className={cn(
            "border-2",
            showConfirm ? "border-primary bg-primary/5" : "border-muted"
          )}>
            <CardContent className="p-6">
              {!showConfirm ? (
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold">准备开始？</h3>
                    <p className="text-sm text-muted-foreground">
                      考试时长 {exam.duration_minutes} 分钟，请确保有足够的时间完成
                    </p>
                  </div>
                  <Button size="lg" onClick={handleStartExam}>
                    <Play className="mr-2 h-5 w-5" />
                    开始考试
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center gap-3 text-yellow-600">
                    <AlertCircle className="h-6 w-6" />
                    <h3 className="text-lg font-semibold">确认开始考试</h3>
                  </div>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li>• 考试开始后计时器将立即启动</li>
                    <li>• 考试过程中请勿刷新页面</li>
                    <li>• 时间结束后将自动交卷</li>
                    <li>• 可以中途退出，但计时不会暂停</li>
                  </ul>
                  <div className="flex gap-3 pt-2">
                    <Button variant="outline" onClick={() => setShowConfirm(false)}>
                      取消
                    </Button>
                    <Button size="lg" onClick={handleStartExam}>
                      <Play className="mr-2 h-5 w-5" />
                      确认开始
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </CardContent>
      </Card>

      {/* 提示信息 */}
      <div className="flex items-start gap-3 text-sm text-muted-foreground bg-muted p-4 rounded-lg">
        <HelpCircle className="h-5 w-5 shrink-0" />
        <div>
          <p className="font-medium text-foreground">考试提示</p>
          <p>建议在网络稳定的环境下进行考试。如遇技术问题，可联系管理员。</p>
        </div>
      </div>
    </div>
  )
}

// 信息框组件
function InfoBox({ 
  icon: Icon, 
  label, 
  value, 
  highlight = false 
}: { 
  icon: React.ElementType
  label: string
  value: string
  highlight?: boolean
}) {
  return (
    <div className={cn(
      "p-4 rounded-lg text-center",
      highlight ? "bg-primary/10" : "bg-muted"
    )}>
      <Icon className={cn(
        "h-5 w-5 mx-auto mb-2",
        highlight ? "text-primary" : "text-muted-foreground"
      )} />
      <p className="text-xs text-muted-foreground mb-1">{label}</p>
      <p className={cn(
        "text-lg font-bold",
        highlight ? "text-primary" : "text-foreground"
      )}>{value}</p>
    </div>
  )
}
