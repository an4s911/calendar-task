"use client";

import { SubmitEvent, useState } from "react";
import { useStore } from "@/lib/store";
import { Category } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalTitle,
  ModalFooter,
} from "@/components/ui/modal";
import { ConfirmDialog, AlertDialog } from "@/components/ui/confirm-dialog";
import { Plus, Pencil, Trash2 } from "lucide-react";

export default function CategoryManager() {
  const { categories, projects, addCategory, updateCategory, deleteCategory } =
    useStore();
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [name, setName] = useState("");
  const [color, setColor] = useState("#3b82f6");
  const [projectId, setProjectId] = useState<string>("");
  const [deletingCategory, setDeletingCategory] = useState<Category | null>(
    null,
  );
  const [alertMessage, setAlertMessage] = useState<string | null>(null);

  const resetForm = () => {
    setName("");
    setColor("#3b82f6");
    setProjectId(projects.length > 0 ? projects[0].id : "");
    setEditingCategory(null);
  };

  const handleOpenModal = (category?: Category) => {
    if (category) {
      setEditingCategory(category);
      setName(category.name);
      setColor(category.color);
      setProjectId(category.projectId || "");
    } else {
      resetForm();
    }
    setShowModal(true);
  };

  const handleSubmit = async (e: SubmitEvent) => {
    e.preventDefault();

    if (!projectId) {
      setAlertMessage("Please select a project");
      return;
    }

    try {
      if (editingCategory) {
        // Update existing category
        const response = await fetch(`/api/categories/${editingCategory.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, color, projectId }),
        });

        if (response.ok) {
          const updated = await response.json();
          updateCategory(editingCategory.id, updated);
        }
      } else {
        // Create new category
        const response = await fetch("/api/categories", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name,
            color,
            projectId,
            order: categories.length,
          }),
        });

        if (response.ok) {
          const newCategory = await response.json();
          addCategory(newCategory);
        }
      }

      setShowModal(false);
      resetForm();
    } catch (error) {
      console.error("Error saving category:", error);
      setAlertMessage("Failed to save category");
    }
  };

  const handleDeleteClick = (category: Category) => {
    setDeletingCategory(category);
  };

  const handleDeleteConfirm = async () => {
    if (!deletingCategory) return;

    try {
      const response = await fetch(`/api/categories/${deletingCategory.id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        deleteCategory(deletingCategory.id);
      }
    } catch (error) {
      console.error("Error deleting category:", error);
      setAlertMessage("Failed to delete category");
    }
  };

  const CategoryCard = ({ category }: { category: Category }) => {
    const project = projects.find((p) => p.id === category.projectId);
    return (
      <div
        key={category.id}
        className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800"
      >
        <div className="flex items-center space-x-3 flex-1">
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <div className="font-medium text-gray-900 dark:text-white">
                {category.name}
              </div>
              {project && (
                <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400">
                  {project.name}
                </span>
              )}
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
            onClick={() => handleDeleteClick(category)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
    );
  };

  // Group categories by project
  const categoriesByProject = projects.map((project) => ({
    project,
    categories: categories.filter((c) => c.projectId === project.id),
  }));

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Categories
        </h3>
        <Button
          size="sm"
          onClick={() => handleOpenModal()}
          disabled={projects.length === 0}
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Category
        </Button>
      </div>

      {projects.length === 0 ? (
        <div className="text-center py-8 border border-dashed border-gray-300 dark:border-gray-600 rounded-lg">
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
            No projects available
          </p>
          <p className="text-xs text-gray-400 dark:text-gray-500">
            Create a project first before adding categories
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {categoriesByProject.map(({ project, categories: projectCats }) => (
            <div key={project.id}>
              <h4 className="text-md font-semibold text-gray-700 dark:text-gray-300 mb-3">
                {project.name}
              </h4>
              <div className="space-y-3">
                {projectCats.length > 0 ? (
                  projectCats.map((category) => (
                    <CategoryCard key={category.id} category={category} />
                  ))
                ) : (
                  <p className="text-sm text-gray-500 dark:text-gray-400 italic">
                    No categories in this project
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal open={showModal} onOpenChange={setShowModal}>
        <ModalContent onClose={() => setShowModal(false)}>
          <ModalHeader>
            <ModalTitle>
              {editingCategory ? "Edit Category" : "Add New Category"}
            </ModalTitle>
          </ModalHeader>

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
              <Label htmlFor="project">Project *</Label>
              <select
                id="project"
                value={projectId}
                onChange={(e) => setProjectId(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                required
              >
                <option value="">Select a project</option>
                {projects.map((project) => (
                  <option key={project.id} value={project.id}>
                    {project.name}
                  </option>
                ))}
              </select>
            </div>

            <ModalFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowModal(false)}
              >
                Cancel
              </Button>
              <Button type="submit">
                {editingCategory ? "Update" : "Create"}
              </Button>
            </ModalFooter>
          </form>
        </ModalContent>
      </Modal>

      <ConfirmDialog
        open={!!deletingCategory}
        onOpenChange={(open) => {
          if (!open) setDeletingCategory(null);
        }}
        title="Delete Category"
        message={`Are you sure you want to delete "${deletingCategory?.name}"? This will affect all tasks in this category.`}
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
