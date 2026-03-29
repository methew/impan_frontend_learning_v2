import { useState, useRef, useCallback, useEffect } from 'react'
import { ChevronRight, ChevronDown, Circle, CheckCircle2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

// 节点数据接口
export interface WorkflowyNode {
  id: string | number
  content: string
  children: WorkflowyNode[]
  collapsed?: boolean
  checked?: boolean
  order: number
  isNew?: boolean
  isDeleted?: boolean
  parent?: string | number | null
  [key: string]: any
}

interface WorkflowyEditorProps {
  nodes: WorkflowyNode[]
  onChange: (nodes: WorkflowyNode[]) => void
  onSave?: (nodes: WorkflowyNode[]) => Promise<void>
  onCreateNode?: (parentId: string | number | null, data: Partial<WorkflowyNode>) => Promise<WorkflowyNode>
  onUpdateNode?: (id: string | number, data: Partial<WorkflowyNode>) => Promise<void>
  onDeleteNode?: (id: string | number) => Promise<void>
  onMoveNode?: (id: string | number, parentId: string | number | null, order: number) => Promise<void>
  onIndent?: (id: string | number) => Promise<void>
  onOutdent?: (id: string | number) => Promise<void>
  readOnly?: boolean
  showCheckboxes?: boolean
  className?: string
}

// 生成临时 ID
let tempIdCounter = 0
function generateTempId(): string {
  return `temp-${Date.now()}-${++tempIdCounter}`
}

// 展平树为列表（用于键盘导航）
function flattenTree(nodes: WorkflowyNode[], parentId: string | number | null = null, depth = 0): Array<WorkflowyNode & { depth: number; parentId: string | number | null }> {
  const result: Array<WorkflowyNode & { depth: number; parentId: string | number | null }> = []
  
  for (const node of nodes) {
    result.push({ ...node, depth, parentId })
    if (node.children && node.children.length > 0 && !node.collapsed) {
      result.push(...flattenTree(node.children, node.id, depth + 1))
    }
  }
  
  return result
}

// 查找节点路径
function findNodePath(nodes: WorkflowyNode[], targetId: string | number, path: WorkflowyNode[] = []): WorkflowyNode[] | null {
  for (const node of nodes) {
    if (node.id === targetId) {
      return [...path, node]
    }
    if (node.children) {
      const result = findNodePath(node.children, targetId, [...path, node])
      if (result) return result
    }
  }
  return null
}

// 更新节点
function updateNodeInTree(nodes: WorkflowyNode[], targetId: string | number, updates: Partial<WorkflowyNode>): WorkflowyNode[] {
  return nodes.map(node => {
    if (node.id === targetId) {
      return { ...node, ...updates }
    }
    if (node.children) {
      return { ...node, children: updateNodeInTree(node.children, targetId, updates) }
    }
    return node
  })
}

// 删除节点
function deleteNodeFromTree(nodes: WorkflowyNode[], targetId: string | number): WorkflowyNode[] {
  return nodes.filter(node => node.id !== targetId).map(node => {
    if (node.children) {
      return { ...node, children: deleteNodeFromTree(node.children, targetId) }
    }
    return node
  })
}

// 添加子节点
function addChildToNode(nodes: WorkflowyNode[], parentId: string | number, child: WorkflowyNode): WorkflowyNode[] {
  return nodes.map(node => {
    if (node.id === parentId) {
      return { ...node, children: [...(node.children || []), child], collapsed: false }
    }
    if (node.children) {
      return { ...node, children: addChildToNode(node.children, parentId, child) }
    }
    return node
  })
}

// 单个节点组件
function WorkflowyNodeItem({
  node,
  depth,
  isFocused,
  isEditing,
  showCheckboxes,
  readOnly,
  onToggleCollapse,
  onToggleCheck,
  onStartEdit,
  onFinishEdit,
  onCreateSibling,
  onIndent,
  onOutdent,
  onFocus,
}: {
  node: WorkflowyNode
  depth: number
  isFocused: boolean
  isEditing: boolean
  showCheckboxes: boolean
  readOnly: boolean
  onToggleCollapse: () => void
  onToggleCheck: () => void
  onStartEdit: () => void
  onFinishEdit: (content: string) => void
  onCreateSibling: () => void
  onIndent: () => void
  onOutdent: () => void
  onFocus: () => void
}) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [editValue, setEditValue] = useState(node.content)
  
  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus()
      inputRef.current.select()
    }
  }, [isEditing])
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      onFinishEdit(editValue)
      onCreateSibling()
    } else if (e.key === 'Tab') {
      e.preventDefault()
      if (e.shiftKey) {
        onOutdent()
      } else {
        onIndent()
      }
    } else if (e.key === 'Escape') {
      e.preventDefault()
      setEditValue(node.content)
      onFinishEdit(node.content)
    }
  }
  
  const hasChildren = node.children && node.children.length > 0
  
  return (
    <div
      className={cn(
        "group flex items-start gap-1 py-1",
        isFocused && "bg-accent/50 rounded"
      )}
      style={{ paddingLeft: `${depth * 24}px` }}
      onClick={onFocus}
    >
      {/* 折叠/展开按钮 */}
      <button
        onClick={(e) => {
          e.stopPropagation()
          onToggleCollapse()
        }}
        className={cn(
          "w-5 h-5 flex items-center justify-center rounded hover:bg-accent shrink-0 mt-0.5",
          !hasChildren && "invisible"
        )}
      >
        {hasChildren && (
          node.collapsed ? (
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          ) : (
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          )
        )}
      </button>
      
      {/* 复选框（可选） */}
      {showCheckboxes && (
        <button
          onClick={(e) => {
            e.stopPropagation()
            onToggleCheck()
          }}
          className="w-5 h-5 flex items-center justify-center shrink-0 mt-0.5"
        >
          {node.checked ? (
            <CheckCircle2 className="h-4 w-4 text-green-500" />
          ) : (
            <Circle className="h-4 w-4 text-muted-foreground" />
          )}
        </button>
      )}
      
      {/* 内容 */}
      <div className="flex-1 min-w-0">
        {isEditing ? (
          <input
            ref={inputRef}
            type="text"
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onKeyDown={handleKeyDown}
            onBlur={() => onFinishEdit(editValue)}
            className="w-full bg-transparent border-none outline-none text-sm p-0"
            placeholder="输入内容..."
          />
        ) : (
          <div
            onClick={(e) => {
              e.stopPropagation()
              if (!readOnly) {
                onStartEdit()
              }
            }}
            className={cn(
              "text-sm cursor-text min-h-[20px] break-words",
              node.checked && "line-through text-muted-foreground",
              !node.content && "text-muted-foreground italic"
            )}
          >
            {node.content || '(空)'}
          </div>
        )}
      </div>
    </div>
  )
}

// 主编辑器组件
export function WorkflowyEditor({
  nodes: initialNodes,
  onCreateNode,
  onUpdateNode,
  onDeleteNode,
  onIndent,
  onOutdent,
  readOnly = false,
  showCheckboxes = false,
  className,
}: WorkflowyEditorProps) {
  const [nodes, setNodes] = useState<WorkflowyNode[]>(initialNodes)
  const [focusedId, setFocusedId] = useState<string | number | null>(null)
  const [editingId, setEditingId] = useState<string | number | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  
  // 同步外部 nodes 变化
  useEffect(() => {
    setNodes(initialNodes)
  }, [initialNodes])
  
  // 获取展平列表用于导航
  const flatList = flattenTree(nodes)
  
  // 查找当前聚焦节点的索引
  const focusedIndex = flatList.findIndex(n => n.id === focusedId)
  
  // 处理键盘导航
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (editingId) return // 编辑模式下不处理导航
    
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      if (focusedIndex < flatList.length - 1) {
        setFocusedId(flatList[focusedIndex + 1].id)
      }
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      if (focusedIndex > 0) {
        setFocusedId(flatList[focusedIndex - 1].id)
      }
    } else if (e.key === 'Enter' && focusedId) {
      e.preventDefault()
      handleCreateSibling(focusedId)
    } else if (e.key === 'Tab' && focusedId) {
      e.preventDefault()
      if (e.shiftKey) {
        handleOutdent(focusedId)
      } else {
        handleIndent(focusedId)
      }
    } else if (e.key === 'Backspace' && focusedId) {
      const node = flatList.find(n => n.id === focusedId)
      if (node && !node.content) {
        e.preventDefault()
        handleDelete(focusedId)
      }
    } else if (e.key === ' ' && focusedId && showCheckboxes) {
      e.preventDefault()
      handleToggleCheck(focusedId)
    }
  }, [editingId, flatList, focusedIndex, focusedId, showCheckboxes])
  
  // 切换折叠状态
  const handleToggleCollapse = (id: string | number) => {
    setNodes(prev => updateNodeInTree(prev, id, { collapsed: !prev.find(n => n.id === id)?.collapsed }))
  }
  
  // 切换选中状态
  const handleToggleCheck = (id: string | number) => {
    const node = flatList.find(n => n.id === id)
    if (node) {
      const newChecked = !node.checked
      setNodes(prev => updateNodeInTree(prev, id, { checked: newChecked }))
      onUpdateNode?.(id, { checked: newChecked })
    }
  }
  
  // 开始编辑
  const handleStartEdit = (id: string | number) => {
    if (readOnly) return
    setEditingId(id)
    setFocusedId(id)
  }
  
  // 完成编辑
  const handleFinishEdit = (id: string | number, content: string) => {
    setEditingId(null)
    const node = flatList.find(n => n.id === id)
    if (node && node.content !== content) {
      setNodes(prev => updateNodeInTree(prev, id, { content }))
      onUpdateNode?.(id, { content })
    }
  }
  
  // 创建兄弟节点
  const handleCreateSibling = async (id: string | number) => {
    if (readOnly) return
    
    const node = flatList.find(n => n.id === id)
    if (!node) return
    
    const newNode: WorkflowyNode = {
      id: generateTempId(),
      content: '',
      children: [],
      order: node.order + 1,
      parent: node.parentId,
      isNew: true,
    }
    
    // 找到父节点并插入新节点
    if (node.parentId === null) {
      // 根级别
      setNodes(prev => {
        const index = prev.findIndex(n => n.id === id)
        const newNodes = [...prev]
        newNodes.splice(index + 1, 0, newNode)
        return newNodes
      })
    } else {
      setNodes(prev => {
        const parentPath = findNodePath(prev, node.parentId!)
        if (parentPath) {
          const parent = parentPath[parentPath.length - 1]
          const index = parent.children.findIndex((n: WorkflowyNode) => n.id === id)
          const newChildren = [...parent.children]
          newChildren.splice(index + 1, 0, newNode)
          return updateNodeInTree(prev, node.parentId!, { children: newChildren })
        }
        return prev
      })
    }
    
    setFocusedId(newNode.id)
    setEditingId(newNode.id)
    
    // 调用后端 API
    try {
      if (onCreateNode) {
        const created = await onCreateNode(node.parentId, { content: '', order: newNode.order })
        setNodes(prev => updateNodeInTree(prev, newNode.id, { id: created.id, isNew: false }))
      }
    } catch (error) {
      toast.error('创建节点失败')
    }
  }
  
  // 注意：创建子节点的功能通过其他方式实现，此函数保留用于扩展
  // const handleCreateChild = async (id: string | number) => { ... }
  
  // 删除节点
  const handleDelete = async (id: string | number) => {
    if (readOnly) return
    
    const node = flatList.find(n => n.id === id)
    if (!node) return
    
    // 移动到上一个或下一个节点
    let nextFocusId: string | number | null = null
    if (focusedIndex > 0) {
      nextFocusId = flatList[focusedIndex - 1].id
    } else if (focusedIndex < flatList.length - 1) {
      nextFocusId = flatList[focusedIndex + 1].id
    }
    
    setNodes(prev => deleteNodeFromTree(prev, id))
    setFocusedId(nextFocusId)
    
    // 调用后端 API
    try {
      await onDeleteNode?.(id)
    } catch (error) {
      toast.error('删除节点失败')
    }
  }
  
  // 缩进（成为前一个兄弟节点的子节点）
  const handleIndent = async (id: string | number) => {
    if (readOnly) return
    
    const node = flatList.find(n => n.id === id)
    if (!node || node.depth === 0) return
    
    // 查找前一个兄弟节点
    const siblings = flatList.filter(n => n.parentId === node.parentId && n.depth === node.depth)
    const currentIndex = siblings.findIndex(n => n.id === id)
    if (currentIndex <= 0) return // 没有前一个兄弟
    
    const prevSibling = siblings[currentIndex - 1]
    
    // 更新本地状态
    setNodes(prev => {
      // 从当前位置删除
      let newNodes = deleteNodeFromTree(prev, id)
      // 添加到前一个兄弟的子节点
      newNodes = addChildToNode(newNodes, prevSibling.id, { ...node, parent: prevSibling.id })
      return newNodes
    })
    
    // 调用后端 API
    try {
      await onIndent?.(id)
    } catch (error) {
      toast.error('缩进失败')
    }
  }
  
  // 提升（成为父节点的兄弟节点）
  const handleOutdent = async (id: string | number) => {
    if (readOnly) return
    
    const node = flatList.find(n => n.id === id)
    if (!node || node.depth <= 1) return // 根节点或第一层不能提升
    
    // 更新本地状态
    setNodes(prev => {
      const parentPath = findNodePath(prev, node.parentId!)
      if (!parentPath || parentPath.length < 2) return prev
      
      const grandParent = parentPath[parentPath.length - 2]
      const parent = parentPath[parentPath.length - 1]
      
      // 从当前位置删除
      let newNodes = deleteNodeFromTree(prev, id)
      // 添加到祖父节点下
      const newNode = { ...node, parent: grandParent.id, order: parent.order + 1 }
      newNodes = addChildToNode(newNodes, grandParent.id, newNode)
      
      return newNodes
    })
    
    // 调用后端 API
    try {
      await onOutdent?.(id)
    } catch (error) {
      toast.error('提升失败')
    }
  }
  
  // 递归渲染节点
  const renderNode = (node: WorkflowyNode, depth: number) => {
    const isFocused = focusedId === node.id
    const isEditing = editingId === node.id
    
    return (
      <div key={node.id}>
        <WorkflowyNodeItem
          node={node}
          depth={depth}
          isFocused={isFocused}
          isEditing={isEditing}
          showCheckboxes={showCheckboxes}
          readOnly={readOnly}
          onToggleCollapse={() => handleToggleCollapse(node.id)}
          onToggleCheck={() => handleToggleCheck(node.id)}
          onStartEdit={() => handleStartEdit(node.id)}
          onFinishEdit={(content) => handleFinishEdit(node.id, content)}
          onCreateSibling={() => handleCreateSibling(node.id)}
          onIndent={() => handleIndent(node.id)}
          onOutdent={() => handleOutdent(node.id)}
          onFocus={() => setFocusedId(node.id)}
        />
        
        {/* 渲染子节点 */}
        {node.children && node.children.length > 0 && !node.collapsed && (
          <div>
            {node.children.map(child => renderNode(child, depth + 1))}
          </div>
        )}
      </div>
    )
  }
  
  return (
    <div
      ref={containerRef}
      className={cn(
        "workflowy-editor overflow-auto p-4 focus:outline-none",
        className
      )}
      onKeyDown={handleKeyDown}
      tabIndex={0}
    >
      {nodes.length === 0 ? (
        <div className="text-center text-muted-foreground py-8">
          <p>没有内容</p>
          {!readOnly && (
            <button
              onClick={() => {
                const newNode: WorkflowyNode = {
                  id: generateTempId(),
                  content: '',
                  children: [],
                  order: 0,
                  parent: null,
                  isNew: true,
                }
                setNodes([newNode])
                setFocusedId(newNode.id)
                setEditingId(newNode.id)
              }}
              className="text-primary hover:underline mt-2"
            >
              点击创建第一个节点
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-0.5">
          {nodes.map(node => renderNode(node, 0))}
        </div>
      )}
      
      {/* 快捷键提示 */}
      {!readOnly && (
        <div className="mt-4 pt-4 border-t text-xs text-muted-foreground">
          <div className="flex flex-wrap gap-3">
            <span><kbd className="px-1 py-0.5 bg-muted rounded">Enter</kbd> 新建</span>
            <span><kbd className="px-1 py-0.5 bg-muted rounded">Tab</kbd> 缩进</span>
            <span><kbd className="px-1 py-0.5 bg-muted rounded">Shift+Tab</kbd> 提升</span>
            <span><kbd className="px-1 py-0.5 bg-muted rounded">↑↓</kbd> 导航</span>
            <span><kbd className="px-1 py-0.5 bg-muted rounded">Backspace</kbd> 空节点删除</span>
          </div>
        </div>
      )}
    </div>
  )
}

export default WorkflowyEditor
