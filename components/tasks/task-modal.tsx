"use client";

import { useState, useEffect } from "react";
import { useStore } from "@/lib/store";
import { Task, TaskStatus, TaskPriority } from "@/lib/types";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalTitle,
  ModalFooter,
} from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import TaskFormModal from "@/components/tasks/task-form-modal";
import { format } from "date-fns";
import { Calendar, Clock, Pencil, UserPlus, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface SimpleUser {
  id: string;
  fullName: string;
  username: string;
}

interface TaskModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  task: Task | null;
}

const STATUS_OPTIONS: { value: TaskStatus; label: string }[] = [
  { value: "not-started", label: "Not Started" },
  { value: "waiting", label: "Waiting" },
  { value: "in-progress", label: "In Progress" },
  { value: "completed", label: "Completed" },
];

const PRIORITY_OPTIONS: { value: TaskPriority; label: string }[] = [
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
];

const statusStyles: Record<TaskStatus, string> = {
  "not-started":
    "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300",
  waiting:
    "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
  "in-progress":
    "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  completed:
    "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
};

const priorityStyles: Record<TaskPriority, string> = {
  low: "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300",
  medium:
    "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
  high: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
};

export default function TaskModal({
  open,
  onOpenChange,
  task,
}: TaskModalProps) {
  const { tasks, updateTask } = useStore();
  const [showFormModal, setShowFormModal] = useState(false);
  const [currentTask, setCurrentTask] = useState<Task | null>(null);
  const [trackedTaskId, setTrackedTaskId] = useState<string | null>(null);

  // User assignment state (admin only)
  const [users, setUsers] = useState<SimpleUser[]>([]);
  const [assignedUserIds, setAssignedUserIds] = useState<string[]>([]);
  const [showAssignDropdown, setShowAssignDropdown] = useState(false);
  const isAdmin = users.length > 0;

  // Fetch users list (admin only)
  useEffect(() => {
    if (!open) return;
    fetch("/api/users")
      .then((res) => (res.ok ? res.json() : []))
      .then((data: SimpleUser[]) => setUsers(data))
      .catch(() => setUsers([]));
  }, [open]);

  // Fetch existing assignments
  useEffect(() => {
    if (!open || !task || !isAdmin) return;
    fetch(`/api/assignments/task?taskId=${task.id}`)
      .then((res) => (res.ok ? res.json() : []))
      .then((assignments: Array<{ userId: string }>) => {
        setAssignedUserIds(assignments.map((a) => a.userId));
      })
      .catch(() => setAssignedUserIds([]));
  }, [open, task, isAdmin]);

  const handleAssignUser = async (userId: string) => {
    if (!currentTask) return;
    setAssignedUserIds((prev) => [...prev, userId]);
    setShowAssignDropdown(false);
    try {
      await fetch("/api/assignments/task", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ taskId: currentTask.id, userId }),
      });
    } catch {
      setAssignedUserIds((prev) => prev.filter((id) => id !== userId));
    }
  };

  const handleUnassignUser = async (userId: string) => {
    if (!currentTask) return;
    setAssignedUserIds((prev) => prev.filter((id) => id !== userId));
    try {
      await fetch(
        `/api/assignments/task?taskId=${currentTask.id}&userId=${userId}`,
        { method: "DELETE" },
      );
    } catch {
      setAssignedUserIds((prev) => [...prev, userId]);
    }
  };

  // Sync from prop only when task ID changes or modal opens — not on every re-render
  if (task && open && task.id !== trackedTaskId) {
    setCurrentTask(task);
    setTrackedTaskId(task.id);
  }
  if (!open && trackedTaskId !== null) {
    setCurrentTask(null);
    setTrackedTaskId(null);
  }

  if (!currentTask) return null;

  const handleStatusChange = async (newStatus: TaskStatus) => {
    if (newStatus === currentTask.status) return;

    const updated = { ...currentTask, status: newStatus };
    setCurrentTask(updated);
    updateTask(currentTask.id, updated);

    try {
      const response = await fetch(`/api/tasks/${currentTask.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (response.ok) {
        const serverTask = await response.json();
        setCurrentTask(serverTask);
        updateTask(currentTask.id, serverTask);
      }
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };

  const handlePriorityChange = async (newPriority: TaskPriority) => {
    if (newPriority === currentTask.priority) return;

    const updated = { ...currentTask, priority: newPriority };
    setCurrentTask(updated);
    updateTask(currentTask.id, updated);

    try {
      const response = await fetch(`/api/tasks/${currentTask.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ priority: newPriority }),
      });
      if (response.ok) {
        const serverTask = await response.json();
        setCurrentTask(serverTask);
        updateTask(currentTask.id, serverTask);
      }
    } catch (error) {
      console.error("Error updating priority:", error);
    }
  };

  const handleFormClose = (formOpen: boolean) => {
    if (!formOpen) {
      setShowFormModal(false);
      // Refresh from store after form edits
      if (currentTask) {
        const freshTask = tasks.find((t) => t.id === currentTask.id);
        if (freshTask) setCurrentTask(freshTask);
      }
    }
  };

  const handleClose = () => {
    onOpenChange(false);
    setCurrentTask(null);
    setShowAssignDropdown(false);
  };

  return (
    <>
      <Modal open={open && !showFormModal} onOpenChange={handleClose}>
        <ModalContent onClose={handleClose}>
          <ModalHeader>
            <ModalTitle>{currentTask.title}</ModalTitle>
          </ModalHeader>

          <div className="space-y-5">
            {/* Description */}
            {currentTask.description && (
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {currentTask.description}
              </p>
            )}

            {/* Date & Time */}
            {(currentTask.startDate || currentTask.startTime) && (
              <div className="flex flex-wrap gap-4 text-sm text-gray-600 dark:text-gray-400">
                {currentTask.startDate && (
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4" />
                    <span>
                      {format(
                        new Date(currentTask.startDate),
                        "EEEE, MMMM d, yyyy",
                      )}
                      {currentTask.endDate &&
                        new Date(currentTask.endDate).getTime() !==
                          new Date(currentTask.startDate).getTime() && (
                          <>
                            {" - "}
                            {format(
                              new Date(currentTask.endDate),
                              "EEEE, MMMM d, yyyy",
                            )}
                          </>
                        )}
                    </span>
                  </div>
                )}
                {currentTask.startTime && (
                  <div className="flex items-center space-x-2">
                    <Clock className="h-4 w-4" />
                    <span>
                      {currentTask.startTime}
                      {currentTask.endTime && ` - ${currentTask.endTime}`}
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* Status */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Status
              </label>
              <div className="flex flex-wrap gap-2">
                {STATUS_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => handleStatusChange(opt.value)}
                    className={cn(
                      "px-3 py-1.5 rounded-md text-sm font-medium transition-all",
                      currentTask.status === opt.value
                        ? cn(
                            statusStyles[opt.value],
                            "ring-2 ring-offset-1 ring-current",
                          )
                        : "bg-gray-50 text-gray-500 hover:bg-gray-100 dark:bg-gray-700/50 dark:text-gray-400 dark:hover:bg-gray-700",
                    )}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Priority */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Priority
              </label>
              <div className="flex flex-wrap gap-2">
                {PRIORITY_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => handlePriorityChange(opt.value)}
                    className={cn(
                      "px-3 py-1.5 rounded-md text-sm font-medium transition-all",
                      currentTask.priority === opt.value
                        ? cn(
                            priorityStyles[opt.value],
                            "ring-2 ring-offset-1 ring-current",
                          )
                        : "bg-gray-50 text-gray-500 hover:bg-gray-100 dark:bg-gray-700/50 dark:text-gray-400 dark:hover:bg-gray-700",
                    )}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Assigned Users (admin only) */}
            {isAdmin && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Assigned To
                </label>
                <div className="flex flex-wrap gap-2">
                  {assignedUserIds.map((userId) => {
                    const user = users.find((u) => u.id === userId);
                    if (!user) return null;
                    return (
                      <span
                        key={userId}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                      >
                        {user.fullName}
                        <button
                          onClick={() => handleUnassignUser(userId)}
                          className="hover:bg-blue-200 dark:hover:bg-blue-800/50 rounded-full p-0.5 transition-colors"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    );
                  })}

                  {/* Add user button / dropdown */}
                  <div className="relative">
                    <button
                      onClick={() => setShowAssignDropdown(!showAssignDropdown)}
                      className="px-3 py-1.5 rounded-md text-sm font-medium bg-gray-50 text-gray-500 hover:bg-gray-100 dark:bg-gray-700/50 dark:text-gray-400 dark:hover:bg-gray-700 transition-colors inline-flex items-center gap-1.5"
                    >
                      <UserPlus className="h-3.5 w-3.5" />
                      Assign
                    </button>

                    {showAssignDropdown && (
                      <div className="absolute top-full left-0 mt-1 z-50 w-56 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg py-1 max-h-48 overflow-y-auto">
                        {users
                          .filter((u) => !assignedUserIds.includes(u.id))
                          .map((user) => (
                            <button
                              key={user.id}
                              onClick={() => handleAssignUser(user.id)}
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
                        {users.filter((u) => !assignedUserIds.includes(u.id))
                          .length === 0 && (
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
          </div>

          <ModalFooter>
            <Button variant="outline" onClick={() => setShowFormModal(true)}>
              <Pencil className="h-4 w-4 mr-2" />
              Edit
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      <TaskFormModal
        open={showFormModal}
        onOpenChange={handleFormClose}
        task={currentTask}
      />
    </>
  );
}
