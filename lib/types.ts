export interface Task {
  id: string
  title: string
  description?: string | null
  date?: Date | string | null
  startTime?: string | null
  endTime?: string | null
  status: 'not-started' | 'waiting' | 'in-progress' | 'completed'
  priority: 'low' | 'medium' | 'high'
  categoryId: string
  show: boolean
  createdAt: Date | string
  updatedAt: Date | string
  completedAt?: Date | string | null
  category?: Category
}

export interface Category {
  id: string
  name: string
  icon: string
  color: string
  type: 'life' | 'business'
  order: number
  createdAt?: Date | string
  updatedAt?: Date | string
}

export interface Settings {
  id: string
  weekStartsOn: number
  defaultView: 'month' | 'week' | 'day'
  darkMode: boolean
  showCompleted: boolean
  defaultStatus: string
  createdAt?: Date | string
  updatedAt?: Date | string
}

export type TaskStatus = 'not-started' | 'waiting' | 'in-progress' | 'completed'
export type TaskPriority = 'low' | 'medium' | 'high'
export type CalendarView = 'month' | 'week' | 'day'
export type CategoryType = 'life' | 'business'
export type CategoryFilter = 'all' | 'life' | 'business'

export const STATUS_COLORS = {
  'not-started': '#6b7280',
  'waiting': '#f59e0b',
  'in-progress': '#3b82f6',
  'completed': '#10b981',
} as const

export const PRIORITY_COLORS = {
  'low': '#6b7280',
  'medium': '#f59e0b',
  'high': '#ef4444',
} as const
