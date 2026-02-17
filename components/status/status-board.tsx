"use client";

import { useState } from "react";
import { useStore } from "@/lib/store";
import { Task, TaskStatus } from "@/lib/types";
import StatusColumn from "./status-column";
import TaskModal from "@/components/tasks/task-modal";

const columns: { status: TaskStatus; label: string; icon: string }[] = [
  { status: "not-started", label: "Not Started", icon: "⭕" },
  { status: "waiting", label: "Waiting", icon: "⏳" },
  { status: "in-progress", label: "In Progress", icon: "🔄" },
  { status: "completed", label: "Completed", icon: "✅" },
];

export default function StatusBoard() {
  const { tasks } = useStore();
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [showTaskModal, setShowTaskModal] = useState(false);

  const getTasksByStatus = (status: TaskStatus) => {
    return tasks.filter((task) => task.status === status);
  };

  const handleTaskClick = (task: Task) => {
    setSelectedTask(task);
    setShowTaskModal(true);
  };

  const handleCloseModal = () => {
    setShowTaskModal(false);
    setSelectedTask(null);
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Status Board
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Manage your tasks by status
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {columns.map((column) => (
          <StatusColumn
            key={column.status}
            status={column.status}
            label={column.label}
            icon={column.icon}
            tasks={getTasksByStatus(column.status)}
            onTaskClick={handleTaskClick}
          />
        ))}
      </div>

      <TaskModal
        open={showTaskModal}
        onOpenChange={(open) => {
          if (!open) handleCloseModal();
          else setShowTaskModal(open);
        }}
        task={selectedTask}
      />
    </div>
  );
}
