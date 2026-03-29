import { createFileRoute } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import { 
  Tags, 
  Search,
  Plus,
  ChevronDown,
  ChevronUp,
  MoreHorizontal,
  Edit,
  Trash2,
  FolderTree,
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

import { cn } from '@/lib/utils'

export const Route = createFileRoute('/learning/categories/')({
  component: CategoryManagementPage,
})

// 临时类型定义，后续可从后端获取
interface Category {
  id: string
  name: string
  slug: string
  description?: string
  parent?: string | null
  category_type: string
  content_count: number
  is_active: boolean
}

function CategoryManagementPage() {
  const [categories] = useState<Category[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set())

  useEffect(() => {
    // 后续实现从后端获取分类数据
    setIsLoading(false)
  }, [])

  const toggleNode = (nodeId: string) => {
    setExpandedNodes(prev => {
      const next = new Set(prev)
      if (next.has(nodeId)) {
        next.delete(nodeId)
      } else {
        next.add(nodeId)
      }
      return next
    })
  }

  const filteredCategories = categories.filter(cat => 
    searchQuery === '' || 
    cat.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    cat.description?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const rootCategories = filteredCategories.filter(c => !c.parent)
  const getChildCategories = (parentId: string) => filteredCategories.filter(c => c.parent === parentId)

  const renderCategory = (cat: Category, level: number = 0) => {
    const children = getChildCategories(cat.id)
    const hasChildren = children.length > 0
    const isExpanded = expandedNodes.has(cat.id)

    return (
      <div key={cat.id}>
        <div
          className={cn(
            "flex items-center gap-2 p-3 rounded-lg hover:bg-accent transition-colors",
            level > 0 && "ml-4"
          )}
          style={{ paddingLeft: `${level * 16 + 12}px` }}
        >
          {hasChildren ? (
            <button
              onClick={() => toggleNode(cat.id)}
              className="p-1 rounded hover:bg-accent-foreground/10"
            >
              {isExpanded ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronUp className="h-4 w-4" />
              )}
            </button>
          ) : (
            <span className="w-6" />
          )}
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-medium truncate">{cat.name}</span>
              <Badge variant="outline" className="text-xs">{cat.category_type}</Badge>
              {cat.content_count > 0 && (
                <Badge variant="secondary" className="text-xs">{cat.content_count}</Badge>
              )}
            </div>
            <p className="text-sm text-muted-foreground truncate">
              {cat.description || '无描述'}
            </p>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>
                <Edit className="mr-2 h-4 w-4" />
                编辑
              </DropdownMenuItem>
              <DropdownMenuItem className="text-destructive">
                <Trash2 className="mr-2 h-4 w-4" />
                删除
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        
        {hasChildren && isExpanded && (
          <div>
            {children.map(child => renderCategory(child, level + 1))}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-purple-500 text-white">
            <FolderTree className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold">学科管理</h1>
            <p className="text-xs text-muted-foreground">
              共 {categories.length} 个分类
            </p>
          </div>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          新建分类
        </Button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="搜索分类..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Category List */}
      <Card className="flex-1 overflow-hidden flex flex-col">
        <CardHeader className="shrink-0">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            分类列表
          </CardTitle>
        </CardHeader>
        <CardContent className="flex-1 overflow-y-auto p-0">
          {isLoading ? (
            <div className="p-4 space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-16" />
              ))}
            </div>
          ) : categories.length > 0 ? (
            <div className="p-2">
              {rootCategories.map(cat => renderCategory(cat))}
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center gap-4">
              <Tags className="h-12 w-12 text-muted-foreground/50" />
              <div className="text-center">
                <p className="text-muted-foreground">暂无分类数据</p>
                <p className="text-xs text-muted-foreground mt-1">
                  分类功能需要后端支持
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
