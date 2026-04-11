import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { Flashcard } from '@/components/learning/Flashcard'
import { FlashcardSession } from '@/components/learning/FlashcardSession'

describe('Flashcard Component', () => {
  const mockCard = {
    id: '1',
    front: '日',
    back: 'にち/ひ/か',
    reading: 'nichi/hi/ka',
    meaning: '太阳/白天/日期',
    example: '日の出（ひので）',
    level: 'N5',
  }

  it('renders front side initially', () => {
    render(<Flashcard card={mockCard} onResponse={() => {}} />)
    
    expect(screen.getByText('日')).toBeInTheDocument()
    expect(screen.getByText('点击翻转')).toBeInTheDocument()
  })

  it('flips to back side when clicked', async () => {
    render(<Flashcard card={mockCard} onResponse={() => {}} />)
    
    fireEvent.click(screen.getByTestId('flashcard'))
    
    // Wait for animation to complete
    await waitFor(() => {
      expect(screen.getByText('にち/ひ/か')).toBeInTheDocument()
    }, { timeout: 500 })
    
    await waitFor(() => {
      expect(screen.getByText('太阳/白天/日期')).toBeInTheDocument()
    }, { timeout: 500 })
  })

  it('calls onResponse with correct status', async () => {
    const onResponse = vi.fn()
    render(<Flashcard card={mockCard} onResponse={onResponse} />)
    
    // Flip the card first
    fireEvent.click(screen.getByTestId('flashcard'))
    
    // Wait for back side to show
    await waitFor(() => {
      expect(screen.getByText('不认识')).toBeInTheDocument()
    }, { timeout: 500 })
    
    // Click "Again" (Don't know)
    fireEvent.click(screen.getByText('不认识'))
    
    expect(onResponse).toHaveBeenCalledWith('1', 'again')
  })

  it('displays difficulty buttons after flip', async () => {
    render(<Flashcard card={mockCard} onResponse={() => {}} />)
    
    // Initially no difficulty buttons
    expect(screen.queryByText('不认识')).not.toBeInTheDocument()
    
    // Flip the card
    fireEvent.click(screen.getByTestId('flashcard'))
    
    // Now difficulty buttons should be visible
    await waitFor(() => {
      expect(screen.getByText('不认识')).toBeInTheDocument()
      expect(screen.getByText('模糊')).toBeInTheDocument()
      expect(screen.getByText('认识')).toBeInTheDocument()
    }, { timeout: 500 })
  })

  it('shows progress indicator', () => {
    render(
      <Flashcard
        card={mockCard}
        onResponse={() => {}}
        currentIndex={5}
        totalCount={20}
      />
    )
    
    expect(screen.getByText('6 / 20')).toBeInTheDocument()
  })
})

describe('FlashcardSession Component', () => {
  const mockCards = [
    { id: '1', front: '日', back: 'にち', meaning: '太阳' },
    { id: '2', front: '月', back: 'つき', meaning: '月亮' },
    { id: '3', front: '火', back: 'ひ', meaning: '火' },
  ]

  it('renders all cards in queue', () => {
    render(<FlashcardSession cards={mockCards} onComplete={() => {}} />)
    
    expect(screen.getByText('日')).toBeInTheDocument()
    expect(screen.getByText('第 1 张，共 3 张')).toBeInTheDocument()
  })

  it('moves to next card after response', async () => {
    render(<FlashcardSession cards={mockCards} onComplete={() => {}} />)
    
    // Flip card
    fireEvent.click(screen.getByTestId('flashcard'))
    
    // Wait for buttons
    await waitFor(() => {
      expect(screen.getByText('认识')).toBeInTheDocument()
    }, { timeout: 500 })
    
    // Click response
    fireEvent.click(screen.getByText('认识'))
    
    // Wait for next card
    await waitFor(() => {
      expect(screen.getByText('月')).toBeInTheDocument()
    }, { timeout: 500 })
  })

  it('calls onComplete when all cards reviewed', async () => {
    const onComplete = vi.fn()
    render(<FlashcardSession cards={mockCards} onComplete={onComplete} />)
    
    // Review all cards
    for (let i = 0; i < mockCards.length; i++) {
      fireEvent.click(screen.getByTestId('flashcard'))
      
      await waitFor(() => {
        expect(screen.getByText('认识')).toBeInTheDocument()
      }, { timeout: 500 })
      
      fireEvent.click(screen.getByText('认识'))
      
      if (i < mockCards.length - 1) {
        await waitFor(() => {
          expect(screen.getByText(mockCards[i + 1].front)).toBeInTheDocument()
        }, { timeout: 500 })
      }
    }
    
    await waitFor(() => {
      expect(onComplete).toHaveBeenCalled()
    }, { timeout: 1000 })
  })

  it('shows session summary when complete', async () => {
    render(
      <FlashcardSession cards={mockCards} onComplete={() => {}} />
    )
    
    // Review all cards with some "again" responses
    for (let i = 0; i < mockCards.length; i++) {
      fireEvent.click(screen.getByTestId('flashcard'))
      
      await waitFor(() => {
        expect(screen.getByText('不认识')).toBeInTheDocument()
      }, { timeout: 500 })
      
      // Mark first card as "again" to show continue button
      if (i === 0) {
        fireEvent.click(screen.getByText('不认识'))
      } else {
        fireEvent.click(screen.getByText('认识'))
      }
      
      if (i < mockCards.length - 1) {
        await waitFor(() => {
          expect(screen.getByText(mockCards[i + 1].front)).toBeInTheDocument()
        }, { timeout: 500 })
      }
    }
    
    // Check summary
    await waitFor(() => {
      expect(screen.getByText('学习完成！')).toBeInTheDocument()
      expect(screen.getByText('重新开始')).toBeInTheDocument()
      // "继续学习"按钮只在有"again"卡片时显示，格式为 "继续学习 (X 张需要复习)"
      expect(screen.getByText(/继续学习/)).toBeInTheDocument()
    }, { timeout: 1000 })
  })

  it('handles keyboard shortcuts', async () => {
    render(<FlashcardSession cards={mockCards} onComplete={() => {}} />)
    
    // Press space to flip
    fireEvent.keyDown(document, { key: ' ' })
    
    // Wait for back side
    await waitFor(() => {
      expect(screen.getByText('にち')).toBeInTheDocument()
    }, { timeout: 500 })
  })

  it('shows empty state when no cards', () => {
    render(<FlashcardSession cards={[]} onComplete={() => {}} />)
    
    expect(screen.getByText('没有卡片可学习')).toBeInTheDocument()
  })
})
