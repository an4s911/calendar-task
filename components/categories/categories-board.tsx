'use client'

import { useState } from 'react'
import { useStore } from '@/lib/store'
import { Task } from '@/lib/types'
import CategoryColumn from './category-column'
import TaskFormModal from '@/components/tasks/task-form-modal'

export default function CategoriesBoard() {
  const { tasks, categories } = useStore()
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  const [showTaskModal, setShowTaskModal] = useState(false)

  const lifeCategories = categories.filter(c => c.type === 'life')
  const businessCategories = categories.filter(c => c.type === 'business')

  const getTasksByCategory = (categoryId: string) => {
    return tasks.filter((task) => task.categoryId === categoryId && task.show)
  }

  const handleTaskClick = (task: Task) => {
    setSelectedTask(task)
    setShowTaskModal(true)
  }

  const handleCloseModal = () => {
    setShowTaskModal(false)
    setSelectedTask(null)
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Categories Board
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Organize your tasks by category - Edit category names or delete them directly
        </p>
      </div>

      {categories.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 dark:text-gray-400 mb-4">
            No categories yet. Add some in Settings!
          </p>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Life Categories Section */}
          {lifeCategories.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Life Categories
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {lifeCategories.map((category) => (
                  <CategoryColumn
                    key={category.id}
                    category={category}
                    tasks={getTasksByCategory(category.id)}
                    onTaskClick={handleTaskClick}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Business Categories Section */}
          {businessCategories.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Business Categories
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {businessCategories.map((category) => (
                  <CategoryColumn
                    key={category.id}
                    category={category}
                    tasks={getTasksByCategory(category.id)}
                    onTaskClick={handleTaskClick}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      <TaskFormModal
        open={showTaskModal}
        onOpenChange={(open) => {
          if (!open) handleCloseModal()
          else setShowTaskModal(open)
        }}
        task={selectedTask}
      />
    </div>
  )
}
