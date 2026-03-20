import { createFileRoute } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import { 
  BarChart3, 
  BookOpen,
  ClipboardList,
  TrendingUp,
  Award
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { toast } from 'sonner'
import * as examApi from '@/api/exams'
import type { ExamStats } from '@/types'

export const Route = createFileRoute('/stats')({
  component: StatsPage,
})

function StatsPage() {
  const [examStats, setExamStats] = useState<ExamStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  
  useEffect(() => {
    loadStats()
  }, [])
  
  const loadStats = async () => {
    setIsLoading(true)
    try {
      const data = await examApi.getExamStats()
      setExamStats(data)
    } catch (error) {
      toast.error('加载统计数据失败')
    } finally {
      setIsLoading(false)
    }
  }
  
  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <BarChart3 className="h-6 w-6 text-primary" />
        <h1 className="text-2xl font-bold">学习统计</h1>
      </div>
      
      {/* Exam Stats */}
      {examStats && (
        <>
          {/* Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">总考试次数</CardTitle>
                <ClipboardList className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{examStats.total_attempts}</div>
                <p className="text-xs text-muted-foreground">
                  已完成 {examStats.completed_attempts}
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">通过率</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {(examStats.pass_rate * 100).toFixed(1)}%
                </div>
                <Progress value={examStats.pass_rate * 100} className="mt-2" />
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">通过考试</CardTitle>
                <Award className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{examStats.passed_attempts}</div>
                <p className="text-xs text-muted-foreground">
                  总计 {examStats.completed_attempts} 次
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">考试类型</CardTitle>
                <BookOpen className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{examStats.by_exam_type.length}</div>
                <p className="text-xs text-muted-foreground">
                  已参加过
                </p>
              </CardContent>
            </Card>
          </div>
          
          {/* By Exam Type */}
          {examStats.by_exam_type.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>按考试类型</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {examStats.by_exam_type.map((type) => (
                    <div key={type.exam_type_id} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{type.exam_type_name}</span>
                        <span className="text-sm text-muted-foreground">
                          {type.attempts} 次
                        </span>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="flex-1">
                          <div className="flex justify-between text-sm mb-1">
                            <span>通过率</span>
                            <span>{(type.pass_rate * 100).toFixed(0)}%</span>
                          </div>
                          <Progress value={type.pass_rate * 100} />
                        </div>
                        <div className="w-20 text-right">
                          <span className="text-sm font-medium">
                            {type.avg_score.toFixed(0)} 分
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
          
          {/* Recent Attempts */}
          {examStats.recent_attempts.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>最近考试</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {examStats.recent_attempts.slice(0, 5).map((attempt) => (
                    <div
                      key={attempt.id}
                      className="flex items-center justify-between p-3 bg-muted rounded-lg"
                    >
                      <div>
                        <p className="font-medium">{attempt.exam_type_name}</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(attempt.completed_at).toLocaleString('zh-CN')}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className={`font-bold ${attempt.is_passed ? 'text-green-600' : 'text-red-600'}`}>
                          {attempt.score.toFixed(0)}%
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {attempt.is_passed ? '通过' : '未通过'}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  )
}
