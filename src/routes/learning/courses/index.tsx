import { createFileRoute } from '@tanstack/react-router'
import { useState, useEffect, useCallback, useRef } from 'react'
import { 
  Library, 
  Search,
  Plus,
  MoreHorizontal,
  Edit,
  Trash2,
  Loader2,
  GraduationCap,
  BookOpen,
  Target,
  Palette,
  Settings,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { toast } from 'sonner'
import * as api from '@/api/learning'
import type { Course } from '@/api/learning'
import { cn } from '@/lib/utils'

export const Route = createFileRoute('/learning/courses/')({
  component: CourseManagementPage,
})

const PAGE_SIZE = 20

const COURSE_TYPES = [
  { value: 'textbook', label: '教材', icon: BookOpen },
  { value: 'exam_prep', label: '考试备考', icon: GraduationCap },
  { value: 'skill', label: '技能训练', icon: Target },
  { value: 'theme', label: '主题课程', icon: Palette },
  { value: 'custom', label: '自定义', icon: Settings },
]

const COURSE_TYPE_COLORS: Record<string, string> = {
  textbook: 'bg-blue-500',
  exam_prep: 'bg-orange-500',
  skill: 'bg-green-500',
  theme: 'bg-purple-500',
  custom: 'bg-gray-500',
}

// 课程表单组件
function CourseFormDialog({
  open,
  onOpenChange,
  course,
  onSubmit,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  course?: Course | null
  onSubmit: (data: Partial<Course>) => Promise<void>
}) {
  const isEditing = !!course
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState<{
    name: string
    language_code: string
    course_type: Course['course_type']
    description: string
    level_from: string
    level_to: string
    is_public: boolean
  }>({
    name: '',
    language_code: 'ja',
    course_type: 'textbook',
    description: '',
    level_from: '',
    level_to: '',
    is_public: true,
  })

  useEffect(() => {
    if (course) {
      setFormData({
        name: course.name,
        language_code: course.language?.code || 'ja',
        course_type: course.course_type,
        description: course.description || '',
        level_from: course.level_from || '',
        level_to: course.level_to || '',
        is_public: course.is_public,
      })
    } else {
      setFormData({
        name: '',
        language_code: 'ja',
        course_type: 'textbook',
        description: '',
        level_from: '',
        level_to: '',
        is_public: true,
      })
    }
  }, [course, open])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name.trim()) return

    setIsSubmitting(true)
    try {
      await onSubmit(formData)
      onOpenChange(false)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{isEditing ? '编辑课程' : '创建课程'}</DialogTitle>
          <DialogDescription>
            {isEditing ? '修改课程信息' : '添加一个新的学习课程'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="name">课程名称 *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="如：N5 基础课程"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>课程类型</Label>
              <Select
                value={formData.course_type}
                onValueChange={(v) => setFormData(prev => ({ ...prev, course_type: v as Course['course_type'] }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {COURSE_TYPES.map(type => (
                    <SelectItem key={type.value} value={type.value}>
                      <div className="flex items-center gap-2">
                        <type.icon className="h-4 w-4" />
                        {type.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>语言</Label>
              <Select
                value={formData.language_code}
                onValueChange={(v) => setFormData(prev => ({ ...prev, language_code: v }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ja">日语</SelectItem>
                  <SelectItem value="zh">中文</SelectItem>
                  <SelectItem value="en">英语</SelectItem>
                  <SelectItem value="ko">韩语</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>起始级别</Label>
              <Input
                value={formData.level_from}
                onChange={(e) => setFormData(prev => ({ ...prev, level_from: e.target.value }))}
                placeholder="如：N5"
              />
            </div>

            <div className="space-y-2">
              <Label>目标级别</Label>
              <Input
                value={formData.level_to}
                onChange={(e) => setFormData(prev => ({ ...prev, level_to: e.target.value }))}
                placeholder="如：N1"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>课程描述</Label>
            <Textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="课程简介..."
              rows={3}
            />
          </div>

          <div className="flex items-center justify-between rounded-lg border p-3">
            <div className="space-y-0.5">
              <Label>公开课程</Label>
              <p className="text-xs text-muted-foreground">其他用户可以看到此课程</p>
            </div>
            <Switch
              checked={formData.is_public}
              onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_public: checked }))}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
              取消
            </Button>
            <Button type="submit" disabled={isSubmitting || !formData.name.trim()}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isEditing ? '保存修改' : '创建课程'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

// 删除确认对话框
function DeleteConfirmDialog({
  open,
  onOpenChange,
  course,
  onConfirm,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  course: Course | null
  onConfirm: () => Promise<void>
}) {
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      await onConfirm()
      onOpenChange(false)
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-destructive">
            <Trash2 className="h-5 w-5" />
            确认删除
          </DialogTitle>
          <DialogDescription>
            您确定要删除课程 <strong>"{course?.name}"</strong> 吗？
            <br />
            此操作不可撤销。
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="pt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isDeleting}>
            取消
          </Button>
          <Button variant="destructive" onClick={handleDelete} disabled={isDeleting}>
            {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            删除
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function CourseManagementPage() {
  const [courses, setCourses] = useState<Course[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [hasMore, setHasMore] = useState(true)
  const [totalCount, setTotalCount] = useState(0)
  
  // 对话框状态
  const [formOpen, setFormOpen] = useState(false)
  const [editingCourse, setEditingCourse] = useState<Course | null>(null)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [deletingCourse, setDeletingCourse] = useState<Course | null>(null)
  
  const observerRef = useRef<IntersectionObserver | null>(null)
  const loadMoreRef = useRef<HTMLDivElement>(null)
  const setPage = useState(1)[1]

  // 加载数据
  const loadCourses = useCallback(async (pageNum: number, isReset: boolean = false) => {
    if (isReset) {
      setIsLoading(true)
    } else {
      setIsLoadingMore(true)
    }
    
    try {
      const offset = (pageNum - 1) * PAGE_SIZE
      const data = await api.getCourses({ 
        ordering: '-created_at',
        limit: PAGE_SIZE,
        offset,
      })
      
      if (isReset) {
        setCourses(data)
      } else {
        setCourses(prev => [...prev, ...data])
      }
      
      setHasMore(data.length === PAGE_SIZE)
      setTotalCount(prev => isReset ? data.length : prev + data.length)
    } catch (error: any) {
      if (error.response?.status === 401) {
        toast.error('请先登录')
      } else {
        toast.error('加载课程失败', { description: error.message })
      }
    } finally {
      setIsLoading(false)
      setIsLoadingMore(false)
    }
  }, [])

  // 初始加载
  useEffect(() => {
    loadCourses(1, true)
  }, [loadCourses])

  // 无限滚动
  useEffect(() => {
    const element = loadMoreRef.current
    if (!element || isLoading) return

    observerRef.current = new IntersectionObserver(
      (entries) => {
        const [target] = entries
        if (target.isIntersecting && hasMore && !isLoadingMore) {
          setPage(prev => {
            const nextPage = prev + 1
            loadCourses(nextPage, false)
            return nextPage
          })
        }
      },
      { root: null, rootMargin: '100px', threshold: 0 }
    )

    observerRef.current.observe(element)

    return () => {
      observerRef.current?.disconnect()
    }
  }, [hasMore, isLoading, isLoadingMore, loadCourses, setPage])

  // 搜索过滤
  const filteredCourses = courses.filter(course => 
    searchQuery === '' || 
    course.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    course.description?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  // 新建
  const handleCreate = () => {
    setEditingCourse(null)
    setFormOpen(true)
  }

  // 编辑
  const handleEdit = (course: Course) => {
    setEditingCourse(course)
    setFormOpen(true)
  }

  // 删除
  const handleDelete = (course: Course) => {
    setDeletingCourse(course)
    setDeleteOpen(true)
  }

  // 提交表单
  const handleSubmit = async (formData: Partial<Course>) => {
    try {
      if (editingCourse) {
        const updated = await api.updateCourse(editingCourse.id, formData)
        toast.success('课程已更新')
        setCourses(prev => prev.map(c => c.id === editingCourse.id ? updated : c))
      } else {
        const newCourse = await api.createCourse(formData)
        toast.success('课程已创建')
        setCourses(prev => [newCourse, ...prev])
        setTotalCount(prev => prev + 1)
      }
    } catch (error: any) {
      toast.error(editingCourse ? '更新失败' : '创建失败', { 
        description: error.response?.data?.detail || error.message 
      })
      throw error
    }
  }

  // 确认删除
  const handleConfirmDelete = async () => {
    if (!deletingCourse) return
    
    try {
      await api.deleteCourse(deletingCourse.id)
      toast.success('课程已删除')
      setCourses(prev => prev.filter(c => c.id !== deletingCourse.id))
      setTotalCount(prev => prev - 1)
    } catch (error: any) {
      toast.error('删除失败', { 
        description: error.response?.data?.detail || error.message 
      })
      throw error
    }
  }

  return (
    <div className="h-full flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-blue-500 text-white">
            <Library className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold">课程管理</h1>
            <p className="text-xs text-muted-foreground">
              共 {totalCount}+ 个课程
              {hasMore && '（滚动加载更多）'}
            </p>
          </div>
        </div>
        <Button onClick={handleCreate}>
          <Plus className="mr-2 h-4 w-4" />
          创建课程
        </Button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="搜索课程..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Course List */}
      <Card className="flex-1 overflow-hidden flex flex-col">
        <CardHeader className="shrink-0 py-3">
          <CardTitle className="text-sm font-medium text-muted-foreground flex items-center justify-between">
            <span>课程列表</span>
            <span className="text-xs">
              显示 {filteredCourses.length} / {courses.length} 个课程
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="flex-1 overflow-y-auto p-0">
          {isLoading ? (
            <div className="p-4 space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-24" />
              ))}
            </div>
          ) : filteredCourses.length > 0 ? (
            <div className="divide-y">
              {filteredCourses.map(course => {
                const typeConfig = COURSE_TYPES.find(t => t.value === course.course_type)
                const TypeIcon = typeConfig?.icon || BookOpen
                
                return (
                  <div 
                    key={course.id} 
                    className="flex items-start gap-4 p-4 hover:bg-accent/50 transition-colors"
                  >
                    {/* Type Icon */}
                    <div className={cn(
                      "p-2 rounded-lg shrink-0",
                      COURSE_TYPE_COLORS[course.course_type] || 'bg-gray-500',
                      "text-white"
                    )}>
                      <TypeIcon className="h-5 w-5" />
                    </div>
                    
                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-medium truncate">{course.name}</h3>
                        {course.language?.flag_emoji && (
                          <span>{course.language.flag_emoji}</span>
                        )}
                        {!course.is_public && (
                          <Badge variant="secondary" className="text-xs">私有</Badge>
                        )}
                      </div>
                      
                      <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                        {course.description || '暂无描述'}
                      </p>
                      
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <span className="px-2 py-0.5 bg-muted rounded">
                          {typeConfig?.label || course.course_type}
                        </span>
                        {(course.level_from || course.level_to) && (
                          <span>
                            {course.level_from && `${course.level_from}`}
                            {course.level_from && course.level_to && ' → '}
                            {course.level_to && `${course.level_to}`}
                          </span>
                        )}
                        <span>创建于 {new Date(course.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                    
                    {/* Actions */}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleEdit(course)}>
                          <Edit className="mr-2 h-4 w-4" />
                          编辑
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive" onClick={() => handleDelete(course)}>
                          <Trash2 className="mr-2 h-4 w-4" />
                          删除
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                )
              })}
              
              {/* Load more sentinel */}
              <div ref={loadMoreRef} className="h-4" />
              
              {/* Loading indicator */}
              {isLoadingMore && (
                <div className="py-4 flex justify-center">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              )}
              
              {/* End message */}
              {!hasMore && !searchQuery && (
                <p className="text-center text-sm text-muted-foreground py-4">
                  已加载全部 {courses.length} 个课程
                </p>
              )}
            </div>
          ) : (
            <div className="h-full flex items-center justify-center">
              <p className="text-muted-foreground">
                {searchQuery ? '未找到匹配的课程' : '暂无课程数据'}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Form Dialog */}
      <CourseFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        course={editingCourse}
        onSubmit={handleSubmit}
      />

      {/* Delete Confirm Dialog */}
      <DeleteConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        course={deletingCourse}
        onConfirm={handleConfirmDelete}
      />
    </div>
  )
}
