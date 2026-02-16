export interface Task {
  id: string;
  title: string;
  description?: string | null;
  date?: Date | string | null;
  startTime?: string | null;
  endTime?: string | null;
  status: "not-started" | "waiting" | "in-progress" | "completed";
  priority: "low" | "medium" | "high";
  categoryId: string;
  show: boolean;
  createdAt: Date | string;
  updatedAt: Date | string;
  completedAt?: Date | string | null;
  category?: Category;
}

export interface Project {
  id: string;
  name: string;
  description?: string | null;
  color: string;
  order: number;
  createdAt?: Date | string;
  updatedAt?: Date | string;
  categories?: Category[];
}

export interface Category {
  id: string;
  name: string;
  color: string;
  projectId?: string | null;
  project?: Project;
  order: number;
  createdAt?: Date | string;
  updatedAt?: Date | string;
}

export interface Role {
  id: string;
  name: string;
  description?: string | null;
  color: string;
  createdAt?: Date | string;
  updatedAt?: Date | string;
  _count?: { users: number };
}

export interface User {
  id: string;
  fullName: string;
  username: string;
  email?: string | null;
  roleId?: string | null;
  role?: Role | null;
  timezone: string;
  isAdmin: boolean;
  isActive: boolean;
  passwordChangedAt?: Date | string;
  createdAt?: Date | string;
  updatedAt?: Date | string;
  projectAssignments?: ProjectAssignment[];
}

export interface ProjectAssignment {
  id: string;
  projectId: string;
  userId: string;
  categoryAccessMode: "all" | "selected" | "all_except";
  project?: Project;
  user?: Pick<User, "id" | "fullName" | "username">;
  categoryPermissions?: CategoryPermission[];
  createdAt?: Date | string;
  updatedAt?: Date | string;
}

export interface CategoryPermission {
  id: string;
  projectAssignmentId: string;
  categoryId: string;
  canAccess: boolean;
  category?: Category;
}

export interface TaskAssignment {
  id: string;
  taskId: string;
  userId: string;
  task?: Task;
  user?: Pick<User, "id" | "fullName" | "username">;
  createdAt?: Date | string;
}

export interface ActivityLog {
  id: string;
  userId: string;
  action: string;
  entityType: string;
  entityId: string;
  entityName?: string | null;
  metadata?: Record<string, unknown> | null;
  createdAt: Date | string;
  user?: Pick<User, "id" | "fullName" | "username">;
}

export interface Settings {
  id: string;
  weekStartsOn: number;
  defaultView: "month" | "week" | "day";
  darkMode: boolean;
  showCompleted: boolean;
  defaultStatus: string;
  createdAt?: Date | string;
  updatedAt?: Date | string;
}

export type TaskStatus =
  | "not-started"
  | "waiting"
  | "in-progress"
  | "completed";
export type TaskPriority = "low" | "medium" | "high";
export type CalendarView = "month" | "week" | "day";
export type CategoryFilter = "all" | string; // "all" or project ID

export const STATUS_COLORS = {
  "not-started": "#6b7280",
  waiting: "#f59e0b",
  "in-progress": "#3b82f6",
  completed: "#10b981",
} as const;

export const PRIORITY_COLORS = {
  low: "#6b7280",
  medium: "#f59e0b",
  high: "#ef4444",
} as const;
