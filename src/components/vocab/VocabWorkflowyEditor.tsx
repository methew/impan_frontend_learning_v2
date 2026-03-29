import { useState, useEffect, useCallback } from 'react'
import { X, Save, Loader2 } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import * as api from '@/api/learning'
import type { VocabNode } from '@/types'
import { WorkflowyEditor, type WorkflowyNode } from './WorkflowyEditor'

interface VocabWorkflowyEditorProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  rootNode?: VocabNode | null
  allNodes: VocabNode[]
  onSave: () => void
}

// 将 VocabNode 转换为 WorkflowyNode
function vocabToWorkflowy(node: VocabNode): WorkflowyNode {
  return {
    id: node.id,
    content: node.content || '',
    children: [],
    collapsed: false,
    order: node.sort_order || 0,
    parent: node.parent,
    node_type: node.node_type,
  }
}

// 构建 Workflowy 树
function buildWorkflowyTree(nodes: VocabNode[], rootId?: string | number): WorkflowyNode[] {
  if (rootId) {
    // 找到根节点
    const root = nodes.find(n => n.id === rootId)
    if (!root) return []
    
    // 递归构建树
    const buildChildren = (parentId: string | number): WorkflowyNode[] => {
      const children = nodes
        .filter(n => n.parent == parentId)
        .sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0))
        .map(n => ({
          ...vocabToWorkflowy(n),
          children: buildChildren(n.id),
        }))
      return children
    }
    
    return [{
      ...vocabToWorkflowy(root),
      children: buildChildren(root.id),
    }]
  } else {
    // 显示所有根节点
    const roots = nodes
      .filter(n => !n.parent || n.parent === null || n.parent === '' || n.parent === 0)
      .sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0))
      .map(n => ({
        ...vocabToWorkflowy(n),
        children: buildWorkflowyTree(nodes, n.id).flatMap(r => r.children),
      }))
    return roots
  }
}

// 展平 Workflowy 树为列表
function flattenWorkflowyNodes(nodes: WorkflowyNode[], parentId: string | number | null = null): Array<WorkflowyNode & { parent: string | number | null }> {
  const result: Array<WorkflowyNode & { parent: string | number | null }> = []
  
  for (const node of nodes) {
    result.push({ ...node, parent: parentId })
    if (node.children && node.children.length > 0) {
      result.push(...flattenWorkflowyNodes(node.children, node.id))
    }
  }
  
  return result
}

export function VocabWorkflowyEditor({
  open,
  onOpenChange,
  rootNode,
  allNodes,
  onSave,
}: VocabWorkflowyEditorProps) {
  const [nodes, setNodes] = useState<WorkflowyNode[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [changedNodes, setChangedNodes] = useState<Set<string | number>>(new Set())
  
  // 加载数据
  useEffect(() => {
    if (open) {
      setIsLoading(true)
      try {
        const tree = buildWorkflowyTree(allNodes, rootNode?.id)
        setNodes(tree)
        setChangedNodes(new Set())
      } finally {
        setIsLoading(false)
      }
    }
  }, [open, rootNode, allNodes])
  
  // 处理节点变化
  const handleChange = useCallback((newNodes: WorkflowyNode[]) => {
    setNodes(newNodes)
    // 标记变化的节点
    const flatNodes = flattenWorkflowyNodes(newNodes)
    const changed = new Set<string | number>()
    
    for (const node of flatNodes) {
      const original = allNodes.find(n => n.id === node.id)
      if (!original || original.content !== node.content || original.sort_order !== node.order) {
        changed.add(node.id)
      }
    }
    
    setChangedNodes(changed)
  }, [allNodes])
  
  // 创建节点
  const handleCreateNode = async (parentId: string | number | null, data: Partial<WorkflowyNode>) => {
    const nodeData: Partial<VocabNode> = {
      content: data.content || '',
      node_type: 'example', // 默认类型
      parent: parentId,
      sort_order: data.order || 0,
      is_active: true,
    }
    
    const created = await api.createVocabNode(nodeData)
    return vocabToWorkflowy(created)
  }
  
  // 更新节点
  const handleUpdateNode = async (id: string | number, data: Partial<WorkflowyNode>) => {
    const updateData: Partial<VocabNode> = {}
    if (data.content !== undefined) updateData.content = data.content
    if (data.order !== undefined) updateData.sort_order = data.order
    
    await api.updateVocabNode(String(id), updateData)
  }
  
  // 删除节点
  const handleDeleteNode = async (id: string | number) => {
    await api.deleteVocabNode(id)
  }
  
  // 缩进节点
  const handleIndent = async (id: string | number) => {
    try {
      await api.indentVocabNode(id)
      toast.success('已缩进')
    } catch (error) {
      toast.error('缩进失败')
      throw error
    }
  }
  
  // 提升节点
  const handleOutdent = async (id: string | number) => {
    try {
      await api.outdentVocabNode(id)
      toast.success('已提升')
    } catch (error) {
      toast.error('提升失败')
      throw error
    }
  }
  
  // 保存所有更改
  const handleSave = async () => {
    setIsSaving(true)
    try {
      const flatNodes = flattenWorkflowyNodes(nodes)
      const updates: Array<{ id: string | number; content?: string; order?: number }> = []
      
      for (const node of flatNodes) {
        if (changedNodes.has(node.id)) {
          const update: { id: string | number; content?: string; order?: number } = { id: node.id }
          const original = allNodes.find(n => n.id === node.id)
          if (!original || original.content !== node.content) {
            update.content = node.content
          }
          if (!original || original.sort_order !== node.order) {
            update.order = node.order
          }
          if (update.content !== undefined || update.order !== undefined) {
            updates.push(update)
          }
        }
      }
      
      if (updates.length > 0) {
        await api.bulkUpdateVocabNodes(updates)
        toast.success(`已保存 ${updates.length} 个节点的更改`)
      } else {
        toast.info('没有需要保存的更改')
      }
      
      onSave()
      onOpenChange(false)
    } catch (error) {
      toast.error('保存失败')
    } finally {
      setIsSaving(false)
    }
  }
  
  // 关闭对话框
  const handleClose = () => {
    if (changedNodes.size > 0) {
      if (confirm('有未保存的更改，确定要关闭吗？')) {
        onOpenChange(false)
      }
    } else {
      onOpenChange(false)
    }
  }
  
  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl h-[90vh] flex flex-col p-0">
        <DialogHeader className="px-6 py-4 border-b shrink-0">
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2">
              {isLoading && <Loader2 className="h-5 w-5 animate-spin" />}
              {rootNode ? `编辑: ${rootNode.content || '(未命名)'}` : '词汇大纲编辑器'}
              {changedNodes.size > 0 && (
                <span className="text-sm font-normal text-amber-500">
                  ({changedNodes.size} 个更改)
                </span>
              )}
            </DialogTitle>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={handleClose}>
                <X className="h-4 w-4 mr-1" />
                取消
              </Button>
              <Button size="sm" onClick={handleSave} disabled={isSaving}>
                {isSaving && <Loader2 className="h-4 w-4 mr-1 animate-spin" />}
                <Save className="h-4 w-4 mr-1" />
                保存
              </Button>
            </div>
          </div>
        </DialogHeader>
        
        <div className="flex-1 overflow-hidden">
          {isLoading ? (
            <div className="h-full flex items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <WorkflowyEditor
              nodes={nodes}
              onChange={handleChange}
              onCreateNode={handleCreateNode}
              onUpdateNode={handleUpdateNode}
              onDeleteNode={handleDeleteNode}
              onIndent={handleIndent}
              onOutdent={handleOutdent}
              className="h-full"
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default VocabWorkflowyEditor
