import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { KanjiDisplay, SimpleFurigana } from '@/components/KanjiDisplay'
import { ChevronLeft, ChevronRight, Volume2, Bookmark, Check } from 'lucide-react'

export const Route = createFileRoute('/ja/learn/')({
  component: JapaneseLearnPage,
})

// 模拟学习数据
const mockLessonData = {
  lesson: '第1課',
  title: '初めまして',
  vocabulary: [
    {
      term: '日本語',
      reading: 'にほんご',
      meaning: '日语',
      hasKanji: true,
      kanjiBreakdown: [
        { kanji: '日', onyomi: ['にち', 'じつ'], kunyomi: ['ひ', 'か'], meanings: ['太阳', '日本'], jlptLevel: 'N5' },
        { kanji: '本', onyomi: ['ほん'], kunyomi: ['もと'], meanings: ['书', '根源'], jlptLevel: 'N5' },
        { kanji: '語', onyomi: ['ご'], kunyomi: ['かたる'], meanings: ['语言', '话'], jlptLevel: 'N5' },
      ]
    },
    {
      term: '学生',
      reading: 'がくせい',
      meaning: '学生',
      hasKanji: true,
      kanjiBreakdown: [
        { kanji: '学', onyomi: ['がく', 'がっ'], kunyomi: ['まなぶ'], meanings: ['学习', '学问'], jlptLevel: 'N5' },
        { kanji: '生', onyomi: ['せい', 'しょう'], kunyomi: ['いきる', 'うむ'], meanings: ['生', '学生'], jlptLevel: 'N5' },
      ]
    },
    {
      term: '会社員',
      reading: 'かいしゃいん',
      meaning: '公司职员',
      hasKanji: true,
      kanjiBreakdown: [
        { kanji: '会', onyomi: ['かい', 'え'], kunyomi: ['あう'], meanings: ['会议', '遇见'], jlptLevel: 'N5' },
        { kanji: '社', onyomi: ['しゃ'], kunyomi: ['やしろ'], meanings: ['公司', '神社'], jlptLevel: 'N5' },
        { kanji: '員', onyomi: ['いん'], kunyomi: [], meanings: ['成员', '职员'], jlptLevel: 'N5' },
      ]
    },
    {
      term: 'です',
      reading: 'です',
      meaning: '是（判断助动词）',
      hasKanji: false,
    },
  ],
  sentences: [
    {
      japanese: 'わたしは学生です。',
      reading: 'わたしはがくせいです。',
      meaning: '我是学生。',
      grammar: ['～は～です'],
    },
    {
      japanese: '日本語を勉強します。',
      reading: 'にほんごをべんきょうします。',
      meaning: '我学习日语。',
      grammar: ['～を～ます'],
    },
  ],
  kanji: [
    { char: '日', onyomi: 'にち', kunyomi: 'ひ', meaning: '太阳；日本', strokeCount: 4 },
    { char: '本', onyomi: 'ほん', kunyomi: 'もと', meaning: '书；根源', strokeCount: 5 },
    { char: '語', onyomi: 'ご', kunyomi: 'かたる', meaning: '语言', strokeCount: 14 },
  ]
}

function JapaneseLearnPage() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [showMeaning, setShowMeaning] = useState(false)
  const [learnedWords, setLearnedWords] = useState<Set<string>>(new Set())

  const currentVocab = mockLessonData.vocabulary[currentIndex]

  const handlePrev = () => {
    setCurrentIndex(prev => Math.max(0, prev - 1))
    setShowMeaning(false)
  }

  const handleNext = () => {
    setCurrentIndex(prev => Math.min(mockLessonData.vocabulary.length - 1, prev + 1))
    setShowMeaning(false)
  }

  const toggleLearned = () => {
    setLearnedWords(prev => {
      const next = new Set(prev)
      if (next.has(currentVocab.term)) {
        next.delete(currentVocab.term)
      } else {
        next.add(currentVocab.term)
      }
      return next
    })
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* 顶部信息栏 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Badge variant="outline">{mockLessonData.lesson}</Badge>
          <h1 className="text-2xl font-bold">{mockLessonData.title}</h1>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">
            {currentIndex + 1} / {mockLessonData.vocabulary.length}
          </span>
          <Button variant="outline" size="icon">
            <Bookmark className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <Tabs defaultValue="vocab" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="vocab">词汇学习</TabsTrigger>
          <TabsTrigger value="sentences">例句</TabsTrigger>
          <TabsTrigger value="kanji">汉字</TabsTrigger>
        </TabsList>

        {/* 词汇学习 Tab */}
        <TabsContent value="vocab" className="space-y-4">
          <Card className="min-h-[400px]">
            <CardContent className="p-8">
              <div className="flex flex-col items-center justify-center h-full space-y-8">
                {/* 主要词汇显示 - 使用 KanjiDisplay 组件 */}
                <KanjiDisplay
                  vocab={currentVocab}
                  showBreakdown={true}
                  showPopover={true}
                />

                {/* 释义 */}
                {showMeaning && (
                  <div className="text-center space-y-2 animate-in fade-in">
                    <p className="text-xl text-primary">{currentVocab.meaning}</p>
                    <p className="text-sm text-muted-foreground">{currentVocab.reading}</p>
                  </div>
                )}

                {/* 操作按钮 */}
                <div className="flex gap-4">
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={() => setShowMeaning(!showMeaning)}
                  >
                    {showMeaning ? '隐藏释义' : '显示释义'}
                  </Button>
                  <Button
                    variant={learnedWords.has(currentVocab.term) ? 'default' : 'outline'}
                    size="lg"
                    onClick={toggleLearned}
                  >
                    <Check className="mr-2 h-4 w-4" />
                    {learnedWords.has(currentVocab.term) ? '已掌握' : '标记掌握'}
                  </Button>
                  <Button variant="outline" size="icon">
                    <Volume2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 导航按钮 */}
          <div className="flex justify-between">
            <Button
              variant="outline"
              onClick={handlePrev}
              disabled={currentIndex === 0}
            >
              <ChevronLeft className="mr-2 h-4 w-4" />
              上一个
            </Button>
            <Button
              onClick={handleNext}
              disabled={currentIndex === mockLessonData.vocabulary.length - 1}
            >
              下一个
              <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          </div>

          {/* 词汇列表预览 */}
          <div className="grid grid-cols-4 gap-2">
            {mockLessonData.vocabulary.map((vocab, index) => (
              <button
                key={vocab.term}
                onClick={() => {
                  setCurrentIndex(index)
                  setShowMeaning(false)
                }}
                className={`p-2 rounded-lg text-sm transition-colors ${
                  index === currentIndex
                    ? 'bg-primary text-primary-foreground'
                    : learnedWords.has(vocab.term)
                    ? 'bg-green-100 text-green-800'
                    : 'bg-muted hover:bg-muted/80'
                }`}
              >
                <SimpleFurigana term={vocab.term} reading={vocab.reading} />
              </button>
            ))}
          </div>
        </TabsContent>

        {/* 例句 Tab */}
        <TabsContent value="sentences" className="space-y-4">
          {mockLessonData.sentences.map((sentence, index) => (
            <Card key={index}>
              <CardContent className="p-6 space-y-4">
                <div className="text-2xl">
                  <SimpleFurigana 
                    term={sentence.japanese} 
                    reading={sentence.reading}
                    className="text-2xl"
                  />
                </div>
                <p className="text-muted-foreground">{sentence.meaning}</p>
                <div className="flex gap-2">
                  {sentence.grammar.map(g => (
                    <Badge key={g} variant="outline">{g}</Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        {/* 汉字 Tab */}
        <TabsContent value="kanji" className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            {mockLessonData.kanji.map((kanji, index) => (
              <Card key={index}>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <span className="text-5xl font-bold">{kanji.char}</span>
                    <Badge variant="outline">{kanji.strokeCount}画</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <div>
                    <span className="text-muted-foreground">音读：</span>
                    <span className="font-medium">{kanji.onyomi}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">训读：</span>
                    <span className="font-medium">{kanji.kunyomi}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">释义：</span>
                    <span>{kanji.meaning}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default JapaneseLearnPage
