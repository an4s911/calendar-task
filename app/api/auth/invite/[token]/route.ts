import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;

  const user = await prisma.user.findUnique({
    where: { inviteToken: token },
  });

  if (!user || user.isActive) {
    return NextResponse.json(
      { error: "Invalid or expired invite link" },
      { status: 404 }
    );
  }

  return NextResponse.json({
    fullName: user.fullName === "Pending User" ? "" : user.fullName,
    email: user.email || "",
  });
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;
  const body = await request.json();

  const user = await prisma.user.findUnique({
    where: { inviteToken: token },
  });

  if (!user || user.isActive) {
    return NextResponse.json(
      { error: "Invalid or expired invite link" },
      { status: 404 }
    );
  }

  if (!body.fullName || !body.username || !body.password) {
    return NextResponse.json(
      { error: "Full name, username, and password are required" },
      { status: 400 }
    );
  }

  if (!/^[a-z0-9_]{3,30}$/.test(body.username)) {
    return NextResponse.json(
      {
        error:
          "Username must be 3-30 characters, lowercase letters, numbers, or underscores",
      },
      { status: 400 }
    );
  }

  if (body.password.length < 8) {
    return NextResponse.json(
      { error: "Password must be at least 8 characters" },
      { status: 400 }
    );
  }

  // Check username uniqueness (exclude this user's placeholder)
  const existing = await prisma.user.findUnique({
    where: { username: body.username },
  });
  if (existing && existing.id !== user.id) {
    return NextResponse.json(
      { error: "Username already taken" },
      { status: 409 }
    );
  }

  const passwordHash = await bcrypt.hash(body.password, 12);

  await prisma.user.update({
    where: { id: user.id },
    data: {
      fullName: body.fullName,
      username: body.username,
      email: body.email || null,
      passwordHash,
      isActive: true,
      inviteToken: null,
      passwordChangedAt: new Date(),
    },
  });

  return NextResponse.json({ success: true });
}
