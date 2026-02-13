import Link from "next/link";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function DefaultPasswordBanner() {
  const session = await getSession();
  if (!session) return null;

  const user = await prisma.user.findUnique({
    where: { id: session.sub },
    select: { passwordChangedAt: true, createdAt: true },
  });

  if (!user) return null;

  const usingDefault =
    user.passwordChangedAt.getTime() === user.createdAt.getTime();
  if (!usingDefault) return null;

  return (
    <div className="bg-amber-50 dark:bg-amber-900/20 border-b border-amber-200 dark:border-amber-800 px-4 py-2">
      <p className="text-sm text-amber-700 dark:text-amber-400">
        You are using the default password.{" "}
        <Link
          href="/settings"
          className="font-medium underline hover:text-amber-800 dark:hover:text-amber-300"
        >
          Change it in Settings
        </Link>
      </p>
    </div>
  );
}
