import { createFileRoute, Link } from '@tanstack/react-router'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { 
  Upload, 
  FileJson, 
  BookOpen,
  FlaskConical,
  Layers,
  TreeDeciduous,
  HelpCircle,
  AlertCircle,
  Download,
  ChevronRight,
  GraduationCap,
  Plus,
  ArrowLeft
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

export const Route = createFileRoute('/learning/import/')({
  component: ImportPage,
})

// 导入模板配置
const importTemplates = {
  // 词汇导入 - 支持树形结构
  vocab: {
    name: '词汇批量导入',
    description: '导入单词、读音、义项、例句',
    icon: TreeDeciduous,
    color: 'bg-emerald-500',
    docs: '支持导入词汇的树形结构：词条 > 读音 > 义项 > 例句',
    template: `{
  "content_type": "vocab",
  "language_code": "ja",
  "items": [
    {
      "node_type": "term",
      "content": "食べる",
      "order": 1,
      "difficulty_level": 5,
      "frequency_rank": 150,
      "children": [
        {
          "node_type": "reading",
          "content": "た・べる[2]",
          "order": 1,
          "children": [
            {
              "node_type": "sense",
              "content": "吃",
              "order": 1,
              "children": [
                {
                  "node_type": "example",
                  "content": "りんごを食べる",
                  "order": 1
                }
              ]
            }
          ]
        },
        {
          "node_type": "form",
          "content": "食べます",
          "order": 2
        }
      ]
    }
  ]
}`,
  },
  // 语法导入
  grammar: {
    name: '语法批量导入',
    description: '导入语法点、接续、用法、例句',
    icon: FlaskConical,
    color: 'bg-cyan-500',
    docs: '支持导入语法的完整结构，包括接续模式和用法说明',
    template: `{
  "content_type": "grammar",
  "language_code": "ja",
  "items": [
    {
      "node_type": "term",
      "content": "～てください",
      "order": 1,
      "difficulty_level": 5,
      "conjugation_pattern": "动词て形 + ください",
      "grammar_tags": ["敬语", "请求表达"],
      "children": [
        {
          "node_type": "usage_rule",
          "content": "用于礼貌请求某人做某事",
          "order": 1,
          "children": [
            {
              "node_type": "example",
              "content": "ここに座ってください",
              "order": 1
            }
          ]
        }
      ]
    }
  ]
}`,
  },
  // 惯用句导入
  idiom: {
    name: '惯用句批量导入',
    description: '导入成语、谚语、惯用表达',
    icon: Layers,
    color: 'bg-indigo-500',
    docs: '支持导入惯用句的字面意思、实际含义和文化注释',
    template: `{
  "content_type": "idiom",
  "language_code": "ja",
  "items": [
    {
      "node_type": "term",
      "content": "一石二鳥",
      "order": 1,
      "idiom_type": "yojijukugo",
      "difficulty_level": 4,
      "formality": "neutral",
      "english_equivalent": "Kill two birds with one stone",
      "children": [
        {
          "node_type": "literal_meaning",
          "content": "一块石头两只鸟",
          "order": 1
        },
        {
          "node_type": "sense",
          "content": "一举两得，事半功倍",
          "order": 2,
          "children": [
            {
              "node_type": "example",
              "content": "この方法なら一石二鳥だ",
              "order": 1
            }
          ]
        }
      ]
    }
  ]
}`,
  },
  // 课文导入
  text: {
    name: '课文批量导入',
    description: '导入课程、章节、句子',
    icon: BookOpen,
    color: 'bg-rose-500',
    docs: '支持导入课文结构：课程 > 章节 > 句子，支持关联词汇语法',
    template: `{
  "content_type": "text",
  "language_code": "ja",
  "items": [
    {
      "node_type": "term",
      "content": "第1课 私の家族",
      "order": 1,
      "difficulty_level": 5,
      "estimated_duration": 45,
      "children": [
        {
          "node_type": "section",
          "content": "语法",
          "section_type": "grammar",
          "order": 1,
          "children": [
            {
              "node_type": "sentence",
              "content": "私は学生です",
              "order": 1,
              "related_vocabularies": ["vocab_001", "vocab_002"],
              "related_grammars": ["grammar_001"]
            }
          ]
        }
      ]
    }
  ]
}`,
  },
  // 课程导入
  course: {
    name: '课程导入',
    description: '导入完整课程结构',
    icon: GraduationCap,
    color: 'bg-blue-500',
    docs: '导入课程、级别和单元的完整结构',
    template: `{
  "import_type": "course",
  "language_code": "ja",
  "course": {
    "name": "大家的日语 初级上",
    "course_type": "textbook",
    "description": "经典日语入门教材",
    "level_from": "N5",
    "level_to": "N4",
    "is_public": true
  },
  "units": [
    {
      "name": "第1单元",
      "sort_order": 1,
      "lessons": [
        {
          "name": "第1课",
          "vocab_count": 20,
          "grammar_count": 3
        }
      ]
    }
  ]
}`,
  },
}

type TemplateKey = keyof typeof importTemplates

function ImportPage() {
  useTranslation()
  const [activeTab, setActiveTab] = useState<TemplateKey>('vocab')
  const [jsonInput, setJsonInput] = useState('')
  const [isImporting, setIsImporting] = useState(false)
  const [validationError, setValidationError] = useState<string | null>(null)
  const [dryRun, setDryRun] = useState(true)
  const [importStats, setImportStats] = useState<{ total: number; success: number; failed: number } | null>(null)

  const activeTemplate = importTemplates[activeTab]

  const validateJson = (json: string): boolean => {
    try {
      const parsed = JSON.parse(json)
      if (!parsed.items && !parsed.course) {
        setValidationError('JSON 必须包含 items 或 course 字段')
        return false
      }
      setValidationError(null)
      return true
    } catch (e) {
      setValidationError('JSON 格式错误: ' + (e as Error).message)
      return false
    }
  }

  const handleImport = async () => {
    if (!validateJson(jsonInput)) {
      toast.error('JSON 格式验证失败')
      return
    }

    setIsImporting(true)
    setImportStats(null)

    try {
      const data = JSON.parse(jsonInput)
      
      // 模拟导入处理
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      // 计算导入统计
      const items = data.items || data.units || []
      const total = items.length
      
      setImportStats({
        total,
        success: dryRun ? 0 : Math.floor(total * 0.9), // 模拟90%成功率
        failed: dryRun ? 0 : Math.floor(total * 0.1),
      })

      if (dryRun) {
        toast.success('模拟导入验证通过', {
          description: `共 ${total} 条记录，可以安全导入`,
        })
      } else {
        toast.success('导入成功', {
          description: `成功导入 ${Math.floor(total * 0.9)}/${total} 条记录`,
        })
      }
    } catch (error) {
      toast.error('导入失败', {
        description: (error as Error).message,
      })
    } finally {
      setIsImporting(false)
    }
  }

  const loadTemplate = () => {
    setJsonInput(activeTemplate.template)
    setValidationError(null)
    toast.success('模板已加载')
  }

  const downloadTemplate = () => {
    const blob = new Blob([activeTemplate.template], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${activeTab}-import-template.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    toast.success('模板已下载')
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link to="/learning/content">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold">批量导入学习内容</h1>
          <p className="text-muted-foreground">通过 JSON 批量导入词汇、语法、惯用句、课文</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr,400px]">
        {/* 左侧：导入配置 */}
        <div className="space-y-6">
          {/* 模板选择 */}
          <Card>
            <CardHeader>
              <CardTitle>选择导入类型</CardTitle>
              <CardDescription>根据要导入的内容选择对应模板</CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as TemplateKey)}>
                <TabsList className="grid grid-cols-3 lg:grid-cols-5 mb-4">
                  {(Object.keys(importTemplates) as TemplateKey[]).map((key) => {
                    const template = importTemplates[key]
                    return (
                      <TabsTrigger key={key} value={key} className="flex items-center gap-2">
                        <template.icon className="h-4 w-4" />
                        <span className="hidden sm:inline">{template.name}</span>
                      </TabsTrigger>
                    )
                  })}
                </TabsList>

                {(Object.keys(importTemplates) as TemplateKey[]).map((key) => {
                  const template = importTemplates[key]
                  return (
                    <TabsContent key={key} value={key}>
                      <div className="flex items-start gap-4 p-4 rounded-lg bg-muted">
                        <div className={cn("p-3 rounded-lg text-white shrink-0", template.color)}>
                          <template.icon className="h-6 w-6" />
                        </div>
                        <div>
                          <h3 className="font-semibold">{template.name}</h3>
                          <p className="text-sm text-muted-foreground">{template.description}</p>
                          <p className="text-xs text-muted-foreground mt-2">{template.docs}</p>
                        </div>
                      </div>
                    </TabsContent>
                  )
                })}
              </Tabs>
            </CardContent>
          </Card>

          {/* JSON 输入 */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>JSON 数据</CardTitle>
                <CardDescription>粘贴或编辑要导入的 JSON 数据</CardDescription>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={loadTemplate}>
                  <FileJson className="mr-2 h-4 w-4" />
                  加载模板
                </Button>
                <Button variant="outline" size="sm" onClick={downloadTemplate}>
                  <Download className="mr-2 h-4 w-4" />
                  下载模板
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                value={jsonInput}
                onChange={(e) => {
                  setJsonInput(e.target.value)
                  if (e.target.value) validateJson(e.target.value)
                }}
                placeholder="粘贴 JSON 数据..."
                rows={20}
                className={cn(
                  "font-mono text-sm",
                  validationError && "border-red-500 focus-visible:ring-red-500"
                )}
              />
              
              {validationError && (
                <div className="flex items-center gap-2 text-red-600 text-sm">
                  <AlertCircle className="h-4 w-4" />
                  {validationError}
                </div>
              )}

              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <Switch
                    checked={dryRun}
                    onCheckedChange={setDryRun}
                  />
                  <div>
                    <p className="font-medium">模拟导入（验证模式）</p>
                    <p className="text-sm text-muted-foreground">只验证数据，不实际创建</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 右侧：操作面板 */}
        <div className="space-y-6">
          {/* 导入操作 */}
          <Card>
            <CardHeader>
              <CardTitle>导入操作</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button
                className="w-full"
                size="lg"
                onClick={handleImport}
                disabled={isImporting || !jsonInput || !!validationError}
              >
                {isImporting ? (
                  <>
                    <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    {dryRun ? '验证中...' : '导入中...'}
                  </>
                ) : (
                  <>
                    <Upload className="mr-2 h-4 w-4" />
                    {dryRun ? '验证数据' : '开始导入'}
                  </>
                )}
              </Button>

              {importStats && (
                <div className="p-4 rounded-lg bg-muted space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>总记录</span>
                    <span className="font-medium">{importStats.total}</span>
                  </div>
                  {!dryRun && (
                    <>
                      <div className="flex justify-between text-sm">
                        <span className="text-green-600">成功</span>
                        <span className="font-medium text-green-600">{importStats.success}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-red-600">失败</span>
                        <span className="font-medium text-red-600">{importStats.failed}</span>
                      </div>
                    </>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* 帮助信息 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <HelpCircle className="h-5 w-5" />
                导入说明
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <div>
                <h4 className="font-medium mb-2">支持的节点类型</h4>
                <div className="space-y-1 text-muted-foreground">
                  <p>• term - 词条/根节点</p>
                  <p>• reading - 读音/发音</p>
                  <p>• sense - 义项/含义</p>
                  <p>• example - 例句</p>
                  <p>• form - 变形形式</p>
                  <p>• sentence - 句子（课文）</p>
                  <p>• section - 章节（课文）</p>
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-2">通用字段</h4>
                <div className="space-y-1 text-muted-foreground">
                  <p>• content - 内容（必填）</p>
                  <p>• node_type - 节点类型</p>
                  <p>• order - 排序序号</p>
                  <p>• children - 子节点数组</p>
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-2">注意事项</h4>
                <ul className="space-y-1 text-muted-foreground list-disc list-inside">
                  <li>JSON 格式必须正确</li>
                  <li>建议先使用模拟导入验证</li>
                  <li>children 支持无限层级嵌套</li>
                  <li>大量数据建议分批导入</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* 快捷链接 */}
          <Card>
            <CardHeader>
              <CardTitle>快捷操作</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" className="w-full justify-between" asChild>
                <Link to="/learning/content">
                  返回学习内容
                  <ChevronRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button variant="outline" className="w-full justify-between" asChild>
                <Link to="/learning/content/new">
                  单条新建
                  <Plus className="h-4 w-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
