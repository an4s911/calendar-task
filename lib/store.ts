import { create } from "zustand";
import {
  Task,
  Category,
  Project,
  Settings,
  CalendarView,
  CategoryFilter,
} from "./types";

interface AppState {
  tasks: Task[];
  categories: Category[];
  projects: Project[];
  settings: Settings | null;
  currentView: CalendarView;
  selectedDate: Date;
  isLoading: boolean;
  categoryFilter: CategoryFilter;
  currentUserId: string | null;
  isCurrentUserAdmin: boolean;
  assignedToMeFilter: boolean;
  users: { id: string; fullName: string; username: string }[];

  setTasks: (tasks: Task[]) => void;
  setCategories: (categories: Category[]) => void;
  setProjects: (projects: Project[]) => void;
  setSettings: (settings: Settings) => void;
  setCurrentView: (view: CalendarView) => void;
  setSelectedDate: (date: Date) => void;
  setIsLoading: (loading: boolean) => void;
  setCategoryFilter: (filter: CategoryFilter) => void;
  setCurrentUserId: (id: string | null) => void;
  setIsCurrentUserAdmin: (isAdmin: boolean) => void;
  setAssignedToMeFilter: (filter: boolean) => void;
  setUsers: (
    users: { id: string; fullName: string; username: string }[],
  ) => void;

  addTask: (task: Task) => void;
  updateTask: (id: string, task: Partial<Task>) => void;
  deleteTask: (id: string) => void;

  addCategory: (category: Category) => void;
  updateCategory: (id: string, category: Partial<Category>) => void;
  deleteCategory: (id: string) => void;

  addProject: (project: Project) => void;
  updateProject: (id: string, project: Partial<Project>) => void;
  deleteProject: (id: string) => void;
}

export const useStore = create<AppState>((set) => ({
  tasks: [],
  categories: [],
  projects: [],
  settings: null,
  currentView: "month",
  selectedDate: new Date(),
  isLoading: false,
  categoryFilter: "all",
  currentUserId: null,
  isCurrentUserAdmin: false,
  assignedToMeFilter: false,
  users: [],

  setTasks: (tasks) => set({ tasks }),
  setCategories: (categories) => set({ categories }),
  setProjects: (projects) => set({ projects }),
  setSettings: (settings) => set({ settings }),
  setCurrentView: (view) => set({ currentView: view }),
  setSelectedDate: (date) => set({ selectedDate: date }),
  setIsLoading: (loading) => set({ isLoading: loading }),
  setCategoryFilter: (filter) => set({ categoryFilter: filter }),
  setCurrentUserId: (id) => set({ currentUserId: id }),
  setIsCurrentUserAdmin: (isAdmin) => set({ isCurrentUserAdmin: isAdmin }),
  setAssignedToMeFilter: (filter) => set({ assignedToMeFilter: filter }),
  setUsers: (users) => set({ users }),

  addTask: (task) => set((state) => ({ tasks: [...state.tasks, task] })),
  updateTask: (id, updatedTask) =>
    set((state) => ({
      tasks: state.tasks.map((t) =>
        t.id === id ? { ...t, ...updatedTask } : t,
      ),
    })),
  deleteTask: (id) =>
    set((state) => ({ tasks: state.tasks.filter((t) => t.id !== id) })),

  addCategory: (category) =>
    set((state) => ({ categories: [...state.categories, category] })),
  updateCategory: (id, updatedCategory) =>
    set((state) => ({
      categories: state.categories.map((c) =>
        c.id === id ? { ...c, ...updatedCategory } : c,
      ),
    })),
  deleteCategory: (id) =>
    set((state) => ({
      categories: state.categories.filter((c) => c.id !== id),
    })),

  addProject: (project) =>
    set((state) => ({ projects: [...state.projects, project] })),
  updateProject: (id, updatedProject) =>
    set((state) => ({
      projects: state.projects.map((p) =>
        p.id === id ? { ...p, ...updatedProject } : p,
      ),
    })),
  deleteProject: (id) =>
    set((state) => ({
      projects: state.projects.filter((p) => p.id !== id),
    })),
}));
