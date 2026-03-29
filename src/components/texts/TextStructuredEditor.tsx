import { useState, useEffect, useCallback } from 'react'
import { 
  Trash2, 
  ChevronDown, 
  ChevronUp,
  Save,
  X,
  BookOpen,
  FileText,
  Lightbulb,
  Tag,
  AlignLeft,
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

// 节点类型定义
const NODE_TYPE_CONFIG: Record<string, { label: string; icon: any; color: string; description?: string; allowedChildren?: string[] }> = {
  term: { 
    label: '课文', 
    icon: BookOpen, 
    color: 'bg-indigo-500',
    description: '课文根节点',
    allowedChildren: ['section', 'sentence', 'vocabulary', 'grammar', 'reading', 'note']
  },
  lesson: { 
    label: '课文', 
    icon: BookOpen, 
    color: 'bg-indigo-500',
    description: '课文根节点(兼容)',
    allowedChildren: ['section', 'sentence', 'vocabulary', 'grammar']
  },
  section: { 
    label: '章节', 
    icon: FileText, 
    color: 'bg-blue-500',
    description: '课文章节',
    allowedChildren: ['sentence', 'explanation', 'note', 'translation']
  },
  reading: { 
    label: '读音', 
    icon: Tag, 
    color: 'bg-orange-500',
    description: '发音/读音',
    allowedChildren: ['sense', 'note']
  },
  sense: { 
    label: '义项', 
    icon: Lightbulb, 
    color: 'bg-teal-500',
    description: '含义/义项',
    allowedChildren: ['gloss', 'example', 'note']
  },
  gloss: { 
    label: '释义', 
    icon: AlignLeft, 
    color: 'bg-slate-500',
    description: '源语言释义',
  },
  sentence: { 
    label: '句子', 
    icon: AlignLeft, 
    color: 'bg-green-500',
    description: '课文句子',
    allowedChildren: ['translation', 'explanation', 'note']
  },
  vocabulary: { 
    label: '词汇', 
    icon: Tag, 
    color: 'bg-emerald-500',
    description: '课文中词汇',
    allowedChildren: ['explanation', 'example']
  },
  grammar: { 
    label: '语法点', 
    icon: Lightbulb, 
    color: 'bg-amber-500',
    description: '课文中语法',
    allowedChildren: ['explanation', 'example']
  },
  explanation: { 
    label: '解释', 
    icon: Lightbulb, 
    color: 'bg-purple-500',
    description: '详细解释',
    allowedChildren: ['example', 'note']
  },
  translation: { 
    label: '翻译', 
    icon: AlignLeft, 
    color: 'bg-pink-500',
    description: '翻译',
  },
  note: { 
    label: '注释', 
    icon: Tag, 
    color: 'bg-gray-500',
    description: '补充说明',
  },
  example: { 
    label: '例句', 
    icon: AlignLeft, 
    color: 'bg-cyan-500',
    description: '例句',
    allowedChildren: ['translation', 'note']
  },
}

interface TreeNode {
  id: string
  node_type: string
  content: string
  content_json?: any
  order: number
  parent: string | null
  children: TreeNode[]
  isNew?: boolean
}

interface TextStructuredEditorProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  rootNode?: { id: string | number; content?: string } | null
  onSave: () => void
}

let tempIdCounter = 0
function generateTempId(): string {
  return `temp-${Date.now()}-${++tempIdCounter}`
}

function convertApiNode(node: any): TreeNode {
  return {
    id: String(node.id),
    node_type: node.node_type,
    content: node.content || '',
    content_json: node.content_json || {},
    order: node.order || 0,
    parent: node.parent ? String(node.parent) : null,
    children: (node.children || []).map(convertApiNode),
    isNew: false,
  }
}

function TreeNodeItem({
  node,
  depth = 0,
  onAddChild,
  onDelete,
  onUpdate,
}: {
  node: TreeNode
  depth?: number
  onAddChild: (parentId: string, type: string) => void
  onDelete: (id: string) => void
  onUpdate: (id: string, data: Partial<TreeNode>) => void
}) {
  const [isExpanded, setIsExpanded] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const config = NODE_TYPE_CONFIG[node.node_type] || { label: node.node_type, icon: BookOpen, color: 'bg-gray-500' }
  const Icon = config.icon
  const hasChildren = node.children.length > 0
  const allowedChildren = config.allowedChildren || []

  return (
    <div className={cn("relative", depth > 0 && "ml-6 border-l-2 border-dashed border-border pl-4")}>
      <div className="flex items-start gap-2 py-2 group">
        {hasChildren && (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="mt-2 p-1 rounded hover:bg-accent shrink-0"
          >
            {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
          </button>
        )}
        
        <div className="flex-1 min-w-0">
          <div className={cn(
            "flex items-center gap-2 px-3 py-2 rounded-lg border bg-card",
            "hover:border-primary/50 transition-colors"
          )}>
            <div className={cn("p-1.5 rounded-md text-white shrink-0", config.color)}>
              <Icon className="h-3.5 w-3.5" />
            </div>
            
            <Badge variant="outline" className="text-xs shrink-0">
              {config.label}
            </Badge>
            
            {isEditing ? (
              <Input
                value={node.content}
                onChange={(e) => onUpdate(node.id, { content: e.target.value })}
                onBlur={() => setIsEditing(false)}
                onKeyDown={(e) => e.key === 'Enter' && setIsEditing(false)}
                className="flex-1 h-8 text-sm"
                autoFocus
              />
            ) : (
              <div 
                onClick={() => setIsEditing(true)}
                className="flex-1 text-sm cursor-text min-h-[20px] py-1"
              >
                {node.content || <span className="text-muted-foreground italic">(空)</span>}
              </div>
            )}
            
            <Input
              type="number"
              value={node.order}
              onChange={(e) => onUpdate(node.id, { order: parseInt(e.target.value) || 0 })}
              className="w-16 h-8 text-sm"
            />
            
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 shrink-0 text-destructive opacity-0 group-hover:opacity-100"
              onClick={() => onDelete(node.id)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
          
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
                    title={childConfig.description}
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
            />
          ))}
        </div>
      )}
    </div>
  )
}

export function TextStructuredEditor({
  open,
  onOpenChange,
  rootNode,
  onSave,
}: TextStructuredEditorProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [tree, setTree] = useState<TreeNode | null>(null)

  useEffect(() => {
    if (open) {
      if (rootNode) {
        loadTree(rootNode.id)
      } else {
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
    console.log('[TextEditor] Loading tree for node:', rootId)
    try {
      const rootData = await api.getTextNodeTree(rootId)
      console.log('[TextEditor] Loaded data:', rootData)
      if (!rootData) {
        toast.error('加载课文树失败', { description: '返回数据为空' })
        return
      }
      setTree(convertApiNode(rootData))
    } catch (error: any) {
      console.error('[TextEditor] Load error:', error)
      toast.error('加载课文树失败', { 
        description: error.response?.data?.detail || error.message || '未知错误'
      })
    } finally {
      setIsLoading(false)
    }
  }

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
      
      const addToParent = (node: TreeNode): TreeNode => {
        if (node.id === parentId) {
          return { ...node, children: [...node.children, newNode] }
        }
        return { ...node, children: node.children.map(addToParent) }
      }
      
      return addToParent(prev)
    })
  }, [])

  const handleDelete = useCallback((id: string) => {
    setTree(prev => {
      if (!prev) return prev
      
      const removeNode = (node: TreeNode): TreeNode | null => {
        if (node.id === id) return null
        return { ...node, children: node.children.map(removeNode).filter(Boolean) as TreeNode[] }
      }
      
      return removeNode(prev)
    })
  }, [])

  const handleUpdate = useCallback((id: string, data: Partial<TreeNode>) => {
    setTree(prev => {
      if (!prev) return prev
      
      const updateNode = (node: TreeNode): TreeNode => {
        if (node.id === id) return { ...node, ...data }
        return { ...node, children: node.children.map(updateNode) }
      }
      
      return updateNode(prev)
    })
  }, [])

  const handleSave = async () => {
    if (!tree) return
    
    setIsSaving(true)
    try {
      if (tree.isNew) {
        await api.createTextNode({
          content: tree.content,
          node_type: tree.node_type as any,
          sort_order: tree.order,
          parent: null,
        })
      } else {
        await api.updateTextNode(tree.id, {
          content: tree.content,
          sort_order: tree.order,
        })
      }
      
      toast.success(rootNode ? '课文已更新' : '课文已创建')
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
          <DialogHeader>
            <DialogTitle>加载中...</DialogTitle>
          </DialogHeader>
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
          <DialogHeader>
            <DialogTitle>错误</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <p className="text-muted-foreground mb-4">无法加载课文数据</p>
            <Button variant="outline" onClick={() => onOpenChange(false)}>关闭</Button>
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
            {rootNode ? `编辑课文: ${rootNode.content}` : '新建课文'}
          </DialogTitle>
          <DialogDescription>
            按照结构编辑课文信息：课文 → 章节 → 句子 → 翻译/注释
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex-1 overflow-y-auto py-4 pr-2">
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
            {rootNode ? '保存修改' : '创建课文'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
