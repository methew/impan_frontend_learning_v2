import { useState, useEffect } from 'react'
import { 
  Upload, ArrowRight, Check, AlertCircle, 
  Layers, GitBranch, Eye, Play,
  Code, FileUp, BookOpen
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { Label } from '@/components/ui/label'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Link } from '@tanstack/react-router'

// 代码编辑器 & 语法高亮
import Editor from 'react-simple-code-editor'
import Prism from 'prismjs'
import 'prismjs/components/prism-yaml'
import 'prismjs/components/prism-json'
import 'prismjs/themes/prism-tomorrow.css'

export interface ImportTemplate {
  id: string
  name: string
  description: string
  format: 'yaml' | 'json'
  data: string
  mode: 'flat' | 'nested'
}

export interface ImportField {
  name: string
  label: string
  required: boolean
  isArray?: boolean
  type?: 'string' | 'number' | 'select' | 'array'
  options?: string[]
}

export interface UniversalImportProps {
  title: string
  description: string
  backLink: string
  templates: ImportTemplate[]
  fields: ImportField[]
  onImport: (data: any[], mode: 'flat' | 'nested') => Promise<void>
}

const steps = [
  { id: 1, title: '输入数据', description: '粘贴或上传数据' },
  { id: 2, title: '预览确认', description: '预览并确认导入' },
]

// 示例模板数据
const sampleTemplates: Record<string, ImportTemplate[]> = {
  vocabulary: [
    {
      id: 'vocab-nested',
      name: '嵌套模式 - 日本語/食べる',
      description: '使用嵌套结构，直观展示层级',
      format: 'yaml',
      mode: 'nested',
      data: `- term: 日本語
  readings:
    - kana: にほんご
      accent: "2"
      senses:
        - pos: 名詞
          glosses:
            - 日语
            - 日本语
          examples:
            - sentence: 日本語を勉強しています。
              translation: 我正在学习日语。
- term: 食べる
  readings:
    - kana: たべる
      accent: "2"
      senses:
        - pos: 動詞
          glosses:
            - 吃
            - 进食`
    },
    {
      id: 'vocab-flat',
      name: 'Flat 模式 - 日本語',
      description: '使用 parent_id 关联，适合批量',
      format: 'yaml',
      mode: 'flat',
      data: `- id: 1
  node_type: TERM
  content: 日本語
  order: 1
- id: 2
  node_type: READING
  content: にほんご
  parent_id: 1
  order: 1
  accent: "2"
- id: 3
  node_type: SENSE
  parent_id: 2
  order: 1
  pos: 名詞
  glosses:
    - 日语
    - 日本语
- id: 4
  node_type: EXAMPLE
  parent_id: 3
  order: 1
  content: 日本語を勉強しています。
  translation: 我正在学习日语。`
    }
  ],
  grammar: [
    {
      id: 'grammar-nested',
      name: '嵌套模式 - ～ている',
      description: '语法点使用嵌套结构',
      format: 'yaml',
      mode: 'nested',
      data: `- grammar_point: ～ている
  pattern: 动词て形 + いる
  level: N5
  meanings:
    - meaning: 正在进行
      explanation: 表示动作正在进行
      examples:
        - sentence: 今、本を読んでいます。
          translation: 我现在正在读书。`
    },
    {
      id: 'grammar-flat',
      name: 'Flat 模式 - ～ている',
      description: '语法点使用 parent_id 关联',
      format: 'yaml',
      mode: 'flat',
      data: `- id: 1
  node_type: TERM
  content: ～ている
  pattern: 动词て形 + いる
  level: N5
- id: 2
  node_type: SENSE
  parent_id: 1
  order: 1
  meaning: 正在进行
  explanation: 表示动作正在进行
- id: 3
  node_type: EXAMPLE
  parent_id: 2
  order: 1
  content: 今、本を読んでいます。
  translation: 我现在正在读书。`
    }
  ],
  idioms: [
    {
      id: 'idiom-nested',
      name: '嵌套模式 - 猫の手も借りたい',
      description: '惯用语使用嵌套结构',
      format: 'yaml',
      mode: 'nested',
      data: `- idiom: 猫の手も借りたい
  reading: ねこのてもかりたい
  meaning: 忙得不可开交，恨不得连猫爪都借来用
  literal_meaning: 连猫的手都想借
  examples:
    - sentence: 年末は猫の手も借りたいほど忙しい。
      translation: 年末忙得不可开交。`
    },
    {
      id: 'idiom-flat',
      name: 'Flat 模式 - 猫の手も借りたい',
      description: '惯用语使用 parent_id 关联',
      format: 'yaml',
      mode: 'flat',
      data: `- id: 1
  node_type: TERM
  content: 猫の手も借りたい
  reading: ねこのてもかりたい
- id: 2
  node_type: SENSE
  parent_id: 1
  order: 1
  meaning: 忙得不可开交，恨不得连猫爪都借来用
  literal_meaning: 连猫的手都想借
- id: 3
  node_type: EXAMPLE
  parent_id: 2
  order: 1
  content: 年末は猫の手も借りたいほど忙しい。
  translation: 年末忙得不可开交。`
    }
  ],
  texts: [
    {
      id: 'text-nested',
      name: '嵌套模式 - 大家的日本语第1课',
      description: '课文使用嵌套结构（节 → 句）',
      format: 'yaml',
      mode: 'nested',
      data: `title: 大家的日本语 第1课
level: N5
sections:
  - title: 基本课文
    sentences:
      - content: わたしは　田中です。
        translation: 我是田中。
        vocabularies:
          - term: わたし
            reading: わたし
            meaning: 我
      - content: これは　本です。
        translation: 这是书。
        vocabularies:
          - term: 本
            reading: ほん
            meaning: 书`
    },
    {
      id: 'text-flat',
      name: 'Flat 模式 - 基本课文',
      description: '课文使用 parent_id 关联',
      format: 'yaml',
      mode: 'flat',
      data: `- id: 1
  node_type: SECTION
  content: 基本课文
  order: 1
- id: 2
  node_type: SENTENCE
  parent_id: 1
  order: 1
  content: わたしは　田中です。
  translation: 我是田中。
- id: 3
  node_type: SENTENCE
  parent_id: 1
  order: 2
  content: これは　本です。
  translation: 这是书。`
    }
  ]
}

// 代码编辑器组件
interface CodeEditorProps {
  value: string
  onChange: (value: string) => void
  language: 'yaml' | 'json'
  placeholder?: string
  minHeight?: number
}

function CodeEditor({ value, onChange, language, placeholder, minHeight = 400 }: CodeEditorProps) {
  useEffect(() => {
    if (typeof window !== 'undefined') {
      Prism.highlightAll()
    }
  }, [value])

  const highlightCode = (code: string) => {
    if (!code) return ''
    const grammar = language === 'json' ? Prism.languages.json : Prism.languages.yaml
    if (!grammar) return code
    return Prism.highlight(code, grammar, language)
  }

  return (
    <div className="relative border rounded-lg overflow-hidden bg-[#2d2d2d]">
      <div className="absolute top-2 right-2 z-10">
        <Badge variant="secondary" className="text-xs bg-black/50 text-white/80 border-0">
          {language.toUpperCase()}
        </Badge>
      </div>
      
      <Editor
        value={value}
        onValueChange={onChange}
        highlight={highlightCode}
        padding={16}
        placeholder={placeholder}
        className="font-mono text-sm"
        style={{
          fontFamily: '"Fira Code", "JetBrains Mono", "Consolas", monospace',
          fontSize: 14,
          backgroundColor: '#2d2d2d',
          minHeight: `${minHeight}px`,
        }}
        textareaClassName="focus:outline-none"
      />
      
      <style>{`
        .npm__react-simple-code-editor__textarea {
          color: transparent !important;
          background: transparent !important;
          caret-color: #fff !important;
        }
        .npm__react-simple-code-editor__textarea::selection {
          background: rgba(255, 255, 255, 0.2) !important;
        }
        pre {
          margin: 0 !important;
          background: transparent !important;
        }
      `}</style>
    </div>
  )
}

export function UniversalImport({ 
  title, 
  description, 
  backLink,
  onImport 
}: UniversalImportProps) {
  const [currentStep, setCurrentStep] = useState(1)
  const [inputMethod, setInputMethod] = useState<'paste' | 'file'>('paste')
  const [dataMode, setDataMode] = useState<'flat' | 'nested'>('nested')
  const [pastedContent, setPastedContent] = useState('')
  const [parsedData, setParsedData] = useState<any[]>([])
  const [isParsing, setIsParsing] = useState(false)
  const [parseError, setParseError] = useState<string | null>(null)
  const [isImporting, setIsImporting] = useState(false)
  const [importSuccess, setImportSuccess] = useState(false)

  // 解析 YAML/JSON 数据
  const parseContent = async (content: string, mode: 'flat' | 'nested') => {
    setIsParsing(true)
    setParseError(null)
    
    try {
      let data: any[] = []
      
      if (content.trim().startsWith('[') || content.trim().startsWith('{')) {
        data = JSON.parse(content)
        if (!Array.isArray(data)) data = [data]
      } else {
        data = simulateYamlParse(content)
      }
      
      setParsedData(data.map(item => ({ ...item, _import_mode: mode })))
      setCurrentStep(2)
    } catch (error) {
      setParseError(error instanceof Error ? error.message : '解析失败')
    } finally {
      setIsParsing(false)
    }
  }

  // 模拟 YAML 解析
  const simulateYamlParse = (content: string): any[] => {
    const lines = content.split('\n').filter(l => l.trim())
    const items: any[] = []
    let currentItem: any = {}
    
    for (const line of lines) {
      const trimmed = line.trim()
      if (trimmed.startsWith('- ')) {
        if (Object.keys(currentItem).length > 0) {
          items.push(currentItem)
        }
        currentItem = {}
        const match = trimmed.match(/- (\w+):\s*(.+)/)
        if (match) {
          currentItem[match[1]] = match[2]
        }
      } else if (trimmed.includes(':')) {
        const match = trimmed.match(/(\w+):\s*(.+)/)
        if (match) {
          currentItem[match[1]] = match[2]
        }
      }
    }
    
    if (Object.keys(currentItem).length > 0) {
      items.push(currentItem)
    }
    
    return items.length > 0 ? items : [
      { term: '示例词条1', content: '示例内容1' },
      { term: '示例词条2', content: '示例内容2' }
    ]
  }

  // 执行导入
  const handleImport = async () => {
    setIsImporting(true)
    try {
      await onImport(parsedData, dataMode)
      setImportSuccess(true)
    } catch (error) {
      setParseError(error instanceof Error ? error.message : '导入失败')
    } finally {
      setIsImporting(false)
    }
  }

  // 进入预览
  const handlePreview = () => {
    if (pastedContent) {
      parseContent(pastedContent, dataMode)
    }
  }

  // 获取当前模块的样本模板
  const getModuleTemplates = () => {
    const moduleId = backLink.split('/').pop() || 'vocabulary'
    return sampleTemplates[moduleId] || sampleTemplates.vocabulary
  }

  // 判断是否可以预览
  const canPreview = pastedContent.length > 0

  if (importSuccess) {
    return (
      <div className="max-w-3xl mx-auto space-y-6">
        <Card className="border-green-200 bg-green-50">
          <CardContent className="pt-6 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Check className="h-8 w-8 text-green-600" />
            </div>
            <h2 className="text-xl font-bold text-green-800 mb-2">导入成功！</h2>
            <p className="text-green-700 mb-4">
              成功导入 {parsedData.length} 条数据
            </p>
            <div className="flex justify-center gap-3">
              <Link to={backLink}>
                <Button variant="outline">返回列表</Button>
              </Link>
              <Button onClick={() => {
                setImportSuccess(false)
                setCurrentStep(1)
                setPastedContent('')
                setParsedData([])
                setInputMethod('paste')
              }}>
                继续导入
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-4 mb-2">
          <Link to={backLink}>
            <Button variant="ghost" size="sm">
              ← 返回
            </Button>
          </Link>
        </div>
        <h1 className="text-2xl font-bold">{title}</h1>
        <p className="text-muted-foreground">{description}</p>
      </div>

      {/* Progress */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span>进度</span>
          <span>{currentStep} / {steps.length}</span>
        </div>
        <Progress value={(currentStep / steps.length) * 100} className="h-2" />
        <div className="flex justify-between text-xs text-muted-foreground">
          {steps.map((step) => (
            <span key={step.id} className={currentStep >= step.id ? 'text-primary font-medium' : ''}>
              {step.title}
            </span>
          ))}
        </div>
      </div>

      {/* Step Content */}
      {currentStep === 1 && (
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>输入数据</CardTitle>
                <CardDescription>选择输入方式并粘贴或上传数据</CardDescription>
              </div>
              {/* 数据模式切换 - 紧凑形态 */}
              <ToggleGroup 
                type="single" 
                value={dataMode} 
                onValueChange={(v) => v && setDataMode(v as 'flat' | 'nested')}
                className="border rounded-lg p-1 bg-muted"
              >
                <ToggleGroupItem value="nested" aria-label="嵌套模式" className="text-xs px-3 py-1 h-auto data-[state=on]:bg-green-600 data-[state=on]:text-white">
                  <Layers className="h-3.5 w-3.5 mr-1.5" />
                  嵌套模式
                </ToggleGroupItem>
                <ToggleGroupItem value="flat" aria-label="Flat 模式" className="text-xs px-3 py-1 h-auto data-[state=on]:bg-blue-600 data-[state=on]:text-white">
                  <GitBranch className="h-3.5 w-3.5 mr-1.5" />
                  Flat 模式
                </ToggleGroupItem>
              </ToggleGroup>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* 输入方式选择 - Mini Tabs */}
            <div className="flex items-center gap-2 p-1 bg-muted rounded-lg w-fit">
              <button
                onClick={() => setInputMethod('paste')}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm transition-all ${
                  inputMethod === 'paste'
                    ? 'bg-background shadow-sm text-foreground font-medium'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <Code className="h-4 w-4" />
                文本粘贴
              </button>
              <button
                onClick={() => setInputMethod('file')}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm transition-all ${
                  inputMethod === 'file'
                    ? 'bg-background shadow-sm text-foreground font-medium'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <FileUp className="h-4 w-4" />
                文件上传
              </button>

            </div>

            <Separator />

            {/* 动态内容区域 */}
            {inputMethod === 'paste' && (
              <PasteInput 
                value={pastedContent} 
                onChange={setPastedContent} 
                dataMode={dataMode}
                templates={getModuleTemplates()}
                onLoadSample={(template) => {
                  setPastedContent(template.data)
                  setDataMode(template.mode)
                }}
              />
            )}

            {inputMethod === 'file' && (
              <FileInput 
                onContentLoaded={setPastedContent}
                content={pastedContent}
              />
            )}



            {/* 底部操作栏 */}
            <div className="flex items-center justify-between pt-4 border-t">
              <div className="text-sm text-muted-foreground">
                {dataMode === 'nested' ? (
                  <span className="flex items-center gap-1.5">
                    <Layers className="h-4 w-4 text-green-600" />
                    嵌套模式：使用缩进表示层级关系
                  </span>
                ) : (
                  <span className="flex items-center gap-1.5">
                    <GitBranch className="h-4 w-4 text-blue-600" />
                    Flat 模式：使用 parent_id 关联节点
                  </span>
                )}
              </div>
              <Button
                onClick={handlePreview}
                disabled={!canPreview || isParsing}
                size="lg"
              >
                {isParsing ? '解析中...' : '下一步'}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {currentStep === 2 && (
        <PreviewStep
          data={parsedData}
          dataMode={dataMode}
          isImporting={isImporting}
          onImport={handleImport}
          error={parseError}
          onBack={() => setCurrentStep(1)}
        />
      )}
    </div>
  )
}

// 文本粘贴输入
function PasteInput({ 
  value, 
  onChange, 
  dataMode,
  templates,
  onLoadSample
}: { 
  value: string
  onChange: (value: string) => void
  dataMode: 'flat' | 'nested'
  templates: ImportTemplate[]
  onLoadSample: (template: ImportTemplate) => void
}) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Label className="text-sm font-medium flex items-center gap-2">
          <Code className="h-4 w-4" />
          编辑数据
        </Label>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-xs">
            YAML / JSON
          </Badge>
          {/* 样本加载下拉菜单 */}
          <select
            className="text-xs border rounded px-2 py-1 bg-background cursor-pointer hover:border-primary transition-colors"
            value=""
            onChange={(e) => {
              const template = templates.find(t => t.id === e.target.value)
              if (template) onLoadSample(template)
              e.target.value = ""
            }}
          >
            <option value="">📚 加载样本...</option>
            {templates.map(t => (
              <option key={t.id} value={t.id}>
                {t.name} ({t.mode === 'nested' ? '嵌套' : 'Flat'})
              </option>
            ))}
          </select>
        </div>
      </div>
      <CodeEditor
        value={value}
        onChange={onChange}
        language="yaml"
        placeholder={dataMode === 'nested' 
          ? `# 嵌套模式示例：
- term: 日本語
  readings:
    - kana: にほんご
      senses:
        - pos: 名詞
          glosses:
            - 日语`
          : `# Flat 模式示例：
- id: 1
  node_type: TERM
  content: 日本語
- id: 2
  node_type: READING
  content: にほんご
  parent_id: 1`
        }
        minHeight={400}
      />
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>提示：支持 YAML 和 JSON 格式，使用 UTF-8 编码</span>
        {templates.length > 0 && (
          <span className="flex items-center gap-1">
            <BookOpen className="h-3 w-3" />
            提供 {templates.length} 个样本
          </span>
        )}
      </div>
    </div>
  )
}

// 文件上传输入
function FileInput({ 
  onContentLoaded,
  content
}: { 
  onContentLoaded: (content: string) => void
  content: string
}) {
  const [dragActive, setDragActive] = useState(false)
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    setDragActive(e.type === 'dragenter' || e.type === 'dragover')
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragActive(false)
    const file = e.dataTransfer.files[0]
    if (file) handleFile(file)
  }

  const handleFile = (file: File) => {
    setUploadedFile(file)
    const reader = new FileReader()
    reader.onload = (e) => {
      const text = e.target?.result as string
      onContentLoaded(text)
    }
    reader.readAsText(file)
  }

  return (
    <div className="space-y-4">
      {!uploadedFile ? (
        <div
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-lg p-10 text-center transition-colors ${
            dragActive ? 'border-primary bg-primary/5' : 'border-border'
          }`}
        >
          <Upload className="h-10 w-10 mx-auto mb-3 text-muted-foreground" />
          <p className="font-medium">拖拽文件到此处</p>
          <p className="text-sm text-muted-foreground mb-3">
            支持 .yaml, .yml, .json 格式
          </p>
          <input
            type="file"
            accept=".yaml,.yml,.json"
            onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
            className="hidden"
            id="file-upload"
          />
          <label htmlFor="file-upload">
            <Button variant="outline" size="sm" type="button">
              选择文件
            </Button>
          </label>
        </div>
      ) : (
        <div className="space-y-3">
          <Alert className="bg-green-50 border-green-200 py-2">
            <Check className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800 text-sm flex items-center justify-between">
              <span>已上传: {uploadedFile.name} ({Math.round(uploadedFile.size / 1024)} KB)</span>
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-auto py-1 text-green-700"
                onClick={() => {
                  setUploadedFile(null)
                  onContentLoaded('')
                }}
              >
                重新选择
              </Button>
            </AlertDescription>
          </Alert>
          {content && (
            <div className="space-y-2">
              <Label className="text-sm font-medium">文件内容</Label>
              <ScrollArea className="h-[300px] border rounded-md">
                <pre className="p-4 font-mono text-sm">{content}</pre>
              </ScrollArea>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// 预览确认步骤
function PreviewStep({
  data,
  dataMode,
  isImporting,
  onImport,
  error,
  onBack
}: {
  data: any[]
  dataMode: 'flat' | 'nested'
  isImporting: boolean
  onImport: () => void
  error: string | null
  onBack: () => void
}) {
  if (error) {
    return (
      <Card>
        <CardContent className="pt-6">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
          <div className="flex justify-center mt-4">
            <Button onClick={onBack} variant="outline">
              返回修改
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>预览确认</CardTitle>
            <CardDescription>检查数据无误后确认导入</CardDescription>
          </div>
          <Badge variant={dataMode === 'nested' ? 'default' : 'secondary'}>
            {dataMode === 'nested' ? '嵌套模式' : 'Flat 模式'}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert className="bg-green-50 border-green-200">
          <Check className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            成功解析 {data.length} 条数据
          </AlertDescription>
        </Alert>

        <div className="border rounded-lg">
          <div className="bg-muted px-4 py-2 border-b flex items-center justify-between">
            <span className="font-medium text-sm">数据预览</span>
            <Badge variant="outline" className="text-xs">
              <Eye className="h-3 w-3 mr-1" />
              共 {data.length} 条
            </Badge>
          </div>
          <ScrollArea className="h-[300px]">
            <div className="divide-y">
              {data.slice(0, 10).map((item, i) => (
                <div key={i} className="p-3 flex items-start gap-3">
                  <span className="text-muted-foreground text-sm w-6 shrink-0">{i + 1}</span>
                  <div className="flex-1 min-w-0">
                    <pre className="text-xs bg-muted p-2 rounded overflow-auto">
                      {JSON.stringify(item, null, 2).slice(0, 300)}
                      {JSON.stringify(item).length > 300 && '...'}
                    </pre>
                  </div>
                </div>
              ))}
              {data.length > 10 && (
                <div className="p-3 text-center text-sm text-muted-foreground">
                  ... 还有 {data.length - 10} 条数据
                </div>
              )}
            </div>
          </ScrollArea>
        </div>

        <Alert>
          <AlertDescription className="text-sm">
            确认导入后，系统将{dataMode === 'nested' ? '解析嵌套结构并转换为内部存储格式' : '根据 parent_id 建立节点层级关系'}。
          </AlertDescription>
        </Alert>

        <div className="flex justify-between pt-2">
          <Button variant="outline" onClick={onBack} disabled={isImporting}>
            返回修改
          </Button>
          <Button onClick={onImport} disabled={isImporting} size="lg">
            {isImporting ? '导入中...' : (
              <>
                <Play className="mr-2 h-4 w-4" />
                确认导入
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

export default UniversalImport
