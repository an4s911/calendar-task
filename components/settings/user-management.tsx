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
import { Plus, Pencil, Trash2, Shield, ShieldOff } from "lucide-react";
import { User, Role } from "@/lib/types";

interface UserManagementProps {
  users: User[];
  roles: Role[];
  onRefresh: () => void;
}

export default function UserManagement({
  users,
  roles,
  onRefresh,
}: UserManagementProps) {
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [roleId, setRoleId] = useState("");
  const [timezone, setTimezone] = useState("UTC");
  const [isAdmin, setIsAdmin] = useState(false);
  const [deletingUser, setDeletingUser] = useState<User | null>(null);
  const [alertMessage, setAlertMessage] = useState<string | null>(null);

  const resetForm = () => {
    setFullName("");
    setUsername("");
    setEmail("");
    setPassword("");
    setRoleId("");
    setTimezone("UTC");
    setIsAdmin(false);
    setEditingUser(null);
  };

  const handleOpenModal = (user?: User) => {
    if (user) {
      setEditingUser(user);
      setFullName(user.fullName);
      setUsername(user.username);
      setEmail(user.email ?? "");
      setPassword("");
      setRoleId(user.roleId ?? "");
      setTimezone(user.timezone);
      setIsAdmin(user.isAdmin);
    } else {
      resetForm();
    }
    setShowModal(true);
  };

  const handleSubmit = async (e: SubmitEvent) => {
    e.preventDefault();

    try {
      if (editingUser) {
        const body: Record<string, unknown> = {
          fullName,
          username,
          email: email || null,
          roleId: roleId || null,
          timezone,
          isAdmin,
        };
        if (password) {
          body.password = password;
        }

        const response = await fetch(`/api/users/${editingUser.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });

        if (!response.ok) {
          const data = await response.json();
          setAlertMessage(data.error ?? "Failed to update user");
          return;
        }
      } else {
        const response = await fetch("/api/users", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            fullName,
            username,
            email: email || null,
            password,
            roleId: roleId || null,
            timezone,
            isAdmin,
          }),
        });

        if (!response.ok) {
          const data = await response.json();
          setAlertMessage(data.error ?? "Failed to create user");
          return;
        }
      }

      setShowModal(false);
      resetForm();
      onRefresh();
    } catch (error) {
      console.error("Error saving user:", error);
      setAlertMessage("Failed to save user");
    }
  };

  const handleDeleteClick = (user: User) => {
    setDeletingUser(user);
  };

  const handleDeleteConfirm = async () => {
    if (!deletingUser) return;

    try {
      const response = await fetch(`/api/users/${deletingUser.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const data = await response.json();
        setAlertMessage(data.error ?? "Failed to delete user");
        return;
      }

      onRefresh();
    } catch (error) {
      console.error("Error deleting user:", error);
      setAlertMessage("Failed to delete user");
    }
  };

  const UserRow = ({ user }: { user: User }) => {
    const role = roles.find((r) => r.id === user.roleId);

    return (
      <tr className="border-b border-gray-200 dark:border-gray-700 last:border-b-0">
        <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">
          {user.fullName}
        </td>
        <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
          {user.username}
        </td>
        <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
          {user.email ?? "-"}
        </td>
        <td className="px-4 py-3">
          {role ? (
            <span
              className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium text-white"
              style={{ backgroundColor: role.color }}
            >
              {role.name}
            </span>
          ) : (
            <span className="text-sm text-gray-400 dark:text-gray-500">-</span>
          )}
        </td>
        <td className="px-4 py-3">
          {user.isAdmin ? (
            <Shield className="h-4 w-4 text-green-500" />
          ) : (
            <ShieldOff className="h-4 w-4 text-gray-400" />
          )}
        </td>
        <td className="px-4 py-3">
          <div className="flex space-x-1">
            <Button
              size="icon"
              variant="ghost"
              onClick={() => handleOpenModal(user)}
            >
              <Pencil className="h-4 w-4" />
            </Button>
            <Button
              size="icon"
              variant="ghost"
              onClick={() => handleDeleteClick(user)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </td>
      </tr>
    );
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Users
        </h3>
        <Button size="sm" onClick={() => handleOpenModal()}>
          <Plus className="h-4 w-4 mr-2" />
          Add User
        </Button>
      </div>

      {users.length === 0 ? (
        <div className="text-center py-8 border border-dashed border-gray-300 dark:border-gray-600 rounded-lg">
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
            No users found
          </p>
          <p className="text-xs text-gray-400 dark:text-gray-500">
            Create a user to get started
          </p>
        </div>
      ) : (
        <div className="border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Username
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Admin
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <UserRow key={user.id} user={user} />
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <Modal open={showModal} onOpenChange={setShowModal}>
        <ModalContent onClose={() => setShowModal(false)}>
          <ModalHeader>
            <ModalTitle>
              {editingUser ? "Edit User" : "Add New User"}
            </ModalTitle>
          </ModalHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="fullName">Full Name *</Label>
              <Input
                id="fullName"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="e.g., John Doe"
                required
              />
            </div>

            <div>
              <Label htmlFor="username">Username *</Label>
              <Input
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="e.g., johndoe"
                required
              />
            </div>

            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="e.g., john@example.com"
              />
            </div>

            <div>
              <Label htmlFor="password">
                Password {editingUser ? "(leave blank to keep current)" : "*"}
              </Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={
                  editingUser ? "Leave blank to keep current" : "Enter password"
                }
                required={!editingUser}
              />
            </div>

            <div>
              <Label htmlFor="roleId">Role</Label>
              <select
                id="roleId"
                value={roleId}
                onChange={(e) => setRoleId(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="">No role</option>
                {roles.map((role) => (
                  <option key={role.id} value={role.id}>
                    {role.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <Label htmlFor="timezone">Timezone</Label>
              <Input
                id="timezone"
                value={timezone}
                onChange={(e) => setTimezone(e.target.value)}
                placeholder="e.g., UTC"
              />
            </div>

            <div className="flex items-center space-x-2">
              <input
                id="isAdmin"
                type="checkbox"
                checked={isAdmin}
                onChange={(e) => setIsAdmin(e.target.checked)}
                className="h-4 w-4 rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500"
              />
              <Label htmlFor="isAdmin">Admin privileges</Label>
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
                {editingUser ? "Update" : "Create"}
              </Button>
            </ModalFooter>
          </form>
        </ModalContent>
      </Modal>

      <ConfirmDialog
        open={!!deletingUser}
        onOpenChange={(open) => {
          if (!open) setDeletingUser(null);
        }}
        title="Delete User"
        message={`Are you sure you want to delete "${deletingUser?.fullName}"? This action cannot be undone.`}
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
