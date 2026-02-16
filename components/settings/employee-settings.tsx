"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import ChangePasswordForm from "@/components/auth/change-password-form";

interface ProfileData {
  fullName: string;
  email: string;
  timezone: string;
}

export default function EmployeeSettings() {
  const [profile, setProfile] = useState<ProfileData>({
    fullName: "",
    email: "",
    timezone: "UTC",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    fetch("/api/profile")
      .then((res) => res.json())
      .then((user) => {
        setProfile({
          fullName: user.fullName || "",
          email: user.email || "",
          timezone: user.timezone || "UTC",
        });
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setSaving(true);

    try {
      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profile),
      });

      if (res.ok) {
        setSuccess("Profile updated successfully");
      } else {
        const data = await res.json();
        setError(data.error || "Failed to update profile");
      }
    } catch {
      setError("Something went wrong");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-48" />
          <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded" />
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Settings
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Manage your personal settings
        </p>
      </div>

      {/* Profile Section */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Profile
        </h2>

        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg text-sm mb-4">
            {error}
          </div>
        )}
        {success && (
          <div className="bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 px-4 py-3 rounded-lg text-sm mb-4">
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="fullName">Full Name</Label>
            <Input
              id="fullName"
              value={profile.fullName}
              onChange={(e) =>
                setProfile({ ...profile, fullName: e.target.value })
              }
              required
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={profile.email}
              onChange={(e) =>
                setProfile({ ...profile, email: e.target.value })
              }
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="timezone">Timezone</Label>
            <Input
              id="timezone"
              value={profile.timezone}
              onChange={(e) =>
                setProfile({ ...profile, timezone: e.target.value })
              }
              placeholder="e.g., UTC, America/New_York"
              className="mt-1"
            />
          </div>

          <Button type="submit" disabled={saving}>
            {saving ? "Saving..." : "Save Profile"}
          </Button>
        </form>
      </div>

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
