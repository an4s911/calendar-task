# 🚀 Simple Setup Guide - Life Org 2026 (No Auth Version)

**Build a beautiful task manager in your browser - No backend, no auth, just clean code!**

---

## 📋 What You're Building

A modern task management app that:
- ✅ Runs 100% in your browser
- ✅ Stores data in localStorage (no server!)
- ✅ Looks like the HTML version you saw
- ✅ Works offline
- ✅ Takes 2-3 hours to get working
- ✅ FREE to deploy (Vercel/Netlify)

---

## ⚡ Quick Start (10 Minutes)

### Step 1: Create Next.js App

```bash
npx create-next-app@latest life-org-2026 \
  --typescript \
  --tailwind \
  --app \
  --no-src-dir \
  --import-alias "@/*"

cd life-org-2026
```

### Step 2: Install Dependencies

```bash
# UI Components
npm install @radix-ui/react-dialog
npm install @radix-ui/react-dropdown-menu
npm install @radix-ui/react-select
npm install @radix-ui/react-checkbox
npm install @radix-ui/react-switch
npm install class-variance-authority
npm install clsx tailwind-merge

# State & Utils
npm install zustand
npm install date-fns
npm install nanoid
npm install lucide-react

# Drag & Drop
npm install @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities
```

### Step 3: Install shadcn/ui

```bash
npx shadcn-ui@latest init
# Choose defaults for all options

# Install components
npx shadcn-ui@latest add button dialog input label select checkbox switch calendar toast badge card
```

---

## 📁 Create File Structure

```bash
mkdir -p lib hooks components/{ui,calendar,tasks,status,layout}
```

---

## 🏗️ Build Core Files

### 1. Create Types (`lib/types.ts`)

```typescript
export type TaskStatus = 'not-started' | 'waiting' | 'in-progress' | 'completed'
export type TaskPriority = 'low' | 'medium' | 'high'

export interface Task {
  id: string
  title: string
  description?: string
  date?: Date
  startTime?: string
  endTime?: string
  status: TaskStatus
  priority: TaskPriority
  categoryId: string
  show: boolean
  createdAt: Date
  updatedAt: Date
  completedAt?: Date
}

export interface Category {
  id: string
  name: string
  icon: string
  color: string
  order: number
}

export interface Settings {
  weekStartsOn: 0 | 1
  defaultView: 'month' | 'week' | 'day'
  darkMode: boolean
  showCompleted: boolean
}
```

### 2. Create Store (`lib/store.ts`)

```typescript
import { create } from 'zustand'
import { Task, Category, Settings } from './types'
import { nanoid } from 'nanoid'

interface AppState {
  tasks: Task[]
  categories: Category[]
  settings: Settings
  
  // Actions
  addTask: (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => void
  updateTask: (id: string, updates: Partial<Task>) => void
  deleteTask: (id: string) => void
  
  addCategory: (category: Omit<Category, 'id'>) => void
  updateCategory: (id: string, updates: Partial<Category>) => void
  deleteCategory: (id: string) => void
  
  updateSettings: (settings: Partial<Settings>) => void
  
  loadFromStorage: () => void
  saveToStorage: () => void
}

const defaultCategories: Category[] = [
  { id: 'cat_1', name: 'Physical', icon: '💪', color: '#3b82f6', order: 0 },
  { id: 'cat_2', name: 'Money', icon: '💰', color: '#10b981', order: 1 },
  { id: 'cat_3', name: 'Education', icon: '📚', color: '#8b5cf6', order: 2 },
  { id: 'cat_4', name: 'Chores', icon: '🧹', color: '#f59e0b', order: 3 },
  { id: 'cat_5', name: 'Health', icon: '❤️', color: '#ef4444', order: 4 },
  { id: 'cat_6', name: 'Relationship', icon: '👥', color: '#ec4899', order: 5 },
  { id: 'cat_7', name: 'Hobbies', icon: '🎨', color: '#06b6d4', order: 6 },
  { id: 'cat_8', name: 'Entertainment', icon: '🎬', color: '#a855f7', order: 7 },
  { id: 'cat_9', name: 'Life Admin', icon: '📋', color: '#6366f1', order: 8 },
  { id: 'cat_10', name: 'Shopping', icon: '🛒', color: '#14b8a6', order: 9 },
]

export const useStore = create<AppState>((set, get) => ({
  tasks: [],
  categories: defaultCategories,
  settings: {
    weekStartsOn: 1,
    defaultView: 'month',
    darkMode: false,
    showCompleted: true,
  },
  
  addTask: (task) => {
    const newTask: Task = {
      ...task,
      id: nanoid(),
      createdAt: new Date(),
      updatedAt: new Date(),
    }
    set((state) => ({ tasks: [...state.tasks, newTask] }))
    get().saveToStorage()
  },
  
  updateTask: (id, updates) => {
    set((state) => ({
      tasks: state.tasks.map((task) =>
        task.id === id
          ? { ...task, ...updates, updatedAt: new Date() }
          : task
      ),
    }))
    get().saveToStorage()
  },
  
  deleteTask: (id) => {
    set((state) => ({
      tasks: state.tasks.filter((task) => task.id !== id),
    }))
    get().saveToStorage()
  },
  
  addCategory: (category) => {
    const newCategory: Category = {
      ...category,
      id: nanoid(),
    }
    set((state) => ({ categories: [...state.categories, newCategory] }))
    get().saveToStorage()
  },
  
  updateCategory: (id, updates) => {
    set((state) => ({
      categories: state.categories.map((cat) =>
        cat.id === id ? { ...cat, ...updates } : cat
      ),
    }))
    get().saveToStorage()
  },
  
  deleteCategory: (id) => {
    set((state) => ({
      categories: state.categories.filter((cat) => cat.id !== id),
    }))
    get().saveToStorage()
  },
  
  updateSettings: (settings) => {
    set((state) => ({
      settings: { ...state.settings, ...settings },
    }))
    get().saveToStorage()
  },
  
  loadFromStorage: () => {
    if (typeof window === 'undefined') return
    
    const tasks = localStorage.getItem('life-org-2026:tasks')
    const categories = localStorage.getItem('life-org-2026:categories')
    const settings = localStorage.getItem('life-org-2026:settings')
    
    if (tasks) {
      set({ tasks: JSON.parse(tasks) })
    }
    if (categories) {
      set({ categories: JSON.parse(categories) })
    }
    if (settings) {
      set({ settings: JSON.parse(settings) })
    }
  },
  
  saveToStorage: () => {
    if (typeof window === 'undefined') return
    
    const state = get()
    localStorage.setItem('life-org-2026:tasks', JSON.stringify(state.tasks))
    localStorage.setItem('life-org-2026:categories', JSON.stringify(state.categories))
    localStorage.setItem('life-org-2026:settings', JSON.stringify(state.settings))
  },
}))
```

### 3. Create Layout (`app/layout.tsx`)

```typescript
'use client'

import { useEffect } from 'react'
import { Inter } from 'next/font/google'
import './globals.css'
import { useStore } from '@/lib/store'

const inter = Inter({ subsets: ['latin'] })

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const loadFromStorage = useStore((state) => state.loadFromStorage)
  
  useEffect(() => {
    loadFromStorage()
  }, [loadFromStorage])
  
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  )
}
```

### 4. Create Main Page (`app/page.tsx`)

```typescript
'use client'

import { useState } from 'react'
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths } from 'date-fns'
import { useStore } from '@/lib/store'
import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react'

export default function HomePage() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const tasks = useStore((state) => state.tasks)
  
  const monthStart = startOfMonth(currentDate)
  const monthEnd = endOfMonth(currentDate)
  const monthDays = eachDayOfInterval({ start: monthStart, end: monthEnd })
  
  // Calculate calendar days (including prev/next month)
  const firstDayOfWeek = monthStart.getDay()
  const daysFromPrevMonth = firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1
  
  const calendarDays: Date[] = []
  for (let i = daysFromPrevMonth; i > 0; i--) {
    const day = new Date(monthStart)
    day.setDate(day.getDate() - i)
    calendarDays.push(day)
  }
  calendarDays.push(...monthDays)
  
  const prevMonth = () => setCurrentDate(subMonths(currentDate, 1))
  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1))
  const goToToday = () => setCurrentDate(new Date())
  
  const getTasksForDay = (day: Date) => {
    return tasks.filter((task) => {
      if (!task.date || !task.show) return false
      return isSameDay(new Date(task.date), day)
    })
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 to-blue-600 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 mb-6">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl md:text-4xl font-bold text-white">
              📅 Life Organization 2026
            </h1>
            <Button
              size="lg"
              className="bg-white text-purple-600 hover:bg-gray-100"
            >
              <Plus className="w-5 h-5 mr-2" />
              Add Task
            </Button>
          </div>
        </div>
        
        {/* Calendar Controls */}
        <div className="bg-white rounded-2xl shadow-2xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-800">
              {format(currentDate, 'MMMM yyyy')}
            </h2>
            <div className="flex gap-2">
              <Button variant="outline" onClick={prevMonth}>
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Button variant="outline" onClick={goToToday}>
                Today
              </Button>
              <Button variant="outline" onClick={nextMonth}>
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
          
          {/* Day Headers */}
          <div className="grid grid-cols-7 gap-2 mb-2">
            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => (
              <div
                key={day}
                className="text-center font-semibold text-gray-600 p-2"
              >
                {day}
              </div>
            ))}
          </div>
          
          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-2">
            {calendarDays.map((day, index) => {
              const isCurrentMonth = isSameMonth(day, currentDate)
              const isToday = isSameDay(day, new Date())
              const dayTasks = getTasksForDay(day)
              
              return (
                <div
                  key={index}
                  className={`
                    min-h-[100px] p-2 rounded-lg border-2 transition-all
                    ${isCurrentMonth ? 'bg-white' : 'bg-gray-50'}
                    ${isToday ? 'border-purple-500 bg-purple-50' : 'border-gray-200'}
                    hover:border-purple-300 hover:shadow-md cursor-pointer
                  `}
                >
                  <div className={`
                    text-sm font-medium mb-1
                    ${isToday ? 'text-purple-600' : 'text-gray-700'}
                  `}>
                    {format(day, 'd')}
                  </div>
                  
                  {/* Tasks */}
                  <div className="space-y-1">
                    {dayTasks.slice(0, 3).map((task) => (
                      <div
                        key={task.id}
                        className={`
                          text-xs p-1 rounded truncate
                          ${task.status === 'completed' ? 'bg-green-100 text-green-700 line-through' :
                            task.status === 'in-progress' ? 'bg-blue-100 text-blue-700' :
                            task.status === 'waiting' ? 'bg-yellow-100 text-yellow-700' :
                            'bg-gray-100 text-gray-700'}
                        `}
                      >
                        {task.title}
                      </div>
                    ))}
                    {dayTasks.length > 3 && (
                      <div className="text-xs text-gray-500 text-center">
                        +{dayTasks.length - 3} more
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
```

---

## 🎨 Update Tailwind Config

**Update `tailwind.config.ts`:**

```typescript
import type { Config } from "tailwindcss"

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f5f7ff',
          100: '#ebefff',
          500: '#667eea',
          600: '#5568d3',
        },
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}

export default config
```

---

## 🚀 Run It!

```bash
npm run dev
```

Open http://localhost:3000

You should see a beautiful calendar! 🎉

---

## 📝 Next Steps

Now that you have the foundation working, add these features:

### Week 1: Task Form
- Create `components/tasks/task-form.tsx`
- Add dialog to create/edit tasks
- Connect to store

### Week 2: Status Board
- Create `app/status/page.tsx`
- Build Kanban columns
- Add drag & drop

### Week 3: Categories & Filters
- Category management
- Filter sidebar
- Search functionality

### Week 4: Polish
- Dark mode
- Export/import
- Settings page
- Mobile responsive
- Animations

### Week 5: Deploy
- Deploy to Vercel
- Add PWA support
- Test on mobile

---

## 📦 Complete package.json

```json
{
  "name": "life-org-2026-simple",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint"
  },
  "dependencies": {
    "next": "14.2.0",
    "react": "^18.3.0",
    "react-dom": "^18.3.0",
    "@radix-ui/react-dialog": "^1.0.5",
    "@radix-ui/react-dropdown-menu": "^2.0.6",
    "@radix-ui/react-select": "^2.0.0",
    "@radix-ui/react-checkbox": "^1.0.4",
    "@radix-ui/react-switch": "^1.0.3",
    "class-variance-authority": "^0.7.0",
    "clsx": "^2.1.1",
    "tailwind-merge": "^2.3.0",
    "zustand": "^4.5.2",
    "date-fns": "^3.6.0",
    "nanoid": "^5.0.7",
    "lucide-react": "^0.379.0",
    "@dnd-kit/core": "^6.1.0",
    "@dnd-kit/sortable": "^8.0.0"
  },
  "devDependencies": {
    "@types/node": "^20",
    "@types/react": "^18",
    "@types/react-dom": "^18",
    "typescript": "^5",
    "tailwindcss": "^3.4.3",
    "postcss": "^8",
    "autoprefixer": "^10.4.19",
    "eslint": "^8",
    "eslint-config-next": "14.2.0"
  }
}
```

---

## 🎯 Key Differences from Full Version

### ✅ What You GET:
- Beautiful UI (same as HTML version)
- Full task management
- Calendar views
- Categories
- Status board
- Dark mode
- Export/import
- 100% client-side

### ❌ What You DON'T Need:
- Authentication
- User accounts
- Database
- Backend API
- Server costs
- User management
- OAuth flows
- Email verification

### 💰 Cost:
- **$0** - Deploy free on Vercel
- **$0** - No database costs
- **$0** - No auth service
- **$0** - Just static hosting

---

## 🚀 Deploy to Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Follow prompts
# Done in 2 minutes!
```

Your app is live! 🎉

---

## 📊 What You'll Have in 5 Weeks

Week 1: ✅ Basic calendar with tasks
Week 2: ✅ Task CRUD operations
Week 3: ✅ Status board + categories
Week 4: ✅ Dark mode + export/import
Week 5: ✅ Polish + deploy

**Result**: A production-ready, beautiful task manager that costs $0 to run!

---

## 🎉 You're Ready!

This simple version gives you:
- ✅ Everything from the HTML mockup
- ✅ No complexity of auth/database
- ✅ Works offline
- ✅ FREE to deploy
- ✅ 100% private
- ✅ Easy to build

**Start coding and have fun!** 🚀
