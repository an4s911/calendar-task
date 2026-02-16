import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserIdFromRequest, requireAuth } from "@/lib/api-helpers";
import bcrypt from "bcryptjs";

export async function GET(request: NextRequest) {
  const authCheck = await requireAuth(request);
  if (authCheck) return authCheck;

  const userId = getUserIdFromRequest(request)!;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { role: true },
  });

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const { passwordHash, ...safeUser } = user;
  return NextResponse.json(safeUser);
}

export async function PUT(request: NextRequest) {
  const authCheck = await requireAuth(request);
  if (authCheck) return authCheck;

  const userId = getUserIdFromRequest(request)!;
  const body = await request.json();

  const updateData: Record<string, unknown> = {};

  // Employees can only update their own profile fields
  if (body.fullName !== undefined) updateData.fullName = body.fullName;
  if (body.email !== undefined) updateData.email = body.email || null;
  if (body.timezone !== undefined) updateData.timezone = body.timezone;

  // Password change requires current password verification
  if (body.newPassword) {
    if (!body.currentPassword) {
      return NextResponse.json(
        { error: "Current password is required" },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (!user.passwordHash) {
      return NextResponse.json(
        { error: "Password not set for this user" },
        { status: 400 }
      );
    }

    const valid = await bcrypt.compare(body.currentPassword, user.passwordHash);
    if (!valid) {
      return NextResponse.json(
        { error: "Current password is incorrect" },
        { status: 401 }
      );
    }

    if (body.newPassword.length < 8) {
      return NextResponse.json(
        { error: "New password must be at least 8 characters" },
        { status: 400 }
      );
    }

    updateData.passwordHash = await bcrypt.hash(body.newPassword, 12);
    updateData.passwordChangedAt = new Date();
  }

  const user = await prisma.user.update({
    where: { id: userId },
    data: updateData,
    include: { role: true },
  });

  const { passwordHash, ...safeUser } = user;
  return NextResponse.json(safeUser);
}
