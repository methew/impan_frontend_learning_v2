import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import { 
  ArrowLeft,
  BookOpen,
  Edit,
  Trash2,
  Layers,
  GraduationCap,
  Calendar,
  Globe,
  Target
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { toast } from 'sonner'
import { useTranslation } from 'react-i18next'
import type { Course } from '@/types'

export const Route = createFileRoute('/learning/courses/$id')({
  component: CourseDetailPage,
})

// 模拟数据
const mockCourses: Record<string, Course> = {
  '1': {
    id: '1',
    name: '大家的日语 初级上',
    language: { code: 'ja', name: '日语', name_local: '日本語', writing_system: 'kana', has_spaces: false, is_rtl: false },
    course_type: 'textbook',
    description: '经典日语教材，适合零基础学习者。包含25课，涵盖基础语法、词汇和会话。',
    level_from: 'N5',
    level_to: 'N4',
    is_active: true,
    is_public: true,
    created_at: '2024-01-15',
  },
  '2': {
    id: '2',
    name: '大家的日语 初级下',
    language: { code: 'ja', name: '日语', name_local: '日本語', writing_system: 'kana', has_spaces: false, is_rtl: false },
    course_type: 'textbook',
    description: '经典日语教材初级下册，承接初级上，继续深入学习日语基础。',
    level_from: 'N4',
    level_to: 'N3',
    is_active: true,
    is_public: true,
    created_at: '2024-01-15',
  },
  '3': {
    id: '3',
    name: 'JLPT N5 备考课程',
    language: { code: 'ja', name: '日语', name_local: '日本語', writing_system: 'kana', has_spaces: false, is_rtl: false },
    course_type: 'exam_prep',
    description: '针对 JLPT N5 考试的专项训练，包含词汇、语法、阅读和听力。',
    level_from: 'N5',
    level_to: 'N5',
    is_active: true,
    is_public: true,
    created_at: '2024-02-01',
  },
  '4': {
    id: '4',
    name: 'HSK 标准教程 1',
    language: { code: 'zh', name: '中文', name_local: '中文', writing_system: 'hanzi', has_spaces: false, is_rtl: false },
    course_type: 'textbook',
    description: 'HSK 一级标准教程，包含150个词汇和基础语法。',
    level_from: 'HSK1',
    level_to: 'HSK1',
    is_active: true,
    is_public: true,
    created_at: '2024-02-10',
  },
}

// 模拟课程统计
const mockStats = {
  '1': {
    totalLessons: 25,
    completedLessons: 12,
    totalVocab: 800,
    learnedVocab: 350,
    totalGrammar: 50,
    learnedGrammar: 22,
    studyHours: 45,
    lastStudyDate: '2024-03-25',
  },
  '2': {
    totalLessons: 25,
    completedLessons: 0,
    totalVocab: 900,
    learnedVocab: 0,
    totalGrammar: 60,
    learnedGrammar: 0,
    studyHours: 0,
    lastStudyDate: null,
  },
  '3': {
    totalLessons: 20,
    completedLessons: 5,
    totalVocab: 600,
    learnedVocab: 120,
    totalGrammar: 40,
    learnedGrammar: 10,
    studyHours: 18,
    lastStudyDate: '2024-03-24',
  },
  '4': {
    totalLessons: 15,
    completedLessons: 0,
    totalVocab: 150,
    learnedVocab: 0,
    totalGrammar: 30,
    learnedGrammar: 0,
    studyHours: 0,
    lastStudyDate: null,
  },
}

// 模拟课程单元
const mockUnits: Record<string, Array<{ id: string; name: string; lessons: number; completed: number }>> = {
  '1': [
    { id: 'u1', name: '第一单元 - 入门', lessons: 5, completed: 5 },
    { id: 'u2', name: '第二单元 - 基础会话', lessons: 5, completed: 4 },
    { id: 'u3', name: '第三单元 - 日常生活', lessons: 5, completed: 3 },
    { id: 'u4', name: '第四单元 - 进阶语法', lessons: 5, completed: 0 },
    { id: 'u5', name: '第五单元 - 复习巩固', lessons: 5, completed: 0 },
  ],
  '3': [
    { id: 'u1', name: '词汇篇', lessons: 5, completed: 2 },
    { id: 'u2', name: '语法篇', lessons: 5, completed: 2 },
    { id: 'u3', name: '阅读篇', lessons: 5, completed: 1 },
    { id: 'u4', name: '听力篇', lessons: 5, completed: 0 },
  ],
}

function useCourseTypeLabels() {
  const { t } = useTranslation()
  return {
    textbook: t('course.textbook'),
    exam_prep: t('course.examPrep'),
    skill: t('course.skill'),
    theme: t('course.theme'),
    custom: t('course.custom'),
  }
}



function CourseDetailPage() {
  const { id } = Route.useParams()
  const navigate = useNavigate()
  const { t } = useTranslation()
  const courseTypeLabels = useCourseTypeLabels()
  const [course, setCourse] = useState<Course | null>(null)
  const [stats, setStats] = useState<typeof mockStats['1'] | null>(null)
  const [units, setUnits] = useState<typeof mockUnits['1']>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // 模拟API调用
    const timer = setTimeout(() => {
      const foundCourse = mockCourses[id]
      if (foundCourse) {
        setCourse(foundCourse)
        setStats((mockStats as unknown as Record<string, typeof mockStats['1']>)[id] || mockStats['1'])
        setUnits(mockUnits[id] || [])
      }
      setIsLoading(false)
    }, 300)

    return () => clearTimeout(timer)
  }, [id])

  const handleDelete = () => {
    if (confirm(t('messages.deleteConfirm'))) {
      toast.success(t('messages.deleteSuccess'))
      navigate({ to: '/learning/courses' })
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 bg-muted rounded animate-pulse" />
        <div className="h-64 bg-muted rounded-lg animate-pulse" />
      </div>
    )
  }

  if (!course) {
    return (
      <div className="text-center py-12">
        <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h2 className="text-xl font-semibold mb-2">{t('course.notFound')}</h2>
        <p className="text-muted-foreground mb-4">{t('course.notFoundDesc')}</p>
        <Button onClick={() => navigate({ to: '/learning/courses' })}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          {t('common.back')}
        </Button>
      </div>
    )
  }

  const progress = stats ? Math.round((stats.completedLessons / stats.totalLessons) * 100) : 0

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate({ to: '/learning/courses' })}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">{course.name}</h1>
            <p className="text-muted-foreground">{course.description}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => navigate({ to: `/learning/courses/${id}/edit` })}>
            <Edit className="h-4 w-4 mr-2" />
            {t('common.edit')}
          </Button>
          <Button variant="destructive" onClick={handleDelete}>
            <Trash2 className="h-4 w-4 mr-2" />
            {t('common.delete')}
          </Button>
        </div>
      </div>

      {/* Course Info Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-blue-100">
                <Globe className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{t('course.language')}</p>
                <p className="font-semibold">{course.language.name}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-purple-100">
                <Layers className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{t('course.type')}</p>
                <p className="font-semibold">{courseTypeLabels[course.course_type]}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-green-100">
                <GraduationCap className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{t('course.levelFrom')}</p>
                <p className="font-semibold">
                  {course.level_from} {course.level_to && course.level_to !== course.level_from ? `- ${course.level_to}` : ''}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-orange-100">
                <Calendar className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{t('common.createdAt')}</p>
                <p className="font-semibold">{new Date(course.created_at).toLocaleDateString('zh-CN')}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Progress Overview */}
      {stats && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              学习进度
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">{t('course.progress')}</span>
                <span className="font-semibold">{progress}%</span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div 
                  className="h-full bg-primary transition-all"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4">
                <div className="text-center">
                  <p className="text-2xl font-bold">{stats.completedLessons}/{stats.totalLessons}</p>
                  <p className="text-sm text-muted-foreground">{t('course.completedLessons')}</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold">{stats.learnedVocab}/{stats.totalVocab}</p>
                  <p className="text-sm text-muted-foreground">{t('stats.vocabularyLearned')}</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold">{stats.learnedGrammar}/{stats.totalGrammar}</p>
                  <p className="text-sm text-muted-foreground">{t('stats.grammarMastered')}</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold">{stats.studyHours}</p>
                  <p className="text-sm text-muted-foreground">{t('course.studyHours')}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Units & Lessons */}
      <Tabs defaultValue="units" className="space-y-4">
        <TabsList>
          <TabsTrigger value="units">{t('course.units')}</TabsTrigger>
          <TabsTrigger value="vocab">{t('learning.vocabulary')}</TabsTrigger>
          <TabsTrigger value="grammar">{t('learning.grammar')}</TabsTrigger>
        </TabsList>

        <TabsContent value="units" className="space-y-4">
          {units.length > 0 ? (
            units.map((unit) => (
              <Card key={unit.id} className="hover:border-primary/50 transition-colors">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="p-3 rounded-lg bg-primary/10">
                        <BookOpen className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold">{unit.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          {unit.lessons} {t('course.lessons')} · {t('course.completedLessons')} {unit.completed}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-sm font-medium">
                          {Math.round((unit.completed / unit.lessons) * 100)}%
                        </p>
                      </div>
                      <Button variant="ghost" size="sm">
                        {t('course.enterLearn')}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card>
              <CardContent className="p-12 text-center">
                <Layers className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">{t('common.noData')}</h3>
                <p className="text-muted-foreground mb-4">{t('course.notFoundDesc')}</p>
                <Button>{t('course.addUnit')}</Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="vocab">
          <Card>
            <CardContent className="p-12 text-center">
              <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">{t('learning.vocabulary')}</h3>
              <p className="text-muted-foreground mb-4">{t('learning.vocabulary')}</p>
              <Button asChild>
                <Link to="/learning/content">{t('learning.viewDetails')}</Link>
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="grammar">
          <Card>
            <CardContent className="p-12 text-center">
              <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">{t('learning.grammar')}</h3>
              <p className="text-muted-foreground mb-4">{t('learning.grammar')}</p>
              <Button asChild>
                <Link to="/learning/content">{t('learning.viewDetails')}</Link>
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
