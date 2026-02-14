"use client";

import { useState } from "react";
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
import { Calendar, Clock, Pencil } from "lucide-react";
import { cn } from "@/lib/utils";

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
  };

  return (
    <>
      <Modal open={open && !showFormModal} onOpenChange={handleClose}>
        <ModalContent onClose={handleClose}>
          <ModalHeader>
            <div className="flex items-center space-x-3">
              {currentTask.category && (
                <span className="text-2xl">{currentTask.category.icon}</span>
              )}
              <ModalTitle>{currentTask.title}</ModalTitle>
            </div>
          </ModalHeader>

          <div className="space-y-5">
            {/* Description */}
            {currentTask.description && (
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {currentTask.description}
              </p>
            )}

            {/* Date & Time */}
            {(currentTask.date || currentTask.startTime) && (
              <div className="flex flex-wrap gap-4 text-sm text-gray-600 dark:text-gray-400">
                {currentTask.date && (
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4" />
                    <span>
                      {format(new Date(currentTask.date), "EEEE, MMMM d, yyyy")}
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
