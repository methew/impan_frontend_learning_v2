import { createFileRoute, Link } from '@tanstack/react-router'
import { ArrowLeft, Play, Plus, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useDeck, useDeckStats, useDeleteDeck, useFlashcards, useDeleteFlashcard } from '@/hooks/useFlashcards'
import { format } from 'date-fns'

export const Route = createFileRoute('/learning/flashcards/$deckId')({
  component: DeckDetailPage,
})

function DeckDetailPage() {
  const { deckId } = Route.useParams()
  const { data: deck } = useDeck(deckId)
  const { data: stats } = useDeckStats(deckId)
  const { data: cards } = useFlashcards(deckId)
  const deleteDeck = useDeleteDeck()
  const deleteCard = useDeleteFlashcard()

  const handleDeleteCard = (cardId: string) => {
    if (confirm('确定要删除这张卡片吗？')) {
      deleteCard.mutate(cardId)
    }
  }

  if (!deck) {
    return <div>加载中...</div>
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Link to="/learning/flashcards">
            <Button variant="ghost">
              <ArrowLeft className="h-4 w-4 mr-2" />
              返回
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold">{deck.title}</h1>
            {deck.description && (
              <p className="text-muted-foreground">{deck.description}</p>
            )}
          </div>
        </div>
        <div className="flex gap-2">
          <Link to="/learning/flashcards/study/$deckId" params={{ deckId }}>
            <Button>
              <Play className="h-4 w-4 mr-2" />
              学习
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-4 gap-4 mb-6">
          <StatCard title="总卡片" value={stats.totalCards} />
          <StatCard title="新卡片" value={stats.newCards} color="green" />
          <StatCard title="待复习" value={stats.dueCards} color="orange" />
          <StatCard title="掌握度" value={`${stats.masteryPercentage}%`} color="blue" />
        </div>
      )}

      <Tabs defaultValue="cards">
        <TabsList>
          <TabsTrigger value="cards">卡片列表</TabsTrigger>
          <TabsTrigger value="settings">设置</TabsTrigger>
        </TabsList>

        <TabsContent value="cards" className="mt-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">
              卡片 ({cards?.length || 0})
            </h2>
            <Button variant="outline" size="sm">
              <Plus className="h-4 w-4 mr-2" />
              添加卡片
            </Button>
          </div>

          <div className="space-y-2">
            {cards?.map((card) => (
              <Card key={card.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1 grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">正面</p>
                        <p className="font-medium">{card.front}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">背面</p>
                        <p className="font-medium">{card.back}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 ml-4">
                      {card.dueDate && (
                        <Badge variant={new Date(card.dueDate) <= new Date() ? 'destructive' : 'secondary'}>
                          {format(new Date(card.dueDate), 'MM/dd')}
                        </Badge>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteCard(card.id)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="settings" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>危险区域</CardTitle>
            </CardHeader>
            <CardContent>
              <Button
                variant="destructive"
                onClick={() => {
                  if (confirm('确定要删除这个卡组吗？此操作不可撤销。')) {
                    deleteDeck.mutate(deckId)
                  }
                }}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                删除卡组
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

function StatCard({
  title,
  value,
  color,
}: {
  title: string
  value: number | string
  color?: string
}) {
  const colorClasses: Record<string, string> = {
    green: 'text-green-600',
    orange: 'text-orange-600',
    blue: 'text-blue-600',
  }

  return (
    <Card>
      <CardContent className="p-4">
        <p className="text-sm text-muted-foreground">{title}</p>
        <p className={`text-2xl font-bold ${color ? colorClasses[color] : ''}`}>
          {value}
        </p>
      </CardContent>
    </Card>
  )
}
