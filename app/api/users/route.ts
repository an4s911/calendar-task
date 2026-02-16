import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin, getUserIdFromRequest } from "@/lib/api-helpers";
import { logActivity } from "@/lib/permissions";
import crypto from "crypto";

export async function GET(request: NextRequest) {
  const adminCheck = await requireAdmin(request);
  if (adminCheck) return adminCheck;

  const users = await prisma.user.findMany({
    include: { role: true },
    orderBy: { createdAt: "desc" },
  });

  // Strip sensitive fields, add derived status
  const safeUsers = users.map(({ passwordHash, inviteToken, ...user }) => ({
    ...user,
    status: user.isActive ? "active" : inviteToken ? "pending" : "deactivated",
  }));

  return NextResponse.json(safeUsers);
}

export async function POST(request: NextRequest) {
  const adminCheck = await requireAdmin(request);
  if (adminCheck) return adminCheck;

  const userId = getUserIdFromRequest(request)!;
  const body = await request.json();

  // Generate a unique invite token and placeholder username
  const inviteToken = crypto.randomBytes(24).toString("hex");
  const placeholderUsername = `pending_${crypto.randomBytes(4).toString("hex")}`;

  const user = await prisma.user.create({
    data: {
      fullName: body.fullName || "Pending User",
      username: placeholderUsername,
      email: body.email || null,
      passwordHash: null,
      inviteToken,
      roleId: body.roleId || null,
      timezone: body.timezone || "UTC",
      isAdmin: body.isAdmin || false,
      isActive: false,
    },
    include: { role: true },
  });

  await logActivity(userId, "created", "user", user.id, user.fullName);

  const { passwordHash: _, ...safeUser } = user;
  // Return invite token in creation response only (one-time visibility)
  return NextResponse.json(safeUser, { status: 201 });
}
