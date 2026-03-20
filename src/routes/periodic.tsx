import { createFileRoute } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import { 
  GraduationCap, 
  Calendar,
  Clock,
  Trophy,
  ArrowRight
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import * as api from '@/api/exams'
import type { PeriodicExam, PeriodicExamParticipant } from '@/types'

export const Route = createFileRoute('/periodic')({
  component: PeriodicExamsPage,
})

function PeriodicExamsPage() {
  const [periodicExams, setPeriodicExams] = useState<PeriodicExam[]>([])
  const [leaderboard, setLeaderboard] = useState<PeriodicExamParticipant[]>([])
  const [isLoading, setIsLoading] = useState(true)
  
  useEffect(() => {
    loadData()
  }, [])
  
  const loadData = async () => {
    setIsLoading(true)
    try {
      const data = await api.getPeriodicExams()
      setPeriodicExams(data)
      
      // Load leaderboard for first exam if available
      if (data.length > 0 && data[0].current_session) {
        const lbData = await api.getPeriodicLeaderboard(data[0].current_session.id)
        setLeaderboard(lbData)
      }
    } catch (error) {
      toast.error('加载周期考试失败')
    } finally {
      setIsLoading(false)
    }
  }
  
  const getFrequencyLabel = (frequency: string) => {
    const labels: Record<string, string> = {
      daily: '每日',
      weekly: '每周',
      monthly: '每月',
    }
    return labels[frequency] || frequency
  }
  
  const getDayOfWeek = (day: number) => {
    const days = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
    return days[day] || ''
  }
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <GraduationCap className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-bold">周期考试</h1>
        </div>
      </div>
      
      {/* Periodic Exams */}
      {isLoading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : periodicExams.length === 0 ? (
        <Card className="p-12 text-center">
          <p className="text-muted-foreground">暂无周期考试</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Exams List */}
          <div className="lg:col-span-2 space-y-4">
            {periodicExams.map((exam) => (
              <Card key={exam.id} className={exam.current_session ? "border-primary" : ""}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>{exam.name}</CardTitle>
                    <Badge variant={exam.current_session ? "default" : "secondary"}>
                      {getFrequencyLabel(exam.frequency)}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {exam.description && (
                    <p className="text-muted-foreground">{exam.description}</p>
                  )}
                  
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="outline">
                      <Clock className="h-3 w-3 mr-1" />
                      {exam.time_of_day}
                    </Badge>
                    <Badge variant="outline">
                      <Calendar className="h-3 w-3 mr-1" />
                      {exam.duration_minutes} 分钟
                    </Badge>
                    <Badge variant="outline">
                      {exam.question_count} 题
                    </Badge>
                    <Badge variant="outline">
                      及格 {exam.passing_score}%
                    </Badge>
                    {exam.day_of_week !== undefined && (
                      <Badge variant="outline">
                        {getDayOfWeek(exam.day_of_week)}
                      </Badge>
                    )}
                  </div>
                  
                  {exam.current_session && (
                    <div className="bg-accent/50 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">当前场次</p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(exam.current_session.session_date).toLocaleDateString('zh-CN')}
                          </p>
                        </div>
                        <Button size="sm">
                          参加考试
                          <ArrowRight className="h-4 w-4 ml-1" />
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
          
          {/* Leaderboard */}
          <div>
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="h-5 w-5 text-yellow-500" />
                  排行榜
                </CardTitle>
              </CardHeader>
              <CardContent>
                {leaderboard.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">
                    暂无数据
                  </p>
                ) : (
                  <div className="space-y-3">
                    {leaderboard.slice(0, 10).map((participant, index) => (
                      <div
                        key={participant.id}
                        className="flex items-center gap-3 p-2 rounded-lg hover:bg-accent/50"
                      >
                        <div className={`
                          w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm
                          ${index === 0 ? 'bg-yellow-100 text-yellow-700' : ''}
                          ${index === 1 ? 'bg-gray-100 text-gray-700' : ''}
                          ${index === 2 ? 'bg-orange-100 text-orange-700' : ''}
                          ${index > 2 ? 'bg-muted text-muted-foreground' : ''}
                        `}>
                          {participant.rank || index + 1}
                        </div>
                        <div className="flex-1">
                          <p className="font-medium">用户 {participant.user.slice(0, 8)}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold">{participant.score?.toFixed(0)} 分</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  )
}
