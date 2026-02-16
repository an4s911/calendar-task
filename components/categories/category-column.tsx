"use client";

import { useState, useEffect } from "react";
import { Category, Task } from "@/lib/types";
import { useStore } from "@/lib/store";
import TaskCard from "@/components/tasks/task-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ConfirmDialog, AlertDialog } from "@/components/ui/confirm-dialog";
import { Pencil, Trash2, Check, X, UserPlus } from "lucide-react";

interface SimpleUser {
  id: string;
  fullName: string;
  username: string;
}

interface CategoryColumnProps {
  category: Category;
  tasks: Task[];
  onTaskClick?: (task: Task) => void;
}

export default function CategoryColumn({
  category,
  tasks,
  onTaskClick,
}: CategoryColumnProps) {
  const { updateCategory, deleteCategory } = useStore();
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(category.name);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [alertMessage, setAlertMessage] = useState<string | null>(null);

  // User assignment state (admin only)
  const [allUsers, setAllUsers] = useState<SimpleUser[]>([]);
  const [assignedUsers, setAssignedUsers] = useState<SimpleUser[]>([]);
  const [showAssignDropdown, setShowAssignDropdown] = useState(false);
  const isAdmin = allUsers.length > 0;

  useEffect(() => {
    fetch("/api/users")
      .then((res) => (res.ok ? res.json() : []))
      .then((data: SimpleUser[]) => setAllUsers(data))
      .catch(() => setAllUsers([]));
  }, []);

  useEffect(() => {
    if (!isAdmin) return;
    fetch(`/api/assignments/category?categoryId=${category.id}`)
      .then((res) => (res.ok ? res.json() : []))
      .then((data: SimpleUser[]) => setAssignedUsers(data))
      .catch(() => setAssignedUsers([]));
  }, [isAdmin, category.id]);

  const handleAssignUser = async (user: SimpleUser) => {
    setAssignedUsers((prev) => [...prev, user]);
    setShowAssignDropdown(false);
    try {
      await fetch("/api/assignments/category", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ categoryId: category.id, userId: user.id }),
      });
    } catch {
      setAssignedUsers((prev) => prev.filter((u) => u.id !== user.id));
    }
  };

  const handleUnassignUser = async (userId: string) => {
    const removed = assignedUsers.find((u) => u.id === userId);
    setAssignedUsers((prev) => prev.filter((u) => u.id !== userId));
    try {
      await fetch(
        `/api/assignments/category?categoryId=${category.id}&userId=${userId}`,
        { method: "DELETE" },
      );
    } catch {
      if (removed) setAssignedUsers((prev) => [...prev, removed]);
    }
  };

  const handleSave = async () => {
    if (editName.trim() && editName !== category.name) {
      try {
        const response = await fetch(`/api/categories/${category.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: editName,
            color: category.color,
          }),
        });

        if (response.ok) {
          const updated = await response.json();
          updateCategory(category.id, updated);
        }
      } catch (error) {
        console.error("Error updating category:", error);
      }
    }
    setIsEditing(false);
  };

  const handleDeleteClick = () => {
    setShowDeleteConfirm(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      const response = await fetch(`/api/categories/${category.id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        deleteCategory(category.id);
      }
    } catch (error) {
      console.error("Error deleting category:", error);
      setAlertMessage("Failed to delete category");
    }
  };

  const handleCancel = () => {
    setEditName(category.name);
    setIsEditing(false);
  };

  return (
    <div className="flex flex-col h-full">
      <div
        className="px-4 py-3 rounded-t-lg border-b-4"
        style={{
          backgroundColor: category.color + "20",
          borderColor: category.color,
        }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 flex-1">
            {isEditing ? (
              <div className="flex items-center space-x-1 flex-1">
                <Input
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleSave();
                    if (e.key === "Escape") handleCancel();
                  }}
                  className="h-8 text-sm"
                  autoFocus
                />
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-8 w-8"
                  onClick={handleSave}
                >
                  <Check className="h-4 w-4 text-green-600" />
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-8 w-8"
                  onClick={handleCancel}
                >
                  <X className="h-4 w-4 text-red-600" />
                </Button>
              </div>
            ) : (
              <>
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  {category.name}
                </h3>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-6 w-6"
                  onClick={() => setIsEditing(true)}
                >
                  <Pencil className="h-3 w-3" />
                </Button>
              </>
            )}
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
              {tasks.length}
            </span>
            {!isEditing && (
              <Button
                size="icon"
                variant="ghost"
                className="h-6 w-6"
                onClick={handleDeleteClick}
              >
                <Trash2 className="h-3 w-3 text-red-600" />
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Assigned Users (admin only) */}
      {isAdmin && (
        <div className="px-4 py-2 bg-white dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700">
          <div className="flex flex-wrap items-center gap-1.5">
            {assignedUsers.map((user) => (
              <span
                key={user.id}
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
              >
                {user.fullName}
                <button
                  onClick={() => handleUnassignUser(user.id)}
                  className="hover:bg-blue-200 dark:hover:bg-blue-800/50 rounded-full p-0.5 transition-colors"
                >
                  <X className="h-2.5 w-2.5" />
                </button>
              </span>
            ))}

            <div className="relative">
              <button
                onClick={() => setShowAssignDropdown(!showAssignDropdown)}
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-500 hover:bg-gray-200 dark:bg-gray-700/50 dark:text-gray-400 dark:hover:bg-gray-700 transition-colors"
              >
                <UserPlus className="h-3 w-3" />
                Assign
              </button>

              {showAssignDropdown && (
                <div className="absolute top-full left-0 mt-1 z-50 w-52 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg py-1 max-h-48 overflow-y-auto">
                  {allUsers
                    .filter((u) => !assignedUsers.some((au) => au.id === u.id))
                    .map((user) => (
                      <button
                        key={user.id}
                        onClick={() => handleAssignUser(user)}
                        className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                      >
                        <span className="text-gray-900 dark:text-white">
                          {user.fullName}
                        </span>
                        <span className="text-gray-500 dark:text-gray-400 ml-1.5">
                          @{user.username}
                        </span>
                      </button>
                    ))}
                  {allUsers.filter(
                    (u) => !assignedUsers.some((au) => au.id === u.id),
                  ).length === 0 && (
                    <p className="px-3 py-2 text-sm text-gray-500 dark:text-gray-400">
                      All users assigned
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="flex-1 p-4 bg-white dark:bg-gray-800 rounded-b-lg shadow space-y-3 min-h-96 overflow-y-auto">
        {tasks.length === 0 ? (
          <div className="text-center text-gray-400 dark:text-gray-500 py-8">
            No tasks
          </div>
        ) : (
          tasks.map((task) => (
            <div key={task.id}>
              <TaskCard task={task} onClick={() => onTaskClick?.(task)} />
            </div>
          ))
        )}
      </div>

      <ConfirmDialog
        open={showDeleteConfirm}
        onOpenChange={setShowDeleteConfirm}
        title="Delete Category"
        message={`Delete "${category.name}" category? This will affect ${tasks.length} task(s).`}
        confirmLabel="Delete"
        variant="destructive"
        onConfirm={handleDeleteConfirm}
      />

      <AlertDialog
        open={!!alertMessage}
        onOpenChange={() => setAlertMessage(null)}
        title="Error"
        message={alertMessage ?? ""}
        variant="destructive"
      />
    </div>
  );
}
