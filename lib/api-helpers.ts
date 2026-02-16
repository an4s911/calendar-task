import { NextRequest, NextResponse } from "next/server";
import { isAdmin } from "./permissions";

export function getUserIdFromRequest(request: NextRequest): string | null {
  return request.headers.get("x-user-id");
}

export async function requireAdmin(request: NextRequest) {
  const userId = getUserIdFromRequest(request);
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!(await isAdmin(userId))) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  return null;
}

export async function requireAuth(request: NextRequest) {
  const userId = getUserIdFromRequest(request);
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return null;
}
