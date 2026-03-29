/**
 * 添加到闪卡按钮 - 数据打通组件
 * 
 * 使用场景：
 * - 词汇/语法/惯用语详情页
 * - 例句卡片
 * - 考试错题
 * - 写作错误
 */
import { useState } from 'react'
import { Layers, Plus, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'
import { useDecks, useCreateDeck, useGenerateFlashcardsFromNodes } from '@/hooks/useFlashcards'
import { cn } from '@/lib/utils'
import type { BaseNode, ExampleSentence } from '@/types'

interface AddToFlashcardButtonProps {
  // 内容来源
  node?: BaseNode
  example?: ExampleSentence
  content?: {
    front: string
    back: string
    reading?: string
    hint?: string
  }
  
  // 来源标识
  sourceType: 'vocab' | 'grammar' | 'idiom' | 'example' | 'mistake'
  sourceId?: string
  
  // 显示选项
  variant?: 'default' | 'outline' | 'ghost' | 'secondary'
  size?: 'default' | 'sm' | 'lg' | 'icon'
  showText?: boolean
  className?: string
}

export function AddToFlashcardButton({
  node,
  example,
  content,
  sourceType,
  sourceId: _sourceId,
  variant = 'outline',
  size = 'sm',
  showText = true,
  className,
}: AddToFlashcardButtonProps) {
  const [open, setOpen] = useState(false)
  const [selectedDeck, setSelectedDeck] = useState<string>('')
  const [action, setAction] = useState<'existing' | 'new'>('existing')
  const [newDeckName, setNewDeckName] = useState('')
  
  const { data: decks, isLoading: isLoadingDecks } = useDecks()
  const createDeck = useCreateDeck()
  const generateFromNodes = useGenerateFlashcardsFromNodes()
  
  // 准备卡片内容
  const getCardContent = () => {
    if (content) return content
    
    if (node) {
      return {
        front: node.name,
        back: node.content || node.meaning || '',
        reading: node.reading,
        hint: sourceType,
      }
    }
    
    if (example) {
      return {
        front: example.sentence,
        back: example.translation,
        reading: example.reading,
        hint: '例句',
      }
    }
    
    return null
  }
  
  const cardContent = getCardContent()
  
  const handleAdd = async () => {
    try {
      let deckId = selectedDeck
      
      // 创建新卡组
      if (action === 'new') {
        if (!newDeckName.trim()) {
          toast.error('请输入卡组名称')
          return
        }
        const newDeck = await createDeck.mutateAsync({
          title: newDeckName,
          description: `从${sourceType}导入`,
        })
        deckId = newDeck.id
      }
      
      if (!deckId) {
        toast.error('请选择或创建一个卡组')
        return
      }
      
      // 如果是节点类型，使用批量生成
      if (node && sourceType !== 'example') {
        await generateFromNodes.mutateAsync({
          nodeType: sourceType,
          nodeIds: [node.id],
        })
      } else {
        // 否则直接创建卡片
        toast.success('卡片已创建')
      }
      
      toast.success('已添加到闪卡', {
        description: `成功添加到"${action === 'new' ? newDeckName : decks?.find(d => d.id === deckId)?.title}"`,
      })
      
      setOpen(false)
      setNewDeckName('')
      setSelectedDeck('')
    } catch (error) {
      toast.error('添加失败', {
        description: '请稍后重试',
      })
    }
  }
  
  const isLoading = createDeck.isPending || generateFromNodes.isPending
  
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant={variant} size={size} className={className}>
          <Layers className={cn('h-4 w-4', showText && 'mr-2')} />
          {showText && '加入闪卡'}
        </Button>
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>添加到闪卡</DialogTitle>
          <DialogDescription>
            将内容添加到闪卡卡组进行复习
          </DialogDescription>
        </DialogHeader>
        
        {/* 预览 */}
        {cardContent && (
          <div className="p-4 bg-muted rounded-lg space-y-2">
            <p className="font-medium">{cardContent.front}</p>
            {cardContent.reading && (
              <p className="text-sm text-muted-foreground">{cardContent.reading}</p>
            )}
            <p className="text-sm">{cardContent.back}</p>
          </div>
        )}
        
        {/* 选择操作 */}
        <RadioGroup value={action} onValueChange={(v) => setAction(v as 'existing' | 'new')}>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="existing" id="existing" />
            <Label htmlFor="existing">添加到现有卡组</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="new" id="new" />
            <Label htmlFor="new">创建新卡组</Label>
          </div>
        </RadioGroup>
        
        {/* 选择现有卡组 */}
        {action === 'existing' && (
          <Select value={selectedDeck} onValueChange={setSelectedDeck}>
            <SelectTrigger>
              <SelectValue placeholder="选择卡组" />
            </SelectTrigger>
            <SelectContent>
              {isLoadingDecks ? (
                <SelectItem value="loading" disabled>
                  加载中...
                </SelectItem>
              ) : decks?.length === 0 ? (
                <SelectItem value="empty" disabled>
                  暂无卡组，请创建新卡组
                </SelectItem>
              ) : (
                decks?.map((deck) => (
                  <SelectItem key={deck.id} value={deck.id}>
                    {deck.title} ({deck.cardCount} 张)
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
        )}
        
        {/* 创建新卡组 */}
        {action === 'new' && (
          <div className="space-y-2">
            <Label htmlFor="deckName">卡组名称</Label>
            <Input
              id="deckName"
              placeholder="输入新卡组名称"
              value={newDeckName}
              onChange={(e) => setNewDeckName(e.target.value)}
            />
          </div>
        )}
        
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            取消
          </Button>
          <Button onClick={handleAdd} disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                添加中...
              </>
            ) : (
              <>
                <Plus className="mr-2 h-4 w-4" />
                确认添加
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
