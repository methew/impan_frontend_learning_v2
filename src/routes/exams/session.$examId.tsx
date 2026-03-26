import { createFileRoute, useParams, useNavigate } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import { 
  Clock,
  ChevronLeft,
  ChevronRight,
  Flag,
  Trophy
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

export const Route = createFileRoute('/exams/session/$examId')({
  component: ExamSessionPage,
})

// 模拟题目
const mockQuestions = [
  {
    id: '1',
    type: 'choice',
    content: '「あ」的正确读音是？',
    options: [
      { id: 'a', content: 'a' },
      { id: 'b', content: 'i' },
      { id: 'c', content: 'u' },
      { id: 'd', content: 'e' },
    ],
    correctAnswer: 'a',
  },
  {
    id: '2',
    type: 'choice',
    content: '「猫」的读音是？',
    options: [
      { id: 'a', content: 'いぬ' },
      { id: 'b', content: 'ねこ' },
      { id: 'c', content: 'とり' },
      { id: 'd', content: 'さかな' },
    ],
    correctAnswer: 'b',
  },
  {
    id: '3',
    type: 'fill_blank',
    content: '「私は学生＿＿す。」请填入正确的助词。',
    correctAnswer: 'です',
  },
  {
    id: '4',
    type: 'choice',
    content: '「你好」用日语怎么说？',
    options: [
      { id: 'a', content: 'さようなら' },
      { id: 'b', content: 'こんにちは' },
      { id: 'c', content: 'おはよう' },
      { id: 'd', content: 'こんばんは' },
    ],
    correctAnswer: 'b',
  },
  {
    id: '5',
    type: 'choice',
    content: '「1」的日语读音是？',
    options: [
      { id: 'a', content: 'に' },
      { id: 'b', content: 'さん' },
      { id: 'c', content: 'いち' },
      { id: 'd', content: 'よん' },
    ],
    correctAnswer: 'c',
  },
]

function ExamSessionPage() {
  useParams({ from: '/exams/session/$examId' })
  const navigate = useNavigate()
  
  const [currentIndex, setCurrentIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [flaggedQuestions, setFlaggedQuestions] = useState<Set<string>>(new Set())
  const [timeLeft, setTimeLeft] = useState(60 * 60) // 60 minutes
  const [showSubmitDialog, setShowSubmitDialog] = useState(false)
  const [showExitDialog, setShowExitDialog] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const currentQuestion = mockQuestions[currentIndex]
  const totalQuestions = mockQuestions.length
  const answeredCount = Object.keys(answers).length
  const progress = (answeredCount / totalQuestions) * 100

  // 计时器
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 0) {
          handleSubmit()
          return 0
        }
        return prev - 1
      })
    }, 1000)
    
    return () => clearInterval(timer)
  }, [])

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const mins = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    if (hours > 0) {
      return `${hours}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
    }
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const handleAnswer = (answer: string) => {
    setAnswers(prev => ({ ...prev, [currentQuestion.id]: answer }))
  }

  const handleFlag = () => {
    setFlaggedQuestions(prev => {
      const next = new Set(prev)
      if (next.has(currentQuestion.id)) {
        next.delete(currentQuestion.id)
      } else {
        next.add(currentQuestion.id)
      }
      return next
    })
  }

  const goToQuestion = (index: number) => {
    if (index >= 0 && index < totalQuestions) {
      setCurrentIndex(index)
    }
  }

  const handleSubmit = async () => {
    if (isSubmitting) return
    setIsSubmitting(true)
    
    try {
      // 模拟提交
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // 计算分数
      let correct = 0
      mockQuestions.forEach(q => {
        if (answers[q.id] === q.correctAnswer) {
          correct++
        }
      })
      const score = Math.round((correct / totalQuestions) * 100)
      
      toast.success('考试完成！', {
        description: `得分: ${score}%`,
      })
      
      // 跳转到结果页
      navigate({ to: '/exams/results/$attemptId', params: { attemptId: 'demo' } })
    } catch (error) {
      toast.error('提交失败')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="h-[calc(100vh-64px)] flex flex-col">
      {/* 顶部导航栏 */}
      <header className="border-b bg-card px-6 py-4">
        <div className="flex items-center justify-between max-w-6xl mx-auto">
          <div className="flex items-center gap-4">
            <h1 className="text-lg font-semibold">JLPT N5 模拟测试</h1>
            <Badge variant="outline">题目 {currentIndex + 1} / {totalQuestions}</Badge>
          </div>
          
          <div className="flex items-center gap-6">
            <div className={cn(
              "text-2xl font-mono font-bold",
              timeLeft < 300 ? "text-red-600 animate-pulse" : "text-primary"
            )}>
              <Clock className="inline-block h-5 w-5 mr-2" />
              {formatTime(timeLeft)}
            </div>
            
            <Button 
              variant="outline" 
              onClick={() => setShowExitDialog(true)}
            >
              退出
            </Button>
            
            <Button 
              onClick={() => setShowSubmitDialog(true)}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  提交中...
                </>
              ) : (
                <>
                  <Trophy className="mr-2 h-4 w-4" />
                  交卷
                </>
              )}
            </Button>
          </div>
        </div>
        
        {/* 进度条 */}
        <div className="max-w-6xl mx-auto mt-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
            <span>答题进度</span>
            <span className="font-medium text-foreground">{answeredCount}/{totalQuestions}</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
      </header>

      {/* 主体内容 */}
      <div className="flex-1 flex max-w-6xl mx-auto w-full">
        {/* 左侧：题目区域 */}
        <main className="flex-1 p-6">
          <Card className="h-full">
            <CardHeader className="flex flex-row items-center justify-between">
              <div className="flex items-center gap-3">
                <Badge variant="outline">第 {currentIndex + 1} 题</Badge>
                <Badge variant="secondary">
                  {currentQuestion.type === 'choice' ? '选择题' : '填空题'}
                </Badge>
              </div>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={handleFlag}
                className={cn(
                  flaggedQuestions.has(currentQuestion.id) && "text-yellow-500"
                )}
              >
                <Flag className={cn(
                  "h-4 w-4 mr-2",
                  flaggedQuestions.has(currentQuestion.id) && "fill-current"
                )} />
                {flaggedQuestions.has(currentQuestion.id) ? '已标记' : '标记'}
              </Button>
            </CardHeader>
            
            <CardContent className="space-y-8">
              {/* 题目内容 */}
              <div className="text-xl font-medium leading-relaxed">
                {currentQuestion.content}
              </div>

              {/* 答案区域 */}
              {currentQuestion.type === 'choice' && currentQuestion.options && (
                <RadioGroup
                  value={answers[currentQuestion.id] || ''}
                  onValueChange={handleAnswer}
                  className="space-y-3"
                >
                  {currentQuestion.options.map((option) => (
                    <div
                      key={option.id}
                      className={cn(
                        "flex items-center space-x-3 p-4 rounded-lg border-2 cursor-pointer transition-all",
                        answers[currentQuestion.id] === option.id
                          ? "border-primary bg-primary/5"
                          : "border-muted hover:border-muted-foreground/50"
                      )}
                      onClick={() => handleAnswer(option.id)}
                    >
                      <RadioGroupItem value={option.id} id={option.id} />
                      <Label 
                        htmlFor={option.id} 
                        className="flex-1 cursor-pointer font-normal"
                      >
                        <span className="font-bold mr-2">{option.id.toUpperCase()}.</span>
                        {option.content}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              )}

              {currentQuestion.type === 'fill_blank' && (
                <div className="space-y-3">
                  <Label>请输入答案：</Label>
                  <Input
                    value={answers[currentQuestion.id] || ''}
                    onChange={(e) => handleAnswer(e.target.value)}
                    placeholder="在此输入答案..."
                    className="max-w-md"
                  />
                </div>
              )}
            </CardContent>
          </Card>

          {/* 导航按钮 */}
          <div className="flex items-center justify-between mt-6">
            <Button
              variant="outline"
              onClick={() => goToQuestion(currentIndex - 1)}
              disabled={currentIndex === 0}
            >
              <ChevronLeft className="mr-2 h-4 w-4" />
              上一题
            </Button>
            
            <Button
              variant="outline"
              onClick={() => goToQuestion(currentIndex + 1)}
              disabled={currentIndex === totalQuestions - 1}
            >
              下一题
              <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </main>

        {/* 右侧：题目导航 */}
        <aside className="w-64 border-l bg-muted/30 p-4 hidden lg:block">
          <h3 className="font-medium mb-4">题目导航</h3>
          <div className="grid grid-cols-5 gap-2">
            {mockQuestions.map((q, index) => {
              const isAnswered = !!answers[q.id]
              const isFlagged = flaggedQuestions.has(q.id)
              const isCurrent = index === currentIndex
              
              return (
                <button
                  key={q.id}
                  onClick={() => goToQuestion(index)}
                  className={cn(
                    "aspect-square rounded-lg text-sm font-medium transition-all",
                    isCurrent && "ring-2 ring-primary ring-offset-2",
                    isAnswered 
                      ? "bg-primary text-primary-foreground" 
                      : "bg-card border hover:border-primary",
                    isFlagged && !isAnswered && "border-yellow-500 text-yellow-600"
                  )}
                >
                  {index + 1}
                </button>
              )
            })}
          </div>
          
          <div className="mt-6 space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <div className="w-4 h-4 rounded bg-primary" />
              <span>已作答</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <div className="w-4 h-4 rounded border border-yellow-500" />
              <span>已标记</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <div className="w-4 h-4 rounded bg-card border" />
              <span>未作答</span>
            </div>
          </div>
        </aside>
      </div>

      {/* 提交确认对话框 */}
      <AlertDialog open={showSubmitDialog} onOpenChange={setShowSubmitDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>确认交卷？</AlertDialogTitle>
            <AlertDialogDescription>
              {answeredCount < totalQuestions ? (
                <>
                  你还有 <span className="font-bold text-red-600">{totalQuestions - answeredCount}</span> 道题目未作答。
                  <br />
                  确定要交卷吗？
                </>
              ) : (
                '所有题目已作答，确定要交卷吗？'
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>继续答题</AlertDialogCancel>
            <AlertDialogAction onClick={handleSubmit}>
              确认交卷
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* 退出确认对话框 */}
      <AlertDialog open={showExitDialog} onOpenChange={setShowExitDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>确认退出？</AlertDialogTitle>
            <AlertDialogDescription>
              退出后考试进度将保存，你可以稍后继续考试。
              <br />
              但计时器不会暂停。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>继续答题</AlertDialogCancel>
            <AlertDialogAction onClick={() => navigate({ to: '/exams' })}>
              保存并退出
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
