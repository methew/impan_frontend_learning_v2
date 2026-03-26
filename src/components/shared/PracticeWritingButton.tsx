/**
 * 写作练习按钮 - 数据打通组件
 * 
 * 使用场景：
 * - 词汇/语法详情页：用此词汇/语法造句
 * - 例句卡片：仿写练习
 * - 课文页面：句子改写
 */
import { useState } from 'react'
import { PenTool, ArrowRight, Loader2, Sparkles } from 'lucide-react'
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
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { useNavigate } from '@tanstack/react-router'
import { cn } from '@/lib/utils'
import type { BaseNode, ExampleSentence } from '@/types'

type ExerciseType = 'meaning_to_sentence' | 'dictation' | 'fill_blank' | 'translation'

interface PracticeWritingButtonProps {
  // 内容来源
  node?: BaseNode
  example?: ExampleSentence
  
  // 来源标识
  sourceType: 'vocab' | 'grammar' | 'idiom' | 'example'
  sourceId?: string
  
  // 显示选项
  variant?: 'default' | 'outline' | 'ghost' | 'secondary'
  size?: 'default' | 'sm' | 'lg' | 'icon'
  showText?: boolean
  className?: string
}

const exerciseTypeOptions: { value: ExerciseType; label: string; description: string }[] = [
  {
    value: 'meaning_to_sentence',
    label: '看义写句',
    description: '根据含义写出句子',
  },
  {
    value: 'dictation',
    label: '听写/看句摹写',
    description: '听音频或看句子进行摹写',
  },
  {
    value: 'fill_blank',
    label: '填空摹写',
    description: '填空完成句子',
  },
  {
    value: 'translation',
    label: '翻译练习',
    description: '将句子翻译成目标语言',
  },
]

export function PracticeWritingButton({
  node,
  example,
  sourceType,
  sourceId,
  variant = 'outline',
  size = 'sm',
  showText = true,
  className,
}: PracticeWritingButtonProps) {
  const [open, setOpen] = useState(false)
  const [selectedType, setSelectedType] = useState<ExerciseType>('meaning_to_sentence')
  const [isLoading, setIsLoading] = useState(false)
  const navigate = useNavigate()

  // 准备练习内容
  const getPracticeContent = () => {
    if (node) {
      return {
        title: node.name,
        prompt: `请使用"${node.name}"造一个句子`,
        reference: node.content || node.meaning || '',
        reading: node.reading,
      }
    }
    
    if (example) {
      return {
        title: '例句仿写',
        prompt: '请参考以下例句进行仿写练习',
        reference: example.sentence,
        translation: example.translation,
        reading: example.reading,
      }
    }
    
    return null
  }

  const content = getPracticeContent()

  const handleStartPractice = async () => {
    setIsLoading(true)
    
    try {
      // 模拟创建练习
      await new Promise(resolve => setTimeout(resolve, 800))
      
      // 构建查询参数
      const params = new URLSearchParams({
        type: selectedType,
        source: sourceType,
        ...(sourceId && { id: sourceId }),
        ...(node?.name && { keyword: node.name }),
      })
      
      toast.success('练习准备就绪', {
        description: `即将开始${exerciseTypeOptions.find(t => t.value === selectedType)?.label}`,
      })
      
      // 跳转到写作练习页面
      navigate({ 
        to: `/learning/writing/practice?${params.toString()}` 
      })
      
      setOpen(false)
    } catch (error) {
      toast.error('创建练习失败')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant={variant} size={size} className={className}>
          <PenTool className={cn('h-4 w-4', showText && 'mr-2')} />
          {showText && '造句练习'}
        </Button>
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-yellow-500" />
            创建写作练习
          </DialogTitle>
          <DialogDescription>
            基于选中的内容创建个性化写作练习
          </DialogDescription>
        </DialogHeader>
        
        {/* 内容预览 */}
        {content && (
          <div className="p-4 bg-muted rounded-lg space-y-2">
            <p className="font-medium">{content.title}</p>
            {content.reading && (
              <p className="text-sm text-muted-foreground">{content.reading}</p>
            )}
            {content.reference && (
              <p className="text-sm">{content.reference}</p>
            )}
            {content.translation && (
              <p className="text-sm text-muted-foreground">{content.translation}</p>
            )}
          </div>
        )}
        
        {/* 选择练习类型 */}
        <div className="space-y-2">
          <Label>选择练习类型</Label>
          <Select value={selectedType} onValueChange={(v) => setSelectedType(v as ExerciseType)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {exerciseTypeOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  <div>
                    <div>{option.label}</div>
                    <div className="text-xs text-muted-foreground">{option.description}</div>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        {/* 选中类型的说明 */}
        <div className="p-3 bg-blue-50 rounded-lg text-sm text-blue-700">
          {exerciseTypeOptions.find(t => t.value === selectedType)?.description}
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            取消
          </Button>
          <Button onClick={handleStartPractice} disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                准备中...
              </>
            ) : (
              <>
                开始练习
                <ArrowRight className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
