"use client";

import { useState, useEffect, SubmitEvent } from "react";
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
  const [date, setDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [status, setStatus] = useState<TaskStatus>("not-started");
  const [priority, setPriority] = useState<TaskPriority>("medium");
  const [categoryId, setCategoryId] = useState("");
  const [show, setShow] = useState(true);

  // Initialize form with task data or defaults
  useEffect(() => {
    if (task) {
      setTitle(task.title);
      setDescription(task.description || "");
      setNotes(task.description || ""); // Using description as notes for now
      setDate(task.date ? new Date(task.date).toISOString().split("T")[0] : "");
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
      setDate(defaultDate ? defaultDate.toISOString().split("T")[0] : "");
      setStartTime("");
      setEndTime("");
      setStatus("not-started");
      setPriority("medium");
      setCategoryId(categories[0]?.id || "");
      setShow(true);
    }
  }, [task, defaultDate, categories, open]);

  const handleSubmit = async (e: SubmitEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const taskData = {
        title,
        description: notes, // Using notes as description
        date: date ? new Date(date).toISOString() : null,
        startTime: startTime || null,
        endTime: endTime || null,
        status,
        priority,
        categoryId,
        show,
      };

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
        }
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
                    {cat.icon} {cat.name}
                  </option>
                ))}
              </Select>
            </div>

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

            {/* Date */}
            <div>
              <Label htmlFor="date">Date</Label>
              <Input
                id="date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
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
