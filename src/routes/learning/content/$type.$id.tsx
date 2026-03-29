import { createFileRoute, useParams, Link } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import { 
  TreeDeciduous, 
  FlaskConical,
  BookOpen,
  ArrowLeft,
  GraduationCap,
  Sparkles,
  Volume2,
  Heart,
  Share2,
  MoreHorizontal
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { toast } from 'sonner'
import * as api from '@/api/learning'
import type { BaseNode, VocabNode, GramNode, TextLessonNode, ExampleSentence } from '@/types'
import { cn } from '@/lib/utils'
import { AddToFlashcardButton } from '@/components/shared/AddToFlashcardButton'
import { PracticeWritingButton } from '@/components/shared/PracticeWritingButton'

export const Route = createFileRoute('/learning/content/$type/$id')({
  component: ContentDetailPage,
})

interface TypeConfig {
  title: string
  icon: React.ComponentType<{ className?: string }>
  color: string
  borderColor: string
  bgColor: string
  textColor: string
  api: {
    get: (id: string) => Promise<BaseNode>
    getExamples?: (id: string) => Promise<ExampleSentence[]>
    getVocabulary?: (id: string) => Promise<VocabNode[]>
    getGrammar?: (id: string) => Promise<GramNode[]>
  }
}

const typeConfig: Record<string, TypeConfig> = {
  vocab: { 
    title: '词汇', 
    icon: TreeDeciduous, 
    color: 'bg-emerald-500',
    borderColor: 'border-emerald-500',
    bgColor: 'bg-emerald-50',
    textColor: 'text-emerald-600',
    api: {
      get: api.getVocabNode,
      getExamples: api.getVocabNodeExamples,
    }
  },
  grammar: { 
    title: '语法', 
    icon: FlaskConical, 
    color: 'bg-cyan-500',
    borderColor: 'border-cyan-500',
    bgColor: 'bg-cyan-50',
    textColor: 'text-cyan-600',
    api: {
      get: api.getGramNode,
      getExamples: api.getGramNodeExamples,
    }
  },
  idiom: { 
    title: '惯用语', 
    icon: BookOpen, 
    color: 'bg-indigo-500',
    borderColor: 'border-indigo-500',
    bgColor: 'bg-indigo-50',
    textColor: 'text-indigo-600',
    api: {
      get: api.getIdiomNode,
      getExamples: api.getIdiomNodeExamples,
    }
  },
  text: { 
    title: '课文', 
    icon: BookOpen, 
    color: 'bg-rose-500',
    borderColor: 'border-rose-500',
    bgColor: 'bg-rose-50',
    textColor: 'text-rose-600',
    api: {
      get: api.getTextNode,
      getVocabulary: api.getTextNodeVocabulary,
      getGrammar: api.getTextNodeGrammar,
    }
  },
}

type ContentType = keyof typeof typeConfig

function ContentDetailPage() {
  const { type, id } = useParams({ from: '/learning/content/$type/$id' })
  const contentType = type as ContentType
  const config = typeConfig[contentType]
  const Icon = config.icon
  
  const [node, setNode] = useState<BaseNode | null>(null)
  const [examples, setExamples] = useState<ExampleSentence[]>([])
  const [relatedVocab, setRelatedVocab] = useState<BaseNode[]>([])
  const [relatedGrammar, setRelatedGrammar] = useState<BaseNode[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isFavorite, setIsFavorite] = useState(false)
  
  useEffect(() => {
    loadContent()
  }, [type, id])
  
  const loadContent = async () => {
    setIsLoading(true)
    try {
      const nodeData = await config.api.get(id)
      setNode(nodeData)
      
      // 加载例句
      if (contentType !== 'text' && 'getExamples' in config.api && config.api.getExamples) {
        const examplesData = await config.api.getExamples(id)
        setExamples(examplesData)
      }
      
      // 加载相关词汇和语法（仅课文）
      if (contentType === 'text') {
        const vocabData = await config.api.getVocabulary!(id)
        setRelatedVocab(vocabData)
        const grammarData = await config.api.getGrammar!(id)
        setRelatedGrammar(grammarData)
      }
    } catch (error) {
      toast.error('加载内容失败')
    } finally {
      setIsLoading(false)
    }
  }
  

  
  const handleStartExam = () => {
    toast.success('生成专项测试', {
      description: `为 "${node?.name}" 生成测试题目`,
    })
  }
  
  const handlePlayAudio = () => {
    toast.success('播放音频', {
      description: 'TTS 功能开发中',
    })
  }
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-200px)]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }
  
  if (!node) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-200px)]">
        <p className="text-muted-foreground mb-4">内容不存在或已删除</p>
        <Link to="/learning/content">
          <Button>
            <ArrowLeft className="mr-2 h-4 w-4" />
            返回学习内容
          </Button>
        </Link>
      </div>
    )
  }
  
  return (
    <div className="space-y-6">
      {/* 顶部导航 */}
      <div className="flex items-center justify-between">
        <Link to="/learning/content">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            返回列表
          </Button>
        </Link>
        <div className="flex items-center gap-2">
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => setIsFavorite(!isFavorite)}
          >
            <Heart className={cn("h-5 w-5", isFavorite && "fill-red-500 text-red-500")} />
          </Button>
          <Button variant="ghost" size="icon" onClick={handlePlayAudio}>
            <Volume2 className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon">
            <Share2 className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon">
            <MoreHorizontal className="h-5 w-5" />
          </Button>
        </div>
      </div>
      
      {/* 主要内容卡片 */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3 mb-4">
            <div className={cn("p-2 rounded-lg", config.color, "text-white")}>
              <Icon className="h-5 w-5" />
            </div>
            <Badge className={config.color}>{node.node_type}</Badge>
            <Badge variant="outline">{config.title}</Badge>
          </div>
          
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-4xl font-bold mb-2">{node.name}</CardTitle>
              {node.reading && (
                <p className={cn("text-xl", config.textColor)}>{node.reading}</p>
              )}
            </div>
            <div className="flex items-center gap-2">
              <AddToFlashcardButton 
                node={node}
                sourceType={contentType === 'vocab' ? 'vocab' : contentType === 'grammar' ? 'grammar' : 'idiom'}
                variant="outline"
              />
              <PracticeWritingButton 
                node={node}
                sourceType={contentType === 'vocab' ? 'vocab' : contentType === 'grammar' ? 'grammar' : 'idiom'}
                variant="outline"
              />
              <Button 
                onClick={handleStartExam}
                className={config.color}
              >
                <GraduationCap className="mr-2 h-4 w-4" />
                专项测试
              </Button>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-8">
          {/* 内容详情 */}
          <Tabs defaultValue="content" className="w-full">
            <TabsList className="grid w-full grid-cols-4 max-w-md">
              <TabsTrigger value="content">内容</TabsTrigger>
              <TabsTrigger value="examples">
                例句 {examples.length > 0 && `(${examples.length})`}
              </TabsTrigger>
              {contentType === 'text' && (
                <TabsTrigger value="vocabulary">
                  词汇 {relatedVocab.length > 0 && `(${relatedVocab.length})`}
                </TabsTrigger>
              )}
              {contentType === 'text' && (
                <TabsTrigger value="grammar">
                  语法 {relatedGrammar.length > 0 && `(${relatedGrammar.length})`}
                </TabsTrigger>
              )}
              {contentType !== 'text' && <TabsTrigger value="related">相关</TabsTrigger>}
            </TabsList>
            
            {/* 内容 Tab */}
            <TabsContent value="content" className="space-y-6">
              {/* 含义/内容 */}
              <div className={cn("p-6 rounded-lg", config.bgColor)}>
                <h3 className="text-sm font-medium text-muted-foreground mb-2">
                  {contentType === 'vocab' ? '含义' : '内容'}
                </h3>
                <p className="text-2xl">{node.content || node.meaning || '暂无内容'}</p>
              </div>
              
              {/* 额外信息 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* 词汇特有 */}
                {contentType === 'vocab' && (node as VocabNode).word_type && (
                  <>
                    <InfoItem label="词性" value={(node as VocabNode).word_type} />
                    {(node as VocabNode).jlpt_level && (
                      <InfoItem label="JLPT 等级" value={(node as VocabNode).jlpt_level} />
                    )}
                    {(node as VocabNode).hsk_level && (
                      <InfoItem label="HSK 等级" value={(node as VocabNode).hsk_level} />
                    )}
                    {(node as VocabNode).content_json?.pronunciation && (
                      <InfoItem label="发音说明" value={(node as VocabNode).content_json?.pronunciation} />
                    )}
                  </>
                )}
                
                {/* 语法特有 */}
                {contentType === 'grammar' && (node as GramNode).structure && (
                  <>
                    <InfoItem label="结构" value={(node as GramNode).structure} />
                    {(node as GramNode).level && (
                      <InfoItem label="等级" value={(node as GramNode).level} />
                    )}
                    {(node as GramNode).conjugation_pattern && (
                      <InfoItem label="变形规则" value={(node as GramNode).conjugation_pattern} />
                    )}
                    {(node as GramNode).usage_notes && (
                      <InfoItem label="用法说明" value={(node as GramNode).usage_notes} />
                    )}
                  </>
                )}
                
                {/* 课文特有 */}
                {contentType === 'text' && (node as TextLessonNode).lesson_number && (
                  <>
                    <InfoItem label="课号" value={(node as TextLessonNode).lesson_number} />
                    {(node as TextLessonNode).source_text && (
                      <InfoItem label="原文" value={(node as TextLessonNode).source_text} />
                    )}
                  </>
                )}
              </div>
              
              {/* AI 解释 */}
              <Card className="border-dashed">
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-yellow-500" />
                    AI 详细解释
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    AI 解释功能即将上线，将为您提供更详细的学习指导和用法说明。
                  </p>
                </CardContent>
              </Card>
            </TabsContent>
            
            {/* 例句 Tab */}
            <TabsContent value="examples" className="space-y-4">
              {examples.length === 0 ? (
                <div className="text-center py-12">
                  <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">暂无例句</p>
                </div>
              ) : (
                examples.map((example, index) => (
                  <ExampleDetailCard 
                    key={index} 
                    example={example} 
                    index={index}
                    config={config}
                  />
                ))
              )}
            </TabsContent>
            
            {/* 词汇 Tab（仅课文） */}
            {contentType === 'text' && (
              <TabsContent value="vocabulary" className="space-y-4">
                {relatedVocab.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-muted-foreground">暂无关联词汇</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {relatedVocab.map((vocab) => (
                      <RelatedNodeCard 
                        key={vocab.id} 
                        node={vocab} 
                        type="vocab"
                      />
                    ))}
                  </div>
                )}
              </TabsContent>
            )}
            
            {/* 语法 Tab（仅课文） */}
            {contentType === 'text' && (
              <TabsContent value="grammar" className="space-y-4">
                {relatedGrammar.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-muted-foreground">暂无关联语法</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {relatedGrammar.map((grammar) => (
                      <RelatedNodeCard 
                        key={grammar.id} 
                        node={grammar} 
                        type="grammar"
                      />
                    ))}
                  </div>
                )}
              </TabsContent>
            )}
            
            {/* 相关 Tab（非课文） */}
            {contentType !== 'text' && (
              <TabsContent value="related">
                <div className="text-center py-12">
                  <p className="text-muted-foreground">相关推荐功能开发中</p>
                </div>
              </TabsContent>
            )}
          </Tabs>
          
          {/* 底部导航 */}
          <div className="flex items-center justify-between pt-6 border-t">
            <Button variant="outline">
              <ArrowLeft className="mr-2 h-4 w-4" />
              上一个
            </Button>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span>排序: {node.sort_order}</span>
              <span>ID: {node.id}</span>
            </div>
            <Button variant="outline">
              下一个
              <ArrowLeft className="ml-2 h-4 w-4 rotate-180" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// 信息项组件
function InfoItem({ label, value }: { label: string; value?: string }) {
  if (!value) return null
  return (
    <div className="p-4 bg-muted rounded-lg">
      <p className="text-sm text-muted-foreground mb-1">{label}</p>
      <p className="font-medium">{value}</p>
    </div>
  )
}

// 例句详情卡片
interface ExampleDetailCardProps {
  example: ExampleSentence
  index: number
  config: typeof typeConfig.vocab
}

function ExampleDetailCard({ example, index, config }: ExampleDetailCardProps) {
  const [showTranslation, setShowTranslation] = useState(true)
  
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          <Badge variant="outline" className="shrink-0">{index + 1}</Badge>
          <div className="flex-1 space-y-3">
            <p className="text-xl font-medium">{example.sentence}</p>
            {example.reading && (
              <p className="text-muted-foreground">{example.reading}</p>
            )}
            {showTranslation && (
              <div className={cn("p-4 rounded-lg", config.bgColor)}>
                <p className="text-sm text-muted-foreground mb-1">翻译</p>
                <p>{example.translation}</p>
              </div>
            )}
          </div>
        </div>
      </CardContent>
      <div className="flex items-center justify-between px-6 py-3 bg-muted/50 border-t">
        <Button 
          variant="ghost" 
          size="sm"
          onClick={() => setShowTranslation(!showTranslation)}
        >
          {showTranslation ? '隐藏翻译' : '显示翻译'}
        </Button>
        <div className="flex items-center gap-2">
          <AddToFlashcardButton 
            example={example}
            sourceType="example"
            variant="ghost"
            size="sm"
          />
          <PracticeWritingButton 
            example={example}
            sourceType="example"
            variant="ghost"
            size="sm"
          />
        </div>
      </div>
    </Card>
  )
}

// 关联内容卡片
interface RelatedNodeCardProps {
  node: BaseNode
  type: 'vocab' | 'grammar'
}

function RelatedNodeCard({ node, type }: RelatedNodeCardProps) {
  const typeConfig = {
    vocab: { color: 'bg-emerald-500', label: '词汇' },
    grammar: { color: 'bg-cyan-500', label: '语法' },
  }
  const config = typeConfig[type]
  
  return (
    <Link to="/learning/content/$type/$id" params={{ type, id: node.id }}>
      <Card className="cursor-pointer hover:shadow-md transition-shadow">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className={cn("p-2 rounded text-white text-xs", config.color)}>
              {config.label}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium truncate">{node.name}</p>
              {node.reading && (
                <p className="text-sm text-muted-foreground">{node.reading}</p>
              )}
            </div>
          </div>
          {(node.content || node.meaning) && (
            <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
              {node.content || node.meaning}
            </p>
          )}
        </CardContent>
      </Card>
    </Link>
  )
}
