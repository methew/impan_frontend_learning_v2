import { createFileRoute, Link } from '@tanstack/react-router'
import { useState, useMemo } from 'react'
import { 
  Plus, 
  Play, 
  MoreVertical, 
  Brain,
  Search,
  Filter,
  LayoutGrid,
  List,
  Clock,
  BookOpen,
  TrendingUp,
  X,
  Library,
  ChevronDown
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Input } from '@/components/ui/input'
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useDecks, useOverallStats } from '@/hooks/useFlashcards'
import type { Deck } from '@/types'

export const Route = createFileRoute('/learning/flashcards/')({
  component: FlashcardsPage,
})

type ViewMode = 'grid' | 'list'
type SortBy = 'updated' | 'created' | 'name' | 'due'
type FilterType = 'all' | 'due' | 'new' | 'reviewing'

function FlashcardsPage() {
  const { data: decksData, isLoading: decksLoading } = useDecks()
  const decks = useMemo(() => {
    if (!decksData) return []
    return decksData
  }, [decksData])
  const { data: stats } = useOverallStats()
  
  const [viewMode, setViewMode] = useState<ViewMode>('grid')
  const [sortBy] = useState<SortBy>('updated')
  const [filterType, setFilterType] = useState<FilterType>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])

  const availableCategories = useMemo(() => {
    if (!decks) return []
    const cats = new Set<string>()
    decks.forEach((d: Deck) => d.tags?.forEach((t: string) => cats.add(t)))
    return Array.from(cats)
  }, [decks])

  const filteredDecks = useMemo(() => {
    if (!decks) return []
    
    let result = [...decks]
    
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      result = result.filter(d => 
        d.title.toLowerCase().includes(query) ||
        d.description?.toLowerCase().includes(query) ||
        d.tags?.some((t: string) => t.toLowerCase().includes(query))
      )
    }
    
    if (filterType === 'due') {
      result = result.filter(d => d.dueCards > 0)
    } else if (filterType === 'new') {
      result = result.filter(d => d.newCards > 0)
    } else if (filterType === 'reviewing') {
      result = result.filter(d => d.cardCount > d.newCards)
    }
    
    if (selectedCategories.length > 0) {
      result = result.filter(d => 
        d.tags?.some((t: string) => selectedCategories.includes(t))
      )
    }
    
    result.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.title.localeCompare(b.title)
        case 'created':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        case 'due':
          return b.dueCards - a.dueCards
        case 'updated':
        default:
          return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      }
    })
    
    return result
  }, [decks, searchQuery, filterType, selectedCategories, sortBy])

  const filteredStats = useMemo(() => {
    return filteredDecks.reduce((acc, deck) => ({
      total: acc.total + deck.cardCount,
      new: acc.new + deck.newCards,
      due: acc.due + deck.dueCards,
    }), { total: 0, new: 0, due: 0 })
  }, [filteredDecks])

  const hasActiveFilters = searchQuery || filterType !== 'all' || selectedCategories.length > 0

  const clearFilters = () => {
    setSearchQuery('')
    setFilterType('all')
    setSelectedCategories([])
  }

  if (decksLoading) {
    return <DecksSkeleton />
  }

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard
            title="总卡片"
            value={stats.totalCards}
            icon={Library}
            color="blue"
          />
          <StatCard
            title="新卡片"
            value={stats.newCards}
            icon={BookOpen}
            color="green"
          />
          <StatCard
            title="待复习"
            value={stats.dueCards}
            icon={Clock}
            color="orange"
          />
          <StatCard
            title="连续学习"
            value={`${stats.streakDays}天`}
            icon={TrendingUp}
            color="purple"
          />
        </div>
      )}

      {/* Filter Bar */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="搜索卡组..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
              {searchQuery && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
                  onClick={() => setSearchQuery('')}
                >
                  <X className="h-3 w-3" />
                </Button>
              )}
            </div>

            <Tabs value={filterType} onValueChange={(v) => setFilterType(v as FilterType)}>
              <TabsList>
                <TabsTrigger value="all">全部</TabsTrigger>
                <TabsTrigger value="due">
                  待复习
                  {stats && stats.dueCards > 0 && (
                    <Badge variant="destructive" className="ml-2 h-5 px-1.5">{stats.dueCards}</Badge>
                  )}
                </TabsTrigger>
                <TabsTrigger value="new">未学习</TabsTrigger>
                <TabsTrigger value="reviewing">学习中</TabsTrigger>
              </TabsList>
            </Tabs>

            {availableCategories.length > 0 && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="gap-2">
                    分类
                    {selectedCategories.length > 0 && (
                      <Badge variant="secondary" className="ml-1">{selectedCategories.length}</Badge>
                    )}
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  {availableCategories.map(cat => (
                    <DropdownMenuItem
                      key={cat}
                      onClick={() => {
                        setSelectedCategories(prev => 
                          prev.includes(cat)
                            ? prev.filter(c => c !== cat)
                            : [...prev, cat]
                        )
                      }}
                    >
                      <span className={selectedCategories.includes(cat) ? 'font-bold' : ''}>
                        {selectedCategories.includes(cat) ? '✓ ' : ''}{cat}
                      </span>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            )}

            <div className="flex border rounded-md">
              <Button
                variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
                size="icon"
                onClick={() => setViewMode('grid')}
                className="rounded-none rounded-l-md"
              >
                <LayoutGrid className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'secondary' : 'ghost'}
                size="icon"
                onClick={() => setViewMode('list')}
                className="rounded-none rounded-r-md"
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {hasActiveFilters && (
            <div className="flex items-center gap-2 pt-4 border-t mt-4">
              <span className="text-sm text-muted-foreground">筛选:</span>
              {searchQuery && (
                <Badge variant="secondary" className="gap-1">
                  搜索: {searchQuery}
                  <X className="h-3 w-3 cursor-pointer" onClick={() => setSearchQuery('')} />
                </Badge>
              )}
              {filterType !== 'all' && (
                <Badge variant="secondary" className="gap-1">
                  {filterType === 'due' && '待复习'}
                  {filterType === 'new' && '未学习'}
                  {filterType === 'reviewing' && '学习中'}
                  <X className="h-3 w-3 cursor-pointer" onClick={() => setFilterType('all')} />
                </Badge>
              )}
              {selectedCategories.map(cat => (
                <Badge key={cat} variant="secondary" className="gap-1">
                  {cat}
                  <X 
                    className="h-3 w-3 cursor-pointer" 
                    onClick={() => setSelectedCategories(prev => prev.filter(c => c !== cat))} 
                  />
                </Badge>
              ))}
              <Button variant="ghost" size="sm" onClick={clearFilters}>
                清除全部
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Results Info */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          共 {filteredDecks.length} 个卡组
          {hasActiveFilters && (
            <span>（从 {decks?.length} 个筛选）</span>
          )}
          {filteredStats.total > 0 && (
            <span className="ml-2">
              · {filteredStats.total} 张卡片
              {filteredStats.due > 0 && <span className="text-orange-500">（{filteredStats.due} 张待复习）</span>}
            </span>
          )}
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          新建卡组
        </Button>
      </div>

      {/* Decks View */}
      {filteredDecks.length === 0 ? (
        hasActiveFilters ? (
          <EmptyStateFiltered onClear={clearFilters} />
        ) : (
          <EmptyState />
        )
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredDecks.map((deck) => (
            <DeckCard key={deck.id} deck={deck} />
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          {filteredDecks.map((deck) => (
            <DeckListItem key={deck.id} deck={deck} />
          ))}
        </div>
      )}
    </div>
  )
}

function DeckCard({ deck }: { deck: Deck }) {
  return (
    <Card className="group hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <CardTitle className="text-lg truncate">{deck.title}</CardTitle>
            {deck.description && (
              <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                {deck.description}
              </p>
            )}
          </div>
          <Button variant="ghost" size="icon" className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
            <MoreVertical className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-2 mb-4 flex-wrap">
          <Badge variant="secondary">{deck.cardCount} 张卡片</Badge>
          {deck.dueCards > 0 && (
            <Badge variant="destructive">{deck.dueCards} 张待复习</Badge>
          )}
          {deck.newCards > 0 && (
            <Badge variant="default">{deck.newCards} 张新卡片</Badge>
          )}
          {deck.tags?.map(tag => (
            <Badge key={tag} variant="outline" className="text-xs">{tag}</Badge>
          ))}
        </div>
        
        <div className="flex gap-2">
          <Link to="/learning/flashcards/study/$deckId" params={{ deckId: deck.id }} className="flex-1">
            <Button className="w-full" disabled={deck.cardCount === 0}>
              <Play className="h-4 w-4 mr-2" />
              {deck.dueCards > 0 ? '继续学习' : '开始学习'}
            </Button>
          </Link>
          <Link to="/learning/flashcards/$deckId" params={{ deckId: deck.id }}>
            <Button variant="outline">管理</Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}

function DeckListItem({ deck }: { deck: Deck }) {
  return (
    <div className="flex items-center gap-4 p-4 border rounded-lg hover:bg-muted/50 transition-colors">
      <div className="flex-1 min-w-0">
        <h3 className="font-medium truncate">{deck.title}</h3>
        {deck.description && (
          <p className="text-sm text-muted-foreground truncate">{deck.description}</p>
        )}
        <div className="flex items-center gap-2 mt-1">
          <Badge variant="secondary" className="text-xs">{deck.cardCount} 张</Badge>
          {deck.dueCards > 0 && (
            <Badge variant="destructive" className="text-xs">{deck.dueCards} 张待复习</Badge>
          )}
          {deck.newCards > 0 && (
            <Badge variant="default" className="text-xs">{deck.newCards} 张新卡片</Badge>
          )}
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Link to="/learning/flashcards/study/$deckId" params={{ deckId: deck.id }}>
          <Button size="sm" disabled={deck.cardCount === 0}>
            <Play className="h-4 w-4 mr-2" />
            学习
          </Button>
        </Link>
        <Link to="/learning/flashcards/$deckId" params={{ deckId: deck.id }}>
          <Button variant="outline" size="sm">管理</Button>
        </Link>
      </div>
    </div>
  )
}

function StatCard({ 
  title, 
  value, 
  icon: Icon,
  color 
}: { 
  title: string; 
  value: number | string; 
  icon: React.ElementType;
  color: string 
}) {
  const colorClasses: Record<string, string> = {
    blue: 'bg-blue-50 text-blue-700 border-blue-200',
    green: 'bg-green-50 text-green-700 border-green-200',
    orange: 'bg-orange-50 text-orange-700 border-orange-200',
    purple: 'bg-purple-50 text-purple-700 border-purple-200',
  }

  return (
    <Card className={colorClasses[color]}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium opacity-80">{title}</p>
            <p className="text-2xl font-bold mt-1">{value}</p>
          </div>
          <Icon className="h-8 w-8 opacity-50" />
        </div>
      </CardContent>
    </Card>
  )
}

function DecksSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <Skeleton key={i} className="h-24" />
        ))}
      </div>
      <Skeleton className="h-8 w-48" />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[...Array(6)].map((_, i) => (
          <Skeleton key={i} className="h-48" />
        ))}
      </div>
    </div>
  )
}

function EmptyState() {
  return (
    <div className="text-center py-16 border-2 border-dashed rounded-lg">
      <Brain className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
      <h3 className="text-lg font-medium mb-2">还没有卡组</h3>
      <p className="text-muted-foreground mb-4">
        创建你的第一个闪卡包开始学习
      </p>
      <Button>
        <Plus className="h-4 w-4 mr-2" />
        新建卡组
      </Button>
    </div>
  )
}

function EmptyStateFiltered({ onClear }: { onClear: () => void }) {
  return (
    <div className="text-center py-16 border-2 border-dashed rounded-lg">
      <Filter className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
      <h3 className="text-lg font-medium mb-2">没有匹配结果</h3>
      <p className="text-muted-foreground mb-4">
        尝试调整筛选条件
      </p>
      <Button variant="outline" onClick={onClear}>
        清除筛选
      </Button>
    </div>
  )
}
