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
import {
  Plus,
  Pencil,
  Trash2,
  Shield,
  ShieldOff,
  Copy,
  Check,
  RotateCcw,
} from "lucide-react";
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
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [inviteLink, setInviteLink] = useState("");
  const [copied, setCopied] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [roleId, setRoleId] = useState("");
  const [timezone, setTimezone] = useState("UTC");
  const [isAdmin, setIsAdmin] = useState(false);
  const [deletingUser, setDeletingUser] = useState<User | null>(null);
  const [alertMessage, setAlertMessage] = useState<string | null>(null);

  const resetForm = () => {
    setFullName("");
    setEmail("");
    setRoleId("");
    setTimezone("UTC");
    setIsAdmin(false);
    setEditingUser(null);
  };

  const handleOpenInviteModal = () => {
    resetForm();
    setShowInviteModal(true);
  };

  const handleOpenEditModal = (user: User) => {
    setEditingUser(user);
    setFullName(user.fullName);
    setEmail(user.email ?? "");
    setRoleId(user.roleId ?? "");
    setTimezone(user.timezone);
    setIsAdmin(user.isAdmin);
    setShowEditModal(true);
  };

  const handleInviteSubmit = async (e: SubmitEvent) => {
    e.preventDefault();

    try {
      const response = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: fullName || undefined,
          email: email || null,
          roleId: roleId || null,
          timezone,
          isAdmin,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        setAlertMessage(data.error ?? "Failed to invite user");
        return;
      }

      const data = await response.json();
      const link = `${window.location.origin}/invite/${data.inviteToken}`;
      setInviteLink(link);
      setCopied(false);
      setShowInviteModal(false);
      setShowLinkModal(true);
      resetForm();
      onRefresh();
    } catch (error) {
      console.error("Error inviting user:", error);
      setAlertMessage("Failed to invite user");
    }
  };

  const handleEditSubmit = async (e: SubmitEvent) => {
    e.preventDefault();
    if (!editingUser) return;

    try {
      const response = await fetch(`/api/users/${editingUser.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName,
          email: email || null,
          roleId: roleId || null,
          timezone,
          isAdmin,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        setAlertMessage(data.error ?? "Failed to update user");
        return;
      }

      setShowEditModal(false);
      resetForm();
      onRefresh();
    } catch (error) {
      console.error("Error updating user:", error);
      setAlertMessage("Failed to update user");
    }
  };

  const handleCopyLink = async () => {
    await navigator.clipboard.writeText(inviteLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
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

  const handleReactivate = async (user: User) => {
    try {
      const response = await fetch(`/api/users/${user.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: true }),
      });

      if (!response.ok) {
        const data = await response.json();
        setAlertMessage(data.error ?? "Failed to reactivate user");
        return;
      }

      onRefresh();
    } catch (error) {
      console.error("Error reactivating user:", error);
      setAlertMessage("Failed to reactivate user");
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
          {user.status === "pending" ? "-" : user.username}
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
          {user.status === "active" ? (
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
              Active
            </span>
          ) : user.status === "pending" ? (
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
              Pending
            </span>
          ) : (
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">
              Deactivated
            </span>
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
            {user.status === "deactivated" && (
              <Button
                size="icon"
                variant="ghost"
                onClick={() => handleReactivate(user)}
                title="Reactivate user"
              >
                <RotateCcw className="h-4 w-4" />
              </Button>
            )}
            {user.status !== "deactivated" && (
              <Button
                size="icon"
                variant="ghost"
                onClick={() => handleOpenEditModal(user)}
              >
                <Pencil className="h-4 w-4" />
              </Button>
            )}
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
        <Button size="sm" onClick={handleOpenInviteModal}>
          <Plus className="h-4 w-4 mr-2" />
          Invite User
        </Button>
      </div>

      {users.length === 0 ? (
        <div className="text-center py-8 border border-dashed border-gray-300 dark:border-gray-600 rounded-lg">
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
            No users found
          </p>
          <p className="text-xs text-gray-400 dark:text-gray-500">
            Invite a user to get started
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
                    Status
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

      {/* Invite User Modal */}
      <Modal open={showInviteModal} onOpenChange={setShowInviteModal}>
        <ModalContent onClose={() => setShowInviteModal(false)}>
          <ModalHeader>
            <ModalTitle>Invite User</ModalTitle>
          </ModalHeader>

          <form onSubmit={handleInviteSubmit} className="space-y-4">
            <div className="bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 px-4 py-3 rounded-lg text-sm">
              An invite link will be generated. The user will set their own
              username and password when they accept the invitation.
            </div>

            <div>
              <Label htmlFor="fullName">
                Full Name <span className="text-gray-400">(optional)</span>
              </Label>
              <Input
                id="fullName"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="e.g., John Doe"
              />
            </div>

            <div>
              <Label htmlFor="email">
                Email <span className="text-gray-400">(optional)</span>
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="e.g., john@example.com"
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
                onClick={() => setShowInviteModal(false)}
              >
                Cancel
              </Button>
              <Button type="submit">Generate Invite Link</Button>
            </ModalFooter>
          </form>
        </ModalContent>
      </Modal>

      {/* Invite Link Modal (shown once after creation) */}
      <Modal open={showLinkModal} onOpenChange={setShowLinkModal}>
        <ModalContent onClose={() => setShowLinkModal(false)}>
          <ModalHeader>
            <ModalTitle>Invite Link Generated</ModalTitle>
          </ModalHeader>

          <div className="space-y-4">
            <div className="bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 px-4 py-3 rounded-lg text-sm">
              This link will only be shown once. Copy it now and share it with
              the user.
            </div>

            <div className="flex items-center gap-2">
              <Input value={inviteLink} readOnly className="font-mono text-sm" />
              <Button
                type="button"
                size="icon"
                variant="outline"
                onClick={handleCopyLink}
              >
                {copied ? (
                  <Check className="h-4 w-4 text-green-500" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>

            <ModalFooter>
              <Button onClick={() => setShowLinkModal(false)}>Done</Button>
            </ModalFooter>
          </div>
        </ModalContent>
      </Modal>

      {/* Edit User Modal */}
      <Modal open={showEditModal} onOpenChange={setShowEditModal}>
        <ModalContent onClose={() => setShowEditModal(false)}>
          <ModalHeader>
            <ModalTitle>Edit User</ModalTitle>
          </ModalHeader>

          <form onSubmit={handleEditSubmit} className="space-y-4">
            <div>
              <Label htmlFor="editFullName">Full Name</Label>
              <Input
                id="editFullName"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="e.g., John Doe"
                required
              />
            </div>

            <div>
              <Label htmlFor="editEmail">Email</Label>
              <Input
                id="editEmail"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="e.g., john@example.com"
              />
            </div>

            <div>
              <Label htmlFor="editRoleId">Role</Label>
              <select
                id="editRoleId"
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
              <Label htmlFor="editTimezone">Timezone</Label>
              <Input
                id="editTimezone"
                value={timezone}
                onChange={(e) => setTimezone(e.target.value)}
                placeholder="e.g., UTC"
              />
            </div>

            <div className="flex items-center space-x-2">
              <input
                id="editIsAdmin"
                type="checkbox"
                checked={isAdmin}
                onChange={(e) => setIsAdmin(e.target.checked)}
                className="h-4 w-4 rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500"
              />
              <Label htmlFor="editIsAdmin">Admin privileges</Label>
            </div>

            <ModalFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowEditModal(false)}
              >
                Cancel
              </Button>
              <Button type="submit">Update</Button>
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
