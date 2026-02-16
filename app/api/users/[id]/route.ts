import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin, getUserIdFromRequest } from "@/lib/api-helpers";
import { logActivity } from "@/lib/permissions";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const adminCheck = await requireAdmin(request);
  if (adminCheck) return adminCheck;

  const { id } = await params;
  const user = await prisma.user.findUnique({
    where: { id },
    include: {
      role: true,
      projectAssignments: {
        include: {
          project: true,
          categoryPermissions: { include: { category: true } },
        },
      },
    },
  });

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const { passwordHash, inviteToken, ...safeUser } = user;
  return NextResponse.json(safeUser);
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const adminCheck = await requireAdmin(request);
  if (adminCheck) return adminCheck;

  const currentUserId = getUserIdFromRequest(request)!;
  const { id } = await params;
  const body = await request.json();

  const updateData: Record<string, unknown> = {};
  if (body.fullName !== undefined) updateData.fullName = body.fullName;
  if (body.email !== undefined) updateData.email = body.email || null;
  if (body.roleId !== undefined) updateData.roleId = body.roleId || null;
  if (body.timezone !== undefined) updateData.timezone = body.timezone;
  if (body.isAdmin !== undefined) updateData.isAdmin = body.isAdmin;
  if (body.isActive !== undefined) updateData.isActive = body.isActive;

  const user = await prisma.user.update({
    where: { id },
    data: updateData,
    include: { role: true },
  });

  await logActivity(currentUserId, "updated", "user", user.id, user.fullName);

  const { passwordHash, inviteToken, ...safeUser } = user;
  return NextResponse.json(safeUser);
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const adminCheck = await requireAdmin(request);
  if (adminCheck) return adminCheck;

  const currentUserId = getUserIdFromRequest(request)!;
  const { id } = await params;

  // Prevent self-deletion
  if (id === currentUserId) {
    return NextResponse.json(
      { error: "Cannot delete your own account" },
      { status: 400 }
    );
  }

  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  if (!user.isActive) {
    // Pending user (never activated) — hard delete
    await prisma.user.delete({ where: { id } });
  } else {
    // Active user — soft delete
    await prisma.user.update({
      where: { id },
      data: { isActive: false },
    });
  }

  await logActivity(
    currentUserId,
    "deleted",
    "user",
    user.id,
    user.fullName
  );

  return NextResponse.json({ success: true });
}
