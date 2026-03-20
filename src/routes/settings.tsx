import { createFileRoute } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import { Settings, Moon, Sun, Monitor, Globe, Type } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { toast } from 'sonner'

export const Route = createFileRoute('/settings')({
  component: SettingsPage,
})

function SettingsPage() {
  const [theme, setTheme] = useState<'light' | 'dark' | 'system'>('system')
  const [fontSize, setFontSize] = useState<'small' | 'medium' | 'large'>('medium')
  const [language, setLanguage] = useState<'zh' | 'en' | 'ja'>('zh')
  
  useEffect(() => {
    // Load settings from localStorage
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | 'system'
    const savedFontSize = localStorage.getItem('fontSize') as 'small' | 'medium' | 'large'
    const savedLanguage = localStorage.getItem('language') as 'zh' | 'en' | 'ja'
    
    if (savedTheme) setTheme(savedTheme)
    if (savedFontSize) setFontSize(savedFontSize)
    if (savedLanguage) setLanguage(savedLanguage)
  }, [])
  
  const saveSettings = () => {
    localStorage.setItem('theme', theme)
    localStorage.setItem('fontSize', fontSize)
    localStorage.setItem('language', language)
    
    // Apply theme
    if (theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
    
    // Apply font size
    document.documentElement.style.fontSize = fontSize === 'small' ? '14px' : fontSize === 'large' ? '18px' : '16px'
    
    toast.success('设置已保存')
  }
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Settings className="h-6 w-6 text-primary" />
        <h1 className="text-2xl font-bold">设置</h1>
      </div>
      
      {/* Theme Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {theme === 'dark' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
            主题
          </CardTitle>
        </CardHeader>
        <CardContent>
          <RadioGroup value={theme} onValueChange={(v) => setTheme(v as 'light' | 'dark' | 'system')}>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="light" id="light" />
              <Label htmlFor="light" className="flex items-center gap-2">
                <Sun className="h-4 w-4" />
                浅色
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="dark" id="dark" />
              <Label htmlFor="dark" className="flex items-center gap-2">
                <Moon className="h-4 w-4" />
                深色
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="system" id="system" />
              <Label htmlFor="system" className="flex items-center gap-2">
                <Monitor className="h-4 w-4" />
                跟随系统
              </Label>
            </div>
          </RadioGroup>
        </CardContent>
      </Card>
      
      {/* Font Size Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Type className="h-5 w-5" />
            字体大小
          </CardTitle>
        </CardHeader>
        <CardContent>
          <RadioGroup value={fontSize} onValueChange={(v) => setFontSize(v as 'small' | 'medium' | 'large')}>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="small" id="small" />
              <Label htmlFor="small">小</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="medium" id="medium" />
              <Label htmlFor="medium">中</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="large" id="large" />
              <Label htmlFor="large">大</Label>
            </div>
          </RadioGroup>
        </CardContent>
      </Card>
      
      {/* Language Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            语言
          </CardTitle>
        </CardHeader>
        <CardContent>
          <RadioGroup value={language} onValueChange={(v) => setLanguage(v as 'zh' | 'en' | 'ja')}>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="zh" id="zh" />
              <Label htmlFor="zh">中文</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="en" id="en" />
              <Label htmlFor="en">English</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="ja" id="ja" />
              <Label htmlFor="ja">日本語</Label>
            </div>
          </RadioGroup>
        </CardContent>
      </Card>
      
      {/* Save Button */}
      <Button onClick={saveSettings} className="w-full">
        保存设置
      </Button>
    </div>
  )
}
