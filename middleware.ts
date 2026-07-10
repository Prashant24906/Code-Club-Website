import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Ignore Next.js internals and auth API
  if (pathname.startsWith("/_next") || pathname.startsWith("/api/auth") || pathname.includes(".")) {
    return NextResponse.next();
  }

  // Protect /admin and its subpaths. Allow the root /admin page so it can act as sign-in UI.
  if (pathname.startsWith("/admin")) {
    if (pathname === "/admin") return NextResponse.next();

    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    if (!token) {
      const url = req.nextUrl.clone();
      url.pathname = "/admin";
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
