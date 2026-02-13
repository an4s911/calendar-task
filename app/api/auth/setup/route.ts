import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  const userCount = await prisma.user.count();
  if (userCount > 0) {
    return NextResponse.json(
      { error: "Setup already completed" },
      { status: 409 },
    );
  }

  const body = await req.json();
  const { fullName, username, email } = body;

  if (!fullName || typeof fullName !== "string" || !fullName.trim()) {
    return NextResponse.json(
      { error: "Full name is required" },
      { status: 400 },
    );
  }

  if (
    !username ||
    typeof username !== "string" ||
    !/^[a-z0-9_]{3,30}$/.test(username)
  ) {
    return NextResponse.json(
      {
        error:
          "Username must be 3-30 characters, lowercase letters, numbers, or underscores",
      },
      { status: 400 },
    );
  }

  const password = process.env.ADMIN_PASSWORD;
  if (!password) {
    return NextResponse.json(
      { error: "ADMIN_PASSWORD environment variable is not set" },
      { status: 500 },
    );
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const now = new Date();

  await prisma.user.create({
    data: {
      fullName: fullName.trim(),
      username,
      email: email?.trim() || null,
      passwordHash,
      role: "admin",
      passwordChangedAt: now,
      createdAt: now,
    },
  });

  return NextResponse.json({ success: true });
}
