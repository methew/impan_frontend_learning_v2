import { createFileRoute, Link } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import { 
  BookOpen, 
  Plus, 
  Search, 
  MoreHorizontal,
  Edit,
  Trash2,
  Layers,
  GraduationCap,
  Globe
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { toast } from 'sonner'
import { useTranslation } from 'react-i18next'
import type { Course } from '@/types'

export const Route = createFileRoute('/learning/courses/')({
  component: CoursesPage,
})

// 模拟数据
const mockCourses: Course[] = [
  {
    id: '1',
    name: '大家的日语 初级上',
    language: { code: 'ja', name: '日语', name_local: '日本語', writing_system: 'kana', has_spaces: false, is_rtl: false },
    course_type: 'textbook',
    description: '经典日语教材，适合零基础学习者',
    level_from: 'N5',
    level_to: 'N4',
    is_active: true,
    is_public: true,
    created_at: '2024-01-15',
  },
  {
    id: '2',
    name: '大家的日语 初级下',
    language: { code: 'ja', name: '日语', name_local: '日本語', writing_system: 'kana', has_spaces: false, is_rtl: false },
    course_type: 'textbook',
    description: '经典日语教材初级下册',
    level_from: 'N4',
    level_to: 'N3',
    is_active: true,
    is_public: true,
    created_at: '2024-01-15',
  },
  {
    id: '3',
    name: 'JLPT N5 备考课程',
    language: { code: 'ja', name: '日语', name_local: '日本語', writing_system: 'kana', has_spaces: false, is_rtl: false },
    course_type: 'exam_prep',
    description: '针对 JLPT N5 考试的专项训练',
    level_from: 'N5',
    level_to: 'N5',
    is_active: true,
    is_public: true,
    created_at: '2024-02-01',
  },
  {
    id: '4',
    name: 'HSK 标准教程 1',
    language: { code: 'zh', name: '中文', name_local: '中文', writing_system: 'hanzi', has_spaces: false, is_rtl: false },
    course_type: 'textbook',
    description: 'HSK 一级标准教程',
    level_from: 'HSK1',
    level_to: 'HSK1',
    is_active: true,
    is_public: true,
    created_at: '2024-02-10',
  },
]

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

const courseTypeColors: Record<string, string> = {
  textbook: 'bg-blue-500',
  exam_prep: 'bg-orange-500',
  skill: 'bg-green-500',
  theme: 'bg-purple-500',
  custom: 'bg-gray-500',
}

function CoursesPage() {
  const { t } = useTranslation()
  const courseTypeLabels = useCourseTypeLabels()
  const [courses, setCourses] = useState<Course[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [selectedLanguage, setSelectedLanguage] = useState<string>('all')

  useEffect(() => {
    // 模拟 API 调用
    const timer = setTimeout(() => {
      setCourses(mockCourses)
      setIsLoading(false)
    }, 500)
    return () => clearTimeout(timer)
  }, [])

  const filteredCourses = courses.filter(course => {
    const matchesSearch = searchQuery === '' || 
      course.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.description?.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesLanguage = selectedLanguage === 'all' || course.language.code === selectedLanguage
    return matchesSearch && matchesLanguage
  })

  // 获取所有语言
  const languages = Array.from(new Map(courses.map(c => [c.language.code, c.language])).values())

  const handleDelete = (course: Course) => {
    toast.error(`${t('common.delete')}: ${course.name}`, {
      description: t('messages.comingSoon'),
    })
  }

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{t('course.title')}</h1>
          <p className="text-muted-foreground">{t('learning.coursesTitle')}</p>
        </div>
        <Link to="/learning/courses">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            {t('course.create')}
          </Button>
        </Link>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 bg-blue-500 rounded-lg text-white">
              <BookOpen className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">{t('course.totalLessons')}</p>
              <p className="text-2xl font-bold">{courses.length}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 bg-green-500 rounded-lg text-white">
              <Globe className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">{t('common.language')}</p>
              <p className="text-2xl font-bold">{languages.length}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 bg-purple-500 rounded-lg text-white">
              <Layers className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">{t('course.textbook')}</p>
              <p className="text-2xl font-bold">
                {courses.filter(c => c.course_type === 'textbook').length}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 bg-orange-500 rounded-lg text-white">
              <GraduationCap className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">{t('course.examPrep')}</p>
              <p className="text-2xl font-bold">
                {courses.filter(c => c.course_type === 'exam_prep').length}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 筛选和搜索 */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={t('learning.searchPlaceholder')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2">
          <Button
            variant={selectedLanguage === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedLanguage('all')}
          >
            {t('learning.allTypes')}
          </Button>
          {languages.map(lang => (
            <Button
              key={lang.code}
              variant={selectedLanguage === lang.code ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedLanguage(lang.code)}
            >
              {lang.name}
            </Button>
          ))}
        </div>
      </div>

      {/* 课程列表 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {isLoading ? (
          // 加载状态
          Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6 space-y-4">
                <div className="h-6 bg-muted rounded w-3/4" />
                <div className="h-4 bg-muted rounded w-1/2" />
                <div className="h-16 bg-muted rounded" />
              </CardContent>
            </Card>
          ))
        ) : filteredCourses.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">{t('common.noData')}</p>
            <Link to="/learning/courses">
              <Button variant="outline" className="mt-4">
                <Plus className="mr-2 h-4 w-4" />
                {t('course.create')}
              </Button>
            </Link>
          </div>
        ) : (
          filteredCourses.map(course => (
            <Card key={course.id} className="group hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${courseTypeColors[course.course_type]} text-white`}>
                      <BookOpen className="h-4 w-4" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{course.name}</CardTitle>
                      <p className="text-sm text-muted-foreground">{course.language.name}</p>
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem asChild>
                        <Link to="/learning/courses/$id" params={{ id: course.id }}>
                          <Edit className="mr-2 h-4 w-4" />
                          {t('common.edit')}
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        className="text-destructive"
                        onClick={() => handleDelete(course)}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        {t('common.delete')}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                  {course.description || t('common.noData')}
                </p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">
                      {courseTypeLabels[course.course_type]}
                    </Badge>
                    {(course.level_from || course.level_to) && (
                      <Badge variant="outline">
                        {course.level_from === course.level_to 
                          ? course.level_from 
                          : `${course.level_from} - ${course.level_to}`}
                      </Badge>
                    )}
                  </div>
                  <Link to="/learning/courses/$id" params={{ id: course.id }}>
                    <Button variant="ghost" size="sm">
                      {t('learning.viewDetails')}
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
