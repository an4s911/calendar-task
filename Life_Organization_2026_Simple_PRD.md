# Product Requirements Document (PRD)
# Life Organization 2026 - Simple Next.js App (No Auth)

---

## Document Information

| Field | Value |
|-------|-------|
| **Product Name** | Life Organization 2026 - Personal Edition |
| **Version** | 1.0 - Simplified |
| **Platform** | Next.js Web Application (Single User) |
| **Created** | February 6, 2026 |
| **Complexity** | ⭐⭐ Simple (No Auth, No Backend) |

---

## Executive Summary

A **beautiful, single-user task management app** built with Next.js that stores data locally in the browser. No authentication, no server required - just a clean, modern interface for personal task organization.

### Key Features

✅ **Visual Calendar** - Month/week/day views with color-coded tasks
✅ **Task Management** - Create, edit, complete, delete tasks
✅ **Status Organization** - Kanban board with drag-and-drop
✅ **Categories** - 10 default categories with custom colors
✅ **Local Storage** - All data saved in browser (no server needed)
✅ **Offline First** - Works without internet
✅ **Export/Import** - Backup your data as JSON
✅ **Dark Mode** - Toggle between light and dark themes
✅ **Mobile Responsive** - Works perfectly on all devices

### What's NOT Included (Simplified)

❌ User accounts / authentication
❌ Multi-user collaboration
❌ Cloud sync / database
❌ Google Calendar integration (can add later)
❌ Team features
❌ Backend API

---

## Tech Stack (Simplified)

```typescript
Frontend:     Next.js 14 (App Router - Client Side Only)
Styling:      Tailwind CSS + shadcn/ui
State:        Zustand (simple state management)
Storage:      localStorage (browser storage)
Date:         date-fns (date utilities)
Drag & Drop:  @dnd-kit
Icons:        lucide-react
Deployment:   Vercel / Netlify (static export)
```

**No Backend Needed!** Everything runs in the browser.

---

## Features

### 1. Task Management

**Task Properties:**
- Title (required)
- Description (optional)
- Date (optional)
- Start time (optional)
- End time (optional)
- Status: Not Started, Waiting, In Progress, Completed
- Priority: Low, Medium, High
- Category: Physical, Money, Education, etc.
- Show toggle (hide/show task)

**Actions:**
- Create task (+ button or Cmd/Ctrl+K)
- Edit task (click task)
- Complete task (checkbox)
- Delete task (trash icon)
- Duplicate task
- Drag to reschedule

---

### 2. Calendar Views

**Month View:**
- 6-week grid (Monday - Sunday)
- Tasks appear on their dates
- Color-coded by status
- Click date to add task
- Click task to edit

**Week View:**
- 7 columns with hourly slots
- See time-based tasks
- Drag tasks between days

**Day View:**
- Single day focus
- Timeline view (6 AM - 11 PM)
- Perfect for daily planning

**Quick Navigation:**
- Arrow keys: Previous/next
- `T` key: Today
- `M` key: Month view
- `W` key: Week view
- `D` key: Day view

---

### 3. Status Board (Kanban)

**4 Columns:**
- ⏳ Waiting
- 🔄 In Progress
- ⭕ Not Started
- ✅ Completed

**Features:**
- Drag tasks between columns
- Status auto-updates
- Task count badges
- Sorted by date
- Filter by category

---

### 4. Categories

**10 Default Categories:**
1. 💪 Physical (#3b82f6 - Blue)
2. 💰 Money (#10b981 - Green)
3. 📚 Education (#8b5cf6 - Purple)
4. 🧹 Chores (#f59e0b - Amber)
5. ❤️ Health (#ef4444 - Red)
6. 👥 Relationship (#ec4899 - Pink)
7. 🎨 Hobbies (#06b6d4 - Cyan)
8. 🎬 Entertainment (#a855f7 - Purple)
9. 📋 Life Admin (#6366f1 - Indigo)
10. 🛒 Shopping (#14b8a6 - Teal)

**Custom Categories:**
- Add unlimited categories
- Choose icon and color
- Edit/delete categories

---

### 5. Data Management

**Local Storage:**
- All data saved to browser automatically
- Auto-save on every change
- Persists across sessions

**Export/Import:**
- Export all data as JSON file
- Import from JSON backup
- Share data between devices

**Clear Data:**
- Reset button in settings
- Confirmation dialog
- Export reminder before clearing

---

### 6. User Interface

**Color System:**
```
Status Colors:
- Not Started: Gray (#6b7280)
- Waiting: Yellow (#f59e0b)
- In Progress: Blue (#3b82f6)
- Completed: Green (#10b981) + strikethrough
- Overdue: Red (#ef4444)

Priority Colors:
- Low: Gray
- Medium: Amber
- High: Red
```

**Components:**
- Clean header with logo and actions
- Sidebar navigation (collapsible on mobile)
- Floating action button (+ add task)
- Toast notifications
- Modal dialogs
- Loading states
- Empty states

---

## File Structure

```
life-org-2026/
├── app/
│   ├── layout.tsx              # Root layout
│   ├── page.tsx                # Calendar view (main page)
│   ├── status/
│   │   └── page.tsx            # Status board
│   ├── settings/
│   │   └── page.tsx            # Settings page
│   └── globals.css             # Global styles
├── components/
│   ├── ui/                     # shadcn components
│   ├── calendar/
│   │   ├── calendar-view.tsx
│   │   ├── month-view.tsx
│   │   ├── week-view.tsx
│   │   └── day-view.tsx
│   ├── tasks/
│   │   ├── task-card.tsx
│   │   ├── task-form.tsx
│   │   └── task-list.tsx
│   ├── status/
│   │   ├── status-board.tsx
│   │   └── status-column.tsx
│   └── layout/
│       ├── header.tsx
│       ├── sidebar.tsx
│       └── mobile-nav.tsx
├── lib/
│   ├── store.ts                # Zustand store
│   ├── storage.ts              # localStorage helpers
│   ├── types.ts                # TypeScript types
│   └── utils.ts                # Utility functions
├── hooks/
│   ├── use-tasks.ts
│   ├── use-categories.ts
│   └── use-local-storage.ts
├── public/
│   ├── icons/
│   └── manifest.json           # PWA manifest
├── package.json
├── next.config.js
├── tailwind.config.ts
└── tsconfig.json
```

---

## Data Model (TypeScript Types)

```typescript
// Task
interface Task {
  id: string
  title: string
  description?: string
  date?: Date
  startTime?: string
  endTime?: string
  status: 'not-started' | 'waiting' | 'in-progress' | 'completed'
  priority: 'low' | 'medium' | 'high'
  categoryId: string
  show: boolean
  createdAt: Date
  updatedAt: Date
  completedAt?: Date
}

// Category
interface Category {
  id: string
  name: string
  icon: string
  color: string
  order: number
}

// Settings
interface Settings {
  weekStartsOn: 0 | 1 // 0 = Sunday, 1 = Monday
  defaultView: 'month' | 'week' | 'day'
  darkMode: boolean
  showCompleted: boolean
  defaultStatus: string
}
```

---

## localStorage Structure

```javascript
// Keys
'life-org-2026:tasks'        // Array of tasks
'life-org-2026:categories'   // Array of categories
'life-org-2026:settings'     // Settings object
'life-org-2026:version'      // Data version for migrations

// Example stored data
{
  "life-org-2026:tasks": [
    {
      "id": "task_abc123",
      "title": "Plan workout",
      "date": "2026-02-06T00:00:00.000Z",
      "status": "not-started",
      "priority": "medium",
      "categoryId": "cat_physical",
      "show": true,
      "createdAt": "2026-02-06T10:30:00.000Z"
    }
  ],
  "life-org-2026:categories": [
    {
      "id": "cat_physical",
      "name": "Physical",
      "icon": "💪",
      "color": "#3b82f6",
      "order": 0
    }
  ],
  "life-org-2026:settings": {
    "weekStartsOn": 1,
    "defaultView": "month",
    "darkMode": false,
    "showCompleted": true
  }
}
```

---

## Key Features in Detail

### Auto-Save

```typescript
// Automatically save on every change
useEffect(() => {
  localStorage.setItem('life-org-2026:tasks', JSON.stringify(tasks))
}, [tasks])

// Debounced for performance
const debouncedSave = useDebouncedCallback((data) => {
  localStorage.setItem('life-org-2026:tasks', JSON.stringify(data))
}, 500)
```

### Export/Import

```typescript
// Export
function exportData() {
  const data = {
    tasks: JSON.parse(localStorage.getItem('life-org-2026:tasks')),
    categories: JSON.parse(localStorage.getItem('life-org-2026:categories')),
    settings: JSON.parse(localStorage.getItem('life-org-2026:settings')),
    exportedAt: new Date(),
    version: '1.0'
  }
  
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `life-org-2026-backup-${new Date().toISOString()}.json`
  a.click()
}

// Import
function importData(file: File) {
  const reader = new FileReader()
  reader.onload = (e) => {
    const data = JSON.parse(e.target.result as string)
    localStorage.setItem('life-org-2026:tasks', JSON.stringify(data.tasks))
    localStorage.setItem('life-org-2026:categories', JSON.stringify(data.categories))
    localStorage.setItem('life-org-2026:settings', JSON.stringify(data.settings))
    window.location.reload()
  }
  reader.readAsText(file)
}
```

---

## Development Timeline

### Week 1: Setup & Calendar
- ✅ Create Next.js app
- ✅ Install dependencies
- ✅ Setup Tailwind + shadcn/ui
- ✅ Create layout components
- ✅ Build month calendar view
- ✅ Implement date navigation

### Week 2: Task Management
- ✅ Create task form
- ✅ Task CRUD operations
- ✅ localStorage integration
- ✅ Task card component
- ✅ Task list component

### Week 3: Status & Categories
- ✅ Build status board
- ✅ Drag and drop
- ✅ Category management
- ✅ Filters and sorting
- ✅ Status transitions

### Week 4: Polish & Features
- ✅ Week and day views
- ✅ Export/import
- ✅ Settings page
- ✅ Dark mode
- ✅ Keyboard shortcuts
- ✅ Mobile responsive
- ✅ PWA setup

### Week 5: Testing & Deploy
- ✅ Bug fixes
- ✅ Performance optimization
- ✅ Deploy to Vercel
- ✅ Documentation

**Total: 5 weeks to production!** 🚀

---

## Performance Targets

| Metric | Target |
|--------|--------|
| Initial load | <1.5s |
| Calendar render | <100ms |
| Task creation | <50ms |
| localStorage read | <10ms |
| localStorage write | <20ms |
| Mobile performance | 90+ Lighthouse |
| Bundle size | <200KB |

---

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+
- Mobile Safari (iOS 14+)
- Chrome Mobile (Android 10+)

**localStorage supported in all modern browsers ✅**

---

## Deployment

### Option 1: Vercel (Recommended)
```bash
# Deploy with one command
vercel

# Or connect GitHub repo for auto-deploy
```

### Option 2: Netlify
```bash
# Build as static site
npm run build
npm run export

# Upload dist folder to Netlify
```

### Option 3: GitHub Pages
```bash
# Enable static export in next.config.js
output: 'export'

# Build and deploy
npm run build
npm run deploy
```

---

## Future Enhancements (Optional)

### Phase 2: Add Later If Needed

**Google Calendar Sync:**
- OAuth without backend (PKCE flow)
- Sync to personal calendar
- Read-only or two-way sync

**Cloud Backup:**
- Optional Supabase integration
- Sync across devices
- Keep using localStorage as primary

**Recurring Tasks:**
- Daily, weekly, monthly patterns
- Auto-create instances

**File Attachments:**
- Store in localStorage as base64
- Or use Cloudflare R2

**Analytics:**
- Local analytics (no tracking)
- Task completion trends
- Time tracking

**Themes:**
- Multiple color schemes
- Custom theme builder

---

## Success Metrics

**Usage:**
- Tasks created per day: 5+
- Task completion rate: 70%+
- Daily active usage: 5 days/week
- Average session: 5 minutes

**Performance:**
- Load time: <1.5s
- No localStorage errors
- Works offline: 100%
- Mobile usable: Yes

**User Satisfaction:**
- Personal rating: ⭐⭐⭐⭐⭐
- Would recommend: Yes
- Daily driver: Yes

---

## Security & Privacy

**No Data Leaves Your Device:**
- ✅ All data in localStorage
- ✅ No server, no database
- ✅ No tracking or analytics
- ✅ No third-party access
- ✅ Complete privacy

**Data Ownership:**
- ✅ You own 100% of your data
- ✅ Export anytime
- ✅ Delete anytime
- ✅ No vendor lock-in

---

## Summary

This is a **simple, beautiful, single-user task management app** that:

✅ Looks like the HTML version you loved
✅ Works entirely in the browser (no backend)
✅ Saves data locally (localStorage)
✅ Deploys as a static site
✅ Takes only 5 weeks to build
✅ Costs $0 to run (static hosting is free)
✅ 100% private (data never leaves your device)

**Perfect for personal use without any complexity!** 🎉

---

## Getting Started

See **SIMPLE_SETUP_GUIDE.md** for step-by-step instructions to build this app in 5 weeks.

---

**Document Version**: 1.0 - Simplified  
**Last Updated**: February 6, 2026  
**Status**: ✅ Ready to Build
