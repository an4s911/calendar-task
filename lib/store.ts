import { create } from 'zustand'
import { Task, Category, Settings, CalendarView, CategoryFilter } from './types'

interface AppState {
  tasks: Task[]
  categories: Category[]
  settings: Settings | null
  currentView: CalendarView
  selectedDate: Date
  isLoading: boolean
  categoryFilter: CategoryFilter

  setTasks: (tasks: Task[]) => void
  setCategories: (categories: Category[]) => void
  setSettings: (settings: Settings) => void
  setCurrentView: (view: CalendarView) => void
  setSelectedDate: (date: Date) => void
  setIsLoading: (loading: boolean) => void
  setCategoryFilter: (filter: CategoryFilter) => void

  addTask: (task: Task) => void
  updateTask: (id: string, task: Partial<Task>) => void
  deleteTask: (id: string) => void

  addCategory: (category: Category) => void
  updateCategory: (id: string, category: Partial<Category>) => void
  deleteCategory: (id: string) => void
}

export const useStore = create<AppState>((set) => ({
  tasks: [],
  categories: [],
  settings: null,
  currentView: 'month',
  selectedDate: new Date(),
  isLoading: false,
  categoryFilter: 'all',

  setTasks: (tasks) => set({ tasks }),
  setCategories: (categories) => set({ categories }),
  setSettings: (settings) => set({ settings }),
  setCurrentView: (view) => set({ currentView: view }),
  setSelectedDate: (date) => set({ selectedDate: date }),
  setIsLoading: (loading) => set({ isLoading: loading }),
  setCategoryFilter: (filter) => set({ categoryFilter: filter }),

  addTask: (task) => set((state) => ({ tasks: [...state.tasks, task] })),
  updateTask: (id, updatedTask) =>
    set((state) => ({
      tasks: state.tasks.map((t) => (t.id === id ? { ...t, ...updatedTask } : t)),
    })),
  deleteTask: (id) =>
    set((state) => ({ tasks: state.tasks.filter((t) => t.id !== id) })),

  addCategory: (category) =>
    set((state) => ({ categories: [...state.categories, category] })),
  updateCategory: (id, updatedCategory) =>
    set((state) => ({
      categories: state.categories.map((c) =>
        c.id === id ? { ...c, ...updatedCategory } : c
      ),
    })),
  deleteCategory: (id) =>
    set((state) => ({ categories: state.categories.filter((c) => c.id !== id) })),
}))
