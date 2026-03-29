import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import { useLearning, LEARNING_LANGUAGES, type LearningLanguage } from '@/contexts/LearningContext'
import { 
  ArrowLeft,
  Save,
  TreeDeciduous,
  FlaskConical,
  BookOpen,
  Layers,
  Plus,
  X,
  ChevronDown,
  ChevronUp,
  Globe
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

export const Route = createFileRoute('/learning/content/new')({
  component: NewContentPage,
})

type ContentType = 'vocab' | 'grammar' | 'idiom' | 'text'

const contentTypes = [
  { value: 'vocab' as const, label: '词汇', description: '单词、短语', icon: TreeDeciduous, color: 'bg-emerald-500' },
  { value: 'grammar' as const, label: '语法', description: '语法规则、句型', icon: FlaskConical, color: 'bg-cyan-500' },
  { value: 'idiom' as const, label: '惯用语', description: '成语、惯用表达', icon: Layers, color: 'bg-indigo-500' },
  { value: 'text' as const, label: '课文', description: '文章、对话', icon: BookOpen, color: 'bg-rose-500' },
]

// 惯用句类型（按语言）
const getIdiomTypes = (lang: LearningLanguage | string) => {
  const common = [
    { value: 'idiom', label: '习语' },
    { value: 'proverb', label: '谚语' },
  ]
  
  const langSpecific: Record<LearningLanguage, { value: string; label: string }[]> = {
    ja: [
      { value: 'yojijukugo', label: '四字熟语' },
      { value: 'kotowaza', label: '谚语' },
      { value: 'kanyouku', label: '惯用句' },
      { value: 'meigen', label: '名言' },
    ],
    zh: [
      { value: 'chengyu', label: '成语' },
      { value: 'xiehouyu', label: '歇后语' },
      { value: 'suyu', label: '俗语' },
    ],
    en: [
      { value: 'slang', label: '俚语' },
      { value: 'expression', label: '惯用表达' },
    ],
    ko: [
      { value: 'sokdak', label: '속담' },
      { value: 'pyosik', label: '표식' },
    ],
    fr: [
      { value: 'expression', label: 'Expression' },
      { value: 'locution', label: 'Locution' },
    ],
    de: [
      { value: 'redewendung', label: 'Redewendung' },
      { value: 'sprichwort', label: 'Sprichwort' },
    ],
    es: [
      { value: 'modismo', label: 'Modismo' },
      { value: 'refran', label: 'Refrán' },
    ],
  }
  
  return [...(langSpecific[lang as LearningLanguage] || []), ...common]
}

// ============ 词汇树形结构 ============
interface Example {
  sentence: string
  translation: string
  note: string
}

interface Sense {
  definition: string
  partOfSpeech: string
  examples: Example[]
}

interface Reading {
  reading: string
  pitchAccent?: string
  senses: Sense[]
}

interface VocabForm {
  term: string
  readings: Reading[]
  tags: string[]
  difficulty: string  // 改为 string 以支持不同语言的等级
  notes: string
}

// ============ 语法树形结构 ============
interface GrammarExample {
  sentence: string
  translation: string
  structure: string
}

interface GrammarForm {
  pattern: string
  meaning: string
  structure: string
  usage: string
  examples: GrammarExample[]
  relatedPatterns: string[]
  tags: string[]
  difficulty: string
}

// ============ 惯用句树形结构 ============
interface IdiomForm {
  term: string
  reading: string
  literalMeaning: string
  actualMeaning: string
  idiomType: string
  englishEquivalent: string
  examples: { sentence: string; translation: string }[]
  difficulty: string
  formality: 'formal' | 'neutral' | 'informal'
}

// ============ 课文树形结构 ============
interface TextForm {
  title: string
  content: string
  translation: string
  difficulty: string
  estimatedTime: number | ''
}

function NewContentPage() {
  const navigate = useNavigate()
  const { 
    learningLanguage, 
    learningLanguageConfig, 
    userCourses, 
    refreshCourses,
    getDifficultyLevels,
    getPosOptions,
    hasFeature 
  } = useLearning()
  
  const [isSaving, setIsSaving] = useState(false)
  const [contentType, setContentType] = useState<ContentType>('vocab')
  const [collapsedReadings, setCollapsedReadings] = useState<Set<number>>(new Set())
  
  // 课程选择
  const [selectedCourseId, setSelectedCourseId] = useState<string>('')
  
  // 加载课程列表
  useEffect(() => {
    refreshCourses()
  }, [learningLanguage])
  

  const difficultyLevels = getDifficultyLevels()
  const posOptions = getPosOptions()

  // ============ 词汇表单状态 ============
  const [vocabForm, setVocabForm] = useState<VocabForm>({
    term: '',
    readings: [{
      reading: '',
      pitchAccent: '',
      senses: [{
        definition: '',
        partOfSpeech: '',
        examples: [{ sentence: '', translation: '', note: '' }]
      }]
    }],
    tags: [],
    difficulty: '',
    notes: ''
  })

  const [tagInput, setTagInput] = useState('')

  // ============ 语法表单状态 ============
  const [grammarForm, setGrammarForm] = useState<GrammarForm>({
    pattern: '',
    meaning: '',
    structure: '',
    usage: '',
    examples: [{ sentence: '', translation: '', structure: '' }],
    relatedPatterns: [],
    tags: [],
    difficulty: ''
  })

  // ============ 惯用句表单状态 ============
  const [idiomForm, setIdiomForm] = useState<IdiomForm>({
    term: '',
    reading: '',
    literalMeaning: '',
    actualMeaning: '',
    idiomType: getIdiomTypes(learningLanguage)[0]?.value || 'idiom',
    englishEquivalent: '',
    examples: [{ sentence: '', translation: '' }],
    difficulty: '',
    formality: 'neutral'
  })

  // ============ 课文表单状态 ============
  const [textForm, setTextForm] = useState<TextForm>({
    title: '',
    content: '',
    translation: '',
    difficulty: '',
    estimatedTime: ''
  })

  // 语言切换时重置表单
  useEffect(() => {
    setVocabForm(prev => ({ ...prev, difficulty: '' }))
    setGrammarForm(prev => ({ ...prev, difficulty: '' }))
    setIdiomForm(prev => ({ ...prev, difficulty: '', idiomType: getIdiomTypes(learningLanguage)[0]?.value || 'idiom' }))
    setTextForm(prev => ({ ...prev, difficulty: '' }))
  }, [learningLanguage])

  // ============ 词汇操作 ============
  const addReading = () => {
    setVocabForm(prev => ({
      ...prev,
      readings: [...prev.readings, {
        reading: '',
        pitchAccent: '',
        senses: [{
          definition: '',
          partOfSpeech: '',
          examples: [{ sentence: '', translation: '', note: '' }]
        }]
      }]
    }))
  }

  const removeReading = (rIdx: number) => {
    if (vocabForm.readings.length <= 1) return
    setVocabForm(prev => ({
      ...prev,
      readings: prev.readings.filter((_, i) => i !== rIdx)
    }))
  }

  const updateReading = (rIdx: number, field: keyof Reading, value: string) => {
    setVocabForm(prev => ({
      ...prev,
      readings: prev.readings.map((r, i) => i === rIdx ? { ...r, [field]: value } : r)
    }))
  }

  const addSense = (rIdx: number) => {
    setVocabForm(prev => ({
      ...prev,
      readings: prev.readings.map((r, i) => i === rIdx ? {
        ...r,
        senses: [...r.senses, { definition: '', partOfSpeech: '', examples: [{ sentence: '', translation: '', note: '' }] }]
      } : r)
    }))
  }

  const removeSense = (rIdx: number, sIdx: number) => {
    if (vocabForm.readings[rIdx].senses.length <= 1) return
    setVocabForm(prev => ({
      ...prev,
      readings: prev.readings.map((r, i) => i === rIdx ? {
        ...r,
        senses: r.senses.filter((_, j) => j !== sIdx)
      } : r)
    }))
  }

  const updateSense = (rIdx: number, sIdx: number, field: keyof Sense, value: string) => {
    setVocabForm(prev => ({
      ...prev,
      readings: prev.readings.map((r, i) => i === rIdx ? {
        ...r,
        senses: r.senses.map((s, j) => j === sIdx ? { ...s, [field]: value } : s)
      } : r)
    }))
  }

  const addExample = (rIdx: number, sIdx: number) => {
    setVocabForm(prev => ({
      ...prev,
      readings: prev.readings.map((r, i) => i === rIdx ? {
        ...r,
        senses: r.senses.map((s, j) => j === sIdx ? {
          ...s,
          examples: [...s.examples, { sentence: '', translation: '', note: '' }]
        } : s)
      } : r)
    }))
  }

  const removeExample = (rIdx: number, sIdx: number, eIdx: number) => {
    if (vocabForm.readings[rIdx].senses[sIdx].examples.length <= 1) return
    setVocabForm(prev => ({
      ...prev,
      readings: prev.readings.map((r, i) => i === rIdx ? {
        ...r,
        senses: r.senses.map((s, j) => j === sIdx ? {
          ...s,
          examples: s.examples.filter((_, k) => k !== eIdx)
        } : s)
      } : r)
    }))
  }

  const updateExample = (rIdx: number, sIdx: number, eIdx: number, field: keyof Example, value: string) => {
    setVocabForm(prev => ({
      ...prev,
      readings: prev.readings.map((r, i) => i === rIdx ? {
        ...r,
        senses: r.senses.map((s, j) => j === sIdx ? {
          ...s,
          examples: s.examples.map((e, k) => k === eIdx ? { ...e, [field]: value } : e)
        } : s)
      } : r)
    }))
  }

  const toggleReadingCollapse = (rIdx: number) => {
    setCollapsedReadings(prev => {
      const next = new Set(prev)
      if (next.has(rIdx)) next.delete(rIdx)
      else next.add(rIdx)
      return next
    })
  }

  // ============ 语法操作 ============
  const addGrammarExample = () => {
    setGrammarForm(prev => ({
      ...prev,
      examples: [...prev.examples, { sentence: '', translation: '', structure: '' }]
    }))
  }

  const removeGrammarExample = (idx: number) => {
    if (grammarForm.examples.length <= 1) return
    setGrammarForm(prev => ({
      ...prev,
      examples: prev.examples.filter((_, i) => i !== idx)
    }))
  }

  const updateGrammarExample = (idx: number, field: keyof GrammarExample, value: string) => {
    setGrammarForm(prev => ({
      ...prev,
      examples: prev.examples.map((e, i) => i === idx ? { ...e, [field]: value } : e)
    }))
  }

  // ============ 标签操作 ============
  const addTag = () => {
    if (!tagInput.trim()) return
    const tag = tagInput.trim()
    if (contentType === 'vocab') {
      setVocabForm(prev => ({ ...prev, tags: [...prev.tags, tag] }))
    } else if (contentType === 'grammar') {
      setGrammarForm(prev => ({ ...prev, tags: [...prev.tags, tag] }))
    }
    setTagInput('')
  }

  const removeTag = (tag: string) => {
    if (contentType === 'vocab') {
      setVocabForm(prev => ({ ...prev, tags: prev.tags.filter(t => t !== tag) }))
    } else if (contentType === 'grammar') {
      setGrammarForm(prev => ({ ...prev, tags: prev.tags.filter(t => t !== tag) }))
    }
  }

  // ============ 惯用句操作 ============
  const addIdiomExample = () => {
    setIdiomForm(prev => ({
      ...prev,
      examples: [...prev.examples, { sentence: '', translation: '' }]
    }))
  }

  const removeIdiomExample = (idx: number) => {
    if (idiomForm.examples.length <= 1) return
    setIdiomForm(prev => ({
      ...prev,
      examples: prev.examples.filter((_, i) => i !== idx)
    }))
  }

  const updateIdiomExample = (idx: number, field: 'sentence' | 'translation', value: string) => {
    setIdiomForm(prev => ({
      ...prev,
      examples: prev.examples.map((e, i) => i === idx ? { ...e, [field]: value } : e)
    }))
  }

  // ============ 提交处理 ============
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)

    let submitData: any = {
      language: learningLanguage,
      course_id: selectedCourseId || null,
    }

    if (contentType === 'vocab') {
      if (!vocabForm.term.trim()) {
        toast.error('请输入词汇')
        setIsSaving(false)
        return
      }
      submitData = { ...submitData, ...buildVocabTree(vocabForm) }
    } else if (contentType === 'grammar') {
      if (!grammarForm.pattern.trim()) {
        toast.error('请输入语法模式')
        setIsSaving(false)
        return
      }
      submitData = { ...submitData, ...buildGrammarTree(grammarForm) }
    } else if (contentType === 'idiom') {
      if (!idiomForm.term.trim()) {
        toast.error('请输入惯用句')
        setIsSaving(false)
        return
      }
      submitData = { ...submitData, ...buildIdiomTree(idiomForm) }
    } else if (contentType === 'text') {
      if (!textForm.title.trim()) {
        toast.error('请输入课文标题')
        setIsSaving(false)
        return
      }
      submitData = { ...submitData, ...buildTextTree(textForm) }
    }

    console.log('Submit data:', JSON.stringify(submitData, null, 2))

    await new Promise(resolve => setTimeout(resolve, 800))
    toast.success('创建成功')
    setIsSaving(false)
    navigate({ to: '/learning/content' })
  }

  // ============ 构建树形结构 ============
  const buildVocabTree = (form: VocabForm) => ({
    node_type: 'term',
    content: form.term,
    difficulty_level: form.difficulty || null,
    children: form.readings.filter(r => r.reading.trim()).map((reading, rIdx) => ({
      node_type: 'reading',
      content: reading.reading,
      content_json: { 
        pitch_accent: reading.pitchAccent,
        ...(hasFeature('hasPitchAccent') ? {} : { pitch_accent: undefined })
      },
      order: rIdx + 1,
      children: reading.senses.filter(s => s.definition.trim()).map((sense, sIdx) => ({
        node_type: 'sense',
        content: sense.definition,
        content_json: { 
          part_of_speech: sense.partOfSpeech,
        },
        order: sIdx + 1,
        children: sense.examples.filter(e => e.sentence.trim()).map((ex, eIdx) => ({
          node_type: 'example',
          content: ex.sentence,
          content_json: { 
            translation: ex.translation,
            note: ex.note
          },
          order: eIdx + 1
        }))
      }))
    }))
  })

  const buildGrammarTree = (form: GrammarForm) => ({
    node_type: 'term',
    content: form.pattern,
    difficulty_level: form.difficulty || null,
    conjugation_pattern: form.structure,
    grammar_tags: form.tags,
    children: [{
      node_type: 'usage_rule',
      content: form.usage || form.meaning,
      children: form.examples.filter(e => e.sentence.trim()).map((ex, idx) => ({
        node_type: 'example',
        content: ex.sentence,
        content_json: { 
          translation: ex.translation,
          structure: ex.structure
        },
        order: idx + 1
      }))
    }]
  })

  const buildIdiomTree = (form: IdiomForm) => ({
    node_type: 'term',
    content: form.term,
    idiom_type: form.idiomType,
    difficulty_level: form.difficulty || null,
    formality: form.formality,
    english_equivalent: form.englishEquivalent,
    children: [
      ...(form.reading ? [{
        node_type: 'reading',
        content: form.reading
      }] : []),
      ...(form.literalMeaning ? [{
        node_type: 'literal_meaning',
        content: form.literalMeaning
      }] : []),
      ...(form.actualMeaning ? [{
        node_type: 'sense',
        content: form.actualMeaning,
        children: form.examples.filter(e => e.sentence.trim()).map((ex, idx) => ({
          node_type: 'example',
          content: ex.sentence,
          content_json: { translation: ex.translation },
          order: idx + 1
        }))
      }] : [])
    ]
  })

  const buildTextTree = (form: TextForm) => ({
    node_type: 'term',
    content: form.title,
    difficulty_level: form.difficulty || null,
    estimated_duration: form.estimatedTime || null,
    children: [{
      node_type: 'section',
      section_type: 'text',
      content: form.content,
      children: [{
        node_type: 'translation',
        content: form.translation
      }]
    }]
  })

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate({ to: '/learning/content' })}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold">新建学习内容</h1>
          <p className="text-muted-foreground">添加新的学习材料到知识库</p>
        </div>
        {/* 当前学习语言显示 */}
        <div className="flex items-center gap-2 px-3 py-1.5 bg-muted rounded-full text-sm">
          <span className="text-lg">{learningLanguageConfig.flagEmoji}</span>
          <span>{learningLanguageConfig.nameLocal}</span>
        </div>
      </div>

      {/* 语言和课程选择 */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Globe className="h-4 w-4" />
            语言和课程
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* 学习语言 */}
          <div className="space-y-2">
            <Label>学习语言</Label>
            <div className="flex flex-wrap gap-2">
              {Object.values(LEARNING_LANGUAGES).map((lang) => (
                <button
                  key={lang.code}
                  type="button"
                  onClick={() => {/* 切换到设置页面更改 */}}
                  disabled={lang.code !== learningLanguage}
                  className={cn(
                    "flex items-center gap-2 px-3 py-2 rounded-lg border-2 text-sm transition-all",
                    lang.code === learningLanguage
                      ? "border-primary bg-primary/5"
                      : "border-muted opacity-50 cursor-not-allowed"
                  )}
                  title="在设置中更改学习语言"
                >
                  <span>{lang.flagEmoji}</span>
                  <span>{lang.nameLocal}</span>
                </button>
              ))}
            </div>
            <p className="text-xs text-muted-foreground">
              在设置中更改学习语言
            </p>
          </div>

          {/* 课程选择 */}
          <div className="space-y-2">
            <Label htmlFor="course">所属课程（可选）</Label>
            <select
              id="course"
              value={selectedCourseId}
              onChange={(e) => setSelectedCourseId(e.target.value)}
              className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm"
            >
              <option value="">-- 不属于任何课程 --</option>
              <optgroup label="我的课程">
                {userCourses.map(course => (
                  <option key={course.id} value={course.id}>
                    {course.name} ({course.levelFrom}-{course.levelTo})
                  </option>
                ))}
              </optgroup>
            </select>
            {userCourses.length === 0 && (
              <p className="text-xs text-muted-foreground">
                暂无{learningLanguage}课程，
                <button type="button" className="text-primary hover:underline" onClick={() => navigate({ to: '/learning/courses' })}>
                  创建课程
                </button>
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* 内容类型选择 */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">选择内容类型</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {contentTypes.map((type) => {
              const Icon = type.icon
              const isSelected = contentType === type.value
              return (
                <button
                  key={type.value}
                  type="button"
                  onClick={() => setContentType(type.value)}
                  className={cn(
                    "flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-all",
                    isSelected
                      ? `border-${type.color.replace('bg-', '')} ${type.color.replace('bg-', 'bg-').replace('500', '50')}`
                      : "border-muted hover:border-muted-foreground/30"
                  )}
                >
                  <div className={cn("p-2 rounded-lg text-white", type.color)}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="text-center">
                    <p className="font-medium">{type.label}</p>
                    <p className="text-xs text-muted-foreground">{type.description}</p>
                  </div>
                </button>
              )
            })}
          </div>
        </CardContent>
      </Card>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* ========== 词汇表单 ========== */}
        {contentType === 'vocab' && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TreeDeciduous className="h-5 w-5 text-emerald-500" />
                词汇信息
              </CardTitle>
              <CardDescription>
                {learningLanguageConfig.nameLocal} → 读音 → 含义 → 例句
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* 词汇词条 */}
              <div className="space-y-2">
                <Label htmlFor="term">词汇 <span className="text-red-500">*</span></Label>
                <Input
                  id="term"
                  value={vocabForm.term}
                  onChange={(e) => setVocabForm(prev => ({ ...prev, term: e.target.value }))}
                  placeholder={`如：${learningLanguage === 'ja' ? '食べる' : learningLanguage === 'en' ? 'hello' : '你好'}`}
                  className="text-lg"
                  required
                />
              </div>

              {/* 读音列表 */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label>读音</Label>
                  <Button type="button" variant="outline" size="sm" onClick={addReading}>
                    <Plus className="h-4 w-4 mr-1" />
                    添加读音
                  </Button>
                </div>

                {vocabForm.readings.map((reading, rIdx) => {
                  const isCollapsed = collapsedReadings.has(rIdx)
                  return (
                    <div key={rIdx} className="border rounded-lg overflow-hidden">
                      {/* 读音头部 */}
                      <div className="bg-muted/50 p-3 flex items-center gap-3">
                        <button
                          type="button"
                          onClick={() => toggleReadingCollapse(rIdx)}
                          className="p-1 hover:bg-muted rounded"
                        >
                          {isCollapsed ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
                        </button>
                        <span className="text-sm font-medium text-muted-foreground">读音 {rIdx + 1}</span>
                        <Input
                          value={reading.reading}
                          onChange={(e) => updateReading(rIdx, 'reading', e.target.value)}
                          placeholder={learningLanguage === 'ja' ? '如：たべる' : learningLanguage === 'en' ? '如：/həˈloʊ/' : '如：nǐ hǎo'}
                          className="flex-1 h-8"
                        />
                        {/* 声调/声调标记 - 语言特定 */}
                        {hasFeature('hasPitchAccent') && (
                          <Input
                            value={reading.pitchAccent}
                            onChange={(e) => updateReading(rIdx, 'pitchAccent', e.target.value)}
                            placeholder="声调如：LHH"
                            className="w-24 h-8 text-xs"
                          />
                        )}
                        {vocabForm.readings.length > 1 && (
                          <Button type="button" variant="ghost" size="icon" className="h-8 w-8" onClick={() => removeReading(rIdx)}>
                            <X className="h-4 w-4" />
                          </Button>
                        )}
                      </div>

                      {/* 含义列表 */}
                      {!isCollapsed && (
                        <div className="p-4 space-y-4">
                          <div className="flex items-center justify-between">
                            <Label className="text-sm">含义</Label>
                            <Button type="button" variant="ghost" size="sm" onClick={() => addSense(rIdx)}>
                              <Plus className="h-3 w-3 mr-1" />
                              添加含义
                            </Button>
                          </div>

                          {reading.senses.map((sense, sIdx) => (
                            <div key={sIdx} className="bg-muted/30 rounded-lg p-4 space-y-3">
                              {/* 含义头部 */}
                              <div className="flex items-start gap-3">
                                <span className="text-xs text-muted-foreground mt-2">含义 {sIdx + 1}</span>
                                <div className="flex-1 grid grid-cols-2 gap-3">
                                  <select
                                    value={sense.partOfSpeech}
                                    onChange={(e) => updateSense(rIdx, sIdx, 'partOfSpeech', e.target.value)}
                                    className="h-9 rounded-md border border-input bg-background px-3 text-sm"
                                  >
                                    <option value="">选择词性</option>
                                    {posOptions.map(pos => (
                                      <option key={pos.value} value={pos.value}>{pos.label}</option>
                                    ))}
                                  </select>
                                  <Input
                                    value={sense.definition}
                                    onChange={(e) => updateSense(rIdx, sIdx, 'definition', e.target.value)}
                                    placeholder="含义解释"
                                  />
                                </div>
                                {reading.senses.length > 1 && (
                                  <Button type="button" variant="ghost" size="icon" className="h-8 w-8" onClick={() => removeSense(rIdx, sIdx)}>
                                    <X className="h-4 w-4" />
                                  </Button>
                                )}
                              </div>

                              {/* 例句列表 */}
                              <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                  <span className="text-xs text-muted-foreground">例句</span>
                                  <Button type="button" variant="ghost" size="sm" className="h-6 text-xs" onClick={() => addExample(rIdx, sIdx)}>
                                    <Plus className="h-3 w-3 mr-1" />
                                    例句
                                  </Button>
                                </div>
                                {sense.examples.map((ex, eIdx) => (
                                  <div key={eIdx} className="space-y-2 pl-4 border-l-2 border-emerald-200">
                                    <Input
                                      value={ex.sentence}
                                      onChange={(e) => updateExample(rIdx, sIdx, eIdx, 'sentence', e.target.value)}
                                      placeholder="例句"
                                      className="text-sm"
                                    />
                                    <div className="flex gap-2">
                                      <Input
                                        value={ex.translation}
                                        onChange={(e) => updateExample(rIdx, sIdx, eIdx, 'translation', e.target.value)}
                                        placeholder="翻译"
                                        className="text-sm flex-1"
                                      />
                                      <Input
                                        value={ex.note}
                                        onChange={(e) => updateExample(rIdx, sIdx, eIdx, 'note', e.target.value)}
                                        placeholder="备注（如语法说明）"
                                        className="text-sm w-40"
                                      />
                                      {sense.examples.length > 1 && (
                                        <Button type="button" variant="ghost" size="icon" className="h-9 w-9" onClick={() => removeExample(rIdx, sIdx, eIdx)}>
                                          <X className="h-4 w-4" />
                                        </Button>
                                      )}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>

              {/* 标签 */}
              <div className="space-y-2">
                <Label>标签</Label>
                <div className="flex gap-2">
                  <Input
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    placeholder={`添加标签（如：${learningLanguage.toUpperCase()}、常用）`}
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                  />
                  <Button type="button" variant="outline" onClick={addTag}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {vocabForm.tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="gap-1">
                      {tag}
                      <button type="button" onClick={() => removeTag(tag)}>
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>

              {/* 难度 - 动态根据语言 */}
              <div className="space-y-2">
                <Label>难度等级 ({learningLanguageConfig.difficultyLevels[0]?.name.split(/\d/)[0]} 体系)</Label>
                <div className="flex flex-wrap gap-2">
                  {difficultyLevels.map((level) => (
                    <button
                      key={level.code}
                      type="button"
                      onClick={() => setVocabForm(prev => ({ ...prev, difficulty: level.code }))}
                      className={cn(
                        "px-4 py-2 rounded-lg border-2 text-sm font-medium transition-all",
                        vocabForm.difficulty === level.code
                          ? "border-emerald-500 bg-emerald-50"
                          : "border-muted hover:border-muted-foreground/30"
                      )}
                      title={level.description}
                    >
                      {level.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* 备注 */}
              <div className="space-y-2">
                <Label>备注</Label>
                <Textarea
                  value={vocabForm.notes}
                  onChange={(e) => setVocabForm(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="补充说明、用法注意等"
                  rows={2}
                />
              </div>
            </CardContent>
          </Card>
        )}

        {/* ========== 语法表单 ========== */}
        {contentType === 'grammar' && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FlaskConical className="h-5 w-5 text-cyan-500" />
                语法信息
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label>语法模式 <span className="text-red-500">*</span></Label>
                <Input
                  value={grammarForm.pattern}
                  onChange={(e) => setGrammarForm(prev => ({ ...prev, pattern: e.target.value }))}
                  placeholder={learningLanguage === 'ja' ? '如：～てください' : learningLanguage === 'en' ? '如：Present Perfect' : '如：把字句'}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>含义</Label>
                  <Input
                    value={grammarForm.meaning}
                    onChange={(e) => setGrammarForm(prev => ({ ...prev, meaning: e.target.value }))}
                    placeholder="如：请求某人做某事"
                  />
                </div>
                <div className="space-y-2">
                  <Label>接续结构</Label>
                  <Input
                    value={grammarForm.structure}
                    onChange={(e) => setGrammarForm(prev => ({ ...prev, structure: e.target.value }))}
                    placeholder={learningLanguage === 'ja' ? '动词て形 + ください' : '主语 + have/has + 过去分词'}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>用法说明</Label>
                <Textarea
                  value={grammarForm.usage}
                  onChange={(e) => setGrammarForm(prev => ({ ...prev, usage: e.target.value }))}
                  placeholder="详细用法说明、使用场景、注意事项等"
                  rows={4}
                />
              </div>

              {/* 例句 */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label>例句</Label>
                  <Button type="button" variant="outline" size="sm" onClick={addGrammarExample}>
                    <Plus className="h-4 w-4 mr-1" />
                    添加例句
                  </Button>
                </div>
                {grammarForm.examples.map((ex, idx) => (
                  <div key={idx} className="border rounded-lg p-3 space-y-2">
                    <Input
                      value={ex.sentence}
                      onChange={(e) => updateGrammarExample(idx, 'sentence', e.target.value)}
                      placeholder="例句"
                    />
                    <div className="grid grid-cols-2 gap-2">
                      <Input
                        value={ex.translation}
                        onChange={(e) => updateGrammarExample(idx, 'translation', e.target.value)}
                        placeholder="翻译"
                      />
                      <Input
                        value={ex.structure}
                        onChange={(e) => updateGrammarExample(idx, 'structure', e.target.value)}
                        placeholder="结构分析（可选）"
                      />
                    </div>
                    {grammarForm.examples.length > 1 && (
                      <Button type="button" variant="ghost" size="sm" onClick={() => removeGrammarExample(idx)}>
                        删除
                      </Button>
                    )}
                  </div>
                ))}
              </div>

              {/* 标签 */}
              <div className="space-y-2">
                <Label>语法标签</Label>
                <div className="flex gap-2">
                  <Input
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    placeholder="如：敬语、请求表达"
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                  />
                  <Button type="button" variant="outline" onClick={addTag}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {grammarForm.tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="gap-1">
                      {tag}
                      <button type="button" onClick={() => removeTag(tag)}>
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>

              {/* 难度 */}
              <div className="space-y-2">
                <Label>难度等级</Label>
                <div className="flex flex-wrap gap-2">
                  {difficultyLevels.map((level) => (
                    <button
                      key={level.code}
                      type="button"
                      onClick={() => setGrammarForm(prev => ({ ...prev, difficulty: level.code }))}
                      className={cn(
                        "px-4 py-2 rounded-lg border-2 text-sm font-medium transition-all",
                        grammarForm.difficulty === level.code
                          ? "border-cyan-500 bg-cyan-50"
                          : "border-muted hover:border-muted-foreground/30"
                      )}
                    >
                      {level.name}
                    </button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* ========== 惯用句表单 ========== */}
        {contentType === 'idiom' && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Layers className="h-5 w-5 text-indigo-500" />
                惯用句信息
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>惯用句 <span className="text-red-500">*</span></Label>
                  <Input
                    value={idiomForm.term}
                    onChange={(e) => setIdiomForm(prev => ({ ...prev, term: e.target.value }))}
                    placeholder={learningLanguage === 'ja' ? '如：一石二鳥' : learningLanguage === 'en' ? '如：Break a leg' : '如：一举两得'}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>读音</Label>
                  <Input
                    value={idiomForm.reading}
                    onChange={(e) => setIdiomForm(prev => ({ ...prev, reading: e.target.value }))}
                    placeholder={learningLanguage === 'ja' ? '如：いっせきにちょう' : '音标或拼音'}
                  />
                </div>
              </div>

              {/* 类型 - 动态根据语言 */}
              <div className="space-y-2">
                <Label>惯用句类型</Label>
                <div className="grid grid-cols-3 gap-2">
                  {getIdiomTypes(learningLanguage).map((type) => (
                    <button
                      key={type.value}
                      type="button"
                      onClick={() => setIdiomForm(prev => ({ ...prev, idiomType: type.value }))}
                      className={cn(
                        "p-2 rounded-lg border-2 text-sm transition-all",
                        idiomForm.idiomType === type.value
                          ? "border-indigo-500 bg-indigo-50"
                          : "border-muted hover:border-muted-foreground/30"
                      )}
                    >
                      {type.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label>字面意思</Label>
                <Input
                  value={idiomForm.literalMeaning}
                  onChange={(e) => setIdiomForm(prev => ({ ...prev, literalMeaning: e.target.value }))}
                  placeholder="字面直译"
                />
              </div>

              <div className="space-y-2">
                <Label>实际含义</Label>
                <Textarea
                  value={idiomForm.actualMeaning}
                  onChange={(e) => setIdiomForm(prev => ({ ...prev, actualMeaning: e.target.value }))}
                  placeholder="实际含义或用法"
                  rows={2}
                />
              </div>

              <div className="space-y-2">
                <Label>英语对应</Label>
                <Input
                  value={idiomForm.englishEquivalent}
                  onChange={(e) => setIdiomForm(prev => ({ ...prev, englishEquivalent: e.target.value }))}
                  placeholder="对应的英语表达"
                />
              </div>

              {/* 例句 */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label>例句</Label>
                  <Button type="button" variant="outline" size="sm" onClick={addIdiomExample}>
                    <Plus className="h-4 w-4 mr-1" />
                    添加例句
                  </Button>
                </div>
                {idiomForm.examples.map((ex, idx) => (
                  <div key={idx} className="border rounded-lg p-3 space-y-2">
                    <Input
                      value={ex.sentence}
                      onChange={(e) => updateIdiomExample(idx, 'sentence', e.target.value)}
                      placeholder="例句"
                    />
                    <Input
                      value={ex.translation}
                      onChange={(e) => updateIdiomExample(idx, 'translation', e.target.value)}
                      placeholder="翻译"
                    />
                    {idiomForm.examples.length > 1 && (
                      <Button type="button" variant="ghost" size="sm" onClick={() => removeIdiomExample(idx)}>
                        删除
                      </Button>
                    )}
                  </div>
                ))}
              </div>

              {/* 难度 */}
              <div className="space-y-2">
                <Label>难度等级</Label>
                <div className="flex flex-wrap gap-2">
                  {difficultyLevels.map((level) => (
                    <button
                      key={level.code}
                      type="button"
                      onClick={() => setIdiomForm(prev => ({ ...prev, difficulty: level.code }))}
                      className={cn(
                        "px-4 py-2 rounded-lg border-2 text-sm font-medium transition-all",
                        idiomForm.difficulty === level.code
                          ? "border-indigo-500 bg-indigo-50"
                          : "border-muted hover:border-muted-foreground/30"
                      )}
                    >
                      {level.name}
                    </button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* ========== 课文表单 ========== */}
        {contentType === 'text' && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-rose-500" />
                课文信息
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label>课文标题 <span className="text-red-500">*</span></Label>
                <Input
                  value={textForm.title}
                  onChange={(e) => setTextForm(prev => ({ ...prev, title: e.target.value }))}
                  placeholder={learningLanguage === 'ja' ? '如：第1课 私の家族' : '如：Lesson 1 My Family'}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>课文内容</Label>
                <Textarea
                  value={textForm.content}
                  onChange={(e) => setTextForm(prev => ({ ...prev, content: e.target.value }))}
                  placeholder="输入课文正文..."
                  rows={8}
                />
              </div>

              <div className="space-y-2">
                <Label>翻译</Label>
                <Textarea
                  value={textForm.translation}
                  onChange={(e) => setTextForm(prev => ({ ...prev, translation: e.target.value }))}
                  placeholder="输入翻译..."
                  rows={4}
                />
              </div>

              <div className="space-y-2">
                <Label>预计学习时长（分钟）</Label>
                <Input
                  type="number"
                  value={textForm.estimatedTime}
                  onChange={(e) => setTextForm(prev => ({ ...prev, estimatedTime: e.target.value ? parseInt(e.target.value) : '' }))}
                  placeholder="如：30"
                />
              </div>

              {/* 难度 */}
              <div className="space-y-2">
                <Label>难度等级</Label>
                <div className="flex flex-wrap gap-2">
                  {difficultyLevels.map((level) => (
                    <button
                      key={level.code}
                      type="button"
                      onClick={() => setTextForm(prev => ({ ...prev, difficulty: level.code }))}
                      className={cn(
                        "px-4 py-2 rounded-lg border-2 text-sm font-medium transition-all",
                        textForm.difficulty === level.code
                          ? "border-rose-500 bg-rose-50"
                          : "border-muted hover:border-muted-foreground/30"
                      )}
                    >
                      {level.name}
                    </button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* 操作按钮 */}
        <div className="flex gap-4">
          <Button type="button" variant="outline" className="flex-1" onClick={() => navigate({ to: '/learning/content' })}>
            取消
          </Button>
          <Button type="submit" className="flex-1" disabled={isSaving}>
            <Save className="mr-2 h-4 w-4" />
            {isSaving ? '保存中...' : '创建内容'}
          </Button>
        </div>
      </form>
    </div>
  )
}
