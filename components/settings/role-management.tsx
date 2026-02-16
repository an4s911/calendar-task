"use client";

import { SubmitEvent, useState } from "react";
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
import { Role } from "@/lib/types";

interface RoleManagementProps {
  roles: Role[];
  onRefresh: () => void;
}

export default function RoleManagement({ roles, onRefresh }: RoleManagementProps) {
  const [showModal, setShowModal] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [color, setColor] = useState("#3b82f6");
  const [deletingRole, setDeletingRole] = useState<Role | null>(null);
  const [alertMessage, setAlertMessage] = useState<string | null>(null);

  const resetForm = () => {
    setName("");
    setDescription("");
    setColor("#3b82f6");
    setEditingRole(null);
  };

  const handleOpenModal = (role?: Role) => {
    if (role) {
      setEditingRole(role);
      setName(role.name);
      setDescription(role.description || "");
      setColor(role.color);
    } else {
      resetForm();
    }
    setShowModal(true);
  };

  const handleSubmit = async (e: SubmitEvent) => {
    e.preventDefault();

    try {
      if (editingRole) {
        const response = await fetch(`/api/roles/${editingRole.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, description, color }),
        });

        if (!response.ok) {
          setAlertMessage("Failed to update role");
          return;
        }
      } else {
        const response = await fetch("/api/roles", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, description, color }),
        });

        if (!response.ok) {
          setAlertMessage("Failed to create role");
          return;
        }
      }

      setShowModal(false);
      resetForm();
      onRefresh();
    } catch (error) {
      console.error("Error saving role:", error);
      setAlertMessage("Failed to save role");
    }
  };

  const handleDeleteClick = (role: Role) => {
    const userCount = role._count?.users ?? 0;
    if (userCount > 0) {
      setAlertMessage("Cannot delete role with assigned users");
      return;
    }
    setDeletingRole(role);
  };

  const handleDeleteConfirm = async () => {
    if (!deletingRole) return;

    try {
      const response = await fetch(`/api/roles/${deletingRole.id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        onRefresh();
      } else {
        setAlertMessage("Failed to delete role");
      }
    } catch (error) {
      console.error("Error deleting role:", error);
      setAlertMessage("Failed to delete role");
    }
  };

  const RoleCard = ({ role }: { role: Role }) => {
    const userCount = role._count?.users ?? 0;
    return (
      <div
        key={role.id}
        className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800"
      >
        <div className="flex items-center space-x-3 flex-1">
          <div
            className="w-3 h-3 rounded-full shrink-0"
            style={{ backgroundColor: role.color }}
          />
          <div className="flex-1">
            <div className="font-medium text-gray-900 dark:text-white">
              {role.name}
            </div>
            {role.description && (
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                {role.description}
              </p>
            )}
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
              {userCount} {userCount === 1 ? "user" : "users"}
            </p>
          </div>
        </div>
        <div className="flex space-x-1">
          <Button
            size="icon"
            variant="ghost"
            onClick={() => handleOpenModal(role)}
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            onClick={() => handleDeleteClick(role)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
    );
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Roles
        </h3>
        <Button size="sm" onClick={() => handleOpenModal()}>
          <Plus className="h-4 w-4 mr-2" />
          Add Role
        </Button>
      </div>

      {roles.length === 0 ? (
        <div className="text-center py-8 border border-dashed border-gray-300 dark:border-gray-600 rounded-lg">
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
            No roles defined
          </p>
          <p className="text-xs text-gray-400 dark:text-gray-500">
            Create a role to organize user permissions
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {roles.map((role) => (
            <RoleCard key={role.id} role={role} />
          ))}
        </div>
      )}

      <Modal open={showModal} onOpenChange={setShowModal}>
        <ModalContent onClose={() => setShowModal(false)}>
          <ModalHeader>
            <ModalTitle>
              {editingRole ? "Edit Role" : "Add New Role"}
            </ModalTitle>
          </ModalHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Manager"
                required
              />
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="e.g., Can manage team tasks"
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

            <ModalFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowModal(false)}
              >
                Cancel
              </Button>
              <Button type="submit">
                {editingRole ? "Update" : "Create"}
              </Button>
            </ModalFooter>
          </form>
        </ModalContent>
      </Modal>

      <ConfirmDialog
        open={!!deletingRole}
        onOpenChange={(open) => {
          if (!open) setDeletingRole(null);
        }}
        title="Delete Role"
        message={`Are you sure you want to delete "${deletingRole?.name}"? This action cannot be undone.`}
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
