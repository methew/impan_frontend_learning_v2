import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { Plus, Upload, Search, Filter, ChevronRight, Pencil } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

export const Route = createFileRoute('/ja/vocabulary/')({
  component: JapaneseVocabularyPage,
})

// 模拟扁平化结构数据
const mockVocabData = [
  {
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
    lastReviewed: '2小时前',
  },
  {
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
    lastReviewed: '昨天',
  },
  {
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
    lastReviewed: '3天前',
  },
]

function JapaneseVocabularyPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">日语词汇</h1>
          <p className="text-sm text-muted-foreground">Japanese Vocabulary · JLPT N5-N1</p>
        </div>
        <div className="flex gap-2">
          <Link to="/ja/vocabulary/import">
            <Button variant="outline">
              <Upload className="mr-2 h-4 w-4" />
              导入
            </Button>
          </Link>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            添加
          </Button>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="搜索词汇、假名、释义..." className="pl-10" />
        </div>
        <Button variant="outline">
          <Filter className="mr-2 h-4 w-4" />
          筛选
        </Button>
      </div>

      {/* Level Tabs */}
      <Tabs defaultValue="n5">
        <TabsList>
          <TabsTrigger value="n5">N5 ({mockVocabData.length})</TabsTrigger>
          <TabsTrigger value="n4">N4</TabsTrigger>
          <TabsTrigger value="n3">N3</TabsTrigger>
          <TabsTrigger value="n2">N2</TabsTrigger>
          <TabsTrigger value="n1">N1</TabsTrigger>
        </TabsList>
        
        <TabsContent value="n5" className="mt-4 space-y-4">
          {mockVocabData.map((item) => (
            <VocabCard key={item.term} data={item} />
          ))}
        </TabsContent>
        
        <TabsContent value="n4">
          <p className="text-muted-foreground text-center py-8">暂无N4词汇</p>
        </TabsContent>
      </Tabs>
    </div>
  )
}

function VocabCard({ data }: { data: typeof mockVocabData[0] }) {
  const primaryReading = data.readings.find(r => r.isPrimary) || data.readings[0]
  const otherReadings = data.readings.filter(r => !r.isPrimary)
  const navigate = useNavigate()

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation()
    navigate({ to: `/ja/vocabulary/${data.term}/edit` as any })
  }

  return (
    <Card 
      className="hover:shadow-md transition-shadow cursor-pointer group"
      onClick={() => navigate({ to: `/ja/vocabulary/${data.term}` as any })}
    >
      <CardContent className="p-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 space-y-3">
              {/* Term & Primary Reading */}
              <div className="flex items-baseline gap-4">
                <h3 className="text-xl font-bold">{data.term}</h3>
                <div className="flex items-baseline gap-2">
                  <ruby className="text-lg">
                    {data.term}
                    <rt className="text-sm text-muted-foreground">{primaryReading.kana}</rt>
                  </ruby>
                  {primaryReading.accent && (
                    <span className="text-sm text-muted-foreground">[{primaryReading.accent}]</span>
                  )}
                </div>
                <Badge variant="secondary">{data.level}</Badge>
              </div>

              {/* Other Readings (多音字) */}
              {otherReadings.length > 0 && (
                <div className="flex gap-2 text-sm">
                  <span className="text-muted-foreground">其他读音:</span>
                  {otherReadings.map((r, i) => (
                    <span key={i} className="text-muted-foreground">
                      {r.kana}
                    </span>
                  ))}
                </div>
              )}

              {/* Senses */}
              <div className="space-y-1">
                {primaryReading.senses.slice(0, 2).map((sense, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm">
                    <span className="text-muted-foreground">{i + 1}.</span>
                    <Badge variant="outline" className="text-xs">
                      {sense.type}
                    </Badge>
                    <span>{sense.gloss}</span>
                  </div>
                ))}
              </div>

              {/* Forms */}
              {data.forms.length > 0 && (
                <div className="flex gap-2 text-sm">
                  <span className="text-muted-foreground">活用:</span>
                  {data.forms.map((form, i) => (
                    <Badge key={i} variant="secondary" className="text-xs">
                      {form}
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            {/* Right Side Actions */}
            <div className="flex flex-col items-end gap-2">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={handleEdit}
                title="编辑词汇"
              >
                <Pencil className="h-4 w-4" />
              </Button>
              <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
              <span className="text-xs text-muted-foreground">{data.lastReviewed}</span>
            </div>
          </div>
        </CardContent>
      </Card>
  )
}
