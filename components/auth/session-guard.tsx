"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalTitle,
  ModalFooter,
} from "@/components/ui/modal";
import { Button } from "@/components/ui/button";

export default function SessionGuard() {
  const router = useRouter();
  const [deactivated, setDeactivated] = useState(false);

  const handleLogout = useCallback(async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }, [router]);

  useEffect(() => {
    const originalFetch = window.fetch;

    window.fetch = async (...args) => {
      const response = await originalFetch(...args);

      if (response.status === 401) {
        try {
          const cloned = response.clone();
          const data = await cloned.json();
          if (data.code === "ACCOUNT_DEACTIVATED") {
            setDeactivated(true);
          }
        } catch {
          // ignore parse errors
        }
      }

      return response;
    };

    return () => {
      window.fetch = originalFetch;
    };
  }, []);

  return (
    <Modal open={deactivated} onOpenChange={() => {}}>
      <ModalContent onClose={() => {}}>
        <ModalHeader>
          <ModalTitle>Session Ended</ModalTitle>
        </ModalHeader>

        <p className="text-sm text-gray-600 dark:text-gray-400">
          Your account has been deactivated. You will be logged out.
        </p>

        <ModalFooter>
          <Button onClick={handleLogout}>OK</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
