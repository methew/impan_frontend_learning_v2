import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { Loader2, RotateCcw } from 'lucide-react'
import { 
  useCoreSettings, 
  useUpdateCoreSettings,
  useResetCoreSettings,
  useLearningSettings,
  useUpdateLearningSettings,
  useResetLearningSettings,
} from '@/hooks'
import { toast } from 'sonner'

export const Route = createFileRoute('/settings')({
  component: SettingsPage,
})

function SettingsPage() {
  const { t } = useTranslation()
  
  // Core Settings
  const { data: coreSettings, isLoading: isLoadingCore } = useCoreSettings()
  const updateCore = useUpdateCoreSettings()
  const resetCore = useResetCoreSettings()

  // Learning Settings
  const { data: learningSettings, isLoading: isLoadingLearning } = useLearningSettings()
  const updateLearning = useUpdateLearningSettings()
  const resetLearning = useResetLearningSettings()

  // Local state for form values
  const [theme, setTheme] = useState(coreSettings?.theme || 'light')
  const [language, setLanguage] = useState(coreSettings?.language || 'zh')
  const [notifications, setNotifications] = useState(coreSettings?.notifications_enabled ?? true)
  
  const [dailyGoalMinutes, setDailyGoalMinutes] = useState(learningSettings?.daily_goal_minutes || 30)
  const [dailyGoalCards, setDailyGoalCards] = useState(learningSettings?.daily_goal_cards || 10)
  const [reminderEnabled, setReminderEnabled] = useState(learningSettings?.reminder_enabled ?? true)
  const [autoPlayAudio, setAutoPlayAudio] = useState(learningSettings?.auto_play_audio ?? true)

  const handleSaveCore = async () => {
    try {
      await updateCore.mutateAsync({
        theme: theme as 'light' | 'dark' | 'system',
        language: language as 'zh' | 'en' | 'ja',
        notifications_enabled: notifications,
      })
      toast.success(t('settings.saveSuccess'))
    } catch {
      toast.error(t('settings.saveError'))
    }
  }

  const handleSaveLearning = async () => {
    try {
      await updateLearning.mutateAsync({
        daily_goal_minutes: dailyGoalMinutes,
        daily_goal_cards: dailyGoalCards,
        reminder_enabled: reminderEnabled,
        auto_play_audio: autoPlayAudio,
      })
      toast.success(t('settings.saveSuccess'))
    } catch {
      toast.error(t('settings.saveError'))
    }
  }

  const handleResetCore = async () => {
    try {
      await resetCore.mutateAsync()
      toast.success(t('settings.resetSuccess'))
    } catch {
      toast.error(t('settings.resetError'))
    }
  }

  const handleResetLearning = async () => {
    try {
      await resetLearning.mutateAsync()
      toast.success(t('settings.resetSuccess'))
    } catch {
      toast.error(t('settings.resetError'))
    }
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">{t('settings.title')}</h1>

      {/* Core Settings */}
      <Card>
        <CardHeader>
          <CardTitle>{t('settings.coreSettings')}</CardTitle>
          <CardDescription>{t('settings.coreDescription')}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {isLoadingCore ? (
            <div className="flex items-center justify-center h-32">
              <Loader2 className="size-6 animate-spin" />
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>{t('settings.theme')}</Label>
                  <Select value={theme} onValueChange={setTheme}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="light">{t('settings.themeLight')}</SelectItem>
                      <SelectItem value="dark">{t('settings.themeDark')}</SelectItem>
                      <SelectItem value="system">{t('settings.themeSystem')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>{t('settings.language')}</Label>
                  <Select value={language} onValueChange={setLanguage}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="zh">{t('settings.languageZh')}</SelectItem>
                      <SelectItem value="en">{t('settings.languageEn')}</SelectItem>
                      <SelectItem value="ja">{t('settings.languageJa')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>{t('settings.notifications')}</Label>
                  <p className="text-sm text-muted-foreground">
                    {t('settings.notificationsDescription')}
                  </p>
                </div>
                <Switch 
                  checked={notifications} 
                  onCheckedChange={setNotifications}
                />
              </div>

              <Separator />

              <div className="flex justify-between">
                <Button 
                  variant="outline" 
                  onClick={handleResetCore}
                  disabled={resetCore.isPending}
                >
                  {resetCore.isPending ? (
                    <Loader2 className="mr-2 size-4 animate-spin" />
                  ) : (
                    <RotateCcw className="mr-2 size-4" />
                  )}
                  {t('common.reset')}
                </Button>
                <Button 
                  onClick={handleSaveCore}
                  disabled={updateCore.isPending}
                >
                  {updateCore.isPending && (
                    <Loader2 className="mr-2 size-4 animate-spin" />
                  )}
                  {t('common.save')}
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Learning Settings */}
      <Card>
        <CardHeader>
          <CardTitle>{t('settings.learningSettings')}</CardTitle>
          <CardDescription>{t('settings.learningDescription')}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {isLoadingLearning ? (
            <div className="flex items-center justify-center h-32">
              <Loader2 className="size-6 animate-spin" />
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>{t('settings.dailyGoalMinutes')}</Label>
                  <Input
                    type="number"
                    min={5}
                    max={180}
                    value={dailyGoalMinutes}
                    onChange={(e) => setDailyGoalMinutes(parseInt(e.target.value))}
                  />
                </div>

                <div className="space-y-2">
                  <Label>{t('settings.dailyGoalCards')}</Label>
                  <Input
                    type="number"
                    min={1}
                    max={100}
                    value={dailyGoalCards}
                    onChange={(e) => setDailyGoalCards(parseInt(e.target.value))}
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>{t('settings.reminder')}</Label>
                    <p className="text-sm text-muted-foreground">
                      {t('settings.reminderDescription')}
                    </p>
                  </div>
                  <Switch 
                    checked={reminderEnabled} 
                    onCheckedChange={setReminderEnabled}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>{t('settings.autoPlayAudio')}</Label>
                    <p className="text-sm text-muted-foreground">
                      {t('settings.autoPlayAudioDescription')}
                    </p>
                  </div>
                  <Switch 
                    checked={autoPlayAudio} 
                    onCheckedChange={setAutoPlayAudio}
                  />
                </div>
              </div>

              <Separator />

              <div className="flex justify-between">
                <Button 
                  variant="outline" 
                  onClick={handleResetLearning}
                  disabled={resetLearning.isPending}
                >
                  {resetLearning.isPending ? (
                    <Loader2 className="mr-2 size-4 animate-spin" />
                  ) : (
                    <RotateCcw className="mr-2 size-4" />
                  )}
                  {t('common.reset')}
                </Button>
                <Button 
                  onClick={handleSaveLearning}
                  disabled={updateLearning.isPending}
                >
                  {updateLearning.isPending && (
                    <Loader2 className="mr-2 size-4 animate-spin" />
                  )}
                  {t('common.save')}
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
