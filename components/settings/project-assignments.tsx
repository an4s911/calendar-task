"use client";

import { SubmitEvent, useState, useEffect } from "react";
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
import { Plus, Trash2, Users } from "lucide-react";
import { User, Project, ProjectAssignment, Category } from "@/lib/types";

interface ProjectAssignmentsProps {
  users: User[];
  projects: Project[];
  onRefresh: () => void;
}

export default function ProjectAssignments({
  users,
  projects,
  onRefresh,
}: ProjectAssignmentsProps) {
  const [assignments, setAssignments] = useState<ProjectAssignment[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState<string>("");
  const [selectedUserId, setSelectedUserId] = useState<string>("");
  const [categoryAccessMode, setCategoryAccessMode] = useState<
    "all" | "selected" | "all_except"
  >("all");
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<Set<string>>(
    new Set(),
  );
  const [deletingAssignment, setDeletingAssignment] =
    useState<ProjectAssignment | null>(null);
  const [alertMessage, setAlertMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchAssignments = async () => {
    try {
      const response = await fetch("/api/assignments/project");
      if (response.ok) {
        const data = await response.json();
        setAssignments(data);
      }
    } catch (error) {
      console.error("Error fetching assignments:", error);
    }
  };

  useEffect(() => {
    fetchAssignments();
  }, []);

  const selectedProject = projects.find((p) => p.id === selectedProjectId);
  const projectCategories: Category[] = selectedProject?.categories ?? [];

  const assignedUserIdsForProject = assignments
    .filter((a) => a.projectId === selectedProjectId)
    .map((a) => a.userId);

  const availableUsers = users.filter(
    (u) => !assignedUserIdsForProject.includes(u.id),
  );

  const resetForm = () => {
    setSelectedProjectId("");
    setSelectedUserId("");
    setCategoryAccessMode("all");
    setSelectedCategoryIds(new Set());
  };

  const handleOpenModal = () => {
    resetForm();
    setShowModal(true);
  };

  const handleProjectChange = (projectId: string) => {
    setSelectedProjectId(projectId);
    setSelectedUserId("");
    setSelectedCategoryIds(new Set());
  };

  const handleCategoryToggle = (categoryId: string) => {
    setSelectedCategoryIds((prev) => {
      const next = new Set(prev);
      if (next.has(categoryId)) {
        next.delete(categoryId);
      } else {
        next.add(categoryId);
      }
      return next;
    });
  };

  const handleSubmit = async (e: SubmitEvent) => {
    e.preventDefault();

    if (!selectedProjectId) {
      setAlertMessage("Please select a project");
      return;
    }
    if (!selectedUserId) {
      setAlertMessage("Please select a user");
      return;
    }

    setLoading(true);

    try {
      const categoryPermissions = projectCategories.map((cat) => {
        let canAccess = false;
        if (categoryAccessMode === "all") {
          canAccess = true;
        } else if (categoryAccessMode === "selected") {
          canAccess = selectedCategoryIds.has(cat.id);
        } else if (categoryAccessMode === "all_except") {
          canAccess = !selectedCategoryIds.has(cat.id);
        }
        return { categoryId: cat.id, canAccess };
      });

      const response = await fetch("/api/assignments/project", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId: selectedProjectId,
          userId: selectedUserId,
          categoryAccessMode,
          categoryPermissions,
        }),
      });

      if (response.ok) {
        setShowModal(false);
        resetForm();
        await fetchAssignments();
        onRefresh();
      } else {
        const errorData = await response.json().catch(() => null);
        setAlertMessage(
          errorData?.error ?? "Failed to create assignment",
        );
      }
    } catch (error) {
      console.error("Error creating assignment:", error);
      setAlertMessage("Failed to create assignment");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (assignment: ProjectAssignment) => {
    setDeletingAssignment(assignment);
  };

  const handleDeleteConfirm = async () => {
    if (!deletingAssignment) return;

    try {
      const response = await fetch(
        `/api/assignments/project/${deletingAssignment.id}`,
        { method: "DELETE" },
      );

      if (response.ok) {
        await fetchAssignments();
        onRefresh();
      } else {
        setAlertMessage("Failed to remove assignment");
      }
    } catch (error) {
      console.error("Error deleting assignment:", error);
      setAlertMessage("Failed to remove assignment");
    }
  };

  const getAccessModeBadge = (mode: string) => {
    switch (mode) {
      case "all":
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
            All Categories
          </span>
        );
      case "selected":
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
            Selected
          </span>
        );
      case "all_except":
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400">
            All Except
          </span>
        );
      default:
        return null;
    }
  };

  // Group assignments by project
  const assignmentsByProject = projects
    .map((project) => ({
      project,
      assignments: assignments.filter((a) => a.projectId === project.id),
    }))
    .filter(({ assignments: projectAssignments }) => projectAssignments.length > 0);

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Project Assignments
        </h3>
        <Button
          size="sm"
          onClick={handleOpenModal}
          disabled={projects.length === 0 || users.length === 0}
        >
          <Plus className="h-4 w-4 mr-2" />
          Assign User
        </Button>
      </div>

      {projects.length === 0 ? (
        <div className="text-center py-8 border border-dashed border-gray-300 dark:border-gray-600 rounded-lg">
          <Users className="h-8 w-8 mx-auto text-gray-400 dark:text-gray-500 mb-2" />
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
            No projects available
          </p>
          <p className="text-xs text-gray-400 dark:text-gray-500">
            Create a project first before assigning users
          </p>
        </div>
      ) : assignmentsByProject.length === 0 ? (
        <div className="text-center py-8 border border-dashed border-gray-300 dark:border-gray-600 rounded-lg">
          <Users className="h-8 w-8 mx-auto text-gray-400 dark:text-gray-500 mb-2" />
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
            No assignments yet
          </p>
          <p className="text-xs text-gray-400 dark:text-gray-500">
            Assign users to projects to control their category access
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {assignmentsByProject.map(({ project, assignments: projectAssignments }) => (
            <div key={project.id}>
              <h4 className="text-md font-semibold text-gray-700 dark:text-gray-300 mb-3">
                {project.name}
              </h4>
              <div className="space-y-3">
                {projectAssignments.map((assignment) => (
                  <div
                    key={assignment.id}
                    className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800"
                  >
                    <div className="flex items-center space-x-3 flex-1">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300">
                        <Users className="h-4 w-4" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <div className="font-medium text-gray-900 dark:text-white">
                            {assignment.user?.fullName ?? "Unknown User"}
                          </div>
                          {getAccessModeBadge(assignment.categoryAccessMode)}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          @{assignment.user?.username ?? "unknown"}
                        </div>
                      </div>
                    </div>
                    <div className="flex space-x-1">
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => handleDeleteClick(assignment)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal open={showModal} onOpenChange={setShowModal}>
        <ModalContent onClose={() => setShowModal(false)}>
          <ModalHeader>
            <ModalTitle>Assign User to Project</ModalTitle>
          </ModalHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="assign-project">Project *</Label>
              <select
                id="assign-project"
                value={selectedProjectId}
                onChange={(e) => handleProjectChange(e.target.value)}
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

            <div>
              <Label htmlFor="assign-user">User *</Label>
              <select
                id="assign-user"
                value={selectedUserId}
                onChange={(e) => setSelectedUserId(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                required
                disabled={!selectedProjectId}
              >
                <option value="">Select a user</option>
                {availableUsers.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.fullName} (@{user.username})
                  </option>
                ))}
              </select>
              {selectedProjectId && availableUsers.length === 0 && (
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  All users are already assigned to this project
                </p>
              )}
            </div>

            <div>
              <Label>Category Access Mode *</Label>
              <div className="mt-2 space-y-2">
                <label className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="radio"
                    name="categoryAccessMode"
                    value="all"
                    checked={categoryAccessMode === "all"}
                    onChange={() => setCategoryAccessMode("all")}
                    className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-900 dark:text-white">
                    All Categories
                  </span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    Access to every category in this project
                  </span>
                </label>
                <label className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="radio"
                    name="categoryAccessMode"
                    value="selected"
                    checked={categoryAccessMode === "selected"}
                    onChange={() => setCategoryAccessMode("selected")}
                    className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-900 dark:text-white">
                    Selected Only
                  </span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    Access only to chosen categories
                  </span>
                </label>
                <label className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="radio"
                    name="categoryAccessMode"
                    value="all_except"
                    checked={categoryAccessMode === "all_except"}
                    onChange={() => setCategoryAccessMode("all_except")}
                    className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-900 dark:text-white">
                    All Except
                  </span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    Access to all categories except chosen ones
                  </span>
                </label>
              </div>
            </div>

            {(categoryAccessMode === "selected" ||
              categoryAccessMode === "all_except") && (
              <div>
                <Label>
                  {categoryAccessMode === "selected"
                    ? "Select Categories to Grant Access"
                    : "Select Categories to Exclude"}
                </Label>
                {!selectedProjectId ? (
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                    Select a project first to see its categories
                  </p>
                ) : projectCategories.length === 0 ? (
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                    No categories in this project
                  </p>
                ) : (
                  <div className="mt-2 space-y-2 max-h-48 overflow-y-auto border border-gray-200 dark:border-gray-700 rounded-md p-3">
                    {projectCategories.map((category) => (
                      <label
                        key={category.id}
                        className="flex items-center space-x-3 cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={selectedCategoryIds.has(category.id)}
                          onChange={() => handleCategoryToggle(category.id)}
                          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                        <span
                          className="w-3 h-3 rounded-full flex-shrink-0"
                          style={{ backgroundColor: category.color }}
                        />
                        <span className="text-sm text-gray-900 dark:text-white">
                          {category.icon} {category.name}
                        </span>
                      </label>
                    ))}
                  </div>
                )}
              </div>
            )}

            <ModalFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowModal(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? "Assigning..." : "Assign"}
              </Button>
            </ModalFooter>
          </form>
        </ModalContent>
      </Modal>

      <ConfirmDialog
        open={!!deletingAssignment}
        onOpenChange={(open) => {
          if (!open) setDeletingAssignment(null);
        }}
        title="Remove Assignment"
        message={`Are you sure you want to remove ${deletingAssignment?.user?.fullName ?? "this user"} from the project? They will lose access to the assigned categories.`}
        confirmLabel="Remove"
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
