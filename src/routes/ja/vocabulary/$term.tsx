import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { ArrowLeft, Pencil, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

export const Route = createFileRoute('/ja/vocabulary/$term')({
  component: VocabularyDetailPage,
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
    examples: [
      { sentence: 'りんごを食べる', translation: '吃苹果' },
      { sentence: '朝ご飯を食べました', translation: '吃了早饭' },
    ]
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
    examples: [
      { sentence: '毎日', translation: '每天' },
      { sentence: '日が昇る', translation: '太阳升起' },
      { sentence: '三日', translation: '三日，三号' },
    ]
  },
  '忙しい': {
    term: '忙しい',
    level: 'N5',
    readings: [
      {
        kana: 'いそがしい',
        accent: '④',
        isPrimary: true,
        senses: [
          { type: 'general', gloss: '忙碌的，繁忙的' },
          { type: 'figurative', gloss: '匆忙的' },
        ]
      }
    ],
    forms: ['忙しく', '忙しさ'],
    examples: [
      { sentence: '忙しい一日', translation: '忙碌的一天' },
    ]
  },
}

function VocabularyDetailPage() {
  const { term } = Route.useParams()
  const navigate = useNavigate()
  
  const vocab = mockVocabData[term] || {
    term: term,
    level: 'N5',
    readings: [],
    forms: [],
    examples: []
  }

  const primaryReading = vocab.readings.find((r: any) => r.isPrimary) || vocab.readings[0]

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
            <h1 className="text-2xl font-bold">{vocab.term}</h1>
            <p className="text-sm text-muted-foreground">
              {primaryReading?.kana} · JLPT {vocab.level}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => navigate({ to: `/ja/vocabulary/${term}/edit` as any })}>
            <Pencil className="mr-2 h-4 w-4" />
            编辑
          </Button>
          <Button variant="destructive">
            <Trash2 className="mr-2 h-4 w-4" />
            删除
          </Button>
        </div>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">概览</TabsTrigger>
          <TabsTrigger value="readings">读音</TabsTrigger>
          <TabsTrigger value="examples">例句</TabsTrigger>
        </TabsList>

        {/* 概览 */}
        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>基本信息</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-baseline gap-4">
                <span className="text-4xl font-bold">{vocab.term}</span>
                <Badge variant="secondary">{vocab.level}</Badge>
              </div>
              
              {primaryReading && (
                <div className="space-y-2">
                  <p className="text-lg text-muted-foreground">
                    {primaryReading.kana}
                    {primaryReading.accent && ` [${primaryReading.accent}]`}
                  </p>
                  <div className="space-y-1">
                    {primaryReading.senses.map((sense: any, i: number) => (
                      <p key={i} className="text-muted-foreground">
                        {i + 1}. {sense.gloss}
                      </p>
                    ))}
                  </div>
                </div>
              )}

              {vocab.forms.length > 0 && (
                <div className="pt-4 border-t">
                  <p className="text-sm text-muted-foreground mb-2">活用形</p>
                  <div className="flex gap-2">
                    {vocab.forms.map((form: string, i: number) => (
                      <Badge key={i} variant="outline">{form}</Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* 读音 */}
        <TabsContent value="readings" className="space-y-4">
          {vocab.readings.map((reading: any, index: number) => (
            <Card key={index} className={reading.isPrimary ? 'border-primary' : ''}>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <CardTitle className="text-xl">{reading.kana}</CardTitle>
                  {reading.accent && (
                    <Badge variant="outline">[{reading.accent}]</Badge>
                  )}
                  {reading.isPrimary && (
                    <Badge>主要读音</Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {reading.senses.map((sense: any, i: number) => (
                    <div key={i} className="flex items-center gap-2">
                      <span className="text-muted-foreground">{i + 1}.</span>
                      <Badge variant="outline" className="text-xs">{sense.type}</Badge>
                      <span>{sense.gloss}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        {/* 例句 */}
        <TabsContent value="examples" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>例句</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {vocab.examples.map((example: any, index: number) => (
                <div key={index} className="pb-4 border-b last:border-0 last:pb-0">
                  <p className="text-lg font-medium">{example.sentence}</p>
                  <p className="text-muted-foreground">{example.translation}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
