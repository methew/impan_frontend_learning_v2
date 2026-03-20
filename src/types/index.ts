// ============================================================================
// 基础类型
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
// 学习树节点 (Learning Tree Nodes)
// ============================================================================

export type NodeType = 'root' | 'level' | 'unit' | 'lesson' | 'content'

export interface BaseNode {
  id: string
  node_type: NodeType
  parent?: string
  children?: BaseNode[]
  name: string
  content?: string
  reading?: string
  meaning?: string
  sort_order: number
  is_active: boolean
  created_at: string
  updated_at: string
}

// 词汇节点
export interface VocabNode extends BaseNode {
  // 词汇特有字段
  pronunciation?: string
  pitch_accent?: string
  word_type?: string
  jlpt_level?: string
  hsk_level?: string
  // 例句
  sentences?: ExampleSentence[]
}

// 语法节点
export interface GramNode extends BaseNode {
  // 语法特有字段
  structure?: string
  usage_notes?: string
  conjugation_pattern?: string
  level?: string
}

// 惯用语节点
export interface IdiomNode extends BaseNode {
  // 惯用语特有字段
  literal_meaning?: string
  usage_context?: string
  equivalent_expression?: string
}

// 课文节点
export interface TextLessonNode extends BaseNode {
  // 课文特有字段
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

// ============================================================================
// 考试系统 (Exams)
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

// 周期考试
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
// 学习统计
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
  // 考试统计
  total_attempts: number
  completed_attempts: number
  passed_attempts: number
  pass_rate: number
  
  // 按考试类型
  by_exam_type: Array<{
    exam_type_id: string
    exam_type_name: string
    attempts: number
    avg_score: number
    pass_rate: number
  }>
  
  // 最近考试
  recent_attempts: Array<{
    id: string
    exam_type_name: string
    score: number
    is_passed: boolean
    completed_at: string
  }>
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
