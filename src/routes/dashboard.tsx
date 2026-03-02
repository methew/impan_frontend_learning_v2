import { createFileRoute } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Brain, BookOpen, Trophy, Target, Clock, Plus } from "lucide-react"

export const Route = createFileRoute('/dashboard')({
  component: DashboardPage,
})

function DashboardPage() {
  const { t } = useTranslation()

  const courses = [
    { name: t('course.japaneseN3'), progress: 75, totalLessons: 160, completedLessons: 120, id: "japanese-n3" },
    { name: t('course.englishBusiness'), progress: 45, totalLessons: 100, completedLessons: 45, id: "english-business" },
    { name: t('course.pythonProgramming'), progress: 30, totalLessons: 100, completedLessons: 30, id: "python" },
  ]

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t('dashboard.title')}</h1>
          <p className="text-muted-foreground">
            {t('dashboard.subtitle')}
          </p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          {t('dashboard.startLearning')}
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('dashboard.coursesInProgress')}</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">5</div>
            <p className="text-xs text-muted-foreground">
              {t('dashboard.dueThisWeek', { count: 2 })}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('dashboard.studyStreak')}</CardTitle>
            <Trophy className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600">{t('dashboard.days', { count: 12 })}</div>
            <p className="text-xs text-muted-foreground">
              {t('dashboard.keepItUp')}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('dashboard.cardsReviewed')}</CardTitle>
            <Brain className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">1,234</div>
            <p className="text-xs text-muted-foreground">
              {t('dashboard.thisWeek', { count: 89 })}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('dashboard.studyTime')}</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">48h</div>
            <p className="text-xs text-muted-foreground">
              {t('dashboard.thisMonth')}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="lg:col-span-4">
          <CardHeader>
            <CardTitle>{t('dashboard.currentCourses')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {courses.map((course) => (
                <div key={course.id} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">{course.name}</span>
                    <span className="text-xs text-muted-foreground">
                      {t('dashboard.lessons', { completed: course.completedLessons, total: course.totalLessons })}
                    </span>
                  </div>
                  <div className="h-2 rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-primary transition-all"
                      style={{ width: `${course.progress}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>{t('dashboard.dailyGoals')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                  <Target className="h-4 w-4" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">{t('dashboard.reviewCards', { count: 50 })}</p>
                  <p className="text-xs text-muted-foreground">{t('dashboard.completed')}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                  <BookOpen className="h-4 w-4" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">{t('dashboard.studyLessons', { count: 2 })}</p>
                  <p className="text-xs text-muted-foreground">
                    {t('dashboard.progress', { current: 1, total: 2 })}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-amber-100 text-amber-600">
                  <Clock className="h-4 w-4" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">{t('dashboard.studyMinutes', { count: 30 })}</p>
                  <p className="text-xs text-muted-foreground">
                    {t('dashboard.minutesDone', { count: 15 })}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
