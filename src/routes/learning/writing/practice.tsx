import { createFileRoute } from '@tanstack/react-router'
import { PenTool } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export const Route = createFileRoute('/learning/writing/practice')({
  component: WritingPracticePage,
})

const exerciseTypes = [
  { id: 'meaning_to_sentence', name: '看义写句', color: 'bg-blue-500' },
  { id: 'dictation', name: '听写/摹写', color: 'bg-green-500' },
  { id: 'fill_blank', name: '填空', color: 'bg-orange-500' },
  { id: 'translation', name: '翻译', color: 'bg-purple-500' },
]

function WritingPracticePage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <PenTool className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-2xl font-bold">写作练习</h1>
          <p className="text-muted-foreground">选择练习类型开始</p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {exerciseTypes.map((type) => (
          <Card key={type.id} className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardContent className="p-6 text-center">
              <div className={`p-3 rounded-lg ${type.color} text-white inline-flex mb-3`}>
                <PenTool className="h-6 w-6" />
              </div>
              <h3 className="font-medium">{type.name}</h3>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="bg-muted/50">
        <CardHeader>
          <CardTitle>练习统计</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold">0</div>
              <div className="text-sm text-muted-foreground">总练习</div>
            </div>
            <div>
              <div className="text-2xl font-bold">0%</div>
              <div className="text-sm text-muted-foreground">正确率</div>
            </div>
            <div>
              <div className="text-2xl font-bold">0</div>
              <div className="text-sm text-muted-foreground">连续天数</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Badge variant="outline" className="w-full justify-center py-2">
        Writing 模块完整功能开发中...
      </Badge>
    </div>
  )
}
