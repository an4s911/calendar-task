"use client";

import { Modal, ModalFooter } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";

interface ConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  message: string;
  confirmLabel?: string;
  variant?: "default" | "destructive";
  onConfirm: () => void;
}

export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  message,
  confirmLabel = "Confirm",
  variant = "default",
  onConfirm,
}: ConfirmDialogProps) {
  const handleConfirm = () => {
    onConfirm();
    onOpenChange(false);
  };

  return (
    <Modal open={open} onOpenChange={onOpenChange}>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-[min(90vw,448px)]">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          {title}
        </h3>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
          {message}
        </p>
        <ModalFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button variant={variant} onClick={handleConfirm}>
            {confirmLabel}
          </Button>
        </ModalFooter>
      </div>
    </Modal>
  );
}

interface AlertDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  message: string;
  buttonLabel?: string;
  variant?: "default" | "destructive";
}

export function AlertDialog({
  open,
  onOpenChange,
  title,
  message,
  buttonLabel = "OK",
  variant = "default",
}: AlertDialogProps) {
  return (
    <Modal open={open} onOpenChange={onOpenChange}>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-[min(90vw,448px)]">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          {title}
        </h3>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
          {message}
        </p>
        <ModalFooter>
          <Button variant={variant} onClick={() => onOpenChange(false)}>
            {buttonLabel}
          </Button>
        </ModalFooter>
      </div>
    </Modal>
  );
}
