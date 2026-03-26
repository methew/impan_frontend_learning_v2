import { createFileRoute, Link } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { 
  BookOpen, 
  GraduationCap,
  ClipboardList,
  BarChart3,
  ArrowRight,
  Sparkles,
  TreeDeciduous,
  FlaskConical,
  Layers,
  PenTool,
  Target,
  Flame,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { MiniRecommendations } from '@/components/shared/LearningRecommendations'

export const Route = createFileRoute('/')({
  component: HomePage,
})

function HomePage() {
  const { t } = useTranslation()

  const features = [
    {
      icon: BookOpen,
      title: t('learning.contentTitle'),
      description: t('learning.contentDescription'),
      to: '/learning/content',
      color: 'bg-blue-500',
    },
    {
      icon: Layers,
      title: t('learning.flashcardsTitle'),
      description: t('learning.flashcardsDescription'),
      to: '/learning/flashcards',
      color: 'bg-purple-500',
    },
    {
      icon: PenTool,
      title: t('learning.writingTitle'),
      description: t('learning.writingDescription'),
      to: '/learning/writing',
      color: 'bg-green-500',
    },
    {
      icon: ClipboardList,
      title: t('exam.practiceTitle'),
      description: t('exam.practiceDescription'),
      to: '/exams',
      color: 'bg-orange-500',
    },
    {
      icon: GraduationCap,
      title: t('exam.periodicTitle'),
      description: t('exam.periodicDescription'),
      to: '/periodic',
      color: 'bg-red-500',
    },
    {
      icon: BarChart3,
      title: t('stats.title'),
      description: t('stats.description'),
      to: '/stats',
      color: 'bg-cyan-500',
    },
  ]

  const learningTypes = [
    { id: 'vocab', icon: TreeDeciduous, title: t('learning.vocabulary'), to: '/learning/content', color: 'bg-emerald-500' },
    { id: 'grammar', icon: FlaskConical, title: t('learning.grammar'), to: '/learning/content', color: 'bg-cyan-500' },
    { id: 'idiom', icon: BookOpen, title: t('learning.idioms'), to: '/learning/content', color: 'bg-indigo-500' },
    { id: 'text', icon: BookOpen, title: t('learning.text'), to: '/learning/content', color: 'bg-rose-500' },
  ]

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="text-center space-y-4 py-8">
        <div className="flex items-center justify-center gap-2">
          <Sparkles className="h-8 w-8 text-primary" />
          <h1 className="text-4xl font-bold">{t('app.name')}</h1>
        </div>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          {t('app.description')}
        </p>
        <div className="flex justify-center gap-4 pt-4">
          <Link to="/learning/content">
            <Button size="lg">
              {t('learning.start')}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
          <Link to="/exams">
            <Button variant="outline" size="lg">
              {t('exam.go')}
            </Button>
          </Link>
        </div>
      </div>

      {/* Today's Recommendations */}
      <MiniRecommendations />

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 bg-orange-500/10 rounded-lg">
              <Flame className="h-5 w-5 text-orange-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">{t('stats.streak')}</p>
              <p className="text-2xl font-bold">7 {t('common.days')}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 bg-blue-500/10 rounded-lg">
              <Target className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">{t('stats.todayGoal')}</p>
              <p className="text-2xl font-bold">75%</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 bg-purple-500/10 rounded-lg">
              <Layers className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">{t('stats.dueReviews')}</p>
              <p className="text-2xl font-bold">12 {t('common.cards')}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 bg-green-500/10 rounded-lg">
              <BookOpen className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">{t('stats.learned')}</p>
              <p className="text-2xl font-bold">328</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Access - Learning Types */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {learningTypes.map((type) => (
          <Link key={type.id} to={type.to}>
            <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer text-center">
              <CardContent className="p-6">
                <div className={`p-3 rounded-lg ${type.color} text-white inline-flex mb-3`}>
                  <type.icon className="h-6 w-6" />
                </div>
                <h3 className="font-medium">{type.title}</h3>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Features Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {features.map((feature) => (
          <Link key={feature.to} to={feature.to}>
            <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader className="flex flex-row items-center gap-4">
                <div className={`p-3 rounded-lg ${feature.color} text-white`}>
                  <feature.icon className="h-6 w-6" />
                </div>
                <div>
                  <CardTitle>{feature.title}</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{feature.description}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}
