import { useState } from 'react'
import { Loader2, Trash2 } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import type { VocabNode } from '@/types'

interface DeleteConfirmDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  node: VocabNode | null
  onConfirm: () => Promise<void>
}

export function DeleteConfirmDialog({
  open,
  onOpenChange,
  node,
  onConfirm,
}: DeleteConfirmDialogProps) {
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      await onConfirm()
      onOpenChange(false)
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-destructive">
            <Trash2 className="h-5 w-5" />
            确认删除
          </DialogTitle>
          <DialogDescription>
            您确定要删除词汇树 <strong>"{node?.content}"</strong> 吗？
            <br />
            <span className="text-destructive font-medium">
              警告：这将同时删除该词汇的所有子节点（读音、义项、例句等）！
            </span>
            <br />
            此操作不可撤销。
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="pt-4">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isDeleting}
          >
            取消
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={isDeleting}
          >
            {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            删除
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
