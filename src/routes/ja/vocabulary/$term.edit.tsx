import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { ArrowLeft, Save, Plus, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useState } from 'react'

export const Route = createFileRoute('/ja/vocabulary/$term/edit')({
  component: EditVocabularyPage,
})

// 模拟数据
const mockVocabData: Record<string, any> = {
  '食べる': {
    term: '食べる',
    level: 'N5',
    readings: [
      {
        kana: 'たべる',
        accent: '②',
        isPrimary: true,
        senses: [
          { type: 'general', gloss: '吃，食' },
          { type: 'figurative', gloss: '生活，生存' },
        ]
      }
    ],
    forms: ['食べます', '食べて', '食べた'],
    contentJson: {
      pos: 'verb',
      common: true,
    }
  },
  '日': {
    term: '日',
    level: 'N5',
    readings: [
      {
        kana: 'にち',
        accent: '①',
        isPrimary: true,
        senses: [{ type: 'general', gloss: '太阳，日' }]
      },
      {
        kana: 'ひ',
        accent: '⓪',
        isPrimary: false,
        senses: [{ type: 'general', gloss: '太阳，阳光' }]
      },
      {
        kana: 'か',
        accent: '',
        isPrimary: false,
        senses: [{ type: 'specific', gloss: '日期，天数' }]
      },
    ],
    forms: [],
    contentJson: {
      pos: 'noun',
      common: true,
    }
  },
}

function EditVocabularyPage() {
  const { term } = Route.useParams()
  const navigate = useNavigate()
  
  // 获取词汇数据，如果不存在使用默认值
  const vocab = mockVocabData[term] || {
    term: term,
    level: 'N5',
    readings: [{ kana: '', accent: '', isPrimary: true, senses: [{ type: 'general', gloss: '' }] }],
    forms: [],
    contentJson: { pos: '', common: true }
  }

  const [formData, setFormData] = useState(vocab)

  const handleSave = () => {
    // TODO: 调用 API 保存数据
    console.log('保存词汇:', formData)
    navigate({ to: '/ja/vocabulary' })
  }

  const handleAddReading = () => {
    setFormData({
      ...formData,
      readings: [
        ...formData.readings,
        { kana: '', accent: '', isPrimary: false, senses: [{ type: 'general', gloss: '' }] }
      ]
    })
  }

  const handleRemoveReading = (index: number) => {
    const newReadings = formData.readings.filter((_: any, i: number) => i !== index)
    setFormData({ ...formData, readings: newReadings })
  }

  const handleReadingChange = (index: number, field: string, value: string) => {
    const newReadings = [...formData.readings]
    newReadings[index] = { ...newReadings[index], [field]: value }
    setFormData({ ...formData, readings: newReadings })
  }

  const handleSenseChange = (readingIndex: number, senseIndex: number, field: string, value: string) => {
    const newReadings = [...formData.readings]
    const newSenses = [...newReadings[readingIndex].senses]
    newSenses[senseIndex] = { ...newSenses[senseIndex], [field]: value }
    newReadings[readingIndex] = { ...newReadings[readingIndex], senses: newSenses }
    setFormData({ ...formData, readings: newReadings })
  }

  const handleAddSense = (readingIndex: number) => {
    const newReadings = [...formData.readings]
    newReadings[readingIndex].senses.push({ type: 'general', gloss: '' })
    setFormData({ ...formData, readings: newReadings })
  }

  const handleRemoveSense = (readingIndex: number, senseIndex: number) => {
    const newReadings = [...formData.readings]
    newReadings[readingIndex].senses = newReadings[readingIndex].senses.filter((_: any, i: number) => i !== senseIndex)
    setFormData({ ...formData, readings: newReadings })
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link to="/ja/vocabulary">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold">编辑词汇</h1>
            <p className="text-sm text-muted-foreground">{term}</p>
          </div>
        </div>
        <Button onClick={handleSave}>
          <Save className="mr-2 h-4 w-4" />
          保存
        </Button>
      </div>

      <Tabs defaultValue="basic" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="basic">基本信息</TabsTrigger>
          <TabsTrigger value="readings">读音与释义</TabsTrigger>
          <TabsTrigger value="advanced">高级设置</TabsTrigger>
        </TabsList>

        {/* 基本信息 */}
        <TabsContent value="basic" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>词条信息</CardTitle>
              <CardDescription>编辑词汇的基本信息</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="term">词条</Label>
                  <Input
                    id="term"
                    value={formData.term}
                    onChange={(e) => setFormData({ ...formData, term: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="level">JLPT 等级</Label>
                  <Input
                    id="level"
                    value={formData.level}
                    onChange={(e) => setFormData({ ...formData, level: e.target.value })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="pos">词性</Label>
                <Input
                  id="pos"
                  value={formData.contentJson?.pos || ''}
                  onChange={(e) => setFormData({
                    ...formData,
                    contentJson: { ...formData.contentJson, pos: e.target.value }
                  })}
                  placeholder="如：verb, noun, adjective"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 读音与释义 */}
        <TabsContent value="readings" className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium">读音列表</h3>
            <Button variant="outline" size="sm" onClick={handleAddReading}>
              <Plus className="mr-2 h-4 w-4" />
              添加读音
            </Button>
          </div>

          {formData.readings.map((reading: any, readingIndex: number) => (
            <Card key={readingIndex} className={reading.isPrimary ? 'border-primary' : ''}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CardTitle className="text-base">读音 {readingIndex + 1}</CardTitle>
                    {reading.isPrimary && (
                      <Badge variant="default">主要</Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {!reading.isPrimary && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          const newReadings = formData.readings.map((r: any, i: number) => ({
                            ...r,
                            isPrimary: i === readingIndex
                          }))
                          setFormData({ ...formData, readings: newReadings })
                        }}
                      >
                        设为主要
                      </Button>
                    )}
                    {formData.readings.length > 1 && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive"
                        onClick={() => handleRemoveReading(readingIndex)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>假名</Label>
                    <Input
                      value={reading.kana}
                      onChange={(e) => handleReadingChange(readingIndex, 'kana', e.target.value)}
                      placeholder="如：たべる"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>声调</Label>
                    <Input
                      value={reading.accent}
                      onChange={(e) => handleReadingChange(readingIndex, 'accent', e.target.value)}
                      placeholder="如：②"
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label>释义</Label>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleAddSense(readingIndex)}
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      添加释义
                    </Button>
                  </div>
                  {reading.senses.map((sense: any, senseIndex: number) => (
                    <div key={senseIndex} className="flex gap-2 items-start">
                      <Badge variant="outline" className="mt-2">{senseIndex + 1}</Badge>
                      <div className="flex-1 grid grid-cols-2 gap-2">
                        <Input
                          value={sense.type}
                          onChange={(e) => handleSenseChange(readingIndex, senseIndex, 'type', e.target.value)}
                          placeholder="类型"
                        />
                        <Input
                          value={sense.gloss}
                          onChange={(e) => handleSenseChange(readingIndex, senseIndex, 'gloss', e.target.value)}
                          placeholder="释义"
                        />
                      </div>
                      {reading.senses.length > 1 && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive"
                          onClick={() => handleRemoveSense(readingIndex, senseIndex)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        {/* 高级设置 */}
        <TabsContent value="advanced" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>词形变化</CardTitle>
              <CardDescription>编辑动词的活用形或形容词的变化</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-2">
                {formData.forms.map((form: string, index: number) => (
                  <Badge key={index} variant="secondary" className="px-3 py-1">
                    {form}
                  </Badge>
                ))}
              </div>
              <div className="flex gap-2">
                <Input placeholder="添加新的活用形..." />
                <Button variant="outline">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>元数据</CardTitle>
              <CardDescription>词汇的附加信息</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="common"
                  checked={formData.contentJson?.common}
                  onChange={(e) => setFormData({
                    ...formData,
                    contentJson: { ...formData.contentJson, common: e.target.checked }
                  })}
                  className="rounded border-gray-300"
                />
                <Label htmlFor="common">常用词汇</Label>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
