import { NextRequest, NextResponse } from "next/server";
import { getSessionFromRequest } from "@/lib/auth";

const PUBLIC = ["/login", "/setup", "/api/auth"];

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (PUBLIC.some((p) => pathname.startsWith(p))) return NextResponse.next();
  if (pathname.startsWith("/_next") || pathname.includes("."))
    return NextResponse.next();

  const session = await getSessionFromRequest(req);
  if (!session) {
    if (pathname.startsWith("/api/"))
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const url = new URL("/login", req.url);
    url.searchParams.set("from", pathname);
    return NextResponse.redirect(url);
  }

  // For API routes, attach user info to headers for route handlers
  if (pathname.startsWith("/api/")) {
    const requestHeaders = new Headers(req.headers);
    requestHeaders.set("x-user-id", session.sub);
    requestHeaders.set("x-username", session.username);

    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
