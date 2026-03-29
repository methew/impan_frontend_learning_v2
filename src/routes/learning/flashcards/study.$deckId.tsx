import { createFileRoute, Link } from '@tanstack/react-router'
import { useState, useEffect, useCallback } from 'react'
import { ArrowLeft, RotateCw, MoreHorizontal, Brain, Clock, Trophy } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { useDeck, useDueCards, useNewCards, useSubmitReview, useStartStudySession, useEndStudySession } from '@/hooks/useFlashcards'
import type { Flashcard, ReviewRating } from '@/types'

export const Route = createFileRoute('/learning/flashcards/study/$deckId')({
  component: StudyPage,
})

function StudyPage() {
  const { deckId } = Route.useParams()
  const { data: deck } = useDeck(deckId)
  const { data: dueCards = [] } = useDueCards(deckId)
  const { data: newCards = [] } = useNewCards(deckId, 10)
  
  const submitReview = useSubmitReview()
  const startSession = useStartStudySession()
  const endSession = useEndStudySession()
  
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [queue, setQueue] = useState<Flashcard[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [showAnswer, setShowAnswer] = useState(false)
  const [studyStats, setStudyStats] = useState({
    studied: 0,
    correct: 0,
    again: 0,
    timeSpent: 0,
  })
  const [startTime, setStartTime] = useState<number>(Date.now())

  // Initialize study queue
  useEffect(() => {
    if (dueCards.length > 0 || newCards.length > 0) {
      // Prioritize due cards, then new cards
      const mixed = [...dueCards, ...newCards.slice(0, Math.max(0, 20 - dueCards.length))]
      setQueue(mixed)
      setStartTime(Date.now())
      
      // Start session
      startSession.mutate(deckId, {
        onSuccess: (session) => setSessionId(session.id)
      })
    }
  }, [dueCards, newCards, deckId])

  const currentCard = queue[currentIndex]
  const progress = queue.length > 0 ? ((currentIndex) / queue.length) * 100 : 0

  const handleShowAnswer = () => {
    setShowAnswer(true)
  }

  const handleRate = useCallback((rating: ReviewRating) => {
    if (!currentCard) return

    const timeSpent = Date.now() - startTime
    
    submitReview.mutate({
      cardId: currentCard.id,
      rating,
      timeSpent,
    })

    setStudyStats(prev => ({
      ...prev,
      studied: prev.studied + 1,
      correct: rating !== 'again' ? prev.correct + 1 : prev.correct,
      again: rating === 'again' ? prev.again + 1 : prev.again,
      timeSpent: prev.timeSpent + timeSpent,
    }))

    // Move to next card
    if (currentIndex < queue.length - 1) {
      setCurrentIndex(prev => prev + 1)
      setShowAnswer(false)
      setStartTime(Date.now())
    } else {
      // Study complete
      if (sessionId) {
        endSession.mutate(sessionId)
      }
    }
  }, [currentCard, currentIndex, queue.length, sessionId, startTime, submitReview, endSession])

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!showAnswer) {
        if (e.code === 'Space' || e.key === 'Enter') {
          e.preventDefault()
          handleShowAnswer()
        }
      } else {
        switch (e.key) {
          case '1':
            handleRate('again')
            break
          case '2':
            handleRate('hard')
            break
          case '3':
            handleRate('good')
            break
          case '4':
            handleRate('easy')
            break
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [showAnswer, handleRate])

  if (!deck) {
    return <div className="flex items-center justify-center h-96">加载中...</div>
  }

  if (queue.length === 0) {
    return <StudyComplete stats={studyStats} deckId={deckId} />
  }

  if (currentIndex >= queue.length) {
    return <StudyComplete stats={studyStats} deckId={deckId} />
  }

  return (
    <div className="max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Link to="/learning/flashcards">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="font-semibold">{deck.title}</h1>
            <p className="text-sm text-muted-foreground">
              {currentIndex + 1} / {queue.length}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="text-right">
            <div className="text-sm text-muted-foreground">剩余</div>
            <div className="font-medium">{queue.length - currentIndex}</div>
          </div>
          <Button variant="ghost" size="icon">
            <MoreHorizontal className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Progress */}
      <Progress value={progress} className="mb-8" />

      {/* Card */}
      <div className="perspective-1000 mb-8">
        <Card 
          className={`relative min-h-[400px] cursor-pointer transform-style-3d transition-transform duration-500 ${
            showAnswer ? 'rotate-y-180' : ''
          }`}
          onClick={() => !showAnswer && handleShowAnswer()}
        >
          {/* Front */}
          <div className="absolute inset-0 p-8 flex flex-col items-center justify-center backface-hidden">
            <Badge variant="secondary" className="mb-4">
              {currentCard.nodeType === 'vocab' ? '词汇' : 
               currentCard.nodeType === 'grammar' ? '语法' : 
               currentCard.nodeType === 'idiom' ? '惯用语' : '其他'}
            </Badge>
            <h2 className="text-4xl font-bold text-center mb-4">{currentCard.front}</h2>
            {currentCard.reading && (
              <p className="text-xl text-muted-foreground">{currentCard.reading}</p>
            )}
            <p className="text-sm text-muted-foreground mt-8">
              点击或按空格键查看答案
            </p>
          </div>

          {/* Back */}
          <div className="absolute inset-0 p-8 flex flex-col items-center justify-center backface-hidden rotate-y-180">
            <h3 className="text-2xl font-bold text-center mb-4">{currentCard.back}</h3>
            
            {currentCard.examples && currentCard.examples.length > 0 && (
              <div className="w-full max-w-lg mt-6 space-y-3">
                <h4 className="text-sm font-medium text-muted-foreground">例句</h4>
                {currentCard.examples.map((ex, i) => (
                  <div key={i} className="p-3 bg-muted rounded-lg">
                    <p className="font-medium">{ex.sentence}</p>
                    <p className="text-sm text-muted-foreground">{ex.translation}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* Rating Buttons */}
      {showAnswer ? (
        <div className="grid grid-cols-4 gap-3">
          <RatingButton 
            label="再来" 
            shortcut="1"
            description="< 1m"
            variant="destructive"
            onClick={() => handleRate('again')}
          />
          <RatingButton 
            label="困难" 
            shortcut="2"
            description="2d"
            variant="secondary"
            onClick={() => handleRate('hard')}
          />
          <RatingButton 
            label="良好" 
            shortcut="3"
            description="4d"
            onClick={() => handleRate('good')}
          />
          <RatingButton 
            label="简单" 
            shortcut="4"
            description="7d"
            variant="outline"
            className="border-green-500 text-green-600 hover:bg-green-50"
            onClick={() => handleRate('easy')}
          />
        </div>
      ) : (
        <Button 
          size="lg" 
          className="w-full"
          onClick={handleShowAnswer}
        >
          <RotateCw className="h-4 w-4 mr-2" />
          显示答案 (空格)
        </Button>
      )}
    </div>
  )
}

function RatingButton({ 
  label, 
  shortcut, 
  description,
  variant,
  className,
  onClick 
}: { 
  label: string
  shortcut: string
  description: string
  variant?: 'default' | 'destructive' | 'secondary' | 'outline'
  className?: string
  onClick: () => void
}) {
  return (
    <Button
      variant={variant || 'default'}
      className={`h-auto py-4 flex flex-col items-center ${className}`}
      onClick={onClick}
    >
      <span className="text-lg font-bold">{label}</span>
      <span className="text-xs opacity-70 mt-1">{description}</span>
      <kbd className="mt-2 px-2 py-0.5 bg-black/10 rounded text-xs">{shortcut}</kbd>
    </Button>
  )
}

function StudyComplete({ stats, deckId }: { stats: { studied: number; correct: number; again: number; timeSpent: number }, deckId: string }) {
  const accuracy = stats.studied > 0 ? Math.round((stats.correct / stats.studied) * 100) : 0
  const minutes = Math.floor(stats.timeSpent / 60000)
  const seconds = Math.floor((stats.timeSpent % 60000) / 1000)

  return (
    <div className="max-w-md mx-auto text-center py-12">
      <Trophy className="h-16 w-16 mx-auto text-yellow-500 mb-4" />
      <h1 className="text-2xl font-bold mb-2">学习完成!</h1>
      <p className="text-muted-foreground mb-8">本次学习统计</p>

      <div className="grid grid-cols-2 gap-4 mb-8">
        <Card className="p-4">
          <Brain className="h-8 w-8 mx-auto text-blue-500 mb-2" />
          <div className="text-2xl font-bold">{stats.studied}</div>
          <div className="text-sm text-muted-foreground">学习卡片</div>
        </Card>
        <Card className="p-4">
          <div className={`text-2xl font-bold ${accuracy >= 80 ? 'text-green-600' : accuracy >= 60 ? 'text-yellow-600' : 'text-red-600'}`}>
            {accuracy}%
          </div>
          <div className="text-sm text-muted-foreground">正确率</div>
        </Card>
        <Card className="p-4">
          <div className="text-2xl font-bold text-red-600">{stats.again}</div>
          <div className="text-sm text-muted-foreground">需复习</div>
        </Card>
        <Card className="p-4">
          <Clock className="h-8 w-8 mx-auto text-purple-500 mb-2" />
          <div className="text-2xl font-bold">{minutes}:{seconds.toString().padStart(2, '0')}</div>
          <div className="text-sm text-muted-foreground">用时</div>
        </Card>
      </div>

      <div className="flex gap-3">
        <Link to="/learning/flashcards" className="flex-1">
          <Button variant="outline" className="w-full">
            返回卡组
          </Button>
        </Link>
        <Link to="/learning/flashcards/study/$deckId" params={{ deckId }} className="flex-1">
          <Button className="w-full">
            继续学习
          </Button>
        </Link>
      </div>
    </div>
  )
}
