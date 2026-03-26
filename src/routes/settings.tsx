import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useLearning, LEARNING_LANGUAGES } from '@/contexts/LearningContext'
import { 
  Settings, 
  Moon, 
  Sun, 
  Globe, 
  Type, 
  Monitor, 
  Check,
  GraduationCap,
  BookOpen,
  ChevronRight
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'

export const Route = createFileRoute('/settings')({
  component: SettingsPage,
})

type Theme = 'light' | 'dark' | 'system'
type FontSize = 'small' | 'medium' | 'large'
type UiLanguage = 'zh' | 'en' | 'ja'

function SettingsPage() {
  const navigate = useNavigate()
  const { t, i18n } = useTranslation()
  const { 
    learningLanguage, 
    setLearningLanguage, 
    learningLanguageConfig,
    currentCourse,
    setCurrentCourse
  } = useLearning()
  
  const [theme, setTheme] = useState<Theme>('system')
  const [fontSize, setFontSize] = useState<FontSize>('medium')
  const [uiLanguage, setUiLanguage] = useState<UiLanguage>('zh')
  const [isSaving, setIsSaving] = useState(false)
  
  // Load settings from localStorage on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as Theme
    const savedFontSize = localStorage.getItem('fontSize') as FontSize
    const savedUiLanguage = localStorage.getItem('uiLanguage') as UiLanguage
    
    if (savedTheme) {
      setTheme(savedTheme)
      applyTheme(savedTheme)
    }
    if (savedFontSize) {
      setFontSize(savedFontSize)
      applyFontSize(savedFontSize)
    }
    if (savedUiLanguage) {
      setUiLanguage(savedUiLanguage)
      i18n.changeLanguage(savedUiLanguage)
    }
  }, [i18n])

  // Listen for system theme changes when theme is 'system'
  useEffect(() => {
    if (theme !== 'system') return

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    const handleChange = () => applyTheme('system')
    
    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [theme])

  // Apply theme immediately when changed
  const applyTheme = (newTheme: Theme) => {
    const isDark = newTheme === 'dark' || 
      (newTheme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)
    
    if (isDark) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }

  // Apply font size immediately when changed
  const applyFontSize = (size: FontSize) => {
    const fontSizeMap = { small: '14px', medium: '16px', large: '18px' }
    document.documentElement.style.fontSize = fontSizeMap[size]
  }

  // Save all settings
  const saveSettings = async () => {
    setIsSaving(true)
    
    localStorage.setItem('theme', theme)
    localStorage.setItem('fontSize', fontSize)
    localStorage.setItem('uiLanguage', uiLanguage)
    
    applyTheme(theme)
    applyFontSize(fontSize)
    i18n.changeLanguage(uiLanguage)
    
    await new Promise(resolve => setTimeout(resolve, 500))
    
    toast.success(t('messages.saveSuccess'))
    setIsSaving(false)
  }

  // Options
  const fontSizeOptions: { value: FontSize; label: string }[] = [
    { value: 'small', label: t('common.small') },
    { value: 'medium', label: t('common.medium') },
    { value: 'large', label: t('common.large') },
  ]

  const themeOptions: { value: Theme; label: string; icon: React.ReactNode }[] = [
    { value: 'light', label: t('common.light'), icon: <Sun className="h-5 w-5" /> },
    { value: 'dark', label: t('common.dark'), icon: <Moon className="h-5 w-5" /> },
    { value: 'system', label: t('common.auto'), icon: <Monitor className="h-5 w-5" /> },
  ]

  const uiLanguageOptions: { value: UiLanguage; label: string; flag: string; description: string }[] = [
    { value: 'zh', label: '中文', flag: '🇨🇳', description: '简体中文界面' },
    { value: 'en', label: 'English', flag: '🇺🇸', description: 'English Interface' },
    { value: 'ja', label: '日本語', flag: '🇯🇵', description: '日本語インターフェース' },
  ]

  return (
    <div className="space-y-6 max-w-2xl mx-auto pb-12">
      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="p-2 rounded-lg bg-primary/10">
          <Settings className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">{t('settings.title')}</h1>
          <p className="text-muted-foreground">自定义您的学习体验</p>
        </div>
      </div>

      {/* ==================== 学习设置 ==================== */}
      <Card className="border-primary/20">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-lg">
            <GraduationCap className="h-5 w-5 text-primary" />
            学习设置
          </CardTitle>
          <CardDescription>
            选择您要学习的语言和当前课程
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* 学习语言选择 */}
          <div className="space-y-3">
            <Label className="text-base font-medium">学习语言</Label>
            <p className="text-sm text-muted-foreground">
              选择您正在学习的目标语言，这将影响内容难度等级和词性选项
            </p>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {Object.values(LEARNING_LANGUAGES).map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => setLearningLanguage(lang.code)}
                  className={`relative flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-all ${
                    learningLanguage === lang.code
                      ? 'border-primary bg-primary/5'
                      : 'border-muted hover:border-muted-foreground/30'
                  }`}
                >
                  <span className="text-3xl">{lang.flagEmoji}</span>
                  <div className="text-center">
                    <p className="font-medium">{lang.nameLocal}</p>
                    <p className="text-xs text-muted-foreground">{lang.name}</p>
                  </div>
                  {/* 特性标签 */}
                  <div className="flex flex-wrap justify-center gap-1 mt-1">
                    {lang.features.hasPitchAccent && (
                      <Badge variant="outline" className="text-[10px] h-5">声调</Badge>
                    )}
                    {lang.features.hasConjugation && (
                      <Badge variant="outline" className="text-[10px] h-5">变形</Badge>
                    )}
                    {lang.features.hasTones && (
                      <Badge variant="outline" className="text-[10px] h-5">声调</Badge>
                    )}
                    {lang.features.hasGender && (
                      <Badge variant="outline" className="text-[10px] h-5">性</Badge>
                    )}
                    {lang.features.hasCases && (
                      <Badge variant="outline" className="text-[10px] h-5">格</Badge>
                    )}
                  </div>
                  {learningLanguage === lang.code && (
                    <Check className="h-4 w-4 text-primary absolute top-2 right-2" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* 当前语言信息 */}
          <div className="bg-muted/50 rounded-lg p-4 space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-2xl">{learningLanguageConfig.flagEmoji}</span>
              <span className="font-medium">{learningLanguageConfig.nameLocal}</span>
              <Badge variant="secondary" className="ml-auto">
                {learningLanguageConfig.difficultyLevels.length} 个难度等级
              </Badge>
            </div>
            <div className="text-sm text-muted-foreground">
              <p>书写系统: {learningLanguageConfig.writingSystem === 'cjk' ? '中日韩文字' : learningLanguageConfig.writingSystem === 'latin' ? '拉丁字母' : '其他'}</p>
              <p>分词: {learningLanguageConfig.hasSpaces ? '有空格分隔' : '无空格分隔'}</p>
            </div>
          </div>

          {/* 当前课程 */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-base font-medium">当前课程</Label>
              <Button variant="ghost" size="sm" onClick={() => navigate({ to: '/learning/courses' })}>
                管理课程
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
            {currentCourse ? (
              <div className="flex items-center gap-3 p-3 border rounded-lg bg-card">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <BookOpen className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="font-medium">{currentCourse.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {currentCourse.levelFrom} - {currentCourse.levelTo} · {currentCourse.lessonCount} 课
                  </p>
                </div>
                <Button variant="ghost" size="sm" onClick={() => setCurrentCourse(null)}>
                  取消
                </Button>
              </div>
            ) : (
              <div className="text-center p-6 border border-dashed rounded-lg">
                <BookOpen className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-muted-foreground">未选择课程</p>
                <Button variant="outline" size="sm" className="mt-2" onClick={() => navigate({ to: '/learning/courses' })}>
                  选择课程
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* ==================== 界面语言 ==================== */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Globe className="h-5 w-5" />
            界面语言
          </CardTitle>
          <CardDescription>
            选择应用界面的显示语言
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {uiLanguageOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => {
                setUiLanguage(option.value)
                i18n.changeLanguage(option.value)
                localStorage.setItem('uiLanguage', option.value)
              }}
              className={`w-full flex items-center justify-between p-4 rounded-lg border-2 transition-all ${
                uiLanguage === option.value
                  ? 'border-primary bg-primary/5'
                  : 'border-muted hover:border-muted-foreground/30'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">{option.flag}</span>
                <div className="text-left">
                  <span className="font-medium">{option.label}</span>
                  <p className="text-xs text-muted-foreground">{option.description}</p>
                </div>
              </div>
              {uiLanguage === option.value && (
                <Check className="h-5 w-5 text-primary" />
              )}
            </button>
          ))}
        </CardContent>
      </Card>
      
      {/* ==================== 外观设置 ==================== */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-lg">
            {theme === 'system' ? <Monitor className="h-5 w-5" /> : theme === 'dark' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
            {t('common.theme')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-3">
            {themeOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => {
                  setTheme(option.value)
                  applyTheme(option.value)
                  localStorage.setItem('theme', option.value)
                }}
                className={`relative flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-all ${
                  theme === option.value
                    ? 'border-primary bg-primary/5'
                    : 'border-muted hover:border-muted-foreground/30'
                }`}
              >
                {option.icon}
                <span className="text-sm font-medium">{option.label}</span>
                {theme === option.value && (
                  <Check className="h-4 w-4 text-primary absolute top-2 right-2" />
                )}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>
      
      {/* ==================== 字体大小 ==================== */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Type className="h-5 w-5" />
            {t('common.fontSize')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-3">
            {fontSizeOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => {
                  setFontSize(option.value)
                  applyFontSize(option.value)
                  localStorage.setItem('fontSize', option.value)
                }}
                className={`relative flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-all ${
                  fontSize === option.value
                    ? 'border-primary bg-primary/5'
                    : 'border-muted hover:border-muted-foreground/30'
                }`}
              >
                <span 
                  className="font-bold"
                  style={{ 
                    fontSize: option.value === 'small' ? '14px' : option.value === 'large' ? '18px' : '16px' 
                  }}
                >
                  A
                </span>
                <span className="text-sm">{option.label}</span>
                {fontSize === option.value && (
                  <Check className="h-4 w-4 text-primary absolute top-2 right-2" />
                )}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>
      
      {/* ==================== 保存按钮 ==================== */}
      <Button onClick={saveSettings} className="w-full" size="lg" disabled={isSaving}>
        {isSaving ? '保存中...' : t('common.save')}
      </Button>
    </div>
  )
}

// Label 组件
function Label({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <label className={`text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 ${className}`}>
      {children}
    </label>
  )
}
