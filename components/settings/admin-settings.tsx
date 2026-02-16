"use client";

import { useEffect, useState } from "react";
import { useStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { AlertDialog } from "@/components/ui/confirm-dialog";
import CategoryManager from "@/components/settings/category-manager";
import ProjectManager from "@/components/projects/project-manager";
import ChangePasswordForm from "@/components/auth/change-password-form";
import UserManagement from "@/components/settings/user-management";
import RoleManagement from "@/components/settings/role-management";
import ProjectAssignments from "@/components/settings/project-assignments";
import ActivityLogs from "@/components/settings/activity-logs";
import { User, Role } from "@/lib/types";
import {
  Users,
  Tags,
  FolderKanban,
  Layers,
  UserCheck,
  Activity,
  Settings2,
  Lock,
} from "lucide-react";

type SettingsTab =
  | "general"
  | "users"
  | "roles"
  | "projects"
  | "categories"
  | "assignments"
  | "activity"
  | "security";

export default function AdminSettings() {
  const { settings, setSettings, setCategories, setProjects } = useStore();
  const [weekStartsOn, setWeekStartsOn] = useState(1);
  const [defaultView, setDefaultView] = useState<"month" | "week" | "day">(
    "month"
  );
  const [showCompleted, setShowCompleted] = useState(true);
  const [showSavedAlert, setShowSavedAlert] = useState(false);
  const [activeTab, setActiveTab] = useState<SettingsTab>("general");

  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);

  const fetchUsers = async () => {
    try {
      const res = await fetch("/api/users");
      if (res.ok) setUsers(await res.json());
    } catch (e) {
      console.error("Failed to fetch users:", e);
    }
  };

  const fetchRoles = async () => {
    try {
      const res = await fetch("/api/roles");
      if (res.ok) setRoles(await res.json());
    } catch (e) {
      console.error("Failed to fetch roles:", e);
    }
  };

  useEffect(() => {
    async function fetchData() {
      const settingsRes = await fetch("/api/settings");
      const settingsData = await settingsRes.json();
      setSettings(settingsData);
      setWeekStartsOn(settingsData.weekStartsOn);
      setDefaultView(settingsData.defaultView);
      setShowCompleted(settingsData.showCompleted);

      const projectsRes = await fetch("/api/projects");
      const projectsData = await projectsRes.json();
      setProjects(projectsData);

      const categoriesRes = await fetch("/api/categories");
      const categoriesData = await categoriesRes.json();
      setCategories(categoriesData);
    }

    fetchData();
    fetchUsers();
    fetchRoles();
  }, [setSettings, setCategories, setProjects]);

  const handleSave = async () => {
    const updatedSettings = {
      ...settings!,
      weekStartsOn,
      defaultView,
      showCompleted,
    };

    setSettings(updatedSettings);

    await fetch("/api/settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updatedSettings),
    });

    setShowSavedAlert(true);
  };

  const tabs: { id: SettingsTab; label: string; icon: React.ReactNode }[] = [
    {
      id: "general",
      label: "General",
      icon: <Settings2 className="h-4 w-4" />,
    },
    { id: "users", label: "Users", icon: <Users className="h-4 w-4" /> },
    { id: "roles", label: "Roles", icon: <Tags className="h-4 w-4" /> },
    {
      id: "projects",
      label: "Projects",
      icon: <FolderKanban className="h-4 w-4" />,
    },
    {
      id: "categories",
      label: "Categories",
      icon: <Layers className="h-4 w-4" />,
    },
    {
      id: "assignments",
      label: "Assignments",
      icon: <UserCheck className="h-4 w-4" />,
    },
    {
      id: "activity",
      label: "Activity",
      icon: <Activity className="h-4 w-4" />,
    },
    { id: "security", label: "Security", icon: <Lock className="h-4 w-4" /> },
  ];

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Settings
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Manage your application settings
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="flex flex-wrap gap-1 mb-6 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
              activeTab === tab.id
                ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm"
                : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === "general" && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Week Starts On
            </label>
            <select
              value={weekStartsOn}
              onChange={(e) => setWeekStartsOn(Number(e.target.value))}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value={0}>Sunday</option>
              <option value={1}>Monday</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Default View
            </label>
            <select
              value={defaultView}
              onChange={(e) =>
                setDefaultView(e.target.value as "month" | "week" | "day")
              }
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="month">Month</option>
              <option value="week">Week</option>
              <option value="day">Day</option>
            </select>
          </div>

          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Show Completed Tasks
            </label>
            <input
              type="checkbox"
              checked={showCompleted}
              onChange={(e) => setShowCompleted(e.target.checked)}
              className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
          </div>

          <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
            <Button onClick={handleSave} className="w-full">
              Save Settings
            </Button>
          </div>
        </div>
      )}

      {activeTab === "users" && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <UserManagement
            users={users}
            roles={roles}
            onRefresh={() => {
              fetchUsers();
              fetchRoles();
            }}
          />
        </div>
      )}

      {activeTab === "roles" && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <RoleManagement roles={roles} onRefresh={fetchRoles} />
        </div>
      )}

      {activeTab === "projects" && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <ProjectManager />
        </div>
      )}

      {activeTab === "categories" && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <CategoryManager />
        </div>
      )}

      {activeTab === "assignments" && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <ProjectAssignments
            users={users}
            projects={useStore.getState().projects}
            onRefresh={fetchUsers}
          />
        </div>
      )}

      {activeTab === "activity" && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <ActivityLogs />
        </div>
      )}

      {activeTab === "security" && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Security
          </h2>
          <ChangePasswordForm />
        </div>
      )}

      <AlertDialog
        open={showSavedAlert}
        onOpenChange={setShowSavedAlert}
        title="Success"
        message="Settings saved successfully!"
      />
    </div>
  );
}
