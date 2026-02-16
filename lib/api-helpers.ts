import { NextRequest, NextResponse } from "next/server";
import { prisma } from "./prisma";
import { isAdmin } from "./permissions";
import { clearCookieHeader } from "./auth";

export function getUserIdFromRequest(request: NextRequest): string | null {
  return request.headers.get("x-user-id");
}

function deactivatedResponse() {
  const res = NextResponse.json(
    { error: "Account deactivated", code: "ACCOUNT_DEACTIVATED" },
    { status: 401 }
  );
  res.headers.set("Set-Cookie", clearCookieHeader());
  return res;
}

export async function requireAdmin(request: NextRequest) {
  const userId = getUserIdFromRequest(request);
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { isAdmin: true, isActive: true },
  });

  if (!user || !user.isActive) {
    return deactivatedResponse();
  }

  if (!user.isAdmin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  return null;
}

export async function requireAuth(request: NextRequest) {
  const userId = getUserIdFromRequest(request);
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { isActive: true },
  });

  if (!user || !user.isActive) {
    return deactivatedResponse();
  }

  return null;
}
