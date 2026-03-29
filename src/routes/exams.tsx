import { createFileRoute } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import { 
  ClipboardList, 
  Clock,
  Play,
  CheckCircle,
  XCircle,
  Trophy
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { toast } from 'sonner'
import * as api from '@/api/exams'
import type { ExamType, ExamAttempt } from '@/types'
import { cn } from '@/lib/utils'

export const Route = createFileRoute('/exams')({
  component: ExamsPage,
})

function ExamsPage() {
  const [examTypes, setExamTypes] = useState<ExamType[]>([])
  const [attempts, setAttempts] = useState<ExamAttempt[]>([])
  const [activeAttempt, setActiveAttempt] = useState<ExamAttempt | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  
  useEffect(() => {
    loadData()
  }, [])
  
  const loadData = async () => {
    setIsLoading(true)
    try {
      const [typesData, attemptsData] = await Promise.all([
        api.getExamTypes({ status: 'published' }),
        api.getExamAttempts()
      ])
      setExamTypes(typesData)
      setAttempts(attemptsData)
      
      // Check for active attempt
      const active = attemptsData.find(a => a.status === 'in_progress')
      if (active) {
        setActiveAttempt(active)
      }
    } catch (error) {
      toast.error('加载考试数据失败')
    } finally {
      setIsLoading(false)
    }
  }
  
  const startExam = async (examTypeId: string) => {
    try {
      const attempt = await api.startExamAttempt(examTypeId)
      setActiveAttempt(attempt)
      toast.success('考试开始')
    } catch (error) {
      toast.error('开始考试失败')
    }
  }
  
  const continueExam = (attempt: ExamAttempt) => {
    setActiveAttempt(attempt)
  }
  
  const getScoreColor = (percentage: number) => {
    if (percentage >= 80) return 'text-green-600'
    if (percentage >= 60) return 'text-yellow-600'
    return 'text-red-600'
  }
  
  if (activeAttempt) {
    return <ExamSession attempt={activeAttempt} onFinish={() => setActiveAttempt(null)} />
  }
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <ClipboardList className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-bold">模拟考试</h1>
        </div>
      </div>
      
      {/* Exam Types */}
      <div>
        <h2 className="text-lg font-medium mb-4">可参加的考试</h2>
        {isLoading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : examTypes.length === 0 ? (
          <Card className="p-12 text-center">
            <p className="text-muted-foreground">暂无可用考试</p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {examTypes.map((exam) => (
              <Card key={exam.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <CardTitle className="text-lg">{exam.name}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {exam.description || '无描述'}
                  </p>
                  
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="outline">
                      <Clock className="h-3 w-3 mr-1" />
                      {exam.duration_minutes} 分钟
                    </Badge>
                    <Badge variant="outline">
                      {exam.total_questions} 题
                    </Badge>
                    <Badge variant="outline">
                      及格 {exam.passing_score}%
                    </Badge>
                  </div>
                  
                  <Button 
                    className="w-full" 
                    onClick={() => startExam(exam.id)}
                  >
                    <Play className="h-4 w-4 mr-2" />
                    开始考试
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
      
      {/* Past Attempts */}
      {attempts.length > 0 && (
        <div>
          <h2 className="text-lg font-medium mb-4">考试记录</h2>
          <div className="space-y-2">
            {attempts.slice(0, 5).map((attempt) => (
              <Card key={attempt.id} className="hover:bg-accent/50 transition-colors">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={cn(
                        "p-2 rounded-full",
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
                        <p className="text-sm text-muted-foreground">
                          {new Date(attempt.started_at).toLocaleDateString('zh-CN')}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className={cn("text-2xl font-bold", getScoreColor(attempt.percentage_score))}>
                          {attempt.percentage_score.toFixed(1)}%
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {attempt.total_score} / {attempt.max_score} 分
                        </p>
                      </div>
                      {attempt.status === 'in_progress' && (
                        <Button size="sm" onClick={() => continueExam(attempt)}>
                          继续
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// Exam Session Component
interface ExamSessionProps {
  attempt: ExamAttempt
  onFinish: () => void
}

function ExamSession({ attempt, onFinish }: ExamSessionProps) {
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [timeLeft, setTimeLeft] = useState(attempt.exam_type.duration_minutes * 60)
  const [isSubmitting, setIsSubmitting] = useState(false)
  
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
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }
  
  const handleAnswer = (questionId: string, answer: string) => {
    setAnswers(prev => ({ ...prev, [questionId]: answer }))
  }
  
  const handleSubmit = async () => {
    if (isSubmitting) return
    setIsSubmitting(true)
    
    try {
      await api.completeExamAttempt(attempt.id)
      toast.success('考试完成')
      onFinish()
    } catch (error) {
      toast.error('提交失败')
    } finally {
      setIsSubmitting(false)
    }
  }
  
  // Mock questions for demo
  const mockQuestions = [
    { id: '1', question_text: '这是什么意思？', question_type: 'choice', options: [
      { id: 'a', text: '选项 A' },
      { id: 'b', text: '选项 B' },
      { id: 'c', text: '选项 C' },
    ]},
    { id: '2', question_text: '请填空：_____', question_type: 'fill_blank' },
  ]
  
  const progress = (Object.keys(answers).length / mockQuestions.length) * 100
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between sticky top-0 bg-background p-4 border rounded-lg z-10">
        <div>
          <h1 className="text-xl font-bold">{attempt.exam_type.name}</h1>
          <p className="text-sm text-muted-foreground">
            已答 {Object.keys(answers).length} / {mockQuestions.length} 题
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className={cn(
            "text-2xl font-mono font-bold",
            timeLeft < 300 ? "text-red-600" : "text-primary"
          )}>
            {formatTime(timeLeft)}
          </div>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            <Trophy className="h-4 w-4 mr-2" />
            交卷
          </Button>
        </div>
      </div>
      
      <Progress value={progress} className="sticky top-20 z-10" />
      
      {/* Questions */}
      <div className="space-y-6">
        {mockQuestions.map((question, index) => (
          <Card key={question.id}>
            <CardHeader>
              <CardTitle className="text-lg">
                <span className="text-muted-foreground mr-2">{index + 1}.</span>
                {question.question_text}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {question.question_type === 'choice' && question.options && (
                <div className="space-y-2">
                  {question.options.map((option) => (
                    <Button
                      key={option.id}
                      variant={answers[question.id] === option.id ? 'default' : 'outline'}
                      className="w-full justify-start"
                      onClick={() => handleAnswer(question.id, option.id)}
                    >
                      <span className="font-bold mr-2">{option.id.toUpperCase()}.</span>
                      {option.text}
                    </Button>
                  ))}
                </div>
              )}
              {question.question_type === 'fill_blank' && (
                <input
                  type="text"
                  className="w-full p-2 border rounded-md"
                  placeholder="请输入答案"
                  value={answers[question.id] || ''}
                  onChange={(e) => handleAnswer(question.id, e.target.value)}
                />
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
