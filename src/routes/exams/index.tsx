import { createFileRoute, Link } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import { 
  ClipboardList, 
  Clock,
  Play,
  CheckCircle,
  XCircle,
  Search,
  GraduationCap,
  Target,
  TrendingUp,
  Calendar,
  ChevronRight,
  BookOpen
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { toast } from 'sonner'
import type { ExamType, ExamAttempt } from '@/types'
import { cn } from '@/lib/utils'

export const Route = createFileRoute('/exams/')({
  component: ExamsPage,
})

// 模拟数据
const mockExamTypes: ExamType[] = [
  {
    id: '1',
    name: 'JLPT N5 模拟测试',
    code: 'jlpt-n5',
    description: '日本语能力测试 N5 级别模拟考试，包含词汇、语法、阅读和听力',
    language: { code: 'ja', name: '日语', name_local: '日本語', writing_system: 'kana', has_spaces: false, is_rtl: false },
    total_questions: 50,
    duration_minutes: 60,
    passing_score: 60,
    is_active: true,
    status: 'published',
    created_at: '2024-01-01',
  },
  {
    id: '2',
    name: 'JLPT N4 模拟测试',
    code: 'jlpt-n4',
    description: '日本语能力测试 N4 级别模拟考试',
    language: { code: 'ja', name: '日语', name_local: '日本語', writing_system: 'kana', has_spaces: false, is_rtl: false },
    total_questions: 60,
    duration_minutes: 75,
    passing_score: 60,
    is_active: true,
    status: 'published',
    created_at: '2024-01-01',
  },
  {
    id: '3',
    name: 'HSK 1 模拟测试',
    code: 'hsk-1',
    description: '汉语水平考试一级模拟测试',
    language: { code: 'zh', name: '中文', name_local: '中文', writing_system: 'hanzi', has_spaces: false, is_rtl: false },
    total_questions: 40,
    duration_minutes: 40,
    passing_score: 60,
    is_active: true,
    status: 'published',
    created_at: '2024-02-01',
  },
  {
    id: '4',
    name: '词汇专项测试',
    code: 'vocab-test',
    description: '重点测试词汇掌握程度',
    language: { code: 'ja', name: '日语', name_local: '日本語', writing_system: 'kana', has_spaces: false, is_rtl: false },
    total_questions: 30,
    duration_minutes: 30,
    passing_score: 70,
    is_active: true,
    status: 'published',
    created_at: '2024-02-15',
  },
]

const mockAttempts: ExamAttempt[] = [
  {
    id: '1',
    exam_type: mockExamTypes[0],
    user: 'user1',
    started_at: '2024-03-20T10:00:00Z',
    completed_at: '2024-03-20T10:45:00Z',
    status: 'completed',
    total_score: 75,
    max_score: 100,
    percentage_score: 75,
    is_passed: true,
    time_spent_seconds: 2700,
    answers: [],
  },
  {
    id: '2',
    exam_type: mockExamTypes[1],
    user: 'user1',
    started_at: '2024-03-18T14:00:00Z',
    completed_at: '2024-03-18T14:50:00Z',
    status: 'completed',
    total_score: 45,
    max_score: 100,
    percentage_score: 45,
    is_passed: false,
    time_spent_seconds: 3000,
    answers: [],
  },
]

function ExamsPage() {
  const [examTypes, setExamTypes] = useState<ExamType[]>([])
  const [attempts, setAttempts] = useState<ExamAttempt[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedLanguage, setSelectedLanguage] = useState<string>('all')
  const [isLoading, setIsLoading] = useState(true)
  
  useEffect(() => {
    loadData()
  }, [])
  
  const loadData = async () => {
    setIsLoading(true)
    try {
      // 模拟 API 调用
      setTimeout(() => {
        setExamTypes(mockExamTypes)
        setAttempts(mockAttempts)
        setIsLoading(false)
      }, 500)
    } catch (error) {
      toast.error('加载考试数据失败')
      setIsLoading(false)
    }
  }
  
  const filteredExams = examTypes.filter(exam => {
    const matchesSearch = searchQuery === '' || 
      exam.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      exam.description?.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesLanguage = selectedLanguage === 'all' || exam.language.code === selectedLanguage
    return matchesSearch && matchesLanguage
  })
  
  const languages = Array.from(new Map(examTypes.map(e => [e.language.code, e.language])).values())
  
  // 统计数据
  const totalAttempts = attempts.length
  const passedAttempts = attempts.filter(a => a.is_passed).length
  const averageScore = attempts.length > 0 
    ? attempts.reduce((sum, a) => sum + a.percentage_score, 0) / attempts.length 
    : 0
  const passRate = totalAttempts > 0 ? (passedAttempts / totalAttempts) * 100 : 0

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">模拟考试</h1>
          <p className="text-muted-foreground">参加模拟考试，检验学习成果</p>
        </div>
        <Link to="/periodic">
          <Button variant="outline">
            <Calendar className="mr-2 h-4 w-4" />
            周期考试
          </Button>
        </Link>
      </div>
      
      {/* 统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 bg-blue-500 rounded-lg text-white">
              <ClipboardList className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">可用考试</p>
              <p className="text-2xl font-bold">{examTypes.length}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 bg-green-500 rounded-lg text-white">
              <CheckCircle className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">已通过</p>
              <p className="text-2xl font-bold">{passedAttempts}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 bg-orange-500 rounded-lg text-white">
              <TrendingUp className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">平均分数</p>
              <p className="text-2xl font-bold">{averageScore.toFixed(1)}%</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 bg-purple-500 rounded-lg text-white">
              <Target className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">通过率</p>
              <p className="text-2xl font-bold">{passRate.toFixed(1)}%</p>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Tabs defaultValue="exams" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="exams">可参加的考试</TabsTrigger>
          <TabsTrigger value="history">考试记录</TabsTrigger>
        </TabsList>
        
        {/* 可参加的考试 */}
        <TabsContent value="exams" className="space-y-4">
          {/* 筛选 */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="搜索考试..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant={selectedLanguage === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedLanguage('all')}
              >
                全部
              </Button>
              {languages.map(lang => (
                <Button
                  key={lang.code}
                  variant={selectedLanguage === lang.code ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedLanguage(lang.code)}
                >
                  {lang.name}
                </Button>
              ))}
            </div>
          </div>
          
          {/* 考试列表 */}
          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : filteredExams.length === 0 ? (
            <Card className="p-12 text-center">
              <ClipboardList className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">暂无可用考试</p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredExams.map((exam) => (
                <ExamCard key={exam.id} exam={exam} />
              ))}
            </div>
          )}
        </TabsContent>
        
        {/* 考试记录 */}
        <TabsContent value="history" className="space-y-4">
          {attempts.length === 0 ? (
            <Card className="p-12 text-center">
              <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">暂无考试记录</p>
              <p className="text-sm text-muted-foreground mt-2">参加考试后将在这里显示记录</p>
            </Card>
          ) : (
            <div className="space-y-3">
              {attempts.map((attempt) => (
                <AttemptCard key={attempt.id} attempt={attempt} />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}

// 考试卡片组件
function ExamCard({ exam }: { exam: ExamType }) {
  return (
    <Card className="group hover:shadow-lg transition-all duration-300">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <GraduationCap className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-lg">{exam.name}</CardTitle>
              <CardDescription className="text-xs">{exam.language.name}</CardDescription>
            </div>
          </div>
          <Badge variant="outline" className="shrink-0">
            {exam.code}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground line-clamp-2">
          {exam.description || '暂无描述'}
        </p>
        
        <div className="flex flex-wrap gap-2">
          <Badge variant="secondary" className="text-xs">
            <Clock className="h-3 w-3 mr-1" />
            {exam.duration_minutes} 分钟
          </Badge>
          <Badge variant="secondary" className="text-xs">
            <BookOpen className="h-3 w-3 mr-1" />
            {exam.total_questions} 题
          </Badge>
          <Badge variant="secondary" className="text-xs">
            <Target className="h-3 w-3 mr-1" />
            及格 {exam.passing_score}%
          </Badge>
        </div>
        
        <a href={`/exams/${exam.id}`}>
          <Button className="w-full group-hover:bg-primary group-hover:text-primary-foreground">
            <Play className="h-4 w-4 mr-2" />
            开始考试
          </Button>
        </a>
      </CardContent>
    </Card>
  )
}

// 考试记录卡片
function AttemptCard({ attempt }: { attempt: ExamAttempt }) {
  const getScoreColor = (percentage: number) => {
    if (percentage >= 80) return 'text-green-600 bg-green-50'
    if (percentage >= 60) return 'text-yellow-600 bg-yellow-50'
    return 'text-red-600 bg-red-50'
  }
  
  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    return `${mins} 分钟`
  }
  
  return (
    <Card className="hover:bg-accent/50 transition-colors">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className={cn(
              "p-3 rounded-full",
              attempt.is_passed ? "bg-green-100 text-green-600" : "bg-red-100 text-red-600"
            )}>
              {attempt.is_passed ? (
                <CheckCircle className="h-5 w-5" />
              ) : (
                <XCircle className="h-5 w-5" />
              )}
            </div>
            <div>
              <p className="font-medium">{attempt.exam_type.name}</p>
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <span>{new Date(attempt.started_at).toLocaleDateString('zh-CN')}</span>
                <span>·</span>
                <span>{formatDuration(attempt.time_spent_seconds)}</span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className={cn("px-4 py-2 rounded-lg text-center", getScoreColor(attempt.percentage_score))}>
              <p className="text-2xl font-bold">{attempt.percentage_score.toFixed(0)}%</p>
              <p className="text-xs">
                {attempt.total_score}/{attempt.max_score} 分
              </p>
            </div>
            <a href={`/exams/results/${attempt.id}`}>
              <Button variant="ghost" size="icon">
                <ChevronRight className="h-5 w-5" />
              </Button>
            </a>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
