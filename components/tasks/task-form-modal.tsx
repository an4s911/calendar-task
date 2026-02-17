"use client";

import { useState, useEffect, useRef, SubmitEvent } from "react";
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
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { ConfirmDialog, AlertDialog } from "@/components/ui/confirm-dialog";
import { Trash2 } from "lucide-react";

interface SimpleUser {
  id: string;
  fullName: string;
  username: string;
}

interface TaskFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  task?: Task | null;
  defaultDate?: Date;
}

export default function TaskFormModal({
  open,
  onOpenChange,
  task = null,
  defaultDate,
}: TaskFormModalProps) {
  const { categories, addTask, updateTask, deleteTask } = useStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [alertMessage, setAlertMessage] = useState<string | null>(null);

  // Form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [notes, setNotes] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [status, setStatus] = useState<TaskStatus>("not-started");
  const [priority, setPriority] = useState<TaskPriority>("medium");
  const [categoryId, setCategoryId] = useState("");
  const [show, setShow] = useState(true);

  // User assignment state (admin only)
  const [users, setUsers] = useState<SimpleUser[]>([]);
  const [assignedUserIds, setAssignedUserIds] = useState<string[]>([]);
  const originalAssignedIds = useRef<string[]>([]);
  const isAdmin = users.length > 0;

  // Fetch users list (admin only — endpoint returns 403 for non-admins)
  useEffect(() => {
    if (!open) return;
    fetch("/api/users")
      .then((res) => (res.ok ? res.json() : []))
      .then((data: SimpleUser[]) => setUsers(data))
      .catch(() => setUsers([]));
  }, [open]);

  // Fetch existing assignments when editing a task
  useEffect(() => {
    if (!open || !task || !isAdmin) return;
    fetch(`/api/assignments/task?taskId=${task.id}`)
      .then((res) => (res.ok ? res.json() : []))
      .then(
        (
          assignments: Array<{
            userId: string;
          }>,
        ) => {
          const ids = assignments.map((a) => a.userId);
          setAssignedUserIds(ids);
          originalAssignedIds.current = ids;
        },
      )
      .catch(() => {
        setAssignedUserIds([]);
        originalAssignedIds.current = [];
      });
  }, [open, task, isAdmin]);

  // Initialize form with task data or defaults
  useEffect(() => {
    if (task) {
      setTitle(task.title);
      setDescription(task.description || "");
      setNotes(task.description || ""); // Using description as notes for now
      setStartDate(
        task.startDate
          ? new Date(task.startDate).toISOString().split("T")[0]
          : "",
      );
      setEndDate(
        task.endDate ? new Date(task.endDate).toISOString().split("T")[0] : "",
      );
      setStartTime(task.startTime || "");
      setEndTime(task.endTime || "");
      setStatus(task.status);
      setPriority(task.priority);
      setCategoryId(task.categoryId);
      setShow(task.show);
    } else {
      // Reset form
      setTitle("");
      setDescription("");
      setNotes("");
      setStartDate(
        defaultDate
          ? `${defaultDate.getFullYear()}-${String(defaultDate.getMonth() + 1).padStart(2, "0")}-${String(defaultDate.getDate()).padStart(2, "0")}`
          : "",
      );
      setEndDate("");
      setStartTime("");
      setEndTime("");
      setStatus("not-started");
      setPriority("medium");
      setCategoryId(categories[0]?.id || "");
      setShow(true);
      setAssignedUserIds([]);
      originalAssignedIds.current = [];
    }
  }, [task, defaultDate, categories, open]);

  const handleSubmit = async (e: SubmitEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const taskData = {
        title,
        description: notes, // Using notes as description
        startDate: startDate ? new Date(startDate).toISOString() : null,
        endDate: endDate ? new Date(endDate).toISOString() : null,
        startTime: startTime || null,
        endTime: endTime || null,
        status,
        priority,
        categoryId,
        show,
      };

      let savedTaskId: string | null = null;

      if (task) {
        // Update existing task
        const response = await fetch(`/api/tasks/${task.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(taskData),
        });

        if (response.ok) {
          const updatedTask = await response.json();
          updateTask(task.id, updatedTask);
          savedTaskId = task.id;
        }
      } else {
        // Create new task
        const response = await fetch("/api/tasks", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(taskData),
        });

        if (response.ok) {
          const newTask = await response.json();
          addTask(newTask);
          savedTaskId = newTask.id;
        }
      }

      // Sync user assignments (admin only)
      if (savedTaskId && isAdmin) {
        const toAdd = assignedUserIds.filter(
          (id) => !originalAssignedIds.current.includes(id),
        );
        const toRemove = originalAssignedIds.current.filter(
          (id) => !assignedUserIds.includes(id),
        );

        await Promise.all([
          ...toAdd.map((userId) =>
            fetch("/api/assignments/task", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ taskId: savedTaskId, userId }),
            }),
          ),
          ...toRemove.map((userId) =>
            fetch(
              `/api/assignments/task?taskId=${savedTaskId}&userId=${userId}`,
              { method: "DELETE" },
            ),
          ),
        ]);
      }

      onOpenChange(false);
    } catch (error) {
      console.error("Error saving task:", error);
      setAlertMessage("Failed to save task");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteClick = () => {
    setShowDeleteConfirm(true);
  };

  const handleDeleteConfirm = async () => {
    if (!task) return;

    try {
      const response = await fetch(`/api/tasks/${task.id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        deleteTask(task.id);
        onOpenChange(false);
      }
    } catch (error) {
      console.error("Error deleting task:", error);
      setAlertMessage("Failed to delete task");
    }
  };

  return (
    <>
      <Modal open={open} onOpenChange={onOpenChange}>
        <ModalContent onClose={() => onOpenChange(false)}>
          <ModalHeader>
            <ModalTitle>{task ? "Edit Task" : "Create New Task"}</ModalTitle>
          </ModalHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Title */}
            <div>
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter task title"
                required
              />
            </div>

            {/* Category */}
            <div>
              <Label htmlFor="category">Category *</Label>
              <Select
                id="category"
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                required
              >
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </Select>
            </div>

            {/* Assign Users (admin only) */}
            {isAdmin && users.length > 0 && (
              <div>
                <Label>Assign Users</Label>
                <div className="mt-1 max-h-32 overflow-y-auto border border-gray-300 dark:border-gray-600 rounded-lg p-2 space-y-1">
                  {users.map((user) => (
                    <label
                      key={user.id}
                      className="flex items-center space-x-2 px-2 py-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={assignedUserIds.includes(user.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setAssignedUserIds((prev) => [...prev, user.id]);
                          } else {
                            setAssignedUserIds((prev) =>
                              prev.filter((id) => id !== user.id),
                            );
                          }
                        }}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-900 dark:text-white">
                        {user.fullName}{" "}
                        <span className="text-gray-500 dark:text-gray-400">
                          @{user.username}
                        </span>
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* Notes/Description */}
            <div>
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add notes or description..."
                rows={4}
              />
            </div>

            {/* Date Range */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="startDate">Start Date</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="endDate">End Date</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </div>
            </div>

            {/* Time Range */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="startTime">Start Time</Label>
                <Input
                  id="startTime"
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="endTime">End Time</Label>
                <Input
                  id="endTime"
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                />
              </div>
            </div>

            {/* Status and Priority */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="status">Status</Label>
                <Select
                  id="status"
                  value={status}
                  onChange={(e) => setStatus(e.target.value as TaskStatus)}
                >
                  <option value="not-started">Not Started</option>
                  <option value="waiting">Waiting</option>
                  <option value="in-progress">In Progress</option>
                  <option value="completed">Completed</option>
                </Select>
              </div>
              <div>
                <Label htmlFor="priority">Priority</Label>
                <Select
                  id="priority"
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as TaskPriority)}
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </Select>
              </div>
            </div>

            {/* Show/Hide Toggle */}
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="show"
                checked={show}
                onChange={(e) => setShow(e.target.checked)}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <Label htmlFor="show">Show in calendar</Label>
            </div>

            <ModalFooter>
              <div className="flex justify-between w-full">
                <div>
                  {task && (
                    <Button
                      type="button"
                      variant="destructive"
                      onClick={handleDeleteClick}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </Button>
                  )}
                </div>
                <div className="flex space-x-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => onOpenChange(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? "Saving..." : task ? "Update" : "Create"}
                  </Button>
                </div>
              </div>
            </ModalFooter>
          </form>
        </ModalContent>
      </Modal>

      <ConfirmDialog
        open={showDeleteConfirm}
        onOpenChange={setShowDeleteConfirm}
        title="Delete Task"
        message="Are you sure you want to delete this task?"
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
    </>
  );
}
