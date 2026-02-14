"use client";

import { useEffect, useState } from "react";
import { useStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { AlertDialog } from "@/components/ui/confirm-dialog";
import CategoryManager from "@/components/settings/category-manager";
import ChangePasswordForm from "@/components/auth/change-password-form";

export default function SettingsPage() {
  const { settings, setSettings, setCategories } = useStore();
  const [weekStartsOn, setWeekStartsOn] = useState(1);
  const [defaultView, setDefaultView] = useState<"month" | "week" | "day">(
    "month",
  );
  const [showCompleted, setShowCompleted] = useState(true);
  const [showSavedAlert, setShowSavedAlert] = useState(false);

  useEffect(() => {
    async function fetchData() {
      const settingsRes = await fetch("/api/settings");
      const settingsData = await settingsRes.json();
      setSettings(settingsData);
      setWeekStartsOn(settingsData.weekStartsOn);
      setDefaultView(settingsData.defaultView);
      setShowCompleted(settingsData.showCompleted);

      const categoriesRes = await fetch("/api/categories");
      const categoriesData = await categoriesRes.json();
      setCategories(categoriesData);
    }

    fetchData();
  }, [setSettings, setCategories]);

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

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Settings
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Customize your experience
        </p>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 space-y-6">
        {/* Week Starts On */}
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

        {/* Default View */}
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

        {/* Show Completed */}
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

        {/* Save Button */}
        <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
          <Button onClick={handleSave} className="w-full">
            Save Settings
          </Button>
        </div>
      </div>

      {/* Categories Section - Separate Card */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mt-6">
        <CategoryManager />
      </div>

      <AlertDialog
        open={showSavedAlert}
        onOpenChange={setShowSavedAlert}
        title="Success"
        message="Settings saved successfully!"
      />

      {/* Security Section */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mt-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Security
        </h2>
        <ChangePasswordForm />
      </div>
    </div>
  );
}
