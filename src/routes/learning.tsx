import { createFileRoute, Link, useParams } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import { 
  TreeDeciduous, 
  FlaskConical,
  BookOpen,
  ChevronRight,
  Search,
  ChevronDown,
  ChevronUp
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import * as api from '@/api/learning'
import type { BaseNode, ExampleSentence } from '@/types'
import { cn } from '@/lib/utils'

export const Route = createFileRoute('/learning/$type')({
  component: LearningPage,
})

const typeConfig = {
  vocab: { 
    title: '词汇学习', 
    icon: TreeDeciduous, 
    color: 'bg-emerald-500',
    api: api.getVocabNodes
  },
  grammar: { 
    title: '语法学习', 
    icon: FlaskConical, 
    color: 'bg-cyan-500',
    api: api.getGramNodes
  },
  idiom: { 
    title: '惯用语学习', 
    icon: BookOpen, 
    color: 'bg-indigo-500',
    api: api.getIdiomNodes
  },
  text: { 
    title: '课文学习', 
    icon: BookOpen, 
    color: 'bg-rose-500',
    api: api.getTextNodes
  },
}

function LearningPage() {
  const { type } = useParams({ from: '/learning/$type' })
  const config = typeConfig[type as keyof typeof typeConfig]
  const Icon = config?.icon || BookOpen
  
  const [nodes, setNodes] = useState<BaseNode[]>([])
  const [selectedNode, setSelectedNode] = useState<BaseNode | null>(null)
  const [examples, setExamples] = useState<ExampleSentence[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set())
  
  useEffect(() => {
    loadNodes()
  }, [type])
  
  useEffect(() => {
    if (selectedNode) {
      loadExamples(selectedNode.id)
    }
  }, [selectedNode])
  
  const loadNodes = async () => {
    setIsLoading(true)
    try {
      const data = await config.api({ ordering: 'sort_order' })
      setNodes(data)
      if (data.length > 0) {
        setSelectedNode(data[0])
      }
    } catch (error) {
      toast.error('加载内容失败')
    } finally {
      setIsLoading(false)
    }
  }
  
  const loadExamples = async (nodeId: string) => {
    try {
      let data: ExampleSentence[] = []
      if (type === 'vocab') {
        data = await api.getVocabNodeExamples(nodeId)
      } else if (type === 'grammar') {
        data = await api.getGramNodeExamples(nodeId)
      } else if (type === 'idiom') {
        data = await api.getIdiomNodeExamples(nodeId)
      }
      setExamples(data)
    } catch (error) {
      console.log('Failed to load examples')
    }
  }
  
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
  
  const filteredNodes = nodes.filter(node => 
    searchQuery === '' || 
    node.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    node.content?.toLowerCase().includes(searchQuery.toLowerCase())
  )
  
  // Group nodes by parent for tree view
  const rootNodes = filteredNodes.filter(n => !n.parent)
  const getChildNodes = (parentId: string) => filteredNodes.filter(n => n.parent === parentId)
  
  const renderNode = (node: BaseNode, level: number = 0) => {
    const children = getChildNodes(node.id)
    const hasChildren = children.length > 0
    const isExpanded = expandedNodes.has(node.id)
    const isSelected = selectedNode?.id === node.id
    
    return (
      <div key={node.id}>
        <div
          className={cn(
            "flex items-center gap-2 p-2 rounded-lg cursor-pointer transition-colors",
            isSelected ? "bg-primary text-primary-foreground" : "hover:bg-accent",
            level > 0 && "ml-4"
          )}
          style={{ paddingLeft: `${level * 16 + 8}px` }}
          onClick={() => setSelectedNode(node)}
        >
          {hasChildren && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                toggleNode(node.id)
              }}
              className="p-1 rounded hover:bg-accent-foreground/10"
            >
              {isExpanded ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronUp className="h-4 w-4" />
              )}
            </button>
          )}
          <span className="flex-1 truncate">{node.name}</span>
          {node.node_type && (
            <Badge variant={isSelected ? "secondary" : "outline"} className="text-xs">
              {node.node_type}
            </Badge>
          )}
        </div>
        {hasChildren && isExpanded && (
          <div>
            {children.map(child => renderNode(child, level + 1))}
          </div>
        )}
      </div>
    )
  }
  
  return (
    <div className="h-[calc(100vh-140px)] flex gap-6">
      {/* Sidebar */}
      <div className="w-80 flex flex-col gap-4">
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg ${config.color} text-white`}>
            <Icon className="h-5 w-5" />
          </div>
          <h1 className="text-xl font-bold">{config.title}</h1>
        </div>
        
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="搜索..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        
        {/* Node List */}
        <Card className="flex-1 overflow-auto">
          <CardContent className="p-2">
            {isLoading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
              </div>
            ) : (
              <div className="space-y-1">
                {rootNodes.map(node => renderNode(node))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      
      {/* Content */}
      <div className="flex-1 overflow-auto">
        {selectedNode ? (
          <Card className="h-full">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Badge>{selectedNode.node_type}</Badge>
              </div>
              <CardTitle className="text-2xl">{selectedNode.name}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Content */}
              {selectedNode.content && (
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-2">内容</h3>
                  <p className="text-lg">{selectedNode.content}</p>
                </div>
              )}
              
              {/* Reading */}
              {selectedNode.reading && (
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-2">读音</h3>
                  <p className="text-lg text-muted-foreground">{selectedNode.reading}</p>
                </div>
              )}
              
              {/* Meaning */}
              {selectedNode.meaning && (
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-2">含义</h3>
                  <p className="text-lg">{selectedNode.meaning}</p>
                </div>
              )}
              
              {/* Examples */}
              {examples.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-3">例句</h3>
                  <div className="space-y-3">
                    {examples.map((example, index) => (
                      <Card key={index} className="bg-muted/50">
                        <CardContent className="p-4 space-y-2">
                          <p className="text-lg font-medium">{example.sentence}</p>
                          {example.reading && (
                            <p className="text-muted-foreground">{example.reading}</p>
                          )}
                          <p className="text-sm">{example.translation}</p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ) : (
          <Card className="h-full flex items-center justify-center">
            <p className="text-muted-foreground">选择一个项目进行学习</p>
          </Card>
        )}
      </div>
    </div>
  )
}
