import { useState, useEffect, useCallback, useRef } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { Search, Plus, Loader2, Scale, Trash2, Network, Upload } from 'lucide-react'
import { toast } from 'sonner'
import * as api from '@/api/learning'
import type { GramNode } from '@/types'
import { GramStructuredEditor } from '@/components/grammar/GramStructuredEditor'
import { GramImportDialog } from '@/components/grammar/GramImportDialog'

export const Route = createFileRoute('/learning/grammar/')({
  component: GrammarPage,
})

const PAGE_SIZE = 50

// 根节点列表项组件
function RootNodeItem({ 
  node, 
  childCount,
  onEdit, 
  onDelete 
}: { 
  node: GramNode
  childCount: number
  onEdit: (node: GramNode) => void
  onDelete: (node: GramNode) => void
}) {
  return (
    <div className="flex items-center justify-between p-3 hover:bg-accent/50 transition-colors border-b last:border-b-0">
      <div className="flex items-center gap-3 min-w-0">
        <div className="p-2 rounded bg-cyan-100 text-cyan-700">
          <Scale className="h-4 w-4" />
        </div>
        <div className="min-w-0">
          <p className="font-medium truncate">{node.content || node.name || '(未命名)'}</p>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span>类型: {node.node_type}</span>
            <span>·</span>
            <span>排序: {node.sort_order ?? 0}</span>
            {childCount > 0 && (
              <>
                <span>·</span>
                <span className="text-cyan-600">{childCount} 个子节点</span>
              </>
            )}
            {node.level && (
              <>
                <span>·</span>
                <span>难度: {node.level}</span>
              </>
            )}
          </div>
        </div>
      </div>
      <div className="flex items-center gap-1 shrink-0">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => onEdit(node)}
        >
          <Network className="h-4 w-4 mr-1" />
          编辑树
        </Button>
        <Button 
          variant="ghost" 
          size="icon"
          className="text-destructive"
          onClick={() => onDelete(node)}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}

function GrammarPage() {
  const [allNodes, setAllNodes] = useState<GramNode[]>([])
  const [rootNodes, setRootNodes] = useState<GramNode[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [, setTotalCount] = useState(0)
  
  // 对话框状态
  const [editorOpen, setEditorOpen] = useState(false)
  const [editingRootNode, setEditingRootNode] = useState<GramNode | null>(null)
  const [importOpen, setImportOpen] = useState(false)
  
  const observerRef = useRef<IntersectionObserver | null>(null)
  const loadMoreRef = useRef<HTMLDivElement>(null)
  const setPage = useState(1)[1]

  // 加载数据 - 只加载根节点
  const loadNodes = useCallback(async (pageNum: number, isReset: boolean = false) => {
    if (isReset) {
      setIsLoading(true)
    } else {
      setIsLoadingMore(true)
    }
    
    try {
      const data = await api.getGramNodesPaginated({ 
        ordering: 'sort_order',
        limit: PAGE_SIZE,
        offset: (pageNum - 1) * PAGE_SIZE,
        parent: 'null',  // 只获取根节点
      })
      
      const results = data.results || []
      const count = data.count || 0
      
      setTotalCount(count)
      
      if (isReset) {
        setAllNodes(results)
        setHasMore(results.length < count)
      } else {
        setAllNodes(prev => {
          const existingIds = new Set(prev.map(n => n.id))
          const newNodes = results.filter((n: GramNode) => !existingIds.has(n.id))
          const combined = [...prev, ...newNodes]
          setHasMore(combined.length < count)
          return combined
        })
      }
    } catch (error) {
      toast.error('加载数据失败')
      console.error(error)
    } finally {
      setIsLoading(false)
      setIsLoadingMore(false)
    }
  }, [])

  // 初始加载
  useEffect(() => {
    loadNodes(1, true)
  }, [loadNodes])

  // 无限滚动
  useEffect(() => {
    const element = loadMoreRef.current
    if (!element) return

    observerRef.current?.disconnect()
    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !isLoading && !isLoadingMore) {
          setPage(prev => {
            const nextPage = prev + 1
            loadNodes(nextPage, false)
            return nextPage
          })
        }
      },
      { threshold: 0.1 }
    )

    observerRef.current.observe(element)

    return () => {
      observerRef.current?.disconnect()
    }
  }, [hasMore, isLoading, isLoadingMore, loadNodes, setPage])

  // 提取根节点
  useEffect(() => {
    const roots = allNodes.filter(n => {
      return n.parent === null || n.parent === undefined || n.parent === '' || n.parent === 0
    })
    setRootNodes(roots)
  }, [allNodes])

  // 获取子节点数量
  const getChildCount = (nodeId: string | number) => {
    return allNodes.filter(n => n.parent == nodeId).length
  }

  // 搜索过滤（只过滤根节点）
  const filteredRootNodes = rootNodes.filter(node => 
    searchQuery === '' || 
    (node.content || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (node.name || '').toLowerCase().includes(searchQuery.toLowerCase())
  )

  // 新建语法
  const handleCreate = () => {
    setEditingRootNode(null)
    setEditorOpen(true)
  }
  
  // 编辑整棵树
  const handleEditTree = (node: GramNode) => {
    setEditingRootNode(node)
    setEditorOpen(true)
  }

  // 删除
  const handleDelete = async (node: GramNode) => {
    if (!confirm(`确定要删除语法 "${node.content || node.name}" 吗？这将同时删除其所有子节点！`)) {
      return
    }
    
    try {
      // 删除该节点及其所有后代
      const deleteRecursive = async (nodeId: string | number) => {
        const children = allNodes.filter(n => n.parent == nodeId)
        for (const child of children) {
          await deleteRecursive(child.id)
        }
        await api.deleteGramNode(nodeId)
      }
      
      await deleteRecursive(node.id)
      toast.success('语法树已删除')
      
      // 从列表中移除
      setAllNodes(prev => prev.filter(n => {
        let curr: GramNode | undefined = n
        while (curr) {
          if (curr.id === node.id) return false
          curr = allNodes.find(p => p.id == curr?.parent)
        }
        return true
      }))
      setTotalCount(prev => prev - 1)
    } catch (error: any) {
      toast.error('删除失败', { 
        description: error.response?.data?.detail || error.message 
      })
    }
  }
  
  // 保存语法树
  const handleSaveTree = async () => {
    await loadNodes(1, true)
  }

  return (
    <div className="h-full flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-cyan-500 text-white">
            <Scale className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold">语法管理</h1>
            <p className="text-xs text-muted-foreground">
              共 {rootNodes.length}+ 个根节点，{allNodes.length}+ 总节点
              {hasMore && '（滚动加载更多）'}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setImportOpen(true)}>
            <Upload className="mr-2 h-4 w-4" />
            批量导入
          </Button>
          <Button onClick={handleCreate}>
            <Plus className="mr-2 h-4 w-4" />
            新建语法
          </Button>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="搜索根节点语法..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Root Node List */}
      <Card className="flex-1 overflow-hidden flex flex-col">
        <CardHeader className="shrink-0 py-3">
          <CardTitle className="text-sm font-medium text-muted-foreground flex items-center justify-between">
            <span>根节点列表（点击"编辑树"管理整个语法树）</span>
            <span className="text-xs">
              显示 {filteredRootNodes.length} / {rootNodes.length} 个根节点
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="flex-1 overflow-y-auto p-0">
          {isLoading ? (
            <div className="p-4 space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-20" />
              ))}
            </div>
          ) : filteredRootNodes.length > 0 ? (
            <div>
              {filteredRootNodes.map(node => (
                <RootNodeItem 
                  key={node.id} 
                  node={node} 
                  childCount={getChildCount(node.id)}
                  onEdit={handleEditTree}
                  onDelete={handleDelete}
                />
              ))}
              
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
                  已加载全部 {rootNodes.length} 个根节点
                </p>
              )}
            </div>
          ) : (
            <div className="h-full flex items-center justify-center">
              <p className="text-muted-foreground">
                {searchQuery ? '未找到匹配的语法' : '暂无语法数据'}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Structured Editor Dialog */}
      <GramStructuredEditor
        open={editorOpen}
        onOpenChange={setEditorOpen}
        rootNode={editingRootNode}
        onSave={handleSaveTree}
      />

      {/* Import Dialog */}
      <GramImportDialog
        open={importOpen}
        onOpenChange={setImportOpen}
        onImportComplete={() => {
          loadNodes(1, true)
          setImportOpen(false)
        }}
      />
    </div>
  )
}
