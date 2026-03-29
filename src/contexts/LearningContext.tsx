import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'

// ============================================================================
// 学习语言类型
// ============================================================================

export type LearningLanguage = 'ja' | 'en' | 'zh' | 'ko' | 'fr' | 'de' | 'es'

export interface LearningLanguageConfig {
  code: LearningLanguage
  name: string
  nameLocal: string
  flagEmoji: string
  writingSystem: 'latin' | 'cjk' | 'arabic' | 'cyrillic' | 'other'
  hasSpaces: boolean
  features: {
    hasPitchAccent?: boolean      // 日语声调
    hasConjugation?: boolean      // 动词变形
    hasMeasureWords?: boolean     // 量词
    hasGender?: boolean           // 性
    hasCases?: boolean            // 格
    hasTones?: boolean            // 声调
  }
  difficultyLevels: {            // 难度等级体系
    code: string
    name: string
    description?: string
  }[]
  posOptions: {                  // 词性选项
    value: string
    label: string
  }[]
}

// ============================================================================
// 语言配置
// ============================================================================

export const LEARNING_LANGUAGES: Record<LearningLanguage, LearningLanguageConfig> = {
  ja: {
    code: 'ja',
    name: 'Japanese',
    nameLocal: '日本語',
    flagEmoji: '🇯🇵',
    writingSystem: 'cjk',
    hasSpaces: false,
    features: {
      hasPitchAccent: true,
      hasConjugation: true,
      hasMeasureWords: true,
    },
    difficultyLevels: [
      { code: 'N5', name: 'N5', description: '入门' },
      { code: 'N4', name: 'N4', description: '初级' },
      { code: 'N3', name: 'N3', description: '中级' },
      { code: 'N2', name: 'N2', description: '中高级' },
      { code: 'N1', name: 'N1', description: '高级' },
    ],
    posOptions: [
      { value: 'noun', label: '名词' },
      { value: 'verb', label: '动词' },
      { value: 'adj-i', label: 'い形容词' },
      { value: 'adj-na', label: 'な形容词' },
      { value: 'adv', label: '副词' },
      { value: 'particle', label: '助词' },
      { value: 'aux', label: '助动词' },
      { value: 'conj', label: '接续词' },
      { value: 'phrase', label: '短语' },
      { value: 'expression', label: '惯用表达' },
    ],
  },
  en: {
    code: 'en',
    name: 'English',
    nameLocal: 'English',
    flagEmoji: '🇬🇧',
    writingSystem: 'latin',
    hasSpaces: true,
    features: {
      hasConjugation: true,
      hasGender: false,
    },
    difficultyLevels: [
      { code: 'A1', name: 'A1', description: '入门' },
      { code: 'A2', name: 'A2', description: '初级' },
      { code: 'B1', name: 'B1', description: '中级' },
      { code: 'B2', name: 'B2', description: '中高级' },
      { code: 'C1', name: 'C1', description: '高级' },
      { code: 'C2', name: 'C2', description: '精通' },
    ],
    posOptions: [
      { value: 'noun', label: 'Noun' },
      { value: 'verb', label: 'Verb' },
      { value: 'adj', label: 'Adjective' },
      { value: 'adv', label: 'Adverb' },
      { value: 'prep', label: 'Preposition' },
      { value: 'conj', label: 'Conjunction' },
      { value: 'pron', label: 'Pronoun' },
      { value: 'art', label: 'Article' },
      { value: 'phrase', label: 'Phrase' },
      { value: 'idiom', label: 'Idiom' },
    ],
  },
  zh: {
    code: 'zh',
    name: 'Chinese',
    nameLocal: '中文',
    flagEmoji: '🇨🇳',
    writingSystem: 'cjk',
    hasSpaces: false,
    features: {
      hasTones: true,
      hasMeasureWords: true,
    },
    difficultyLevels: [
      { code: 'HSK1', name: 'HSK1', description: '入门' },
      { code: 'HSK2', name: 'HSK2', description: '初级' },
      { code: 'HSK3', name: 'HSK3', description: '中级' },
      { code: 'HSK4', name: 'HSK4', description: '中高级' },
      { code: 'HSK5', name: 'HSK5', description: '高级' },
      { code: 'HSK6', name: 'HSK6', description: '精通' },
    ],
    posOptions: [
      { value: 'noun', label: '名词' },
      { value: 'verb', label: '动词' },
      { value: 'adj', label: '形容词' },
      { value: 'adv', label: '副词' },
      { value: 'mw', label: '量词' },
      { value: 'prep', label: '介词' },
      { value: 'conj', label: '连词' },
      { value: 'part', label: '助词' },
      { value: 'phrase', label: '短语' },
    ],
  },
  ko: {
    code: 'ko',
    name: 'Korean',
    nameLocal: '한국어',
    flagEmoji: '🇰🇷',
    writingSystem: 'other',
    hasSpaces: true,
    features: {
      hasConjugation: true,
      hasMeasureWords: true,
    },
    difficultyLevels: [
      { code: 'TOPIK1', name: 'TOPIK I', description: '初级' },
      { code: 'TOPIK2', name: 'TOPIK II', description: '中高级' },
    ],
    posOptions: [
      { value: 'noun', label: '명사' },
      { value: 'verb', label: '동사' },
      { value: 'adj', label: '형용사' },
      { value: 'adv', label: '부사' },
      { value: 'particle', label: '조사' },
    ],
  },
  fr: {
    code: 'fr',
    name: 'French',
    nameLocal: 'Français',
    flagEmoji: '🇫🇷',
    writingSystem: 'latin',
    hasSpaces: true,
    features: {
      hasGender: true,
      hasConjugation: true,
    },
    difficultyLevels: [
      { code: 'A1', name: 'A1', description: 'Débutant' },
      { code: 'A2', name: 'A2', description: 'Élémentaire' },
      { code: 'B1', name: 'B1', description: 'Intermédiaire' },
      { code: 'B2', name: 'B2', description: 'Avancé' },
      { code: 'C1', name: 'C1', description: 'Autonome' },
      { code: 'C2', name: 'C2', description: 'Maîtrise' },
    ],
    posOptions: [
      { value: 'noun', label: 'Nom' },
      { value: 'verb', label: 'Verbe' },
      { value: 'adj', label: 'Adjectif' },
      { value: 'adv', label: 'Adverbe' },
    ],
  },
  de: {
    code: 'de',
    name: 'German',
    nameLocal: 'Deutsch',
    flagEmoji: '🇩🇪',
    writingSystem: 'latin',
    hasSpaces: true,
    features: {
      hasGender: true,
      hasCases: true,
      hasConjugation: true,
    },
    difficultyLevels: [
      { code: 'A1', name: 'A1', description: 'Anfänger' },
      { code: 'A2', name: 'A2', description: 'Grundlagen' },
      { code: 'B1', name: 'B1', description: 'Mittelstufe' },
      { code: 'B2', name: 'B2', description: 'Fortgeschritten' },
      { code: 'C1', name: 'C1', description: 'Kompetent' },
      { code: 'C2', name: 'C2', description: 'Meisterschaft' },
    ],
    posOptions: [
      { value: 'noun', label: 'Substantiv' },
      { value: 'verb', label: 'Verb' },
      { value: 'adj', label: 'Adjektiv' },
      { value: 'adv', label: 'Adverb' },
    ],
  },
  es: {
    code: 'es',
    name: 'Spanish',
    nameLocal: 'Español',
    flagEmoji: '🇪🇸',
    writingSystem: 'latin',
    hasSpaces: true,
    features: {
      hasGender: true,
      hasConjugation: true,
    },
    difficultyLevels: [
      { code: 'A1', name: 'A1', description: 'Principiante' },
      { code: 'A2', name: 'A2', description: 'Básico' },
      { code: 'B1', name: 'B1', description: 'Intermedio' },
      { code: 'B2', name: 'B2', description: 'Avanzado' },
      { code: 'C1', name: 'C1', description: 'Dominio' },
      { code: 'C2', name: 'C2', description: 'Maestría' },
    ],
    posOptions: [
      { value: 'noun', label: 'Sustantivo' },
      { value: 'verb', label: 'Verbo' },
      { value: 'adj', label: 'Adjetivo' },
      { value: 'adv', label: 'Adverbio' },
    ],
  },
}

// ============================================================================
// 课程类型
// ============================================================================

export interface Course {
  id: string
  name: string
  description?: string
  language: LearningLanguage
  courseType: 'textbook' | 'exam_prep' | 'skill' | 'theme' | 'custom'
  levelFrom?: string
  levelTo?: string
  isActive: boolean
  isPublic: boolean
  cover?: string
  unitCount?: number
  lessonCount?: number
  createdAt: string
}

// ============================================================================
// Context 类型
// ============================================================================

interface LearningContextType {
  // 当前学习语言
  learningLanguage: LearningLanguage
  setLearningLanguage: (lang: LearningLanguage) => void
  learningLanguageConfig: LearningLanguageConfig
  
  // 当前课程
  currentCourse: Course | null
  setCurrentCourse: (course: Course | null) => void
  
  // 用户课程列表
  userCourses: Course[]
  refreshCourses: () => Promise<void>
  
  // 辅助方法
  getDifficultyLevels: () => LearningLanguageConfig['difficultyLevels']
  getPosOptions: () => LearningLanguageConfig['posOptions']
  hasFeature: (feature: keyof LearningLanguageConfig['features']) => boolean
}

// ============================================================================
// Context 创建
// ============================================================================

const LearningContext = createContext<LearningContextType | undefined>(undefined)

// ============================================================================
// Provider
// ============================================================================

const STORAGE_KEY = 'learning_language'
const COURSE_STORAGE_KEY = 'current_course'

export function LearningProvider({ children }: { children: ReactNode }) {
  // 学习语言状态
  const [learningLanguage, setLearningLanguageState] = useState<LearningLanguage>('ja')
  const [currentCourse, setCurrentCourseState] = useState<Course | null>(null)
  const [userCourses, setUserCourses] = useState<Course[]>([])
  const [isInitialized, setIsInitialized] = useState(false)

  // 从 localStorage 加载
  useEffect(() => {
    const savedLang = localStorage.getItem(STORAGE_KEY) as LearningLanguage
    const savedCourse = localStorage.getItem(COURSE_STORAGE_KEY)
    
    if (savedLang && LEARNING_LANGUAGES[savedLang]) {
      setLearningLanguageState(savedLang)
    }
    
    if (savedCourse) {
      try {
        setCurrentCourseState(JSON.parse(savedCourse))
      } catch {
        localStorage.removeItem(COURSE_STORAGE_KEY)
      }
    }
    
    setIsInitialized(true)
  }, [])

  // 设置学习语言
  const setLearningLanguage = (lang: LearningLanguage) => {
    setLearningLanguageState(lang)
    localStorage.setItem(STORAGE_KEY, lang)
    // 切换语言时，清除不兼容的课程选择
    if (currentCourse && currentCourse.language !== lang) {
      setCurrentCourse(null)
    }
  }

  // 设置当前课程
  const setCurrentCourse = (course: Course | null) => {
    setCurrentCourseState(course)
    if (course) {
      localStorage.setItem(COURSE_STORAGE_KEY, JSON.stringify(course))
    } else {
      localStorage.removeItem(COURSE_STORAGE_KEY)
    }
  }

  // 刷新用户课程列表
  const refreshCourses = async () => {
    // TODO: 连接实际 API
    // const response = await apiClient.get('/courses/my-courses/')
    // setUserCourses(response.data)
    
    // 模拟数据
    const allCourses: Course[] = [
      {
        id: '1',
        name: '标准日本语 初级上',
        description: '经典日语教材，适合零基础学习者',
        language: 'ja' as LearningLanguage,
        courseType: 'textbook',
        levelFrom: 'N5',
        levelTo: 'N4',
        isActive: true,
        isPublic: true,
        unitCount: 12,
        lessonCount: 24,
        createdAt: '2024-01-01',
      },
      {
        id: '2',
        name: '大家的日语',
        description: '实用日语会话教材',
        language: 'ja' as LearningLanguage,
        courseType: 'textbook',
        levelFrom: 'N5',
        levelTo: 'N3',
        isActive: true,
        isPublic: true,
        unitCount: 10,
        lessonCount: 20,
        createdAt: '2024-01-01',
      },
      {
        id: '3',
        name: '新概念英语 第一册',
        description: '经典英语教材',
        language: 'en' as LearningLanguage,
        courseType: 'textbook',
        levelFrom: 'A1',
        levelTo: 'A2',
        isActive: true,
        isPublic: true,
        unitCount: 20,
        lessonCount: 144,
        createdAt: '2024-01-01',
      },
    ]
    
    const mockCourses = allCourses.filter(c => c.language === learningLanguage)
    setUserCourses(mockCourses)
  }

  // 加载用户课程
  useEffect(() => {
    if (isInitialized) {
      refreshCourses()
    }
  }, [learningLanguage, isInitialized])

  // 获取当前语言配置
  const learningLanguageConfig = LEARNING_LANGUAGES[learningLanguage]

  // 辅助方法
  const getDifficultyLevels = () => learningLanguageConfig.difficultyLevels
  const getPosOptions = () => learningLanguageConfig.posOptions
  const hasFeature = (feature: keyof LearningLanguageConfig['features']) => 
    !!learningLanguageConfig.features[feature]

  return (
    <LearningContext.Provider
      value={{
        learningLanguage,
        setLearningLanguage,
        learningLanguageConfig,
        currentCourse,
        setCurrentCourse,
        userCourses,
        refreshCourses,
        getDifficultyLevels,
        getPosOptions,
        hasFeature,
      }}
    >
      {children}
    </LearningContext.Provider>
  )
}

// ============================================================================
// Hook
// ============================================================================

export function useLearning() {
  const context = useContext(LearningContext)
  if (context === undefined) {
    throw new Error('useLearning must be used within a LearningProvider')
  }
  return context
}
