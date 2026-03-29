import { useState, useEffect, useCallback } from 'react'
import { 
  Trash2, 
  ChevronDown, 
  ChevronUp,
  Save,
  X,
  BookOpen,
  Volume2,
  Lightbulb,
  Tag,
  AlignLeft,
  Languages,
  RefreshCw,
  Loader2
} from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import * as api from '@/api/learning'

// 节点类型定义 - 根据挂载规则表定义
// TERM → READING, CATEGORY, FORM
// READING → SENSE, EXAMPLE(词条级), FORM
// SENSE → LITERAL, USAGE_RULE, CULTURAL_NOTE, EXPLANATION, EXAMPLE(义项级)
// EXAMPLE → TRANSLATION(多语言), NOTE
// FORM → EXAMPLE(变形用法)
const NODE_TYPE_CONFIG: Record<string, { label: string; icon: any; color: string; description?: string; allowedChildren?: string[] }> = {
  // ========== 核心节点 ==========
  term: { 
    label: '词条', 
    icon: BookOpen, 
    color: 'bg-blue-500',
    description: '词汇根节点',
    allowedChildren: ['reading', 'category', 'form']
  },
  reading: { 
    label: '读音', 
    icon: Volume2, 
    color: 'bg-green-500',
    description: '词条读音（可含音调标记）',
    allowedChildren: ['sense', 'example', 'form']
  },
  sense: { 
    label: '义项', 
    icon: Lightbulb, 
    color: 'bg-amber-500',
    description: '具体含义/用法义项',
    allowedChildren: ['literal', 'usage_rule', 'cultural_note', 'explanation', 'example']
  },
  example: { 
    label: '例句', 
    icon: AlignLeft, 
    color: 'bg-cyan-500',
    description: '用法示例句子',
    allowedChildren: ['translation', 'note']
  },
  form: { 
    label: '变形', 
    icon: RefreshCw, 
    color: 'bg-orange-500',
    description: '词形变化（时态/礼貌体等）',
    allowedChildren: ['example']
  },
  
  // ========== 词条级子节点 ==========
  category: { 
    label: '分类', 
    icon: Tag, 
    color: 'bg-pink-500',
    description: '词汇分类标签',
  },
  
  // ========== 义项级子节点 ==========
  literal: { 
    label: '直译', 
    icon: Languages, 
    color: 'bg-indigo-500',
    description: '字面翻译',
  },
  usage_rule: { 
    label: '用法规则', 
    icon: BookOpen, 
    color: 'bg-violet-500',
    description: '使用场景/限制条件',
  },
  cultural_note: { 
    label: '文化注释', 
    icon: BookOpen, 
    color: 'bg-rose-500',
    description: '文化背景说明',
  },
  explanation: { 
    label: '解释', 
    icon: AlignLeft, 
    color: 'bg-teal-500',
    description: '义项详细解释',
  },
  
  // ========== 例句子节点 ==========
  translation: { 
    label: '翻译', 
    icon: Languages, 
    color: 'bg-indigo-500',
    description: '多语言翻译',
  },
  note: { 
    label: '注释', 
    icon: AlignLeft, 
    color: 'bg-gray-500',
    description: '补充说明',
  },
}

// 树节点数据结构
interface TreeNode {
  id: string
  tempId?: string  // 临时ID用于新节点
  node_type: string
  content: string
  content_json?: any
  order: number
  parent: string | null
  children: TreeNode[]
  isNew?: boolean
  isDeleted?: boolean
}

interface VocabStructuredEditorProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  rootNode?: { id: string | number; content?: string } | null
  onSave: () => void
}


// 将树扁平化为节点列表
function flattenTree(node: TreeNode, result: any[] = []): any[] {
  const { children, tempId, isNew, isDeleted, ...nodeData } = node
  
  if (!isDeleted) {
    result.push({
      ...nodeData,
      tempId,
      isNew,
    })
    
    children.forEach(child => flattenTree(child, result))
  }
  
  return result
}

// 生成临时ID
let tempIdCounter = 0
function generateTempId(): string {
  return `temp-${Date.now()}-${++tempIdCounter}`
}

// 树节点组件
function TreeNodeItem({
  node,
  depth = 0,
  onAddChild,
  onDelete,
  onUpdate,
  onMove,
}: {
  node: TreeNode
  depth?: number
  onAddChild: (parentId: string, type: string) => void
  onDelete: (id: string) => void
  onUpdate: (id: string, data: Partial<TreeNode>) => void
  onMove?: (id: string, direction: 'up' | 'down') => void
}) {
  const [isExpanded, setIsExpanded] = useState(true)
  const config = NODE_TYPE_CONFIG[node.node_type] || { label: node.node_type, icon: BookOpen, color: 'bg-gray-500' }
  const Icon = config.icon
  const hasChildren = node.children.length > 0
  const allowedChildren = config.allowedChildren || []
  
  return (
    <div className={cn("relative", depth > 0 && "ml-6 border-l-2 border-dashed border-border pl-4")}>
      {/* 节点卡片 */}
      <div className="flex items-start gap-2 py-2 group">
        {/* 展开/折叠按钮 */}
        {hasChildren && (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="mt-2 p-1 rounded hover:bg-accent shrink-0"
          >
            {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
          </button>
        )}
        
        {/* 节点内容 */}
        <div className="flex-1 min-w-0">
          <div className={cn(
            "flex items-center gap-2 px-3 py-2 rounded-lg border bg-card",
            "hover:border-primary/50 transition-colors"
          )}>
            {/* 类型标识 */}
            <div className={cn("p-1.5 rounded-md text-white shrink-0", config.color)}>
              <Icon className="h-3.5 w-3.5" />
            </div>
            
            <Badge 
              variant="outline" 
              className="text-xs shrink-0 cursor-help"
              title={config.description || ''}
            >
              {config.label}
            </Badge>
            
            {/* 内容输入 */}
            <Input
              value={node.content}
              onChange={(e) => onUpdate(node.id, { content: e.target.value })}
              className="flex-1 h-8 text-sm min-w-0"
              placeholder={`输入${config.label}...`}
            />
            
            {/* 排序输入 */}
            <Input
              type="number"
              value={node.order}
              onChange={(e) => onUpdate(node.id, { order: parseInt(e.target.value) || 0 })}
              className="w-16 h-8 text-sm"
              placeholder="排序"
            />
            
            {/* 删除按钮 */}
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 shrink-0 text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={() => onDelete(node.id)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
          
          {/* 添加子节点按钮 */}
          {allowedChildren.length > 0 && (
            <div className="flex items-center gap-1 mt-1 ml-8">
              <span className="text-xs text-muted-foreground mr-2">添加:</span>
              {allowedChildren.map(childType => {
                const childConfig = NODE_TYPE_CONFIG[childType]
                if (!childConfig) return null
                const ChildIcon = childConfig.icon
                return (
                  <Button
                    key={childType}
                    variant="ghost"
                    size="sm"
                    className="h-6 px-2 text-xs"
                    onClick={() => onAddChild(node.id, childType)}
                    title={childConfig.description || `添加${childConfig.label}`}
                  >
                    <ChildIcon className="h-3 w-3 mr-1" />
                    {childConfig.label}
                  </Button>
                )
              })}
            </div>
          )}
        </div>
      </div>
      
      {/* 子节点 */}
      {hasChildren && isExpanded && (
        <div className="space-y-1">
          {node.children.map((child) => (
            <TreeNodeItem
              key={child.id}
              node={child}
              depth={depth + 1}
              onAddChild={onAddChild}
              onDelete={onDelete}
              onUpdate={onUpdate}
              onMove={onMove}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export function VocabStructuredEditor({
  open,
  onOpenChange,
  rootNode,
  onSave,
}: VocabStructuredEditorProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [tree, setTree] = useState<TreeNode | null>(null)
  
  // 加载数据
  useEffect(() => {
    if (open) {
      if (rootNode) {
        // 编辑模式：加载根节点及其所有后代
        loadTree(rootNode.id)
      } else {
        // 新建模式：创建一个空的词条根节点
        const newRoot: TreeNode = {
          id: generateTempId(),
          node_type: 'term',
          content: '',
          order: 0,
          parent: null,
          children: [],
          isNew: true,
        }
        setTree(newRoot)
      }
    }
  }, [open, rootNode])
  
  const loadTree = async (rootId: string | number) => {
    setIsLoading(true)
    try {
      // 使用专门的树形 API 获取完整树
      const rootNode = await api.getVocabNodeTree(rootId)
      
      // 转换为 TreeNode 格式
      const convertToTreeNode = (node: any): TreeNode => ({
        id: String(node.id),
        node_type: node.node_type,
        content: node.content || '',
        content_json: node.content_json || {},
        order: node.order || 0,
        parent: node.parent ? String(node.parent) : null,
        children: (node.children || []).map(convertToTreeNode),
        isNew: false,
      })
      
      setTree(convertToTreeNode(rootNode))
    } catch (error: any) {
      toast.error('加载词汇树失败', { description: error.message })
    } finally {
      setIsLoading(false)
    }
  }
  
  // 添加子节点
  const handleAddChild = useCallback((parentId: string, nodeType: string) => {
    setTree(prev => {
      if (!prev) return prev
      
      const newNode: TreeNode = {
        id: generateTempId(),
        node_type: nodeType,
        content: '',
        order: 0,
        parent: parentId,
        children: [],
        isNew: true,
      }
      
      // 递归查找父节点并添加子节点
      const addToParent = (node: TreeNode): TreeNode => {
        if (node.id === parentId) {
          return {
            ...node,
            children: [...node.children, newNode],
          }
        }
        return {
          ...node,
          children: node.children.map(addToParent),
        }
      }
      
      return addToParent(prev)
    })
  }, [])
  
  // 删除节点
  const handleDelete = useCallback((id: string) => {
    setTree(prev => {
      if (!prev) return prev
      
      const removeNode = (node: TreeNode): TreeNode | null => {
        if (node.id === id) {
          return null // 删除当前节点
        }
        return {
          ...node,
          children: node.children.map(removeNode).filter(Boolean) as TreeNode[],
        }
      }
      
      return removeNode(prev)
    })
  }, [])
  
  // 更新节点
  const handleUpdate = useCallback((id: string, data: Partial<TreeNode>) => {
    setTree(prev => {
      if (!prev) return prev
      
      const updateNode = (node: TreeNode): TreeNode => {
        if (node.id === id) {
          return { ...node, ...data }
        }
        return {
          ...node,
          children: node.children.map(updateNode),
        }
      }
      
      return updateNode(prev)
    })
  }, [])
  
  // 保存
  const handleSave = async () => {
    if (!tree) return
    
    setIsSaving(true)
    try {
      const nodes = flattenTree(tree)
      
      // 批量保存节点
      for (const node of nodes) {
        const data = {
          content: node.content,
          node_type: node.node_type,
          content_json: node.content_json || {},
          order: node.order,
          parent: node.parent,
        }
        
        if (node.isNew || String(node.id).startsWith('temp-')) {
          // 新建节点
          await api.createVocabNode(data)
        } else {
          // 更新节点
          await api.updateVocabNode(node.id, data)
        }
      }
      
      toast.success(rootNode ? '词汇树已更新' : '词汇树已创建')
      onSave()
      onOpenChange(false)
    } catch (error: any) {
      toast.error('保存失败', { description: error.message })
    } finally {
      setIsSaving(false)
    }
  }
  
  if (isLoading) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[800px] max-h-[90vh]">
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        </DialogContent>
      </Dialog>
    )
  }
  
  if (!tree) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[800px] max-h-[90vh]">
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <p className="text-muted-foreground mb-4">无法加载词汇数据</p>
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              关闭
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    )
  }
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>
            {rootNode ? `编辑词汇: ${rootNode.content}` : '新建词汇'}
          </DialogTitle>
          <DialogDescription>
            按照词典结构编辑词汇信息：词条 → 读音 → 义项 → 释义/词性/例句
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex-1 overflow-y-auto py-4 pr-2">
          {/* 结构说明 */}
          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-4 p-2 bg-muted rounded">
            <span className="font-medium">结构:</span>
            <span>词条</span>
            <ChevronRight className="h-3 w-3" />
            <span>读音</span>
            <ChevronRight className="h-3 w-3" />
            <span>义项</span>
            <ChevronRight className="h-3 w-3" />
            <span>释义/词性/例句</span>
          </div>
          
          {/* 树形编辑器 */}
          <TreeNodeItem
            node={tree}
            depth={0}
            onAddChild={handleAddChild}
            onDelete={handleDelete}
            onUpdate={handleUpdate}
          />
        </div>
        
        <DialogFooter className="border-t pt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSaving}>
            <X className="mr-2 h-4 w-4" />
            取消
          </Button>
          <Button onClick={handleSave} disabled={isSaving || !tree.content.trim()}>
            {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            <Save className="mr-2 h-4 w-4" />
            {rootNode ? '保存修改' : '创建词汇'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// ChevronRight 图标组件
function ChevronRight({ className }: { className?: string }) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
      className={className}
    >
      <path d="m9 18 6-6-6-6" />
    </svg>
  )
}
