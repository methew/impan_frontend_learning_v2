// ============================================================================
// 通用类型
// ============================================================================

export interface Language {
  code: string
  name: string
  name_local: string
  name_en?: string
  flag_emoji?: string
  writing_system: string
  has_spaces: boolean
  tts_voice?: string
  tts_speed?: number
  is_rtl: boolean
}

// ============================================================================
// 学习树节点 (Learning Tree) - 原 learning_v2
// ============================================================================

// 节点类型 - 与后端 NodeTypeChoices 对应
export type NodeType = 
  // 核心层级
  | 'term'           // 词条
  | 'reading'        // 读音/发音
  | 'sense'          // 义项/含义
  | 'example'        // 例句
  // 辅助节点
  | 'translation'    // 翻译
  | 'explanation'    // 解释说明
  | 'gloss'          // 源语言释义
  | 'note'           // 注释
  | 'part_of_speech' // 词性
  | 'form'           // 变形形式
  | 'usage_rule'     // 用法说明
  | 'cultural_note'  // 文化注释
  | 'literal_meaning'// 字面意思
  // 课文特有
  | 'sentence'       // 句子
  | 'structure'      // 语法结构
  | 'section'        // 课程节
  | 'usage_context'  // 使用场景
  // 分类节点
  | 'category'       // 分类
  | 'unit'           // 单元
  | 'group'          // 组
  // 向后兼容
  | 'root' | 'level' | 'lesson' | 'content'

export interface BaseNode {
  id: string
  node_type: NodeType
  parent?: string | number | null
  children?: BaseNode[]
  name: string
  content?: string
  reading?: string
  meaning?: string
  sort_order: number
  is_active: boolean
  created_by?: string | number | null  // 创建者ID
  created_by_username?: string         // 创建者用户名
  created_at: string
  updated_at: string
}

// 词汇节点 - 与后端数据结构对应
export interface VocabNode extends BaseNode {
  // BaseLanguageNode 字段
  content_json?: Record<string, any>  // 结构化内容
  
  // VocabNode 特有字段
  normalized_content?: string         // 规范化内容
  frequency_rank?: number             // 词频排名
  difficulty_level?: number           // 难度等级 1-5(N1-N5), 6-11(HSK1-6)
  
  // 向后兼容的字段映射
  name: string                        // 等同于 content
  reading?: string                    // 可从 content_json 获取
  word_type?: string                  // 可从 content_json 获取
  jlpt_level?: string                 // 从 difficulty_level 转换
  hsk_level?: string                  // 从 difficulty_level 转换
  sentences?: ExampleSentence[]
}

// 语法节点
export interface GramNode extends BaseNode {
  structure?: string
  usage_notes?: string
  conjugation_pattern?: string
  level?: string
}

// 惯用语节点
export interface IdiomNode extends BaseNode {
  literal_meaning?: string
  usage_context?: string
  equivalent_expression?: string
}

// 课文节点
export interface TextLessonNode extends BaseNode {
  lesson_number?: string
  source_text?: string
  translation?: string
  audio_url?: string
  vocabulary_items?: string[]
}

export interface ExampleSentence {
  id: string
  sentence: string
  reading?: string
  translation: string
  source_type: string
  source_id: string
  source_content?: string
}

export interface Category {
  id: string
  name: string
  abbreviation?: string
  slug: string
  description?: string
  icon?: string
  color?: string
  category_type: 'system' | 'user' | 'exam' | 'topic' | 'difficulty'
  parent?: string
  children?: Category[]
  content_count: number
}

export interface Course {
  id: string
  name: string
  language: Language
  course_type: 'textbook' | 'exam_prep' | 'skill' | 'theme' | 'custom'
  description?: string
  level_from?: string
  level_to?: string
  is_active: boolean
  is_public: boolean
  created_at: string
}

// ============================================================================
// 闪卡系统 (Flashcards) - 从 flashcards_v2 迁移
// ============================================================================

export type FlashcardNodeType = 'vocab' | 'grammar' | 'idiom' | 'lesson'

export interface FlashcardExample {
  sentence: string
  translation: string
}

export interface Flashcard {
  id: string
  front: string
  back: string
  reading?: string
  examples?: FlashcardExample[]
  level?: number
  nodeType: FlashcardNodeType
  nodeId: string
  deckId: string
  createdAt: string
  updatedAt: string
  // FSRS 学习数据
  dueDate?: string
  interval?: number
  repetition?: number
  easinessFactor?: number
  reviewCount?: number
}

export interface Deck {
  id: string
  title: string
  description?: string
  cover?: string
  cardCount: number
  newCards: number
  reviewCards: number
  dueCards: number
  createdAt: string
  updatedAt: string
  isPublic?: boolean
  tags?: string[]
  category?: string
  difficulty?: 'easy' | 'medium' | 'hard'
  sourceNodes?: {
    nodeType: FlashcardNodeType
    categoryId?: string
    level?: number
  }
}

export interface FlashcardStudySession {
  id: string
  deckId: string
  startedAt: string
  endedAt?: string
  cardsStudied: number
  correctCount: number
  wrongCount: number
}

export interface FlashcardStats {
  totalCards: number
  newCards: number
  reviewCards: number
  dueCards: number
  streakDays: number
  totalStudyTime: number
  masteryPercentage: number
}

// 复习评级 (FSRS)
export type ReviewRating = 'again' | 'hard' | 'good' | 'easy'

export interface ReviewPayload {
  cardId: string
  rating: ReviewRating
  timeSpent: number
}

// ============================================================================
// 写作系统 (Writing) - 从 writing_v2 迁移
// ============================================================================

export type ExerciseType = 
  | 'meaning_to_sentence' 
  | 'dictation' 
  | 'fill_blank' 
  | 'translation'
  | 'shadowing'

export type ExerciseStatus = 'not_started' | 'in_progress' | 'pending' | 'correct' | 'incorrect' | 'partial'

export type InputMethod = 'keyboard' | 'handwriting' | 'voice'

export const EXERCISE_TYPE_LABELS: Record<ExerciseType, string> = {
  meaning_to_sentence: '看义写句',
  dictation: '听写/看句摹写',
  fill_blank: '填空摹写',
  translation: '翻译练习',
  shadowing: '影子跟读',
}

export const EXERCISE_TYPE_COLORS: Record<ExerciseType, string> = {
  meaning_to_sentence: 'bg-blue-500',
  dictation: 'bg-green-500',
  fill_blank: 'bg-orange-500',
  translation: 'bg-purple-500',
  shadowing: 'bg-pink-500',
}

export const STATUS_LABELS: Record<ExerciseStatus, string> = {
  not_started: '未开始',
  in_progress: '进行中',
  pending: '待评分',
  correct: '正确',
  incorrect: '错误',
  partial: '部分正确',
}

export interface WritingExercise {
  id: string
  exercise_type: ExerciseType
  exercise_type_display?: string
  prompt: string
  prompt_json?: {
    segments?: Array<{
      text: string
      type: 'normal' | 'blank' | 'hint'
      hint?: string
    }>
  }
  reference_answer: string
  reference_answer_json?: Record<string, unknown>
  user_input?: string
  input_method: InputMethod
  status: ExerciseStatus
  status_display?: string
  is_correct?: boolean
  similarity_score?: number
  score_breakdown?: {
    accuracy?: number
    completeness?: number
    grammar?: number
  }
  error_types?: string[]
  diff_result?: string
  diff_result_json?: {
    differences?: Array<{
      type: 'equal' | 'replace' | 'delete' | 'insert'
      expected?: string
      actual?: string
      position: number
    }>
  }
  char_comparison?: Array<{
    position: number
    expected: string
    actual: string
    is_correct: boolean
  }>
  corrections?: Array<{
    type: string
    message: string
    suggestion: string
  }>
  hints_used: number
  max_hints: number
  hints_content?: string[]
  time_spent?: number
  started_at?: string
  completed_at?: string
  created_at: string
}

export interface CreateExerciseRequest {
  exercise_type: ExerciseType
  content_type?: string
  content_id?: number
  prompt?: string
  prompt_json?: Record<string, unknown>
  reference_answer?: string
  reference_answer_json?: Record<string, unknown>
  max_hints?: number
  input_method?: InputMethod
}

export interface SubmitAnswerRequest {
  user_input: string
  time_spent?: number
}

export interface SubmitAnswerResponse {
  similarity: number
  status: ExerciseStatus
  diff_details: Array<{
    type: string
    expected: string
    actual: string
    position: number
  }>
  char_accuracy: number
}

// 写作提示
export type PromptType = 'meaning_to_sentence' | 'dictation' | 'fill_blank' | 'translation'

export interface WritingPrompt {
  id: string
  prompt_type: PromptType
  prompt_type_display?: string
  question: string
  question_json?: Record<string, unknown>
  answer: string
  answer_json?: Record<string, unknown>
  hints: string[]
  difficulty_level?: number
  language: Language
  usage_count: number
  correct_rate?: number
  is_active: boolean
  created_at: string
  related_prompts?: Array<{
    id: string
    question: string
    prompt_type: PromptType
  }>
}

// 错题本
export type MistakeType = 
  | 'spelling' 
  | 'meaning' 
  | 'grammar' 
  | 'pronunciation'
  | 'particle'
  | 'conjugation'
  | 'word_order'
  | 'omission'
  | 'addition'
  | 'other'

export const MISTAKE_TYPE_LABELS: Record<MistakeType, string> = {
  spelling: '拼写错误',
  meaning: '含义错误',
  grammar: '语法错误',
  pronunciation: '发音错误',
  particle: '助词错误',
  conjugation: '变形错误',
  word_order: '语序错误',
  omission: '漏词',
  addition: '多词',
  other: '其他',
}

export interface MistakeNotebook {
  id: string
  content_type: string
  content_id: string
  mistake_type: MistakeType
  mistake_type_display?: string
  wrong_answer?: string
  wrong_answer_json?: Record<string, unknown>
  correct_answer?: string
  correct_answer_json?: Record<string, unknown>
  error_position?: {
    start: number
    end: number
    line?: number
  }
  error_explanation?: string
  source_exercise?: {
    id: string
    exercise_type: ExerciseType
  }
  review_count: number
  last_reviewed_at?: string
  next_review_at?: string
  mastered: boolean
  priority: number
  user_notes?: string
  created_at: string
}

export interface ReviewMistakeRequest {
  is_correct: boolean
  user_answer?: string
}

// 句子填空学习
export interface SentenceWord {
  id: string
  text: string
  is_blank: boolean
  blank_index?: number
  order: number
}

export interface Sentence {
  id: string
  course_id: string
  chinese: string
  english: string
  words: SentenceWord[]
  order: number
  is_active: boolean
  audio_url?: string
  created_at?: string
}

export interface SentenceCourse {
  id: string
  title: string
  description: string
  total_sentences: number
  difficulty_level?: number
  language_code?: string
  language_name?: string
  is_official: boolean
  sort_order: number
  sentences?: Sentence[]
  progress?: {
    current_index: number
    completed_count: number
    xp_points: number
  }
  created_at: string
}

export interface SentenceLearningProgress {
  id: string
  course: string
  course_title?: string
  current_sentence_index: number
  completed_sentences: string[]
  xp_points: number
  last_accessed_at: string
  created_at: string
}

export interface CheckAnswerRequest {
  answers: string[]
}

export interface CheckAnswerResponse {
  is_correct: boolean
  results: Array<{
    word: string
    user_answer: string
    is_correct: boolean
  }>
}

export interface SentenceLearningRecord {
  id: string
  sentence: string
  sentence_english?: string
  sentence_chinese?: string
  course: string
  course_title?: string
  is_correct: boolean
  attempts: number
  time_spent: number
  error_indices: number[]
  created_at: string
}

export interface SentenceLearningStreak {
  current_streak: number
  longest_streak: number
  last_learning_date?: string
}

export interface SentenceLearningStats {
  streak: SentenceLearningStreak
  total_completed: number
  total_attempts: number
  xp_points: number
}

export interface LeaderboardEntry {
  user_id: string
  username: string
  avatar: string | null
  completed_sentences: number
  streak: number
  rank: number
}

export interface WritingStats {
  total_exercises: number
  completed_exercises: number
  avg_similarity: number
  total_time_spent: number
  by_type: Array<{
    exercise_type: ExerciseType
    count: number
    avg_similarity: number
  }>
  total_mistakes: number
  mastered_mistakes: number
  needs_review: number
  recent_exercises: Array<{
    id: string
    type: ExerciseType
    status: ExerciseStatus
    similarity: number
    created_at: string
  }>
  progress_trend: Array<{
    day: string
    avg_similarity: number
    count: number
  }>
}

export interface MistakeStats {
  total: number
  by_type: Array<{
    mistake_type: MistakeType
    count: number
  }>
  by_mastery: Array<{
    mastery: string
    count: number
  }>
  due_today: number
  reviewed_today: number
}

// ============================================================================
// 考试系统 (Exams) - 原 learning_v2
// ============================================================================

export type QuestionType = 
  | 'choice' 
  | 'multiple_choice' 
  | 'fill_blank' 
  | 'true_false'
  | 'matching'
  | 'ordering'
  | 'writing'
  | 'speaking'

export type ExamStatus = 'draft' | 'published' | 'archived'

export interface ExamType {
  id: string
  name: string
  code: string
  description?: string
  language: Language
  category?: Category
  total_questions: number
  duration_minutes: number
  passing_score: number
  max_attempts?: number
  is_active: boolean
  status: ExamStatus
  created_at: string
}

export interface Question {
  id: string
  question_type: QuestionType
  question_type_display?: string
  question_text: string
  question_text_json?: Record<string, unknown>
  options?: QuestionOption[]
  correct_answer: string | string[]
  explanation?: string
  points: number
  difficulty_level: number
  tags: string[]
  is_active: boolean
  usage_count: number
  correct_rate?: number
  created_at: string
}

export interface QuestionOption {
  id: string
  text: string
  is_correct?: boolean
  sort_order: number
}

export interface QuestionContentLink {
  id: string
  question: string
  content_type: string
  content_id: string
  content_details?: {
    name: string
    reading?: string
    meaning?: string
  }
}

export interface ExamAttempt {
  id: string
  exam_type: ExamType
  user: string
  started_at: string
  completed_at?: string
  status: 'in_progress' | 'completed' | 'abandoned'
  total_score: number
  max_score: number
  percentage_score: number
  is_passed: boolean
  time_spent_seconds: number
  answers: ExamAnswer[]
}

export interface ExamAnswer {
  id: string
  question: Question
  user_answer: string
  is_correct: boolean
  points_earned: number
  time_spent_seconds: number
}

export interface ExamTemplate {
  id: string
  name: string
  exam_type: ExamType
  question_selection_mode: 'random' | 'fixed' | 'adaptive'
  question_categories?: string[]
  difficulty_distribution?: Record<string, number>
  total_questions: number
  duration_minutes: number
  shuffle_questions: boolean
  shuffle_options: boolean
  is_active: boolean
}

export interface ExamSchedule {
  id: string
  exam_type: ExamType
  template?: ExamTemplate
  scheduled_at: string
  ends_at?: string
  time_limit_minutes: number
  allowed_attempts: number
  participants_count: number
  is_active: boolean
}

export interface PeriodicExam {
  id: string
  name: string
  description?: string
  exam_type: ExamType
  frequency: 'daily' | 'weekly' | 'monthly'
  day_of_week?: number
  time_of_day: string
  duration_minutes: number
  question_count: number
  passing_score: number
  is_active: boolean
  current_session?: PeriodicExamSession
}

export interface PeriodicExamSession {
  id: string
  periodic_exam: PeriodicExam
  session_date: string
  start_time: string
  end_time: string
  status: 'upcoming' | 'active' | 'completed' | 'cancelled'
  participants: PeriodicExamParticipant[]
}

export interface PeriodicExamParticipant {
  id: string
  session: string
  user: string
  joined_at?: string
  completed_at?: string
  score?: number
  rank?: number
  status: 'registered' | 'joined' | 'completed' | 'absent'
}

// ============================================================================
// 学习统计 (Stats)
// ============================================================================

export interface LearningStats {
  // 总体统计
  total_nodes_studied: number
  total_examples_seen: number
  mastery_level: 'beginner' | 'intermediate' | 'advanced' | 'expert'
  
  // 按类型统计
  by_node_type: Array<{
    node_type: string
    count: number
    mastered_count: number
  }>
  
  // 学习活动
  recent_activity: Array<{
    node_id: string
    node_name: string
    node_type: string
    action: 'viewed' | 'practiced' | 'mastered'
    timestamp: string
  }>
  
  // 学习热力图数据
  study_streak: {
    current_streak: number
    longest_streak: number
    daily_activity: Array<{
      date: string
      count: number
    }>
  }
}

export interface ExamStats {
  total_attempts: number
  completed_attempts: number
  passed_attempts: number
  pass_rate: number
  
  by_exam_type: Array<{
    exam_type_id: string
    exam_type_name: string
    attempts: number
    avg_score: number
    pass_rate: number
  }>
  
  recent_attempts: Array<{
    id: string
    exam_type_name: string
    score: number
    is_passed: boolean
    completed_at: string
  }>
}

// ============================================================================
// 统一统计面板
// ============================================================================

export interface UnifiedLearningStats {
  overview: {
    totalStudyDays: number
    currentStreak: number
    longestStreak: number
    todayStudyTime: number
    totalXpPoints: number
  }
  
  content: LearningStats
  flashcards: FlashcardStats
  writing: WritingStats
  exams: ExamStats
  
  mastery: {
    vocab: number
    grammar: number
    idiom: number
    writing: number
  }
}

// ============================================================================
// 用户设置
// ============================================================================

export interface UserSettings {
  // 外观
  theme: 'light' | 'dark' | 'system'
  language: 'zh' | 'en' | 'ja'
  fontSize: 'small' | 'medium' | 'large'
  cardFontSize: 'small' | 'medium' | 'large'
  
  // 学习设置
  newCardsPerDay: number
  reviewCardsPerDay: number
  studyAlgorithm: 'sm2' | 'fsrs'
  defaultExerciseType: ExerciseType
  defaultDifficulty: number
  showReading: boolean
  showExamples: boolean
  showHints: boolean
  autoPlayAudio: boolean
  
  // 通知
  studyReminder: boolean
  reminderTime: string
  dailyReminder: boolean
  
  // 目标
  dailyStudyGoal: number
  dailyGoal: number
  targetAccuracy: number
}

// ============================================================================
// 通用响应类型
// ============================================================================

export interface PaginatedResponse<T> {
  count: number
  next: string | null
  previous: string | null
  results: T[]
}

export interface ApiError {
  detail?: string
  [key: string]: string[] | string | undefined
}
