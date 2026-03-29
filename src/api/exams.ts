import apiClient from '@/lib/axios'
import type { 
  ExamType, 
  Question, 
  ExamAttempt, 
  ExamAnswer,
  ExamTemplate,
  ExamSchedule,
  PeriodicExam,
  PeriodicExamSession,
  PeriodicExamParticipant,
  ExamStats
} from '@/types'

// ============================================================================
// 考试类型 API
// ============================================================================

export interface ExamTypeParams {
  search?: string
  language?: string
  category?: string
  status?: string
  ordering?: string
}

export async function getExamTypes(params?: ExamTypeParams): Promise<ExamType[]> {
  const response = await apiClient.get('/exams/types/', { params })
  const data = response.data
  return Array.isArray(data) ? data : data.results || []
}

export async function getExamType(id: string): Promise<ExamType> {
  const response = await apiClient.get(`/exams/types/${id}/`)
  return response.data
}

// ============================================================================
// 题目 API
// ============================================================================

export interface QuestionParams {
  search?: string
  question_type?: string
  exam_type?: string
  difficulty_level?: number
  tags?: string
  ordering?: string
}

export async function getQuestions(params?: QuestionParams): Promise<Question[]> {
  const response = await apiClient.get('/exams/questions/', { params })
  const data = response.data
  return Array.isArray(data) ? data : data.results || []
}

export async function getQuestion(id: string): Promise<Question> {
  const response = await apiClient.get(`/exams/questions/${id}/`)
  return response.data
}

export async function validateAnswer(
  questionId: string, 
  answer: string | string[]
): Promise<{ is_correct: boolean; correct_answer: string; explanation?: string }> {
  const response = await apiClient.post(`/exams/questions/${questionId}/validate/`, { answer })
  return response.data
}

// ============================================================================
// 考试尝试 API
// ============================================================================

export async function getExamAttempts(params?: { status?: string; exam_type?: string }): Promise<ExamAttempt[]> {
  const response = await apiClient.get('/exams/attempts/', { params })
  const data = response.data
  return Array.isArray(data) ? data : data.results || []
}

export async function getExamAttempt(id: string): Promise<ExamAttempt> {
  const response = await apiClient.get(`/exams/attempts/${id}/`)
  return response.data
}

export async function startExamAttempt(examTypeId: string): Promise<ExamAttempt> {
  const response = await apiClient.post('/exams/attempts/', { exam_type: examTypeId })
  return response.data
}

export async function submitAnswer(
  attemptId: string, 
  data: { question: string; answer: string; time_spent_seconds: number }
): Promise<ExamAnswer> {
  const response = await apiClient.post(`/exams/attempts/${attemptId}/submit_answer/`, data)
  return response.data
}

export async function completeExamAttempt(attemptId: string): Promise<ExamAttempt> {
  const response = await apiClient.post(`/exams/attempts/${attemptId}/complete/`)
  return response.data
}

export async function abandonExamAttempt(attemptId: string): Promise<void> {
  await apiClient.post(`/exams/attempts/${attemptId}/abandon/`)
}

// ============================================================================
// 考试模板 API
// ============================================================================

export async function getExamTemplates(params?: { exam_type?: string }): Promise<ExamTemplate[]> {
  const response = await apiClient.get('/exams/templates/', { params })
  const data = response.data
  return Array.isArray(data) ? data : data.results || []
}

export async function getExamTemplate(id: string): Promise<ExamTemplate> {
  const response = await apiClient.get(`/exams/templates/${id}/`)
  return response.data
}

export async function generateExamFromTemplate(templateId: string): Promise<ExamAttempt> {
  const response = await apiClient.post(`/exams/templates/${templateId}/generate_exam/`)
  return response.data
}

// ============================================================================
// 考试安排 API
// ============================================================================

export async function getExamSchedules(params?: { upcoming?: boolean }): Promise<ExamSchedule[]> {
  const response = await apiClient.get('/exams/schedules/', { params })
  const data = response.data
  return Array.isArray(data) ? data : data.results || []
}

export async function getExamSchedule(id: string): Promise<ExamSchedule> {
  const response = await apiClient.get(`/exams/schedules/${id}/`)
  return response.data
}

export async function registerForSchedule(scheduleId: string): Promise<void> {
  await apiClient.post(`/exams/schedules/${scheduleId}/register/`)
}

// ============================================================================
// 周期考试 API
// ============================================================================

export async function getPeriodicExams(params?: { is_active?: boolean }): Promise<PeriodicExam[]> {
  const response = await apiClient.get('/exams/periodic-exams/', { params })
  const data = response.data
  return Array.isArray(data) ? data : data.results || []
}

export async function getPeriodicExam(id: string): Promise<PeriodicExam> {
  const response = await apiClient.get(`/exams/periodic-exams/${id}/`)
  return response.data
}

export async function getPeriodicExamSessions(examId: string): Promise<PeriodicExamSession[]> {
  const response = await apiClient.get('/exams/periodic-sessions/', { params: { periodic_exam: examId } })
  const data = response.data
  return Array.isArray(data) ? data : data.results || []
}

export async function joinPeriodicSession(sessionId: string): Promise<PeriodicExamParticipant> {
  const response = await apiClient.post(`/exams/periodic-sessions/${sessionId}/join/`)
  return response.data
}

export async function getPeriodicLeaderboard(sessionId: string): Promise<PeriodicExamParticipant[]> {
  const response = await apiClient.get(`/exams/periodic-sessions/${sessionId}/leaderboard/`)
  return response.data
}

// ============================================================================
// 考试统计 API
// ============================================================================

export async function getExamStats(): Promise<ExamStats> {
  const response = await apiClient.get('/exams/stats/')
  return response.data
}
