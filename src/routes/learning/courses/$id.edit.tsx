import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { 
  ArrowLeft,
  Save,
  Globe,
  Layers,
  BookOpen
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { toast } from 'sonner'
import type { Course } from '@/types'

export const Route = createFileRoute('/learning/courses/$id/edit')({
  component: CourseEditPage,
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

const courseTypeOptions = [
  { value: 'textbook', label: '教材' },
  { value: 'exam_prep', label: '备考' },
  { value: 'skill', label: '技能' },
  { value: 'theme', label: '主题' },
  { value: 'custom', label: '自定义' },
]

const languageOptions = [
  { value: 'ja', label: '日语', flag: '🇯🇵' },
  { value: 'zh', label: '中文', flag: '🇨🇳' },
  { value: 'en', label: '英语', flag: '🇺🇸' },
  { value: 'ko', label: '韩语', flag: '🇰🇷' },
]

function CourseEditPage() {
  const { id } = Route.useParams()
  const navigate = useNavigate()
  const { t } = useTranslation()
  
  const [course, setCourse] = useState<Course | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  
  // 表单状态
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    course_type: 'textbook',
    language: 'ja',
    level_from: '',
    level_to: '',
    is_active: true,
    is_public: true,
  })

  useEffect(() => {
    // 模拟API调用获取课程数据
    const timer = setTimeout(() => {
      const foundCourse = mockCourses[id]
      if (foundCourse) {
        setCourse(foundCourse)
        setFormData({
          name: foundCourse.name,
          description: foundCourse.description || '',
          course_type: foundCourse.course_type,
          language: foundCourse.language.code,
          level_from: foundCourse.level_from || '',
          level_to: foundCourse.level_to || '',
          is_active: foundCourse.is_active,
          is_public: foundCourse.is_public,
        })
      }
      setIsLoading(false)
    }, 300)

    return () => clearTimeout(timer)
  }, [id])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)
    
    // 模拟保存API调用
    await new Promise(resolve => setTimeout(resolve, 500))
    
    toast.success(t('messages.saveSuccess'))
    setIsSaving(false)
    navigate({ to: `/learning/courses/${id}` })
  }

  const handleChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 bg-muted rounded animate-pulse" />
        <div className="h-96 bg-muted rounded-lg animate-pulse" />
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

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate({ to: `/learning/courses/${id}` })}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">{t('course.edit')}</h1>
          <p className="text-muted-foreground">{course.name}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* 基本信息 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              {t('common.info')}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">{t('course.name')}</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                placeholder={t('course.name')}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">{t('course.description')}</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleChange('description', e.target.value)}
                placeholder={t('course.description')}
                rows={4}
              />
            </div>
          </CardContent>
        </Card>

        {/* 课程设置 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Layers className="h-5 w-5" />
              {t('course.type')}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="course_type">{t('course.type')}</Label>
                <select
                  id="course_type"
                  value={formData.course_type}
                  onChange={(e) => handleChange('course_type', e.target.value)}
                  className="w-full h-10 px-3 rounded-md border border-input bg-background"
                >
                  {courseTypeOptions.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="language">{t('course.language')}</Label>
                <select
                  id="language"
                  value={formData.language}
                  onChange={(e) => handleChange('language', e.target.value)}
                  className="w-full h-10 px-3 rounded-md border border-input bg-background"
                >
                  {languageOptions.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.flag} {opt.label}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="level_from">{t('course.levelFrom')}</Label>
                <Input
                  id="level_from"
                  value={formData.level_from}
                  onChange={(e) => handleChange('level_from', e.target.value)}
                  placeholder="N5, HSK1, etc."
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="level_to">{t('course.levelTo')}</Label>
                <Input
                  id="level_to"
                  value={formData.level_to}
                  onChange={(e) => handleChange('level_to', e.target.value)}
                  placeholder="N1, HSK6, etc."
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 状态设置 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              {t('common.settings')}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="is_active">{t('course.isActive')}</Label>
                <p className="text-sm text-muted-foreground">启用课程</p>
              </div>
              <Switch
                id="is_active"
                checked={formData.is_active}
                onCheckedChange={(checked) => handleChange('is_active', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="is_public">{t('course.isPublic')}</Label>
                <p className="text-sm text-muted-foreground">公开课程</p>
              </div>
              <Switch
                id="is_public"
                checked={formData.is_public}
                onCheckedChange={(checked) => handleChange('is_public', checked)}
              />
            </div>
          </CardContent>
        </Card>

        {/* 操作按钮 */}
        <div className="flex gap-4">
          <Button
            type="button"
            variant="outline"
            className="flex-1"
            onClick={() => navigate({ to: `/learning/courses/${id}` })}
          >
            {t('common.cancel')}
          </Button>
          <Button
            type="submit"
            className="flex-1"
            disabled={isSaving}
          >
            <Save className="h-4 w-4 mr-2" />
            {isSaving ? t('common.loading') : t('common.save')}
          </Button>
        </div>
      </form>
    </div>
  )
}
