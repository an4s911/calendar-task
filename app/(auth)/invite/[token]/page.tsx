export const dynamic = "force-dynamic";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import InviteForm from "./invite-form";

export default async function InvitePage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;

  const user = await prisma.user.findUnique({
    where: { inviteToken: token },
  });

  if (!user || user.isActive) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Complete Your Account
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Set up your username and password to get started
          </p>
        </div>
        <InviteForm
          token={token}
          defaultFullName={user.fullName === "Pending User" ? "" : user.fullName}
          defaultEmail={user.email || ""}
        />
      </div>
    </div>
  );
}
