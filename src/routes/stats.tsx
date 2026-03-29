import { createFileRoute, Link } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { 
  BookOpen,
  ClipboardList,
  Calendar,
  Flame,
  Target,
  Layers,
  PenTool,
  Clock,
  ChevronRight,
  TreeDeciduous,
  GraduationCap,
  Sparkles,
  ArrowUpRight,
  ArrowDownRight,
  Minus
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { cn } from '@/lib/utils'

export const Route = createFileRoute('/stats')({
  component: StatsPage,
})

// 模拟统计数据
const mockStats = {
  overview: {
    totalStudyDays: 45,
    currentStreak: 7,
    longestStreak: 15,
    todayStudyTime: 45, // minutes
    totalStudyTime: 1280, // minutes
    weeklyGoal: 300, // minutes per week
    weeklyProgress: 210,
  },
  mastery: {
    vocab: 65,
    grammar: 48,
    idiom: 32,
    writing: 55,
    overall: 50,
  },
  content: {
    totalNodesStudied: 328,
    vocabCount: 156,
    grammarCount: 89,
    idiomCount: 45,
    textCount: 38,
    examplesSeen: 523,
  },
  flashcards: {
    totalCards: 450,
    newCards: 20,
    reviewCards: 85,
    dueCards: 12,
    masteredCards: 245,
    streakDays: 30,
    totalStudyTime: 480, // minutes
  },
  writing: {
    totalExercises: 128,
    completedExercises: 98,
    avgSimilarity: 78.5,
    totalMistakes: 156,
    masteredMistakes: 89,
    needsReview: 67,
  },
  exams: {
    totalAttempts: 12,
    completedAttempts: 12,
    passedAttempts: 9,
    passRate: 75,
    avgScore: 72.5,
  },
  activity: [
    { date: '2024-03-25', count: 5, time: 45 },
    { date: '2024-03-24', count: 3, time: 30 },
    { date: '2024-03-23', count: 8, time: 75 },
    { date: '2024-03-22', count: 4, time: 40 },
    { date: '2024-03-21', count: 6, time: 55 },
    { date: '2024-03-20', count: 2, time: 20 },
    { date: '2024-03-19', count: 7, time: 65 },
  ],
  weeklyTrend: [
    { day: '周一', content: 12, flashcards: 25, writing: 8, exams: 0 },
    { day: '周二', content: 8, flashcards: 30, writing: 12, exams: 0 },
    { day: '周三', content: 15, flashcards: 20, writing: 5, exams: 45 },
    { day: '周四', content: 10, flashcards: 35, writing: 10, exams: 0 },
    { day: '周五', content: 5, flashcards: 40, writing: 15, exams: 0 },
    { day: '周六', content: 20, flashcards: 50, writing: 20, exams: 60 },
    { day: '周日', content: 0, flashcards: 0, writing: 0, exams: 0 },
  ],
}

function StatsPage() {
  const { t } = useTranslation()
  const [isLoading, setIsLoading] = useState(true)
  const [stats, setStats] = useState(mockStats)

  useEffect(() => {
    // 模拟 API 调用
    setTimeout(() => {
      setStats(mockStats)
      setIsLoading(false)
    }, 500)
  }, [])

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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{t('stats.learning')}</h1>
          <p className="text-muted-foreground">{t('stats.trackProgress')}</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="text-sm">
            <Calendar className="mr-1 h-3 w-3" />
            {t('stats.last7Days')}
          </Badge>
        </div>
      </div>

      {/* 概览统计 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <OverviewCard
          icon={Flame}
          label={t('stats.streak')}
          value={`${stats.overview.currentStreak} ${t('common.days')}`}
          subValue={`${t('stats.longest')} ${stats.overview.longestStreak} ${t('common.days')}`}
          color="text-orange-500"
          bgColor="bg-orange-50"
          trend="up"
        />
        <OverviewCard
          icon={Clock}
          label={t('stats.todayStudy')}
          value={`${stats.overview.todayStudyTime} ${t('common.minutes')}`}
          subValue={`${t('stats.weekly')} ${stats.overview.weeklyProgress} ${t('common.minutes')}`}
          color="text-blue-500"
          bgColor="bg-blue-50"
          trend="up"
        />
        <OverviewCard
          icon={Target}
          label={t('stats.mastery')}
          value={`${stats.mastery.overall}%`}
          subValue={t('stats.overallRating')}
          color="text-green-500"
          bgColor="bg-green-50"
          trend="up"
        />
        <OverviewCard
          icon={BookOpen}
          label={t('stats.content')}
          value={`${stats.content.totalNodesStudied}`}
          subValue={t('stats.nodesLearned')}
          color="text-purple-500"
          bgColor="bg-purple-50"
          trend="neutral"
        />
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-4">
          <TabsTrigger value="overview">{t('common.overview')}</TabsTrigger>
          <TabsTrigger value="content">{t('common.content')}</TabsTrigger>
          <TabsTrigger value="flashcards">{t('common.flashcards')}</TabsTrigger>
          <TabsTrigger value="writing">{t('common.writing')}</TabsTrigger>
        </TabsList>

        {/* 总览 Tab */}
        <TabsContent value="overview" className="space-y-6">
          {/* 掌握程度雷达 */}
          <Card>
            <CardHeader>
              <CardTitle>{t('stats.mastery')}</CardTitle>
              <CardDescription>{t('stats.masteryDesc')}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <MasteryItem 
                    icon={TreeDeciduous}
                    label={t('common.vocabulary')}
                    value={stats.mastery.vocab}
                    color="bg-emerald-500"
                  />
                  <MasteryItem 
                    icon={ClipboardList}
                    label={t('common.grammar')}
                    value={stats.mastery.grammar}
                    color="bg-cyan-500"
                  />
                  <MasteryItem 
                    icon={BookOpen}
                    label={t('common.idioms')}
                    value={stats.mastery.idiom}
                    color="bg-indigo-500"
                  />
                  <MasteryItem 
                    icon={PenTool}
                    label={t('common.writing')}
                    value={stats.mastery.writing}
                    color="bg-green-500"
                  />
                </div>
                <div className="flex items-center justify-center">
                  <div className="relative w-48 h-48">
                    <svg className="w-full h-full transform -rotate-90">
                      <circle
                        cx="96"
                        cy="96"
                        r="88"
                        className="stroke-muted fill-none"
                        strokeWidth="12"
                      />
                      <circle
                        cx="96"
                        cy="96"
                        r="88"
                        className="stroke-primary fill-none"
                        strokeWidth="12"
                        strokeDasharray={`${2 * Math.PI * 88}`}
                        strokeDashoffset={`${2 * Math.PI * 88 * (1 - stats.mastery.overall / 100)}`}
                        strokeLinecap="round"
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-4xl font-bold">{stats.mastery.overall}%</span>
                      <span className="text-sm text-muted-foreground">{t('stats.overallMastery')}</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 各模块统计 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <ModuleStatCard
              title={t('stats.content')}
              icon={BookOpen}
              color="bg-blue-500"
              stats={[
                { label: t('stats.nodesLearned'), value: stats.content.totalNodesStudied },
                { label: t('stats.examplesSeen'), value: stats.content.examplesSeen },
                { label: t('stats.vocabularyCount'), value: stats.content.vocabCount },
              ]}
              link="/learning/content"
            />
            <ModuleStatCard
              title={t('stats.flashcardReview')}
              icon={Layers}
              color="bg-purple-500"
              stats={[
                { label: t('stats.totalCards'), value: stats.flashcards.totalCards },
                { label: t('stats.mastered'), value: stats.flashcards.masteredCards },
                { label: t('stats.streakDays'), value: stats.flashcards.streakDays },
              ]}
              link="/learning/flashcards"
            />
            <ModuleStatCard
              title={t('stats.writingPractice')}
              icon={PenTool}
              color="bg-green-500"
              stats={[
                { label: t('stats.exerciseCount'), value: stats.writing.totalExercises },
                { label: t('stats.avgSimilarity'), value: `${stats.writing.avgSimilarity}%` },
                { label: t('stats.mistakesCorrected'), value: stats.writing.masteredMistakes },
              ]}
              link="/learning/writing"
            />
          </div>

          {/* 考试统计 */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>{t('stats.exams')}</CardTitle>
                <CardDescription>{t('stats.examPerformance')}</CardDescription>
              </div>
              <Link to="/exams">
                <Button variant="outline" size="sm">
                  {t('common.viewDetails')}
                  <ChevronRight className="ml-1 h-4 w-4" />
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-muted rounded-lg">
                  <p className="text-3xl font-bold">{stats.exams.totalAttempts}</p>
                  <p className="text-sm text-muted-foreground">{t('stats.totalExamAttempts')}</p>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <p className="text-3xl font-bold text-green-600">{stats.exams.passedAttempts}</p>
                  <p className="text-sm text-muted-foreground">{t('stats.passedAttempts')}</p>
                </div>
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <p className="text-3xl font-bold text-blue-600">{stats.exams.passRate}%</p>
                  <p className="text-sm text-muted-foreground">{t('stats.passRate')}</p>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <p className="text-3xl font-bold text-purple-600">{stats.exams.avgScore}</p>
                  <p className="text-sm text-muted-foreground">{t('stats.averageScore')}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 内容 Tab */}
        <TabsContent value="content" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{t('stats.contentStats')}</CardTitle>
              <CardDescription>{t('stats.contentStatsDesc')}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <ContentTypeCard
                  icon={TreeDeciduous}
                  label={t('common.vocabulary')}
                  count={stats.content.vocabCount}
                  color="bg-emerald-500"
                  mastery={stats.mastery.vocab}
                />
                <ContentTypeCard
                  icon={ClipboardList}
                  label={t('common.grammar')}
                  count={stats.content.grammarCount}
                  color="bg-cyan-500"
                  mastery={stats.mastery.grammar}
                />
                <ContentTypeCard
                  icon={BookOpen}
                  label={t('common.idioms')}
                  count={stats.content.idiomCount}
                  color="bg-indigo-500"
                  mastery={stats.mastery.idiom}
                />
                <ContentTypeCard
                  icon={GraduationCap}
                  label={t('common.text')}
                  count={stats.content.textCount}
                  color="bg-rose-500"
                  mastery={75}
                />
              </div>

              <div className="p-4 bg-muted rounded-lg">
                <h4 className="font-medium mb-4">{t('stats.learningSuggestions')}</h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <Sparkles className="h-4 w-4 text-yellow-500 mt-0.5" />
                    <span>{t('stats.suggestionVocab')}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Sparkles className="h-4 w-4 text-yellow-500 mt-0.5" />
                    <span>{t('stats.suggestionGrammar')}</span>
                  </li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 闪卡 Tab */}
        <TabsContent value="flashcards" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{t('stats.flashcardStats')}</CardTitle>
              <CardDescription>{t('stats.flashcardStatsDesc')}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                <StatBox label={t('stats.totalCards')} value={stats.flashcards.totalCards} />
                <StatBox label={t('stats.mastered')} value={stats.flashcards.masteredCards} color="text-green-600" />
                <StatBox label={t('stats.learning')} value={stats.flashcards.totalCards - stats.flashcards.masteredCards} />
                <StatBox label={t('stats.newCardsToday')} value={stats.flashcards.newCards} color="text-blue-600" />
                <StatBox label={t('stats.reviewCardsToday')} value={stats.flashcards.reviewCards} color="text-orange-600" />
                <StatBox label={t('stats.dueSoon')} value={stats.flashcards.dueCards} color="text-red-600" />
              </div>
              
              <div className="flex items-center justify-between p-4 bg-purple-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <Flame className="h-8 w-8 text-orange-500" />
                  <div>
                    <p className="font-medium">{t('stats.streakDaysCount', { days: stats.flashcards.streakDays })}</p>
                    <p className="text-sm text-muted-foreground">{t('stats.keepItUp')}</p>
                  </div>
                </div>
                <Link to="/learning/flashcards">
                  <Button>
                    {t('common.continueLearning')}
                    <ChevronRight className="ml-1 h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 写作 Tab */}
        <TabsContent value="writing" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{t('stats.writingStats')}</CardTitle>
              <CardDescription>{t('stats.writingStatsDesc')}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <StatBox label={t('stats.totalExercises')} value={stats.writing.totalExercises} />
                <StatBox label={t('stats.completed')} value={stats.writing.completedExercises} color="text-green-600" />
                <StatBox label={t('stats.avgSimilarity')} value={`${stats.writing.avgSimilarity}%`} color="text-blue-600" />
                <StatBox label={t('stats.needsReview')} value={stats.writing.needsReview} color="text-red-600" />
              </div>

              <div className="space-y-4">
                <h4 className="font-medium">{t('stats.mistakeBook')}</h4>
                <div className="grid grid-cols-3 gap-4">
                  <div className="p-4 bg-red-50 rounded-lg text-center">
                    <p className="text-2xl font-bold text-red-600">{stats.writing.totalMistakes}</p>
                    <p className="text-sm text-muted-foreground">{t('stats.totalMistakes')}</p>
                  </div>
                  <div className="p-4 bg-green-50 rounded-lg text-center">
                    <p className="text-2xl font-bold text-green-600">{stats.writing.masteredMistakes}</p>
                    <p className="text-sm text-muted-foreground">{t('stats.mastered')}</p>
                  </div>
                  <div className="p-4 bg-orange-50 rounded-lg text-center">
                    <p className="text-2xl font-bold text-orange-600">{stats.writing.needsReview}</p>
                    <p className="text-sm text-muted-foreground">{t('stats.pendingReview')}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* 学习活动热力图 */}
      <Card>
        <CardHeader>
          <CardTitle>{t('stats.learningActivity')}</CardTitle>
          <CardDescription>{t('stats.learningActivityDesc')}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-end justify-between h-32 gap-2">
            {stats.activity.map((day, index) => {
              const maxCount = Math.max(...stats.activity.map(d => d.count))
              const height = maxCount > 0 ? (day.count / maxCount) * 100 : 0
              
              return (
                <div key={index} className="flex-1 flex flex-col items-center gap-2">
                  <div className="w-full flex items-end justify-center">
                    <div 
                      className={cn(
                        "w-full max-w-12 rounded-t-lg transition-all",
                        height > 70 ? "bg-primary" : 
                        height > 40 ? "bg-primary/70" : 
                        height > 0 ? "bg-primary/40" : "bg-muted"
                      )}
                      style={{ height: `${Math.max(height, 4)}%` }}
                    />
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-muted-foreground">
                      {new Date(day.date).toLocaleDateString('zh-CN', { weekday: 'short' })}
                    </p>
                    <p className="text-xs font-medium">{t('stats.itemsCount', { count: day.count })}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// 概览卡片
function OverviewCard({ 
  icon: Icon, 
  label, 
  value, 
  subValue,
  color,
  bgColor,
  trend
}: { 
  icon: React.ElementType
  label: string
  value: string
  subValue: string
  color: string
  bgColor: string
  trend: 'up' | 'down' | 'neutral'
}) {
  const TrendIcon = trend === 'up' ? ArrowUpRight : trend === 'down' ? ArrowDownRight : Minus
  
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className={cn("p-2 rounded-lg", bgColor)}>
            <Icon className={cn("h-5 w-5", color)} />
          </div>
          <TrendIcon className={cn(
            "h-4 w-4",
            trend === 'up' ? "text-green-500" : 
            trend === 'down' ? "text-red-500" : 
            "text-muted-foreground"
          )} />
        </div>
        <div className="mt-3">
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className="text-2xl font-bold">{value}</p>
          <p className="text-xs text-muted-foreground">{subValue}</p>
        </div>
      </CardContent>
    </Card>
  )
}

// 掌握程度项
function MasteryItem({ 
  icon: Icon, 
  label, 
  value, 
  color 
}: { 
  icon: React.ElementType
  label: string
  value: number
  color: string
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Icon className={cn("h-4 w-4", color.replace('bg-', 'text-'))} />
          <span className="font-medium">{label}</span>
        </div>
        <span className="font-bold">{value}%</span>
      </div>
      <Progress value={value} className="h-2" />
    </div>
  )
}

// 模块统计卡片
function ModuleStatCard({ 
  title, 
  icon: Icon, 
  color, 
  stats,
  link
}: { 
  title: string
  icon: React.ElementType
  color: string
  stats: { label: string; value: number | string }[]
  link: string
}) {
  const { t } = useTranslation()
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-3">
          <div className={cn("p-2 rounded-lg text-white", color)}>
            <Icon className="h-5 w-5" />
          </div>
          <CardTitle className="text-lg">{title}</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {stats.map((stat, index) => (
            <div key={index} className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">{stat.label}</span>
              <span className="font-medium">{stat.value}</span>
            </div>
          ))}
        </div>
        <Link to={link}>
          <Button variant="ghost" size="sm" className="w-full mt-4">
            {t('common.viewDetails')}
            <ChevronRight className="ml-1 h-4 w-4" />
          </Button>
        </Link>
      </CardContent>
    </Card>
  )
}

// 内容类型卡片
function ContentTypeCard({ 
  icon: Icon, 
  label, 
  count, 
  color,
  mastery
}: { 
  icon: React.ElementType
  label: string
  count: number
  color: string
  mastery: number
}) {
  return (
    <div className={cn("p-4 rounded-lg border-2", color.replace('bg-', 'border-').replace('500', '200'))}>
      <div className="flex items-center gap-3 mb-3">
        <div className={cn("p-2 rounded-lg text-white", color)}>
          <Icon className="h-4 w-4" />
        </div>
        <span className="font-medium">{label}</span>
      </div>
      <p className="text-2xl font-bold mb-2">{count}</p>
      <div className="flex items-center gap-2">
        <Progress value={mastery} className="h-1.5 flex-1" />
        <span className="text-xs text-muted-foreground">{mastery}%</span>
      </div>
    </div>
  )
}

// 统计框
function StatBox({ 
  label, 
  value, 
  color = "text-foreground" 
}: { 
  label: string
  value: number | string
  color?: string
}) {
  return (
    <div className="p-4 bg-muted rounded-lg text-center">
      <p className={cn("text-2xl font-bold", color)}>{value}</p>
      <p className="text-sm text-muted-foreground">{label}</p>
    </div>
  )
}
