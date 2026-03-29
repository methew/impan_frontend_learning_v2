import { useState, useEffect, useCallback, useRef } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { Search, Plus, Loader2, BookOpen, Trash2, Network, Upload, User, Database, ListTree } from 'lucide-react'
import { toast } from 'sonner'
import * as api from '@/api/learning'
import type { VocabNode } from '@/types'
import { getUserInfo } from '@/lib/auth'
import { VocabStructuredEditor } from '@/components/vocab/VocabStructuredEditor'
import { DeleteConfirmDialog } from '@/components/vocab/DeleteConfirmDialog'
import { VocabImportDialog } from '@/components/vocab/VocabImportDialog'
import { VocabWorkflowyEditor } from '@/components/vocab/VocabWorkflowyEditor'

export const Route = createFileRoute('/learning/vocab/')({
  component: VocabPage,
})

const PAGE_SIZE = 50

// 根节点列表项组件
function RootNodeItem({ 
  node, 
  childCount,
  onEdit, 
  onDelete,
  editorType = 'structured'
}: { 
  node: VocabNode
  childCount: number
  onEdit: (node: VocabNode) => void
  onDelete: (node: VocabNode) => void
  editorType?: 'structured' | 'workflowy'
}) {
  return (
    <div className="flex items-center justify-between p-3 hover:bg-accent/50 transition-colors border-b last:border-b-0">
      <div className="flex items-center gap-3 min-w-0">
        <div className="p-2 rounded bg-emerald-100 text-emerald-700">
          <BookOpen className="h-4 w-4" />
        </div>
        <div className="min-w-0">
          <p className="font-medium truncate">{node.content || '(未命名)'}</p>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span>类型: {node.node_type}</span>
            <span>·</span>
            <span>排序: {node.sort_order ?? 0}</span>
            {childCount > 0 && (
              <>
                <span>·</span>
                <span className="text-emerald-600">{childCount} 个子节点</span>
              </>
            )}
            {node.difficulty_level && (
              <>
                <span>·</span>
                <span>难度: N{node.difficulty_level}</span>
              </>
            )}
            {node.created_by ? (
              <>
                <span>·</span>
                <span className="text-blue-600">@{node.created_by_username || node.created_by}</span>
              </>
            ) : (
              <>
                <span>·</span>
                <span className="text-gray-400">系统</span>
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
          {editorType === 'workflowy' ? (
            <>
              <ListTree className="h-4 w-4 mr-1" />
              大纲编辑
            </>
          ) : (
            <>
              <Network className="h-4 w-4 mr-1" />
              编辑树
            </>
          )}
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

function VocabPage() {
  const [allNodes, setAllNodes] = useState<VocabNode[]>([])
  const [rootNodes, setRootNodes] = useState<VocabNode[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [createdByFilter, setCreatedByFilter] = useState<'all' | 'me' | 'system' | 'null'>('all')
  const [, setTotalCount] = useState(0)
  
  // 对话框状态
  const [editorOpen, setEditorOpen] = useState(false)
  const [editingRootNode, setEditingRootNode] = useState<VocabNode | null>(null)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [deletingNode, setDeletingNode] = useState<VocabNode | null>(null)
  const [importOpen, setImportOpen] = useState(false)
  const [workflowyOpen, setWorkflowyOpen] = useState(false)
  const [editorType, setEditorType] = useState<'structured' | 'workflowy'>('structured')
  
  const observerRef = useRef<IntersectionObserver | null>(null)
  const loadMoreRef = useRef<HTMLDivElement>(null)
  const setPage = useState(1)[1]

  // 加载数据
  const loadNodes = useCallback(async (pageNum: number, isReset: boolean = false) => {
    if (isReset) {
      setIsLoading(true)
    } else {
      setIsLoadingMore(true)
    }
    
    try {
      // 构建筛选参数 - 只加载根节点（parent 为 null）
      const params: api.VocabNodeParams = {
        ordering: 'sort_order',
        limit: PAGE_SIZE,
        offset: (pageNum - 1) * PAGE_SIZE,
        parent: 'null',  // 只获取根节点
      }
      
      // 根据创建者筛选
      if (createdByFilter === 'me') {
        const user = getUserInfo()
        if (user) {
          params.created_by = user.id
        }
      } else if (createdByFilter === 'system') {
        params.system_data = true
      } else if (createdByFilter === 'null') {
        params.created_by = 'null'
      }
      
      const data = await api.getVocabNodesPaginated(params)
      
      // 处理分页结果
      const results = data.results || []
      const count = data.count || 0
      
      setTotalCount(count)
      
      if (isReset) {
        setAllNodes(results)
        setHasMore(results.length < count)
      } else {
        setAllNodes(prev => {
          const existingIds = new Set(prev.map(n => n.id))
          const newNodes = results.filter((n: VocabNode) => !existingIds.has(n.id))
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
  }, [createdByFilter])

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

  // 提取根节点（parent 为 null、undefined、空字符串或 0 都是根节点）
  useEffect(() => {
    const roots = allNodes.filter(n => {
      // parent 可能是 null, undefined, '', 0, number, string
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
    node.content?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    node.normalized_content?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  // 新建词汇
  const handleCreate = () => {
    setEditingRootNode(null)
    setEditorOpen(true)
  }
  
  // 编辑整棵树
  const handleEditTree = (node: VocabNode) => {
    setEditingRootNode(node)
    if (editorType === 'workflowy') {
      setWorkflowyOpen(true)
    } else {
      setEditorOpen(true)
    }
  }
  
  // 注意：全局 Workflowy 编辑器通过 editorType 切换使用

  // 删除
  const handleDelete = (node: VocabNode) => {
    setDeletingNode(node)
    setDeleteOpen(true)
  }
  
  // 保存词汇树
  const handleSaveTree = async () => {
    // 刷新数据
    await loadNodes(1, true)
  }

  // 确认删除
  const handleConfirmDelete = async () => {
    if (!deletingNode) return
    
    try {
      // 删除该节点及其所有后代
      const deleteRecursive = async (nodeId: string | number) => {
        const children = allNodes.filter(n => n.parent == nodeId)
        for (const child of children) {
          await deleteRecursive(child.id)
        }
        await api.deleteVocabNode(nodeId)
      }
      
      await deleteRecursive(deletingNode.id)
      toast.success('词汇树已删除')
      
      // 从列表中移除
      setAllNodes(prev => prev.filter(n => {
        // 保留既不是该节点也不是其后代的节点
        let curr: VocabNode | undefined = n
        while (curr) {
          if (curr.id === deletingNode.id) return false
          curr = allNodes.find(p => p.id == curr?.parent)
        }
        return true
      }))
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
          <div className="p-2 rounded-lg bg-emerald-500 text-white">
            <BookOpen className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold">词汇管理</h1>
            <p className="text-xs text-muted-foreground">
              共 {rootNodes.length}+ 个根节点，{allNodes.length}+ 总节点
              {hasMore && '（滚动加载更多）'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {/* 编辑器类型切换 */}
          <div className="flex items-center border rounded-md p-0.5 bg-muted/50">
            <Button
              variant={editorType === 'structured' ? 'secondary' : 'ghost'}
              size="sm"
              className="h-8 text-xs"
              onClick={() => setEditorType('structured')}
              title="结构化编辑器"
            >
              <Network className="h-3.5 w-3.5 mr-1" />
              结构
            </Button>
            <Button
              variant={editorType === 'workflowy' ? 'secondary' : 'ghost'}
              size="sm"
              className="h-8 text-xs"
              onClick={() => setEditorType('workflowy')}
              title="Workflowy 大纲编辑器"
            >
              <ListTree className="h-3.5 w-3.5 mr-1" />
              大纲
            </Button>
          </div>
          
          <Button variant="outline" onClick={() => setImportOpen(true)}>
            <Upload className="mr-2 h-4 w-4" />
            批量导入
          </Button>
          <Button onClick={handleCreate}>
            <Plus className="mr-2 h-4 w-4" />
            新建词汇
          </Button>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="搜索根节点词汇..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        
        {/* 创建者筛选 */}
        <div className="flex gap-1">
          <Button
            variant={createdByFilter === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setCreatedByFilter('all')}
            className="h-10"
          >
            全部
          </Button>
          <Button
            variant={createdByFilter === 'me' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setCreatedByFilter('me')}
            className="h-10"
            title="我创建的"
          >
            <User className="h-4 w-4 mr-1" />
            我的
          </Button>
          <Button
            variant={createdByFilter === 'system' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setCreatedByFilter('system')}
            className="h-10"
            title="系统数据（无创建者或系统用户创建）"
          >
            <Database className="h-4 w-4 mr-1" />
            系统
          </Button>
          <Button
            variant={createdByFilter === 'null' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setCreatedByFilter('null')}
            className="h-10"
            title="无创建者"
          >
            未分配
          </Button>
        </div>
      </div>

      {/* Root Node List */}
      <Card className="flex-1 overflow-hidden flex flex-col">
        <CardHeader className="shrink-0 py-3">
          <CardTitle className="text-sm font-medium text-muted-foreground flex items-center justify-between">
            <span>根节点列表（点击"编辑树"管理整个词汇树）</span>
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
                  editorType={editorType}
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
                {searchQuery ? '未找到匹配的词汇' : '暂无词汇数据'}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Structured Editor Dialog */}
      <VocabStructuredEditor
        open={editorOpen}
        onOpenChange={setEditorOpen}
        rootNode={editingRootNode}

        onSave={handleSaveTree}
      />

      {/* Delete Confirm Dialog */}
      <DeleteConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        node={deletingNode}
        onConfirm={handleConfirmDelete}
      />

      {/* Import Dialog */}
      <VocabImportDialog
        open={importOpen}
        onOpenChange={setImportOpen}
        onImportComplete={() => {
          loadNodes(1, true)
        }}
      />

      {/* Workflowy Editor Dialog */}
      <VocabWorkflowyEditor
        open={workflowyOpen}
        onOpenChange={setWorkflowyOpen}
        rootNode={editingRootNode}
        allNodes={allNodes}
        onSave={handleSaveTree}
      />
    </div>
  )
}
