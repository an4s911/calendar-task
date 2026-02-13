"use client";

import { Calendar, Moon, Sun, Plus, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useStore } from "@/lib/store";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import TaskFormModal from "@/components/tasks/task-form-modal";

export default function Header() {
  const router = useRouter();
  const { settings, setSettings } = useStore();
  const isDark = settings?.darkMode ?? false;
  const [showTaskModal, setShowTaskModal] = useState(false);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  };

  useEffect(() => {
    document.documentElement.classList.toggle("dark", isDark);
  }, [isDark]);

  const toggleDarkMode = async () => {
    if (!settings) return;

    const newDarkMode = !isDark;
    document.documentElement.classList.toggle("dark", newDarkMode);

    const updatedSettings = { ...settings, darkMode: newDarkMode };
    setSettings(updatedSettings);

    // Update in database
    await fetch("/api/settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updatedSettings),
    });
  };

  return (
    <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between px-6 py-4">
        <div className="flex items-center space-x-3">
          <Calendar className="h-8 w-8 text-blue-600 dark:text-blue-400" />
          <div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">
              Life Organization 2026
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Personal Task Manager
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Button variant="outline" size="icon" onClick={toggleDarkMode}>
            {isDark ? (
              <Sun className="h-5 w-5" />
            ) : (
              <Moon className="h-5 w-5" />
            )}
          </Button>
          <Button
            className="flex items-center space-x-2"
            onClick={() => setShowTaskModal(true)}
          >
            <Plus className="h-5 w-5" />
            <span>New Task</span>
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={handleLogout}
            title="Log out"
          >
            <LogOut className="h-5 w-5" />
          </Button>
        </div>
      </div>

      <TaskFormModal open={showTaskModal} onOpenChange={setShowTaskModal} />
    </header>
  );
}
