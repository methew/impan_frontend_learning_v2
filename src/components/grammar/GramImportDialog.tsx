import { useState, useCallback } from 'react'
import { 
  Upload, 
  FileJson, 
  FileSpreadsheet, 
  Loader2,
  CheckCircle,
  AlertCircle,
  X
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import * as api from '@/api/learning'

interface GramImportDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onImportComplete: () => void
}

interface ImportItem {
  term: string
  conjugation?: string
  conjugation_pattern?: string
  meaning?: string
  usage?: string
  level?: number
  examples?: Array<{
    sentence: string
    translation: string
  }>
}

interface ImportResult {
  success: number
  failed: number
  errors: string[]
}

// 解析JSON
function parseJSON(text: string): ImportItem[] {
  const data = JSON.parse(text)
  if (Array.isArray(data)) {
    return data
  }
  if (data.grammar || data.data || data.items) {
    return data.grammar || data.data || data.items
  }
  return [data]
}

// 解析CSV/TSV
function parseCSV(text: string): ImportItem[] {
  const lines = text.trim().split('\n')
  if (lines.length < 2) return []
  
  const firstLine = lines[0]
  const delimiter = firstLine.includes('\t') ? '\t' : ','
  
  const headers = firstLine.split(delimiter).map(h => h.trim().replace(/^"|"$/g, ''))
  const items: ImportItem[] = []
  
  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(delimiter).map(v => v.trim().replace(/^"|"$/g, ''))
    const item: ImportItem = { term: '' }
    
    headers.forEach((header, index) => {
      const value = values[index] || ''
      switch (header.toLowerCase()) {
        case 'term':
        case 'grammar':
        case '语法':
          item.term = value
          break
        case 'conjugation':
        case 'conjugation_pattern':
        case '接续':
          item.conjugation = value
          break
        case 'meaning':
        case 'meaning':
        case '意思':
        case '含义':
          item.meaning = value
          break
        case 'usage':
        case '用法':
          item.usage = value
          break
        case 'level':
        case '级别':
        case '难度':
          item.level = parseInt(value) || 5
          break
      }
    })
    
    if (item.term) {
      items.push(item)
    }
  }
  
  return items
}

export function GramImportDialog({
  open,
  onOpenChange,
  onImportComplete,
}: GramImportDialogProps) {
  const [activeTab, setActiveTab] = useState('json')
  const [jsonText, setJsonText] = useState('')
  const [csvText, setCsvText] = useState('')
  const [isImporting, setIsImporting] = useState(false)
  const [result, setResult] = useState<ImportResult | null>(null)
  const [dragActive, setDragActive] = useState(false)

  const handleFileUpload = useCallback((file: File) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      const text = e.target?.result as string
      if (file.name.endsWith('.json')) {
        setActiveTab('json')
        setJsonText(text)
      } else if (file.name.endsWith('.csv') || file.name.endsWith('.tsv')) {
        setActiveTab('csv')
        setCsvText(text)
      }
    }
    reader.readAsText(file)
  }, [])

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0])
    }
  }, [handleFileUpload])

  async function createGramTree(item: ImportItem): Promise<void> {
    const termNode = await api.createGramNode({
      content: item.term,
      node_type: 'term',
      difficulty_level: item.level || 5,
      conjugation_pattern: item.conjugation || item.conjugation_pattern || '',
      parent: null,
      sort_order: 0,
      is_active: true,
    })

    if (item.usage) {
      const usageNode = await api.createGramNode({
        content: item.usage,
        node_type: 'usage_rule',
        parent: termNode.id,
        sort_order: 0,
        is_active: true,
      })

      if (item.meaning) {
        await api.createGramNode({
          content: item.meaning,
          node_type: 'sense',
          parent: usageNode.id,
          sort_order: 0,
          is_active: true,
        })
      }

      if (item.examples && item.examples.length > 0) {
        for (const ex of item.examples) {
          const exampleNode = await api.createGramNode({
            content: ex.sentence,
            node_type: 'example',
            parent: usageNode.id,
            sort_order: 0,
            is_active: true,
          })

          if (ex.translation) {
            await api.createGramNode({
              content: ex.translation,
              node_type: 'translation',
              parent: exampleNode.id,
              sort_order: 0,
              is_active: true,
            })
          }
        }
      }
    }
  }

  const handleImport = async () => {
    let items: ImportItem[] = []
    
    try {
      if (activeTab === 'json') {
        items = parseJSON(jsonText)
      } else {
        items = parseCSV(csvText)
      }
    } catch (error: any) {
      toast.error('解析失败', { description: error.message })
      return
    }

    if (items.length === 0) {
      toast.error('没有可导入的数据')
      return
    }

    setIsImporting(true)
    setResult(null)

    const importResult: ImportResult = {
      success: 0,
      failed: 0,
      errors: [],
    }

    for (let i = 0; i < items.length; i++) {
      const item = items[i]
      try {
        await createGramTree(item)
        importResult.success++
      } catch (error: any) {
        importResult.failed++
        importResult.errors.push(`${item.term}: ${error.message}`)
      }
      
      if ((i + 1) % 10 === 0) {
        toast.info(`导入进度: ${i + 1}/${items.length}`)
      }
    }

    setResult(importResult)
    setIsImporting(false)

    if (importResult.failed === 0) {
      toast.success(`成功导入 ${importResult.success} 个语法`)
      onImportComplete()
    } else {
      toast.warning(`导入完成: ${importResult.success} 成功, ${importResult.failed} 失败`)
    }
  }

  const handleClose = () => {
    setJsonText('')
    setCsvText('')
    setResult(null)
    onOpenChange(false)
  }

  const jsonExample = `[\n  {\n    "term": "～てください",\n    "conjugation": "动词て形 + ください",\n    "usage": "用于礼貌请求某人做某事",\n    "level": 5,\n    "examples": [\n      { "sentence": "ここに座ってください", "translation": "请坐这里" },\n      { "sentence": "水をください", "translation": "请给我水" }\n    ]\n  },\n  {\n    "term": "～てもいい",\n    "conjugation": "动词て形 + もいい",\n    "usage": "表示许可，可以做某事",\n    "level": 5,\n    "examples": [\n      { "sentence": "ここで写真を撮ってもいいですか", "translation": "可以在这里拍照吗" }\n    ]\n  }\n]`

  const csvExample = `term,conjugation,usage,level
～てください,动词て形 + ください,用于礼貌请求某人做某事,5
～てもいい,动词て形 + もいい,表示许可，可以做某事,5
～なければならない,动词ない形 + ければならない,表示必须做某事,4`

  const sampleData = [
    {
      term: "～てください",
      conjugation: "动词て形 + ください",
      usage: "用于礼貌请求某人做某事",
      level: 5,
      examples: [
        { sentence: "ここに座ってください", translation: "请坐这里" },
        { sentence: "水をください", translation: "请给我水" },
      ]
    },
    {
      term: "～てもいい",
      conjugation: "动词て形 + もいい",
      usage: "表示许可，可以做某事",
      level: 5,
      examples: [
        { sentence: "ここで写真を撮ってもいいですか", translation: "可以在这里拍照吗" },
      ]
    },
  ]

  const downloadSample = (format: 'json' | 'csv') => {
    let content: string
    let filename: string
    let mimeType: string

    if (format === 'json') {
      content = JSON.stringify(sampleData, null, 2)
      filename = 'grammar_sample.json'
      mimeType = 'application/json'
    } else {
      const headers = 'term,conjugation,usage,level\n'
      const rows = sampleData.map(item => 
        `${item.term},${item.conjugation},${item.usage},${item.level}`
      ).join('\n')
      content = headers + rows
      filename = 'grammar_sample.csv'
      mimeType = 'text/csv'
    }

    const blob = new Blob([content], { type: mimeType })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    
    toast.success(`已下载示例文件: ${filename}`)
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <div className="flex items-start justify-between">
            <div>
              <DialogTitle className="flex items-center gap-2">
                <Upload className="h-5 w-5" />
                批量导入语法
              </DialogTitle>
              <DialogDescription className="mt-1.5">
                支持 JSON 或 CSV/TSV 格式批量导入语法数据
              </DialogDescription>
            </div>
            <div className="flex gap-1">
              <Button
                variant="outline"
                size="sm"
                className="h-8 text-xs"
                onClick={() => downloadSample('json')}
              >
                <FileJson className="h-3.5 w-3.5 mr-1" />
                下载JSON示例
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="h-8 text-xs"
                onClick={() => downloadSample('csv')}
              >
                <FileSpreadsheet className="h-3.5 w-3.5 mr-1" />
                下载CSV示例
              </Button>
            </div>
          </div>
        </DialogHeader>

        <div
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          className={cn(
            "border-2 border-dashed rounded-lg p-6 text-center transition-colors",
            dragActive 
              ? "border-primary bg-primary/5" 
              : "border-muted-foreground/20 hover:border-muted-foreground/40"
          )}
        >
          <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">
            拖放文件到此处，或
            <label className="text-primary cursor-pointer hover:underline mx-1">
              点击选择
              <input
                type="file"
                accept=".json,.csv,.tsv"
                className="hidden"
                onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0])}
              />
            </label>
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            支持 .json, .csv, .tsv 格式
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 overflow-hidden flex flex-col">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="json" className="flex items-center gap-2">
              <FileJson className="h-4 w-4" />
              JSON
            </TabsTrigger>
            <TabsTrigger value="csv" className="flex items-center gap-2">
              <FileSpreadsheet className="h-4 w-4" />
              CSV/TSV
            </TabsTrigger>
          </TabsList>

          <TabsContent value="json" className="flex-1 flex flex-col gap-2 mt-2">
            <Textarea
              value={jsonText}
              onChange={(e) => setJsonText(e.target.value)}
              placeholder={jsonExample}
              className="flex-1 font-mono text-xs min-h-[200px]"
            />
            <p className="text-xs text-muted-foreground">
              支持数组格式，每个对象包含 term, conjugation, usage, level, examples 字段
            </p>
          </TabsContent>

          <TabsContent value="csv" className="flex-1 flex flex-col gap-2 mt-2">
            <Textarea
              value={csvText}
              onChange={(e) => setCsvText(e.target.value)}
              placeholder={csvExample}
              className="flex-1 font-mono text-xs min-h-[200px]"
            />
            <p className="text-xs text-muted-foreground">
              支持 CSV/TSV 格式，第一行为表头，列名: term, conjugation, usage, level
            </p>
          </TabsContent>
        </Tabs>

        {result && (
          <Card className={cn(
            "border",
            result.failed === 0 ? 'border-green-500 bg-green-50' : 'border-yellow-500 bg-yellow-50'
          )}>
            <CardContent className="p-3">
              <div className="flex items-start gap-2">
                {result.failed === 0 ? (
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                ) : (
                  <AlertCircle className="h-4 w-4 text-yellow-500 mt-0.5" />
                )}
                <div className="flex-1 text-sm">
                  <div className="font-medium">
                    导入完成: {result.success} 成功, {result.failed} 失败
                  </div>
                  {result.errors.length > 0 && (
                    <div className="mt-2 max-h-24 overflow-y-auto text-xs text-muted-foreground">
                      {result.errors.slice(0, 5).map((err, i) => (
                        <div key={i} className="text-red-500">{err}</div>
                      ))}
                      {result.errors.length > 5 && (
                        <div className="text-muted-foreground">
                          ...还有 {result.errors.length - 5} 条错误
                        </div>
                      )}
                    </div>
                  )}
                </div>
                <button onClick={() => setResult(null)} className="text-muted-foreground hover:text-foreground">
                  <X className="h-4 w-4" />
                </button>
              </div>
            </CardContent>
          </Card>
        )}

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={handleClose} disabled={isImporting}>
            取消
          </Button>
          <Button 
            onClick={handleImport} 
            disabled={isImporting || (!jsonText && !csvText)}
          >
            {isImporting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isImporting ? '导入中...' : '开始导入'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
