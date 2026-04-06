import { useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog'

// 单个汉字信息
interface KanjiInfo {
  kanji: string
  onyomi: string[]
  kunyomi: string[]
  meanings: string[]
  strokeCount?: number
  jlptLevel?: string
}

// 振り仮名信息
interface FuriganaInfo {
  text: string          // 原文（可能含汉字）
  reading: string       // 假名读音
  start: number         // 起始位置
  end: number           // 结束位置
}

// 词汇数据
interface VocabWithKanji {
  term: string
  reading: string
  hasKanji: boolean
  kanjiBreakdown?: KanjiInfo[]
  furigana?: FuriganaInfo[]
}

interface KanjiDisplayProps {
  vocab: VocabWithKanji
  showBreakdown?: boolean    // 是否显示汉字分解
  showPopover?: boolean      // 点击汉字是否显示详情
}

// 简单的振り仮名渲染组件
export function FuriganaText({ 
  text, 
  reading, 
  className = '' 
}: { 
  text: string
  reading: string
  className?: string 
}) {
  // 检查是否含汉字
  const hasKanji = /[\u4e00-\u9faf]/.test(text)
  
  if (!hasKanji) {
    return <span className={className}>{text}</span>
  }

  return (
    <ruby className={`${className} ruby-text`}>
      {text}
      <rt className="text-xs text-muted-foreground">{reading}</rt>
    </ruby>
  )
}

// 汉字详情卡片
function KanjiDetailCard({ kanji }: { kanji: KanjiInfo }) {
  return (
    <Card className="w-64">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <span className="text-4xl font-bold">{kanji.kanji}</span>
          {kanji.jlptLevel && (
            <Badge variant="outline">{kanji.jlptLevel}</Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-3 text-sm">
        {kanji.onyomi.length > 0 && (
          <div>
            <span className="text-muted-foreground">音读：</span>
            <span className="font-medium">{kanji.onyomi.join('、')}</span>
          </div>
        )}
        {kanji.kunyomi.length > 0 && (
          <div>
            <span className="text-muted-foreground">训读：</span>
            <span className="font-medium">{kanji.kunyomi.join('、')}</span>
          </div>
        )}
        <div>
          <span className="text-muted-foreground">释义：</span>
          <span>{kanji.meanings.join('；')}</span>
        </div>
        {kanji.strokeCount && (
          <div>
            <span className="text-muted-foreground">笔画：</span>
            <span>{kanji.strokeCount}画</span>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// 主组件
export function KanjiDisplay({ 
  vocab, 
  showBreakdown = true,
  showPopover = true 
}: KanjiDisplayProps) {
  const [showDetails, setShowDetails] = useState(false)

  // 将词汇按字符分解
  const chars = vocab.term.split('')
  const readingChars = vocab.reading.split('')
  
  // 简单的假名匹配（实际项目中可能需要更复杂的算法）
  const renderWithFurigana = () => {
    // 如果提供了详细的振り仮名信息
    if (vocab.furigana && vocab.furigana.length > 0) {
      return vocab.furigana.map((info, index) => (
        <FuriganaText
          key={index}
          text={info.text}
          reading={info.reading}
        />
      ))
    }
    
    // 简单的整体显示
    return (
      <FuriganaText 
        text={vocab.term} 
        reading={vocab.reading}
        className="text-2xl"
      />
    )
  }

  // 逐个字符显示（带汉字详情弹窗）
  const renderCharByChar = () => {
    return chars.map((char, index) => {
      const isKanji = /[\u4e00-\u9faf]/.test(char)
      const kanjiInfo = vocab.kanjiBreakdown?.find(k => k.kanji === char)
      
      if (!isKanji || !showPopover || !kanjiInfo) {
        return <span key={index} className="text-2xl">{char}</span>
      }

      return (
        <Dialog key={index}>
          <DialogTrigger asChild>
            <button className="text-2xl hover:bg-accent rounded px-0.5 cursor-pointer transition-colors">
              {char}
            </button>
          </DialogTrigger>
          <DialogContent className="p-0 sm:max-w-md">
            <KanjiDetailCard kanji={kanjiInfo} />
          </DialogContent>
        </Dialog>
      )
    })
  }

  return (
    <div className="space-y-4">
      {/* 主要显示区域 */}
      <div className="text-center space-y-2">
        <div className="text-3xl font-bold">
          {showPopover ? renderCharByChar() : renderWithFurigana()}
        </div>
        <p className="text-lg text-muted-foreground">{vocab.reading}</p>
      </div>

      {/* 汉字分解 */}
      {showBreakdown && vocab.hasKanji && vocab.kanjiBreakdown && (
        <div className="border rounded-lg p-4 space-y-3">
          <h4 className="font-medium text-sm text-muted-foreground">汉字分解</h4>
          <div className="flex gap-4">
            {vocab.kanjiBreakdown.map((kanji, index) => (
              <div 
                key={index} 
                className="flex items-center gap-2 bg-muted rounded-lg px-3 py-2"
              >
                <span className="text-2xl font-bold">{kanji.kanji}</span>
                <div className="text-xs">
                  <div className="text-muted-foreground">
                    {kanji.onyomi.slice(0, 1).join('')}
                  </div>
                  <div>{kanji.meanings.slice(0, 1).join('')}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// 简化版 - 只显示振り仮名
export function SimpleFurigana({ 
  term, 
  reading,
  className = ''
}: { 
  term: string
  reading: string
  className?: string
}) {
  const hasKanji = /[\u4e00-\u9faf]/.test(term)
  
  if (!hasKanji) {
    return <span className={className}>{term}</span>
  }

  return (
    <ruby className={`ruby-text ${className}`}>
      {term}
      <rt className="text-[0.5em] text-muted-foreground">{reading}</rt>
    </ruby>
  )
}

export default KanjiDisplay
