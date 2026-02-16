"use client";

import { useEffect, useState } from "react";
import AdminSettings from "@/components/settings/admin-settings";
import EmployeeSettings from "@/components/settings/employee-settings";

export default function SettingsPage() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/profile")
      .then((res) => res.json())
      .then((user) => {
        setIsAdmin(user.isAdmin);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-48" />
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-64" />
          <div className="h-96 bg-gray-200 dark:bg-gray-700 rounded" />
        </div>
      </div>
    );
  }

  return isAdmin ? <AdminSettings /> : <EmployeeSettings />;
}
