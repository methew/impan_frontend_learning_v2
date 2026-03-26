import { createFileRoute, Link } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import { 
  FlaskConical, 
  Plus, 
  Search, 
  MoreHorizontal,
  Edit,
  Trash2,
  BookOpen,
  ChevronRight,
  ChevronDown,
  Folder,
  FolderOpen,
  FileText
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
import { cn } from '@/lib/utils'

export const Route = createFileRoute('/learning/subjects/')({
  component: SubjectsPage,
})

// 学科类型
interface SubjectType {
  id: string
  name: string
  code: string
  icon: string
  color: string
  description?: string
}

// 学科
interface Subject {
  id: string
  name: string
  code: string
  subject_type: SubjectType
  description?: string
  grade_level?: string
  difficulty_level: number
  is_active: boolean
  created_at: string
}

// 章节
interface SubjectSection {
  id: string
  name: string
  code: string
  parent?: string
  children?: SubjectSection[]
  content_count: number
  is_active: boolean
}

// 模拟数据
const mockSubjectTypes: SubjectType[] = [
  { id: '1', name: '自然科学', code: 'science', icon: 'flask', color: 'bg-blue-500', description: '物理、化学、生物等' },
  { id: '2', name: '数学', code: 'math', icon: 'calculator', color: 'bg-purple-500', description: '代数、几何、微积分等' },
  { id: '3', name: '人文社科', code: 'humanities', icon: 'book', color: 'bg-orange-500', description: '历史、地理、政治等' },
  { id: '4', name: '语言文学', code: 'language', icon: 'languages', color: 'bg-green-500', description: '文学、语言学等' },
]

const mockSubjects: Subject[] = [
  {
    id: '1',
    name: '高中物理',
    code: 'physics-hs',
    subject_type: mockSubjectTypes[0],
    description: '高中物理课程，包含力学、电磁学、光学等',
    grade_level: '高中',
    difficulty_level: 4,
    is_active: true,
    created_at: '2024-01-15',
  },
  {
    id: '2',
    name: '初中数学',
    code: 'math-jh',
    subject_type: mockSubjectTypes[1],
    description: '初中数学课程',
    grade_level: '初中',
    difficulty_level: 3,
    is_active: true,
    created_at: '2024-01-20',
  },
  {
    id: '3',
    name: '世界历史',
    code: 'history-world',
    subject_type: mockSubjectTypes[2],
    description: '世界历史概览',
    grade_level: '高中',
    difficulty_level: 3,
    is_active: true,
    created_at: '2024-02-01',
  },
]

const mockSections: SubjectSection[] = [
  {
    id: '1',
    name: '第一章：运动的描述',
    code: 'ch1',
    content_count: 5,
    is_active: true,
    children: [
      { id: '1-1', name: '1.1 质点 参考系', code: '1.1', parent: '1', content_count: 3, is_active: true },
      { id: '1-2', name: '1.2 时间和位移', code: '1.2', parent: '1', content_count: 4, is_active: true },
      { id: '1-3', name: '1.3 运动快慢的描述', code: '1.3', parent: '1', content_count: 3, is_active: true },
    ]
  },
  {
    id: '2',
    name: '第二章：匀变速直线运动',
    code: 'ch2',
    content_count: 8,
    is_active: true,
    children: [
      { id: '2-1', name: '2.1 实验：探究小车速度随时间变化的规律', code: '2.1', parent: '2', content_count: 2, is_active: true },
      { id: '2-2', name: '2.2 匀变速直线运动的速度与时间的关系', code: '2.2', parent: '2', content_count: 4, is_active: true },
    ]
  },
]

const gradeLevelLabels: Record<string, string> = {
  'elementary': '小学',
  'middle': '初中',
  'high': '高中',
  'university': '大学',
}

function SubjectsPage() {
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [subjectTypes, setSubjectTypes] = useState<SubjectType[]>([])
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null)
  const [sections, setSections] = useState<SubjectSection[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set())

  useEffect(() => {
    // 模拟 API 调用
    const timer = setTimeout(() => {
      setSubjects(mockSubjects)
      setSubjectTypes(mockSubjectTypes)
      setSections(mockSections)
      if (mockSubjects.length > 0) {
        setSelectedSubject(mockSubjects[0])
      }
      setIsLoading(false)
    }, 500)
    return () => clearTimeout(timer)
  }, [])

  const filteredSubjects = subjects.filter(subject => 
    searchQuery === '' || 
    subject.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    subject.description?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const toggleSection = (sectionId: string) => {
    setExpandedSections(prev => {
      const next = new Set(prev)
      if (next.has(sectionId)) {
        next.delete(sectionId)
      } else {
        next.add(sectionId)
      }
      return next
    })
  }

  const renderSection = (section: SubjectSection, level: number = 0) => {
    const isExpanded = expandedSections.has(section.id)
    const hasChildren = section.children && section.children.length > 0

    return (
      <div key={section.id}>
        <div 
          className={cn(
            "flex items-center gap-2 p-2 rounded-lg hover:bg-accent cursor-pointer",
            level > 0 && "ml-4"
          )}
          style={{ paddingLeft: `${level * 16 + 8}px` }}
        >
          {hasChildren ? (
            <button
              onClick={(e) => {
                e.stopPropagation()
                toggleSection(section.id)
              }}
              className="p-1 rounded hover:bg-accent-foreground/10"
            >
              {isExpanded ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </button>
          ) : (
            <span className="w-6" />
          )}
          
          {hasChildren ? (
            isExpanded ? (
              <FolderOpen className="h-4 w-4 text-blue-500" />
            ) : (
              <Folder className="h-4 w-4 text-blue-500" />
            )
          ) : (
            <FileText className="h-4 w-4 text-muted-foreground" />
          )}
          
          <span className="flex-1 text-sm">{section.name}</span>
          
          <Badge variant="secondary" className="text-xs">
            {section.content_count} 内容
          </Badge>
        </div>
        
        {hasChildren && isExpanded && (
          <div>
            {section.children!.map(child => renderSection(child, level + 1))}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="h-[calc(100vh-140px)] flex gap-6">
      {/* 左侧：学科列表 */}
      <div className="w-80 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold">学科管理</h1>
            <p className="text-sm text-muted-foreground">管理学科和章节</p>
          </div>
          <Link to="/learning/subjects">
            <Button size="icon" variant="outline">
              <Plus className="h-4 w-4" />
            </Button>
          </Link>
        </div>

        {/* 搜索 */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="搜索学科..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* 学科类型筛选 */}
        <div className="flex flex-wrap gap-1">
          <Badge variant="default" className="cursor-pointer">全部</Badge>
          {subjectTypes.map(type => (
            <Badge 
              key={type.id} 
              variant="outline" 
              className="cursor-pointer hover:bg-accent"
            >
              {type.name}
            </Badge>
          ))}
        </div>

        {/* 学科列表 */}
        <Card className="flex-1 overflow-auto">
          <CardContent className="p-2">
            {isLoading ? (
              <div className="space-y-2">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="h-16 bg-muted rounded animate-pulse" />
                ))}
              </div>
            ) : filteredSubjects.length === 0 ? (
              <div className="text-center py-8">
                <BookOpen className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground">暂无学科</p>
              </div>
            ) : (
              <div className="space-y-1">
                {filteredSubjects.map(subject => (
                  <div
                    key={subject.id}
                    className={cn(
                      "p-3 rounded-lg cursor-pointer transition-colors",
                      selectedSubject?.id === subject.id 
                        ? "bg-primary text-primary-foreground" 
                        : "hover:bg-accent"
                    )}
                    onClick={() => setSelectedSubject(subject)}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`p-2 rounded ${subject.subject_type.color} text-white shrink-0`}>
                        <FlaskConical className="h-4 w-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{subject.name}</p>
                        <p className="text-xs opacity-80 truncate">
                          {subject.grade_level && `${gradeLevelLabels[subject.grade_level] || subject.grade_level} · `}
                          {subject.subject_type.name}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* 右侧：章节详情 */}
      <div className="flex-1">
        {selectedSubject ? (
          <Card className="h-full">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-lg ${selectedSubject.subject_type.color} text-white`}>
                    <FlaskConical className="h-6 w-6" />
                  </div>
                  <div>
                    <CardTitle>{selectedSubject.name}</CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">
                      {selectedSubject.subject_type.name} · {selectedSubject.code}
                    </p>
                  </div>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem asChild>
                      <a href={`/learning/subjects/${selectedSubject.id}/edit`}>
                        <Edit className="mr-2 h-4 w-4" />
                        编辑
                      </a>
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      className="text-destructive"
                      onClick={() => toast.error('删除功能需要后端 API')}
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      删除
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* 描述 */}
              {selectedSubject.description && (
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-2">描述</h3>
                  <p>{selectedSubject.description}</p>
                </div>
              )}

              {/* 基本信息 */}
              <div className="grid grid-cols-3 gap-4">
                <div className="p-3 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground">年级</p>
                  <p className="font-medium">
                    {gradeLevelLabels[selectedSubject.grade_level || ''] || selectedSubject.grade_level || '未设置'}
                  </p>
                </div>
                <div className="p-3 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground">难度</p>
                  <p className="font-medium">{'★'.repeat(selectedSubject.difficulty_level)}</p>
                </div>
                <div className="p-3 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground">状态</p>
                  <p className="font-medium">{selectedSubject.is_active ? '启用' : '禁用'}</p>
                </div>
              </div>

              {/* 章节树 */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-medium text-muted-foreground">章节结构</h3>
                  <Button variant="outline" size="sm">
                    <Plus className="mr-2 h-3 w-3" />
                    添加章节
                  </Button>
                </div>
                <Card className="bg-muted/50">
                  <CardContent className="p-2">
                    {sections.length === 0 ? (
                      <p className="text-center py-8 text-muted-foreground text-sm">
                        暂无章节，点击上方按钮添加
                      </p>
                    ) : (
                      <div className="space-y-1">
                        {sections.map(section => renderSection(section))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="h-full flex items-center justify-center">
            <div className="text-center">
              <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">选择一个学科查看详情</p>
            </div>
          </Card>
        )}
      </div>
    </div>
  )
}
