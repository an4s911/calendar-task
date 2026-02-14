"use client";

import { useState } from "react";
import { useStore } from "@/lib/store";
import { Task } from "@/lib/types";
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addDays,
  addMonths,
  subMonths,
  isSameMonth,
  isSameDay,
  isToday,
} from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import TaskCard from "@/components/tasks/task-card";
import TaskModal from "@/components/tasks/task-modal";
import DayTasksModal from "./day-tasks-modal";

export default function MonthView() {
  const {
    tasks,
    categories,
    setSelectedDate,
    categoryFilter,
    setCategoryFilter,
  } = useStore();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);
  const [showDayModal, setShowDayModal] = useState(false);

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart, { weekStartsOn: 1 });
  const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 });

  const days = [];
  let day = startDate;

  while (day <= endDate) {
    days.push(day);
    day = addDays(day, 1);
  }

  const weeks = [];
  for (let i = 0; i < days.length; i += 7) {
    weeks.push(days.slice(i, i + 7));
  }

  const previousMonth = () => {
    setCurrentMonth(subMonths(currentMonth, 1));
  };

  const nextMonth = () => {
    setCurrentMonth(addMonths(currentMonth, 1));
  };

  const goToToday = () => {
    setCurrentMonth(new Date());
    setSelectedDate(new Date());
  };

  const getTasksForDay = (date: Date) => {
    return tasks.filter((task) => {
      if (!task.date) return false;
      const taskDate = new Date(task.date);
      if (!isSameDay(taskDate, date) || !task.show) return false;

      // Apply category filter
      if (categoryFilter === "all") return true;
      const taskCategory = categories.find((c) => c.id === task.categoryId);
      return taskCategory?.type === categoryFilter;
    });
  };

  const handleTaskClick = (task: Task) => {
    setSelectedTask(task);
    setShowTaskModal(true);
  };

  const handleCloseModal = () => {
    setShowTaskModal(false);
    setSelectedTask(null);
  };

  const handleDayClick = (date: Date) => {
    setSelectedDay(date);
    setShowDayModal(true);
  };

  const handleCloseDayModal = () => {
    setShowDayModal(false);
    setSelectedDay(null);
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
      {/* Header */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        {/* Filter Buttons */}
        <div className="flex items-center justify-center space-x-2 mb-4">
          <Button
            variant={categoryFilter === "all" ? "default" : "outline"}
            size="sm"
            onClick={() => setCategoryFilter("all")}
          >
            All
          </Button>
          <Button
            variant={categoryFilter === "life" ? "default" : "outline"}
            size="sm"
            onClick={() => setCategoryFilter("life")}
          >
            Life
          </Button>
          <Button
            variant={categoryFilter === "business" ? "default" : "outline"}
            size="sm"
            onClick={() => setCategoryFilter("business")}
          >
            Business
          </Button>
        </div>

        {/* Month Navigation */}
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            {format(currentMonth, "MMMM yyyy")}
          </h2>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm" onClick={goToToday}>
              Today
            </Button>
            <Button variant="outline" size="sm" onClick={previousMonth}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={nextMonth}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="p-4">
        {/* Day Headers */}
        <div className="grid grid-cols-7 gap-2 mb-2">
          {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => (
            <div
              key={day}
              className="text-center text-sm font-semibold text-gray-600 dark:text-gray-400 py-2"
            >
              {day}
            </div>
          ))}
        </div>

        {/* Weeks */}
        <div className="space-y-2">
          {weeks.map((week, weekIdx) => (
            <div key={weekIdx} className="grid grid-cols-7 gap-2">
              {week.map((day, dayIdx) => {
                const dayTasks = getTasksForDay(day);
                const isCurrentMonth = isSameMonth(day, currentMonth);
                const isDayToday = isToday(day);

                return (
                  <div
                    key={dayIdx}
                    className={`min-h-32 p-2 border rounded-lg ${
                      isCurrentMonth
                        ? "bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600"
                        : "bg-gray-50 dark:bg-gray-800 border-gray-100 dark:border-gray-700"
                    } ${isDayToday ? "ring-2 ring-blue-500" : ""}`}
                  >
                    <div
                      className={`text-sm font-medium mb-1 cursor-pointer hover:text-blue-600 dark:hover:text-blue-400 transition-colors ${
                        isCurrentMonth
                          ? "text-gray-900 dark:text-white"
                          : "text-gray-400 dark:text-gray-600"
                      } ${isDayToday ? "text-blue-600 dark:text-blue-400" : ""}`}
                      onClick={() => handleDayClick(day)}
                      title={`View all tasks for ${format(day, "MMM d")}`}
                    >
                      {format(day, "d")}
                    </div>
                    <div className="space-y-1">
                      {dayTasks.slice(0, 3).map((task) => (
                        <TaskCard
                          key={task.id}
                          task={task}
                          compact
                          onClick={() => handleTaskClick(task)}
                        />
                      ))}
                      {dayTasks.length > 3 && (
                        <div
                          className="text-xs text-gray-500 dark:text-gray-400 cursor-pointer hover:text-blue-600 dark:hover:text-blue-400"
                          onClick={() => handleDayClick(day)}
                        >
                          +{dayTasks.length - 3} more
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      <TaskModal
        open={showTaskModal}
        onOpenChange={(open) => {
          if (!open) handleCloseModal();
          else setShowTaskModal(open);
        }}
        task={selectedTask}
      />

      <DayTasksModal
        open={showDayModal}
        onOpenChange={(open) => {
          if (!open) handleCloseDayModal();
          else setShowDayModal(open);
        }}
        date={selectedDay}
      />
    </div>
  );
}
