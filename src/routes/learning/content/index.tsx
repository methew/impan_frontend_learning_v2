import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { useState, useEffect } from 'react'

import { 
  TreeDeciduous, 
  FlaskConical,
  BookOpen,
  Search,
  ChevronDown,
  ChevronUp,
  ChevronRight,
  Sparkles,
  GraduationCap,
  Layers,
  PenTool,
  Plus,
  Upload
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { toast } from 'sonner'
import * as api from '@/api/learning'
import type { BaseNode, VocabNode, GramNode, ExampleSentence } from '@/types'
import { cn } from '@/lib/utils'
import { useGenerateFlashcardsFromNodes } from '@/hooks/useFlashcards'

export const Route = createFileRoute('/learning/content/')({
  component: ContentPage,
})

type ContentType = 'vocab' | 'grammar' | 'idiom' | 'text'

const typeConfig = {
  vocab: { 
    title: '词汇学习', 
    icon: TreeDeciduous, 
    color: 'bg-emerald-500',
    borderColor: 'border-emerald-500',
    bgColor: 'bg-emerald-50',
    api: api.getVocabNodes
  },
  grammar: { 
    title: '语法学习', 
    icon: FlaskConical, 
    color: 'bg-cyan-500',
    borderColor: 'border-cyan-500',
    bgColor: 'bg-cyan-50',
    api: api.getGramNodes
  },
  idiom: { 
    title: '惯用语学习', 
    icon: BookOpen, 
    color: 'bg-indigo-500',
    borderColor: 'border-indigo-500',
    bgColor: 'bg-indigo-50',
    api: api.getIdiomNodes
  },
  text: { 
    title: '课文学习', 
    icon: BookOpen, 
    color: 'bg-rose-500',
    borderColor: 'border-rose-500',
    bgColor: 'bg-rose-50',
    api: api.getTextNodes
  },
}

function ContentPage() {
  const navigate = useNavigate()
  const [activeType, setActiveType] = useState<ContentType>('vocab')
  const config = typeConfig[activeType]
  const Icon = config.icon
  
  const [nodes, setNodes] = useState<BaseNode[]>([])
  const [selectedNode, setSelectedNode] = useState<BaseNode | null>(null)
  const [examples, setExamples] = useState<ExampleSentence[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set())
  
  useEffect(() => {
    loadNodes()
  }, [activeType])
  
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
      if (activeType === 'vocab') {
        data = await api.getVocabNodeExamples(nodeId)
      } else if (activeType === 'grammar') {
        data = await api.getGramNodeExamples(nodeId)
      } else if (activeType === 'idiom') {
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
            isSelected ? config.bgColor : "hover:bg-accent",
            isSelected && "border-l-4",
            isSelected && config.borderColor,
            level > 0 && "ml-4"
          )}
          style={{ paddingLeft: `${level * 16 + 8}px` }}
          onClick={() => navigate({ to: `/learning/content/${activeType}.${node.id}` })}
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
          <span className={cn(
            "flex-1 truncate",
            isSelected && "font-medium"
          )}>{node.name}</span>
          {node.node_type && (
            <Badge 
              variant={isSelected ? "default" : "outline"} 
              className={cn("text-xs", isSelected && config.color)}
            >
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
    <div className="h-full flex gap-6 overflow-hidden">
      {/* Sidebar */}
      <div className="w-80 flex flex-col gap-4">
        {/* Type Tabs */}
        <Tabs value={activeType} onValueChange={(v) => setActiveType(v as ContentType)}>
          <TabsList className="grid grid-cols-4 w-full">
            <TabsTrigger value="vocab" className="text-xs">词汇</TabsTrigger>
            <TabsTrigger value="grammar" className="text-xs">语法</TabsTrigger>
            <TabsTrigger value="idiom" className="text-xs">惯用语</TabsTrigger>
            <TabsTrigger value="text" className="text-xs">课文</TabsTrigger>
          </TabsList>
        </Tabs>
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${config.color} text-white`}>
              <Icon className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold">{config.title}</h1>
              <p className="text-xs text-muted-foreground">
                共 {nodes.length} 个节点 · {rootNodes.length} 个根节点
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link to="/learning/import">
              <Button variant="outline" size="sm">
                <Upload className="mr-2 h-4 w-4" />
                批量导入
              </Button>
            </Link>
            <Link to="/learning/content/new">
              <Button size="sm" className={config.color}>
                <Plus className="mr-2 h-4 w-4" />
                新建内容
              </Button>
            </Link>
          </div>
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
        <Card className="flex-1 overflow-hidden flex flex-col">
          <CardContent className="p-2 overflow-y-auto flex-1">
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
      <div className="flex-1 overflow-hidden">
        {selectedNode ? (
          <ContentDetail 
            node={selectedNode} 
            examples={examples}
            contentType={activeType}
            config={config}
          />
        ) : (
          <Card className="h-full flex items-center justify-center">
            <p className="text-muted-foreground">选择一个项目进行学习</p>
          </Card>
        )}
      </div>
    </div>
  )
}

// 内容详情组件
interface ContentDetailProps {
  node: BaseNode
  examples: ExampleSentence[]
  contentType: ContentType
  config: typeof typeConfig.vocab
}

function ContentDetail({ node, examples, contentType, config }: ContentDetailProps) {
  const generateFlashcards = useGenerateFlashcardsFromNodes()
  
  const handleAddToFlashcards = () => {
    generateFlashcards.mutate(
      { nodeType: contentType, nodeIds: [node.id] },
      {
        onSuccess: () => {
          toast.success('已添加到闪卡', {
            description: `${node.name} 已加入闪卡包`,
          })
        },
        onError: () => {
          toast.error('添加失败', {
            description: '请稍后重试',
          })
        },
      }
    )
  }
  
  const handlePracticeWriting = () => {
    toast.success('准备写作练习', {
      description: `使用 "${node.name}" 进行造句练习`,
    })
    // TODO: 导航到写作练习页面
  }
  
  const handleStartExam = () => {
    toast.success('生成专项测试', {
      description: `为 "${node.name}" 生成测试题目`,
    })
    // TODO: 生成专项测试
  }

  return (
    <Card className="h-full flex flex-col overflow-hidden">
      <CardHeader className="shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Badge className={config.color}>{node.node_type}</Badge>
            <span className="text-sm text-muted-foreground">ID: {node.id}</span>
          </div>
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleAddToFlashcards}
              disabled={generateFlashcards.isPending}
            >
              <Layers className="mr-2 h-4 w-4" />
              {generateFlashcards.isPending ? '添加中...' : '加入闪卡'}
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={handlePracticeWriting}
            >
              <PenTool className="mr-2 h-4 w-4" />
              造句练习
            </Button>
            <Button 
              size="sm"
              onClick={handleStartExam}
              className={config.color}
            >
              <GraduationCap className="mr-2 h-4 w-4" />
              专项测试
            </Button>
          </div>
        </div>
        <CardTitle className="text-3xl mt-4">{node.name}</CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-8 overflow-y-auto flex-1">
        {/* 主要内容 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* 左侧：基本信息 */}
          <div className="space-y-6">
            {/* 读音 */}
            {node.reading && (
              <div className={cn("p-4 rounded-lg", config.bgColor)}>
                <h3 className="text-sm font-medium text-muted-foreground mb-2">读音</h3>
                <p className="text-xl font-medium">{node.reading}</p>
              </div>
            )}
            
            {/* 含义/内容 */}
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-2">
                {contentType === 'vocab' ? '含义' : '内容'}
              </h3>
              <p className="text-lg leading-relaxed">{node.content || node.meaning || '暂无内容'}</p>
            </div>
            
            {/* 额外信息（词汇特有） */}
            {contentType === 'vocab' && (node as VocabNode).word_type && (
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline">{(node as VocabNode).word_type}</Badge>
                {(node as VocabNode).jlpt_level && (
                  <Badge variant="outline">{(node as VocabNode).jlpt_level}</Badge>
                )}
                {(node as VocabNode).hsk_level && (
                  <Badge variant="outline">{(node as VocabNode).hsk_level}</Badge>
                )}
              </div>
            )}
            
            {/* 额外信息（语法特有） */}
            {contentType === 'grammar' && (node as GramNode).structure && (
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-2">结构</h3>
                <code className="block p-3 bg-muted rounded-lg font-mono">
                  {(node as GramNode).structure}
                </code>
              </div>
            )}
          </div>
          
          {/* 右侧：学习工具 */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-muted-foreground">学习工具</h3>
            
            <div className="grid grid-cols-2 gap-3">
              <Card className="cursor-pointer hover:shadow-md transition-shadow">
                <CardContent className="p-4 text-center">
                  <div className={cn("p-3 rounded-lg inline-flex mb-2", config.color, "text-white")}>
                    <Sparkles className="h-5 w-5" />
                  </div>
                  <p className="font-medium text-sm">AI 解释</p>
                  <p className="text-xs text-muted-foreground">获取详细解析</p>
                </CardContent>
              </Card>
              
              <Card className="cursor-pointer hover:shadow-md transition-shadow">
                <CardContent className="p-4 text-center">
                  <div className={cn("p-3 rounded-lg inline-flex mb-2", config.color, "text-white")}>
                    <Layers className="h-5 w-5" />
                  </div>
                  <p className="font-medium text-sm">相关词汇</p>
                  <p className="text-xs text-muted-foreground">查看关联内容</p>
                </CardContent>
              </Card>
              
              <Card className="cursor-pointer hover:shadow-md transition-shadow">
                <CardContent className="p-4 text-center">
                  <div className={cn("p-3 rounded-lg inline-flex mb-2", config.color, "text-white")}>
                    <BookOpen className="h-5 w-5" />
                  </div>
                  <p className="font-medium text-sm">课文出处</p>
                  <p className="text-xs text-muted-foreground">查看来源课文</p>
                </CardContent>
              </Card>
              
              <Card className="cursor-pointer hover:shadow-md transition-shadow">
                <CardContent className="p-4 text-center">
                  <div className={cn("p-3 rounded-lg inline-flex mb-2", config.color, "text-white")}>
                    <ChevronRight className="h-5 w-5" />
                  </div>
                  <p className="font-medium text-sm">继续学习</p>
                  <p className="text-xs text-muted-foreground">下一个内容</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
        
        {/* 例句 */}
        {examples.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold mb-4">例句</h3>
            <div className="space-y-4">
              {examples.map((example, index) => (
                <ExampleCard 
                  key={index} 
                  example={example} 
                  index={index}
                />
              ))}
            </div>
          </div>
        )}
        
        {/* 元信息 */}
        <div className="flex items-center justify-between pt-4 border-t text-sm text-muted-foreground">
          <div className="flex items-center gap-4">
            <span>排序: {node.sort_order}</span>
            <span>状态: {node.is_active ? '启用' : '禁用'}</span>
          </div>
          <div className="flex items-center gap-4">
            <span>创建: {new Date(node.created_at).toLocaleDateString()}</span>
            <span>更新: {new Date(node.updated_at).toLocaleDateString()}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// 例句卡片组件
interface ExampleCardProps {
  example: ExampleSentence
  index: number
}

function ExampleCard({ example, index }: ExampleCardProps) {
  const [showTranslation, setShowTranslation] = useState(true)
  
  return (
    <Card className="overflow-hidden">
      <CardContent className="p-0">
        <div className="p-4">
          <div className="flex items-start gap-3">
            <Badge variant="outline" className="shrink-0 mt-1">{index + 1}</Badge>
            <div className="flex-1 space-y-2">
              <p className="text-lg font-medium">{example.sentence}</p>
              {example.reading && (
                <p className="text-muted-foreground">{example.reading}</p>
              )}
              {showTranslation && (
                <p className="text-sm text-muted-foreground border-l-2 border-muted pl-3">
                  {example.translation}
                </p>
              )}
            </div>
          </div>
        </div>
        
        <div className="flex items-center justify-between px-4 py-2 bg-muted/50 border-t">
          <div className="flex items-center gap-2">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => setShowTranslation(!showTranslation)}
            >
              {showTranslation ? '隐藏翻译' : '显示翻译'}
            </Button>
          </div>
          <div className="flex items-center gap-2">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => toast.success('例句已加入闪卡')}
            >
              <Layers className="mr-2 h-3 w-3" />
              加入闪卡
            </Button>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => toast.success('准备写作练习')}
            >
              <PenTool className="mr-2 h-3 w-3" />
              仿写练习
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
