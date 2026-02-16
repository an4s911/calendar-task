import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { signToken, authCookieHeader } from "@/lib/auth";

export async function POST(req: Request) {
  const body = await req.json();
  const { username, password } = body;

  if (!username || !password) {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({ where: { username } });
  if (!user) {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }

  if (!user.isActive) {
    return NextResponse.json(
      { error: "Account is deactivated" },
      { status: 403 }
    );
  }

  if (!user.passwordHash) {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }

  const token = await signToken({
    sub: user.id,
    username: user.username,
    role: user.roleId || "employee",
    isAdmin: user.isAdmin,
  });

  const usingDefaultPassword =
    user.passwordChangedAt.getTime() === user.createdAt.getTime();

  const res = NextResponse.json({
    success: true,
    usingDefaultPassword,
    isAdmin: user.isAdmin,
  });
  res.headers.set("Set-Cookie", authCookieHeader(token));
  return res;
}
