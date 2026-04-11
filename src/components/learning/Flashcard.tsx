import { useState, useCallback, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { RotateCw, Volume2, MoreHorizontal } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'

export interface FlashcardData {
  id: string
  front: string
  back: string
  reading?: string
  meaning?: string
  example?: string
  exampleTranslation?: string
  level?: string
  tags?: string[]
}

interface FlashcardProps {
  card: FlashcardData
  onResponse: (cardId: string, response: 'again' | 'hard' | 'good' | 'easy') => void
  currentIndex?: number
  totalCount?: number
  className?: string
}

export function Flashcard({
  card,
  onResponse,
  currentIndex,
  totalCount,
  className = '',
}: FlashcardProps) {
  const [isFlipped, setIsFlipped] = useState(false)
  const [direction, setDirection] = useState(0)

  const handleFlip = useCallback(() => {
    setIsFlipped(!isFlipped)
  }, [isFlipped])

  const handleResponse = useCallback((response: 'again' | 'hard' | 'good' | 'easy') => {
    setDirection(response === 'again' ? -1 : 1)
    onResponse(card.id, response)
    setIsFlipped(false)
    setDirection(0)
  }, [card.id, onResponse])

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault()
        handleFlip()
      } else if (isFlipped) {
        switch (e.key) {
          case '1':
            handleResponse('again')
            break
          case '2':
            handleResponse('hard')
            break
          case '3':
            handleResponse('good')
            break
          case '4':
            handleResponse('easy')
            break
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isFlipped, handleFlip, handleResponse])

  return (
    <div className={`flex flex-col items-center gap-6 ${className}`}>
      {/* Progress */}
      {currentIndex !== undefined && totalCount !== undefined && (
        <div className="w-full max-w-md flex items-center gap-4">
          <Progress value={(currentIndex / totalCount) * 100} className="flex-1" />
          <span className="text-sm text-muted-foreground min-w-[60px] text-right">
            {currentIndex + 1} / {totalCount}
          </span>
        </div>
      )}

      {/* Card */}
      <div
        className="relative w-full max-w-md aspect-[3/2] cursor-pointer perspective-1000"
        onClick={handleFlip}
        data-testid="flashcard"
      >
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={isFlipped ? 'back' : 'front'}
            initial={{ rotateY: isFlipped ? -90 : 90, opacity: 0 }}
            animate={{ rotateY: 0, opacity: 1 }}
            exit={{ rotateY: isFlipped ? 90 : -90, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="absolute inset-0"
            style={{ transformStyle: 'preserve-3d' }}
          >
            <Card className="w-full h-full flex flex-col items-center justify-center p-8 shadow-lg hover:shadow-xl transition-shadow">
              {!isFlipped ? (
                // Front Side
                <>
                  <div className="text-6xl font-bold mb-4">{card.front}</div>
                  {card.level && (
                    <Badge variant="secondary" className="absolute top-4 right-4">
                      {card.level}
                    </Badge>
                  )}
                  <div className="absolute bottom-4 text-sm text-muted-foreground flex items-center gap-2">
                    <RotateCw className="h-4 w-4" />
                    点击翻转
                  </div>
                </>
              ) : (
                // Back Side
                <>
                  <div className="text-3xl font-bold mb-2">{card.back}</div>
                  {card.reading && (
                    <div className="text-lg text-muted-foreground mb-2">
                      [{card.reading}]
                    </div>
                  )}
                  {card.meaning && (
                    <div className="text-xl text-primary mb-4">{card.meaning}</div>
                  )}
                  {card.example && (
                    <div className="text-sm text-center mt-4 p-3 bg-muted rounded-lg">
                      <div className="font-medium">{card.example}</div>
                      {card.exampleTranslation && (
                        <div className="text-muted-foreground mt-1">
                          {card.exampleTranslation}
                        </div>
                      )}
                    </div>
                  )}
                </>
              )}
            </Card>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Action Buttons */}
      <AnimatePresence>
        {isFlipped && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="flex gap-2 w-full max-w-md"
          >
            <Button
              variant="destructive"
              className="flex-1"
              onClick={(e) => {
                e.stopPropagation()
                handleResponse('again')
              }}
            >
              <span className="block text-xs opacity-70">1</span>
              不认识
            </Button>
            <Button
              variant="outline"
              className="flex-1 border-orange-500 text-orange-600 hover:bg-orange-50"
              onClick={(e) => {
                e.stopPropagation()
                handleResponse('hard')
              }}
            >
              <span className="block text-xs opacity-70">2</span>
              模糊
            </Button>
            <Button
              variant="outline"
              className="flex-1 border-blue-500 text-blue-600 hover:bg-blue-50"
              onClick={(e) => {
                e.stopPropagation()
                handleResponse('good')
              }}
            >
              <span className="block text-xs opacity-70">3</span>
              认识
            </Button>
            <Button
              variant="outline"
              className="flex-1 border-green-500 text-green-600 hover:bg-green-50"
              onClick={(e) => {
                e.stopPropagation()
                handleResponse('easy')
              }}
            >
              <span className="block text-xs opacity-70">4</span>
              简单
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Keyboard Hint */}
      <div className="text-xs text-muted-foreground text-center">
        快捷键: 空格翻转 | 1-4 评分
      </div>
    </div>
  )
}
