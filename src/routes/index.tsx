import { createFileRoute, Link } from '@tanstack/react-router'
import { BookOpen, Globe, GraduationCap, ArrowRight, Languages } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useState } from 'react'

// 语言数据
const languages = [
  {
    code: 'ja',
    name: '日语',
    nativeName: '日本語',
    flag: '🇯🇵',
    description: '包含词汇、语法、惯用语、课文学习',
    color: 'bg-red-50 border-red-200 hover:border-red-400',
    iconColor: 'text-red-500'
  },
  {
    code: 'en',
    name: '英语',
    nativeName: 'English',
    flag: '🇬🇧',
    description: '词汇、语法、阅读、听力学习',
    color: 'bg-blue-50 border-blue-200 hover:border-blue-400',
    iconColor: 'text-blue-500'
  }
]

// 学科数据
const subjects = [
  {
    code: 'engineer',
    name: '工程师考试',
    description: '工程师资格考试备考资料',
    icon: GraduationCap,
    color: 'bg-purple-50 border-purple-200 hover:border-purple-400',
    iconColor: 'text-purple-500'
  }
]

export const Route = createFileRoute('/')({
  component: HomePage,
})

function HomePage() {
  const [activeTab, setActiveTab] = useState<'language' | 'subject'>('language')

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Hero Section */}
      <div className="text-center space-y-4 py-8">
        <div className="flex items-center justify-center gap-2">
          <Globe className="h-10 w-10 text-primary" />
          <h1 className="text-4xl font-bold">学习中心</h1>
        </div>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          选择学习内容，开始你的学习之旅
        </p>
      </div>

      {/* Tab Selection */}
      <div className="flex justify-center gap-4">
        <Button
          variant={activeTab === 'language' ? 'default' : 'outline'}
          size="lg"
          onClick={() => setActiveTab('language')}
          className="gap-2"
        >
          <Languages className="h-5 w-5" />
          语言学习
        </Button>
        <Button
          variant={activeTab === 'subject' ? 'default' : 'outline'}
          size="lg"
          onClick={() => setActiveTab('subject')}
          className="gap-2"
        >
          <GraduationCap className="h-5 w-5" />
          学科考试
        </Button>
      </div>

      {/* Content Area */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {activeTab === 'language' ? (
          languages.map((lang) => (
            <LanguageCard key={lang.code} language={lang} />
          ))
        ) : (
          subjects.map((subject) => (
            <SubjectCard key={subject.code} subject={subject} />
          ))
        )}
      </div>

      {/* Quick Actions */}
      <div className="flex justify-center gap-4 pt-4">
        <Link to="/import">
          <Button variant="outline" size="lg">
            <ArrowRight className="mr-2 h-4 w-4" />
            批量导入资料
          </Button>
        </Link>
      </div>
    </div>
  )
}

function LanguageCard({ language }: { language: typeof languages[0] }) {
  return (
    <Card className={`group hover:shadow-xl transition-all duration-300 border-2 ${language.color}`}>
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <span className="text-4xl">{language.flag}</span>
            <div>
              <CardTitle className="text-xl">{language.name}</CardTitle>
              <p className="text-sm text-muted-foreground">{language.nativeName}</p>
            </div>
          </div>
          <Badge variant="secondary">N5-N1</Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">{language.description}</p>

        {/* 操作按钮 */}
        <div className="flex gap-2 pt-2">
          <Link to={`/${language.code}` as any} className="flex-1">
            <Button 
              className="w-full"
              variant="default"
            >
              <BookOpen className="mr-2 h-4 w-4" />
              开始学习
              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}

function SubjectCard({ subject }: { subject: typeof subjects[0] }) {
  const Icon = subject.icon
  
  return (
    <Card className={`group hover:shadow-xl transition-all duration-300 border-2 ${subject.color}`}>
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${subject.iconColor} bg-white`}>
              <Icon className="h-8 w-8" />
            </div>
            <div>
              <CardTitle className="text-xl">{subject.name}</CardTitle>
              <p className="text-sm text-muted-foreground">资格考试</p>
            </div>
          </div>
          <Badge variant="secondary">备考</Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">{subject.description}</p>

        {/* 操作按钮 */}
        <div className="flex gap-2 pt-2">
          <Link to="/engineer" className="flex-1">
            <Button 
              className="w-full"
              variant="default"
            >
              <BookOpen className="mr-2 h-4 w-4" />
              开始备考
              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}
