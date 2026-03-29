import { createFileRoute, useParams, Link } from '@tanstack/react-router'
import { useState } from 'react'
import { 
  Trophy,
  Clock,
  CheckCircle,
  XCircle,
  ArrowLeft,
  Layers,
  BookOpen,
  RotateCcw,
  Share2,
  Download,
  ChevronRight,
  ChevronDown,
  AlertCircle
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

export const Route = createFileRoute('/exams/results/$attemptId')({
  component: ExamResultPage,
})

// 模拟考试结果
const mockResult = {
  id: '1',
  examName: 'JLPT N5 模拟测试',
  score: 75,
  maxScore: 100,
  percentage: 75,
  passed: true,
  passingScore: 60,
  duration: 45, // minutes
  totalTime: 60, // minutes
  correctCount: 38,
  wrongCount: 12,
  unansweredCount: 0,
  completedAt: '2024-03-20T10:45:00Z',
  answers: [
    { questionId: '1', userAnswer: 'a', correctAnswer: 'a', isCorrect: true, content: '「あ」的正确读音是？', type: 'choice' },
    { questionId: '2', userAnswer: 'b', correctAnswer: 'b', isCorrect: true, content: '「猫」的读音是？', type: 'choice' },
    { questionId: '3', userAnswer: 'だ', correctAnswer: 'です', isCorrect: false, content: '「私は学生＿＿す。」', type: 'fill_blank' },
    { questionId: '4', userAnswer: 'b', correctAnswer: 'b', isCorrect: true, content: '「你好」用日语怎么说？', type: 'choice' },
    { questionId: '5', userAnswer: 'c', correctAnswer: 'c', isCorrect: true, content: '「1」的日语读音是？', type: 'choice' },
  ],
  bySection: [
    { name: '文字词汇', correct: 12, total: 15, percentage: 80 },
    { name: '语法', correct: 10, total: 15, percentage: 67 },
    { name: '阅读', correct: 8, total: 10, percentage: 80 },
    { name: '听力', correct: 8, total: 10, percentage: 80 },
  ],
}

// 错题分析
const wrongAnswers = mockResult.answers.filter(a => !a.isCorrect)

function ExamResultPage() {
  useParams({ from: '/exams/results/$attemptId' })
  const [showDetails, setShowDetails] = useState<Record<string, boolean>>({})

  const handleShare = () => {
    toast.success('分享链接已复制到剪贴板')
  }

  const handleDownload = () => {
    toast.success('成绩单下载中...')
  }

  const handleAddToFlashcards = () => {
    toast.success(`已将 ${wrongAnswers.length} 道错题加入闪卡`)
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 py-6">
      {/* 顶部导航 */}
      <Link to="/exams">
        <Button variant="ghost" size="sm">
          <ArrowLeft className="mr-2 h-4 w-4" />
          返回考试列表
        </Button>
      </Link>

      {/* 成绩卡片 */}
      <Card className={cn(
        "border-2",
        mockResult.passed ? "border-green-500/50" : "border-red-500/50"
      )}>
        <CardContent className="p-8">
          <div className="text-center space-y-4">
            {/* 通过/未通过标识 */}
            <div className={cn(
              "inline-flex items-center gap-2 px-4 py-2 rounded-full text-lg font-bold",
              mockResult.passed 
                ? "bg-green-100 text-green-700" 
                : "bg-red-100 text-red-700"
            )}>
              {mockResult.passed ? (
                <>
                  <CheckCircle className="h-5 w-5" />
                  通过
                </>
              ) : (
                <>
                  <XCircle className="h-5 w-5" />
                  未通过
                </>
              )}
            </div>

            {/* 分数 */}
            <div className="space-y-2">
              <div className={cn(
                "text-7xl font-bold",
                mockResult.passed ? "text-green-600" : "text-red-600"
              )}>
                {mockResult.percentage}%
              </div>
              <p className="text-muted-foreground">
                {mockResult.score} / {mockResult.maxScore} 分
              </p>
            </div>

            {/* 及格线对比 */}
            <div className="max-w-sm mx-auto">
              <div className="flex items-center justify-between text-sm text-muted-foreground mb-2">
                <span>及格线</span>
                <span>你的成绩</span>
              </div>
              <div className="relative h-4 bg-muted rounded-full overflow-hidden">
                <div 
                  className="absolute h-full bg-green-500/30"
                  style={{ width: `${mockResult.passingScore}%` }}
                />
                <div 
                  className={cn(
                    "absolute h-full",
                    mockResult.passed ? "bg-green-500" : "bg-red-500"
                  )}
                  style={{ width: `${mockResult.percentage}%` }}
                />
              </div>
              <div className="flex items-center justify-between text-xs text-muted-foreground mt-1">
                <span>0%</span>
                <span className="text-green-600 font-medium">及格 {mockResult.passingScore}%</span>
                <span>100%</span>
              </div>
            </div>

            {/* 快捷操作 */}
            <div className="flex items-center justify-center gap-3 pt-4">
              <Button variant="outline" onClick={handleShare}>
                <Share2 className="mr-2 h-4 w-4" />
                分享
              </Button>
              <Button variant="outline" onClick={handleDownload}>
                <Download className="mr-2 h-4 w-4" />
                下载成绩单
              </Button>
              {wrongAnswers.length > 0 && (
                <Button onClick={handleAddToFlashcards}>
                  <Layers className="mr-2 h-4 w-4" />
                  错题加入闪卡
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 统计详情 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          icon={Trophy}
          label="总得分"
          value={`${mockResult.score}`}
          subValue={`/${mockResult.maxScore}`}
          color={mockResult.passed ? "text-green-600" : "text-red-600"}
        />
        <StatCard
          icon={CheckCircle}
          label="答对"
          value={`${mockResult.correctCount}`}
          subValue={`/${mockResult.answers.length}`}
          color="text-green-600"
        />
        <StatCard
          icon={XCircle}
          label="答错"
          value={`${mockResult.wrongCount}`}
          subValue={`/${mockResult.answers.length}`}
          color="text-red-600"
        />
        <StatCard
          icon={Clock}
          label="用时"
          value={`${mockResult.duration}`}
          subValue="分钟"
          color="text-blue-600"
        />
      </div>

      <Tabs defaultValue="sections" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-3">
          <TabsTrigger value="sections">各部分得分</TabsTrigger>
          <TabsTrigger value="questions">题目回顾</TabsTrigger>
          <TabsTrigger value="analysis">能力分析</TabsTrigger>
        </TabsList>

        {/* 各部分得分 */}
        <TabsContent value="sections" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>各部分得分详情</CardTitle>
              <CardDescription>按考试各部分查看得分情况</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {mockResult.bySection.map((section, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{section.name}</span>
                    <span className={cn(
                      "font-bold",
                      section.percentage >= 60 ? "text-green-600" : "text-red-600"
                    )}>
                      {section.percentage}%
                    </span>
                  </div>
                  <div className="flex items-center gap-4">
                    <Progress value={section.percentage} className="flex-1" />
                    <span className="text-sm text-muted-foreground w-24 text-right">
                      {section.correct}/{section.total} 正确
                    </span>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* 题目回顾 */}
        <TabsContent value="questions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>题目回顾</CardTitle>
              <CardDescription>
                共 {mockResult.answers.length} 题，答对 {mockResult.correctCount} 题，答错 {mockResult.wrongCount} 题
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {mockResult.answers.map((answer, index) => (
                <QuestionReviewCard
                  key={answer.questionId}
                  index={index}
                  answer={answer}
                  showDetails={showDetails[answer.questionId] || false}
                  onToggle={() => setShowDetails(prev => ({
                    ...prev,
                    [answer.questionId]: !prev[answer.questionId]
                  }))}
                />
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* 能力分析 */}
        <TabsContent value="analysis" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>能力分析</CardTitle>
              <CardDescription>基于本次考试的学习建议</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* 强项 */}
              <div>
                <h4 className="font-medium text-green-600 flex items-center gap-2 mb-3">
                  <CheckCircle className="h-5 w-5" />
                  你的强项
                </h4>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2 text-sm">
                    <span className="text-green-500 mt-0.5">✓</span>
                    <span>文字词汇掌握良好，基础扎实</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm">
                    <span className="text-green-500 mt-0.5">✓</span>
                    <span>阅读理解能力较强</span>
                  </li>
                </ul>
              </div>

              <Separator />

              {/* 待改进 */}
              <div>
                <h4 className="font-medium text-orange-600 flex items-center gap-2 mb-3">
                  <AlertCircle className="h-5 w-5" />
                  待改进
                </h4>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2 text-sm">
                    <span className="text-orange-500 mt-0.5">!</span>
                    <span>助词使用需要加强练习</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm">
                    <span className="text-orange-500 mt-0.5">!</span>
                    <span>敬语表达掌握不够熟练</span>
                  </li>
                </ul>
              </div>

              <Separator />

              {/* 学习建议 */}
              <div>
                <h4 className="font-medium text-blue-600 flex items-center gap-2 mb-3">
                  <BookOpen className="h-5 w-5" />
                  学习建议
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <Card className="bg-muted/50">
                    <CardContent className="p-4">
                      <h5 className="font-medium mb-2">推荐练习</h5>
                      <p className="text-sm text-muted-foreground">
                        针对语法部分进行专项练习，建议完成「助词用法」章节
                      </p>
                      <Link to="/learning/content">
                        <Button variant="link" size="sm" className="mt-2 px-0">
                          去练习
                          <ChevronRight className="ml-1 h-4 w-4" />
                        </Button>
                      </Link>
                    </CardContent>
                  </Card>
                  <Card className="bg-muted/50">
                    <CardContent className="p-4">
                      <h5 className="font-medium mb-2">错题复习</h5>
                      <p className="text-sm text-muted-foreground">
                        本次考试共 {wrongAnswers.length} 道错题，建议加入闪卡复习
                      </p>
                      <Button 
                        variant="link" 
                        size="sm" 
                        className="mt-2 px-0"
                        onClick={handleAddToFlashcards}
                      >
                        加入闪卡
                        <ChevronRight className="ml-1 h-4 w-4" />
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* 底部操作 */}
      <div className="flex items-center justify-between pt-4">
        <Link to="/exams">
          <Button variant="outline">
            <ArrowLeft className="mr-2 h-4 w-4" />
            返回考试列表
          </Button>
        </Link>
        <Link to="/exams/session/$examId" params={{ examId: 'demo' }}>
          <Button>
            <RotateCcw className="mr-2 h-4 w-4" />
            重新考试
          </Button>
        </Link>
      </div>
    </div>
  )
}

// 统计卡片组件
function StatCard({ 
  icon: Icon, 
  label, 
  value, 
  subValue,
  color
}: { 
  icon: React.ElementType
  label: string
  value: string
  subValue: string
  color: string
}) {
  return (
    <Card>
      <CardContent className="p-4 text-center">
        <Icon className={cn("h-6 w-6 mx-auto mb-2", color)} />
        <p className="text-sm text-muted-foreground">{label}</p>
        <p className="text-2xl font-bold">
          {value}
          <span className="text-sm font-normal text-muted-foreground ml-1">{subValue}</span>
        </p>
      </CardContent>
    </Card>
  )
}

// 题目回顾卡片
interface QuestionReviewCardProps {
  index: number
  answer: {
    questionId: string
    content: string
    userAnswer: string
    correctAnswer: string
    isCorrect: boolean
    type: string
  }
  showDetails: boolean
  onToggle: () => void
}

function QuestionReviewCard({ index, answer, showDetails, onToggle }: QuestionReviewCardProps) {
  return (
    <Card className={cn(
      "overflow-hidden transition-all",
      answer.isCorrect ? "border-l-4 border-l-green-500" : "border-l-4 border-l-red-500"
    )}>
      <div 
        className="p-4 flex items-center justify-between cursor-pointer hover:bg-accent/50"
        onClick={onToggle}
      >
        <div className="flex items-center gap-3">
          <Badge variant="outline">{index + 1}</Badge>
          <span className="font-medium line-clamp-1">{answer.content}</span>
        </div>
        <div className="flex items-center gap-2">
          {answer.isCorrect ? (
            <CheckCircle className="h-5 w-5 text-green-500" />
          ) : (
            <XCircle className="h-5 w-5 text-red-500" />
          )}
          <ChevronDown className={cn(
            "h-4 w-4 transition-transform",
            showDetails && "rotate-180"
          )} />
        </div>
      </div>
      
      {showDetails && (
        <div className="px-4 pb-4 border-t bg-muted/30">
          <div className="pt-4 space-y-3">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground mb-1">你的答案</p>
                <p className={cn(
                  "font-medium",
                  answer.isCorrect ? "text-green-600" : "text-red-600"
                )}>
                  {answer.userAnswer.toUpperCase()}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">正确答案</p>
                <p className="font-medium text-green-600">
                  {answer.correctAnswer.toUpperCase()}
                </p>
              </div>
            </div>
            
            {!answer.isCorrect && (
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  <BookOpen className="mr-2 h-3 w-3" />
                  查看解析
                </Button>
                <Button variant="outline" size="sm">
                  <Layers className="mr-2 h-3 w-3" />
                  加入闪卡
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </Card>
  )
}
