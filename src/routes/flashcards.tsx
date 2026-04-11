import { createFileRoute, Link } from '@tanstack/react-router'
import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { 
  BookOpen, 
  Play, 
  Settings, 
  RotateCcw, 
  TrendingUp,
  Clock,
  ChevronRight,
  Filter
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { FlashcardSession } from '@/components/learning/FlashcardSession'
import { FlashcardData } from '@/components/learning/Flashcard'

// Mock data for demo - will be replaced with API call
const mockFlashcards: FlashcardData[] = [
  {
    id: '1',
    front: '日',
    back: 'にち/ひ/か',
    reading: 'nichi/hi/ka',
    meaning: '太阳/白天/日期',
    example: '日の出（ひので）',
    exampleTranslation: '日出',
    level: 'N5',
    tags: ['基础', '时间'],
  },
  {
    id: '2',
    front: '月',
    back: 'つき/げつ',
    reading: 'tsuki/getsu',
    meaning: '月亮/月份',
    example: '月が綺麗ですね（つきがきれいですね）',
    exampleTranslation: '月亮真美啊',
    level: 'N5',
    tags: ['基础', '时间'],
  },
  {
    id: '3',
    front: '火',
    back: 'ひ/か',
    reading: 'hi/ka',
    meaning: '火/星期二',
    example: '火を消す（ひをけす）',
    exampleTranslation: '灭火',
    level: 'N5',
    tags: ['基础', '自然'],
  },
  {
    id: '4',
    front: '水',
    back: 'みず/すい',
    reading: 'mizu/sui',
    meaning: '水/星期三',
    example: '水を飲む（みずをのむ）',
    exampleTranslation: '喝水',
    level: 'N5',
    tags: ['基础', '自然'],
  },
  {
    id: '5',
    front: '木',
    back: 'き/もく',
    reading: 'ki/moku',
    meaning: '树/星期四',
    example: '木の上（きのうえ）',
    exampleTranslation: '树上',
    level: 'N5',
    tags: ['基础', '自然'],
  },
]

function FlashcardsPage() {
  const [isStudying, setIsStudying] = useState(false)
  const [selectedLevel, setSelectedLevel] = useState<string>('all')
  const [selectedTags, setSelectedTags] = useState<string[]>([])

  // Filter cards based on selection
  const filteredCards = mockFlashcards.filter((card) => {
    if (selectedLevel !== 'all' && card.level !== selectedLevel) return false
    if (selectedTags.length > 0 && !card.tags?.some((tag) => selectedTags.includes(tag))) return false
    return true
  })

  // Calculate stats
  const totalCards = mockFlashcards.length
  const studiedCards = 15 // Mock: would come from user progress
  const masteredCards = 8 // Mock: would come from user progress

  if (isStudying) {
    return (
      <FlashcardSession
        cards={filteredCards}
        sessionTitle="日语词汇 - N5"
        onComplete={(stats) => {
          console.log('Session completed:', stats)
          setIsStudying(false)
        }}
        onExit={() => setIsStudying(false)}
      />
    )
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <BookOpen className="h-8 w-8" />
            闪卡学习
          </h1>
          <p className="text-muted-foreground mt-1">
            使用间隔重复系统高效记忆
          </p>
        </div>
        <Button variant="outline">
          <Settings className="mr-2 h-4 w-4" />
          学习设置
        </Button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">总卡片数</p>
                <p className="text-3xl font-bold">{totalCards}</p>
              </div>
              <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center">
                <BookOpen className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">已学习</p>
                <p className="text-3xl font-bold">{studiedCards}</p>
              </div>
              <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">已掌握</p>
                <p className="text-3xl font-bold">{masteredCards}</p>
              </div>
              <div className="h-12 w-12 bg-purple-100 rounded-full flex items-center justify-center">
                <RotateCcw className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Study Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Filters */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Filter className="h-5 w-5" />
              筛选
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">级别</label>
              <Select value={selectedLevel} onValueChange={setSelectedLevel}>
                <SelectTrigger>
                  <SelectValue placeholder="选择级别" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部</SelectItem>
                  <SelectItem value="N5">N5 (初级)</SelectItem>
                  <SelectItem value="N4">N4 (初中级)</SelectItem>
                  <SelectItem value="N3">N3 (中级)</SelectItem>
                  <SelectItem value="N2">N2 (中高级)</SelectItem>
                  <SelectItem value="N1">N1 (高级)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">标签</label>
              <div className="flex flex-wrap gap-2">
                {['基础', '时间', '自然', '动作'].map((tag) => (
                  <Badge
                    key={tag}
                    variant={selectedTags.includes(tag) ? 'default' : 'outline'}
                    className="cursor-pointer"
                    onClick={() => {
                      setSelectedTags((prev) =>
                        prev.includes(tag)
                          ? prev.filter((t) => t !== tag)
                          : [...prev, tag]
                      )
                    }}
                  >
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>

            <div className="pt-4">
              <div className="flex items-center justify-between text-sm mb-2">
                <span>今日待复习</span>
                <span className="font-medium">{filteredCards.length} 张</span>
              </div>
              <Progress value={30} className="h-2" />
            </div>
          </CardContent>
        </Card>

        {/* Right: Study Action */}
        <Card className="lg:col-span-2">
          <CardContent className="p-8">
            <div className="text-center space-y-6">
              <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                <Play className="h-12 w-12 text-primary" />
              </div>

              <div>
                <h2 className="text-2xl font-bold">开始今日学习</h2>
                <p className="text-muted-foreground mt-2">
                  你当前筛选了 {filteredCards.length} 张闪卡待学习
                </p>
              </div>

              <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  预计 5 分钟
                </span>
                <span className="flex items-center gap-1">
                  <RotateCcw className="h-4 w-4" />
                  间隔重复
                </span>
              </div>

              <Button
                size="lg"
                className="w-full max-w-md"
                onClick={() => setIsStudying(true)}
                disabled={filteredCards.length === 0}
              >
                <Play className="mr-2 h-5 w-5" />
                开始学习
              </Button>

              {filteredCards.length === 0 && (
                <p className="text-sm text-muted-foreground">
                  没有符合条件的闪卡，请调整筛选条件
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Sessions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">最近学习记录</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[
              { date: '今天', cards: 20, accuracy: 85, duration: '10分钟' },
              { date: '昨天', cards: 15, accuracy: 78, duration: '8分钟' },
              { date: '3天前', cards: 25, accuracy: 92, duration: '12分钟' },
            ].map((session, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
              >
                <div className="flex items-center gap-4">
                  <div className="text-sm font-medium">{session.date}</div>
                  <div className="text-sm text-muted-foreground">
                    {session.cards} 张卡片
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <Badge variant={session.accuracy >= 80 ? 'default' : 'secondary'}>
                    准确率 {session.accuracy}%
                  </Badge>
                  <div className="text-sm text-muted-foreground flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    {session.duration}
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export const Route = createFileRoute('/flashcards')({
  component: FlashcardsPage,
})
