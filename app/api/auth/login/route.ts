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

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }

  const token = await signToken({
    sub: user.id,
    username: user.username,
    role: user.role,
  });

  const usingDefaultPassword =
    user.passwordChangedAt.getTime() === user.createdAt.getTime();

  const res = NextResponse.json({ success: true, usingDefaultPassword });
  res.headers.set("Set-Cookie", authCookieHeader(token));
  return res;
}
