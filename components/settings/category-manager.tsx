'use client'

import { useState } from 'react'
import { useStore } from '@/lib/store'
import { Category, CategoryType } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Plus, Pencil, Trash2 } from 'lucide-react'

export default function CategoryManager() {
  const { categories, addCategory, updateCategory, deleteCategory } = useStore()
  const [showModal, setShowModal] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [name, setName] = useState('')
  const [icon, setIcon] = useState('')
  const [color, setColor] = useState('#3b82f6')
  const [type, setType] = useState<CategoryType>('life')

  const resetForm = () => {
    setName('')
    setIcon('')
    setColor('#3b82f6')
    setType('life')
    setEditingCategory(null)
  }

  const handleOpenModal = (category?: Category) => {
    if (category) {
      setEditingCategory(category)
      setName(category.name)
      setIcon(category.icon)
      setColor(category.color)
      setType(category.type)
    } else {
      resetForm()
    }
    setShowModal(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      if (editingCategory) {
        // Update existing category
        const response = await fetch(`/api/categories/${editingCategory.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, icon, color, type }),
        })

        if (response.ok) {
          const updated = await response.json()
          updateCategory(editingCategory.id, updated)
        }
      } else {
        // Create new category
        const response = await fetch('/api/categories', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name,
            icon,
            color,
            type,
            order: categories.length,
          }),
        })

        if (response.ok) {
          const newCategory = await response.json()
          addCategory(newCategory)
        }
      }

      setShowModal(false)
      resetForm()
    } catch (error) {
      console.error('Error saving category:', error)
      alert('Failed to save category')
    }
  }

  const handleDelete = async (category: Category) => {
    if (confirm(`Are you sure you want to delete "${category.name}"? This will affect all tasks in this category.`)) {
      try {
        const response = await fetch(`/api/categories/${category.id}`, {
          method: 'DELETE',
        })

        if (response.ok) {
          deleteCategory(category.id)
        }
      } catch (error) {
        console.error('Error deleting category:', error)
        alert('Failed to delete category')
      }
    }
  }

  const lifeCategories = categories.filter(c => c.type === 'life')
  const businessCategories = categories.filter(c => c.type === 'business')

  const CategoryCard = ({ category }: { category: Category }) => (
    <div
      key={category.id}
      className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800"
    >
      <div className="flex items-center space-x-3 flex-1">
        <span className="text-2xl">{category.icon}</span>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <div className="font-medium text-gray-900 dark:text-white">
              {category.name}
            </div>
            <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400">
              {category.type}
            </span>
          </div>
          <div
            className="w-16 h-2 rounded mt-1"
            style={{ backgroundColor: category.color }}
          />
        </div>
      </div>
      <div className="flex space-x-1">
        <Button
          size="icon"
          variant="ghost"
          onClick={() => handleOpenModal(category)}
        >
          <Pencil className="h-4 w-4" />
        </Button>
        <Button
          size="icon"
          variant="ghost"
          onClick={() => handleDelete(category)}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Categories
        </h3>
        <Button size="sm" onClick={() => handleOpenModal()}>
          <Plus className="h-4 w-4 mr-2" />
          Add Category
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Life Categories */}
        <div>
          <h4 className="text-md font-semibold text-gray-700 dark:text-gray-300 mb-3">
            Life Categories
          </h4>
          <div className="space-y-3">
            {lifeCategories.length > 0 ? (
              lifeCategories.map((category) => (
                <CategoryCard key={category.id} category={category} />
              ))
            ) : (
              <p className="text-sm text-gray-500 dark:text-gray-400 italic">
                No life categories yet
              </p>
            )}
          </div>
        </div>

        {/* Business Categories */}
        <div>
          <h4 className="text-md font-semibold text-gray-700 dark:text-gray-300 mb-3">
            Business Categories
          </h4>
          <div className="space-y-3">
            {businessCategories.length > 0 ? (
              businessCategories.map((category) => (
                <CategoryCard key={category.id} category={category} />
              ))
            ) : (
              <p className="text-sm text-gray-500 dark:text-gray-400 italic">
                No business categories yet
              </p>
            )}
          </div>
        </div>
      </div>

      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent onClose={() => setShowModal(false)}>
          <DialogHeader>
            <DialogTitle>
              {editingCategory ? 'Edit Category' : 'Add New Category'}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Work"
                required
              />
            </div>

            <div>
              <Label htmlFor="icon">Icon (Emoji) *</Label>
              <Input
                id="icon"
                value={icon}
                onChange={(e) => setIcon(e.target.value)}
                placeholder="e.g., 💼"
                maxLength={2}
                required
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Use any emoji or symbol
              </p>
            </div>

            <div>
              <Label htmlFor="color">Color *</Label>
              <div className="flex items-center space-x-2">
                <Input
                  id="color"
                  type="color"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  className="w-20 h-10"
                  required
                />
                <Input
                  type="text"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  placeholder="#3b82f6"
                  className="flex-1"
                />
              </div>
            </div>

            <div>
              <Label>Category Type *</Label>
              <div className="flex items-center space-x-4 mt-2">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="radio"
                    name="categoryType"
                    value="life"
                    checked={type === 'life'}
                    onChange={(e) => setType(e.target.value as CategoryType)}
                    className="w-4 h-4 text-blue-600"
                  />
                  <span className="text-sm text-gray-900 dark:text-white">Life</span>
                </label>
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="radio"
                    name="categoryType"
                    value="business"
                    checked={type === 'business'}
                    onChange={(e) => setType(e.target.value as CategoryType)}
                    className="w-4 h-4 text-blue-600"
                  />
                  <span className="text-sm text-gray-900 dark:text-white">Business</span>
                </label>
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowModal(false)}
              >
                Cancel
              </Button>
              <Button type="submit">
                {editingCategory ? 'Update' : 'Create'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
