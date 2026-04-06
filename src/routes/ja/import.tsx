import { createFileRoute, Link } from '@tanstack/react-router'
import { Upload, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

import { japaneseConfig } from '@/config/languages'
import { useState } from 'react'

export const Route = createFileRoute('/ja/import')({
  component: JapaneseImportPage,
})

function JapaneseImportPage() {
  const modules = japaneseConfig.modules
  const [hoveredModule, setHoveredModule] = useState<string | null>(null)

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link to="/ja">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold">导入日语资料</h1>
          <p className="text-sm text-muted-foreground">选择要导入的学习模块</p>
        </div>
      </div>

      {/* Module Selection */}
      <Card>
        <CardHeader>
          <CardTitle>选择导入模块</CardTitle>
          <CardDescription>点击模块进入导入向导</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {modules.map((module) => {
            const isHovered = hoveredModule === module.id
            return (
              <Link 
                key={module.id} 
                to={`/ja/${module.id}/import` as any}
                onMouseEnter={() => setHoveredModule(module.id)}
                onMouseLeave={() => setHoveredModule(null)}
                className="block"
              >
                <div className={`flex items-center justify-between p-5 border-2 rounded-xl transition-all duration-200 cursor-pointer ${
                  isHovered 
                    ? 'border-primary bg-primary/5 shadow-lg' 
                    : 'border-border hover:border-primary/50 hover:shadow-md'
                }`}>
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg transition-colors ${
                      isHovered ? 'bg-primary text-primary-foreground' : 'bg-primary/10'
                    }`}>
                      <Upload className={`h-5 w-5 ${isHovered ? 'text-primary-foreground' : 'text-primary'}`} />
                    </div>
                    <div>
                      <p className={`font-medium ${isHovered ? 'text-primary' : ''}`}>{module.name}</p>
                      <p className="text-sm text-muted-foreground">
                        支持格式: {module.importFormats.join(', ')}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {module.importFormats.map(fmt => (
                      <Badge 
                        key={fmt} 
                        variant={isHovered ? "default" : "outline"} 
                        className="text-xs uppercase"
                      >
                        {fmt}
                      </Badge>
                    ))}
                    <ArrowLeft className={`h-4 w-4 transition-all duration-200 ${
                      isHovered ? 'rotate-180 opacity-100 text-primary' : 'opacity-0'
                    }`} />
                  </div>
                </div>
              </Link>
            )
          })}
        </CardContent>
      </Card>

    </div>
  )
}
