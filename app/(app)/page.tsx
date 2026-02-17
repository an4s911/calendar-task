"use client";

import { useEffect } from "react";
import { useStore } from "@/lib/store";
import MonthView from "@/components/calendar/month-view";

export default function Home() {
  const {
    setTasks,
    setCategories,
    setProjects,
    setSettings,
    setIsLoading,
    setCurrentUserId,
    setIsCurrentUserAdmin,
    setUsers,
  } = useStore();

  useEffect(() => {
    async function fetchData() {
      setIsLoading(true);
      try {
        // Fetch tasks
        const tasksRes = await fetch("/api/tasks");
        const tasks = await tasksRes.json();
        setTasks(tasks);

        // Fetch projects
        const projectsRes = await fetch("/api/projects");
        const projects = await projectsRes.json();
        setProjects(projects);

        // Fetch categories
        const categoriesRes = await fetch("/api/categories");
        const categories = await categoriesRes.json();
        setCategories(categories);

        // Fetch settings
        const settingsRes = await fetch("/api/settings");
        const settings = await settingsRes.json();
        setSettings(settings);

        // Fetch current user
        const meRes = await fetch("/api/auth/me");
        const me = await meRes.json();
        setCurrentUserId(me.id);
        setIsCurrentUserAdmin(me.isAdmin);

        // Fetch users list (for admin assignment UI)
        if (me.isAdmin) {
          const usersRes = await fetch("/api/users");
          if (usersRes.ok) {
            const users = await usersRes.json();
            setUsers(users);
          }
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();
  }, [
    setTasks,
    setCategories,
    setProjects,
    setSettings,
    setIsLoading,
    setCurrentUserId,
    setIsCurrentUserAdmin,
    setUsers,
  ]);

  return (
    <div className="p-6">
      <MonthView />
    </div>
  );
}
