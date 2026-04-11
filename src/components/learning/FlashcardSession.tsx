import { useState, useCallback, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle, RotateCcw, TrendingUp, Clock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Flashcard, FlashcardData } from './Flashcard'

interface SessionStats {
  again: number
  hard: number
  good: number
  easy: number
  totalTime: number
}

interface FlashcardSessionProps {
  cards: FlashcardData[]
  onComplete?: (stats: SessionStats) => void
  onExit?: () => void
  sessionTitle?: string
}

export function FlashcardSession({
  cards,
  onComplete,
  onExit,
  sessionTitle = '闪卡学习',
}: FlashcardSessionProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [responses, setResponses] = useState<Record<string, string>>({})
  const [isComplete, setIsComplete] = useState(false)
  const [startTime] = useState(Date.now())

  const currentCard = cards[currentIndex] || null
  const progress = ((currentIndex) / cards.length) * 100

  const stats = useMemo(() => {
    const counts = { again: 0, hard: 0, good: 0, easy: 0, totalTime: 0 }
    Object.values(responses).forEach((response) => {
      if (response in counts) {
        counts[response as keyof Omit<SessionStats, 'totalTime'>]++
      }
    })
    counts.totalTime = Math.floor((Date.now() - startTime) / 1000)
    return counts
  }, [responses, startTime])

  const handleResponse = useCallback((cardId: string, response: 'again' | 'hard' | 'good' | 'easy') => {
    setResponses((prev) => ({ ...prev, [cardId]: response }))

    if (currentIndex < cards.length - 1) {
      setCurrentIndex((prev) => prev + 1)
    } else {
      setIsComplete(true)
      onComplete?.(stats)
    }
  }, [currentIndex, cards.length, onComplete, stats])

  const handleRestart = useCallback(() => {
    setCurrentIndex(0)
    setResponses({})
    setIsComplete(false)
  }, [])

  const handleContinue = useCallback(() => {
    // Continue with cards marked as "again"
    const againCards = cards.filter((card) => responses[card.id] === 'again')
    if (againCards.length > 0) {
      // Replace cards with only the "again" cards
      cards.splice(0, cards.length, ...againCards)
      handleRestart()
    }
  }, [cards, responses])

  if (isComplete) {
    return (
      <SessionComplete
        stats={stats}
        totalCards={cards.length}
        onRestart={handleRestart}
        onContinue={handleContinue}
        onExit={onExit}
        hasAgainCards={stats.again > 0}
      />
    )
  }

  return (
    <div className="min-h-[calc(100vh-200px)] flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold">{sessionTitle}</h1>
          <p className="text-muted-foreground">
            第 {currentIndex + 1} 张，共 {cards.length} 张
          </p>
        </div>
        <Button variant="ghost" onClick={onExit}>
          退出
        </Button>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-muted rounded-full h-2 mb-8">
        <motion.div
          className="bg-primary h-2 rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>

      {/* Current Card */}
      <div className="flex-1 flex items-center justify-center">
        {currentCard ? (
          <AnimatePresence mode="wait">
            <motion.div
              key={currentCard.id}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.2 }}
              className="w-full"
            >
              <Flashcard
                card={currentCard}
                onResponse={handleResponse}
                currentIndex={currentIndex}
                totalCount={cards.length}
              />
            </motion.div>
          </AnimatePresence>
        ) : (
          <div className="text-center text-muted-foreground">
            没有卡片可学习
          </div>
        )}
      </div>
    </div>
  )
}

interface SessionCompleteProps {
  stats: SessionStats
  totalCards: number
  onRestart: () => void
  onContinue: () => void
  onExit?: () => void
  hasAgainCards: boolean
}

function SessionComplete({
  stats,
  totalCards,
  onRestart,
  onContinue,
  onExit,
  hasAgainCards,
}: SessionCompleteProps) {
  const accuracy = Math.round(
    ((stats.good + stats.easy) / totalCards) * 100
  )
  const minutes = Math.floor(stats.totalTime / 60)
  const seconds = stats.totalTime % 60

  return (
    <div className="min-h-[calc(100vh-200px)] flex flex-col items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-lg"
      >
        <Card className="p-8 text-center">
          <div className="mb-6">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="h-10 w-10 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold">学习完成！</h2>
            <p className="text-muted-foreground mt-2">
              已完成 {totalCards} 张闪卡的学习
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <StatCard
              label="准确率"
              value={`${accuracy}%`}
              icon={TrendingUp}
              color="text-green-600"
            />
            <StatCard
              label="用时"
              value={`${minutes}:${seconds.toString().padStart(2, '0')}`}
              icon={Clock}
              color="text-blue-600"
            />
          </div>

          {/* Response Breakdown */}
          <div className="space-y-2 mb-8">
            <ResponseBar label="简单" count={stats.easy} total={totalCards} color="bg-green-500" />
            <ResponseBar label="认识" count={stats.good} total={totalCards} color="bg-blue-500" />
            <ResponseBar label="模糊" count={stats.hard} total={totalCards} color="bg-orange-500" />
            <ResponseBar label="不认识" count={stats.again} total={totalCards} color="bg-red-500" />
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <Button variant="outline" className="flex-1" onClick={onExit}>
              退出
            </Button>
            <Button variant="outline" className="flex-1" onClick={onRestart}>
              <RotateCcw className="mr-2 h-4 w-4" />
              重新开始
            </Button>
          </div>

          {hasAgainCards && (
            <Button className="w-full mt-3" onClick={onContinue}>
              继续学习 ({stats.again} 张需要复习)
            </Button>
          )}
        </Card>
      </motion.div>
    </div>
  )
}

function StatCard({
  label,
  value,
  icon: Icon,
  color,
}: {
  label: string
  value: string
  icon: React.ComponentType<{ className?: string }>
  color: string
}) {
  return (
    <div className="bg-muted rounded-lg p-4">
      <div className={`flex items-center justify-center gap-2 mb-1 ${color}`}>
        <Icon className="h-5 w-5" />
        <span className="text-2xl font-bold">{value}</span>
      </div>
      <div className="text-sm text-muted-foreground">{label}</div>
    </div>
  )
}

function ResponseBar({
  label,
  count,
  total,
  color,
}: {
  label: string
  count: number
  total: number
  color: string
}) {
  const percentage = total > 0 ? (count / total) * 100 : 0

  return (
    <div className="flex items-center gap-3 text-sm">
      <span className="w-16 text-right">{label}</span>
      <div className="flex-1 bg-muted rounded-full h-2 overflow-hidden">
        <div
          className={`h-full ${color} transition-all duration-500`}
          style={{ width: `${percentage}%` }}
        />
      </div>
      <span className="w-8 text-right font-medium">{count}</span>
    </div>
  )
}
