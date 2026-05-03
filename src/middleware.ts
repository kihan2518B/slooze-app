import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyTokenEdge } from "./lib/auth-edge";

const PUBLIC_ROUTES = [
  "/",
  "/login",
  "/register",
  "/api/auth/login",
  "/api/auth/register",
];
const ADMIN_ROUTES = ["/admin"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isPublic = PUBLIC_ROUTES.some(
    (r) => pathname === r || pathname.startsWith(r + "/"),
  );
  if (isPublic) return NextResponse.next();

  const token = request.cookies.get("auth_token");
  if (!token) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  const user = await verifyTokenEdge(token.value);
  if (!user) {
    const response = NextResponse.redirect(new URL("/login", request.url));
    // response.cookies.delete("auth_token");
    return response;
  }

  // Protect admin routes
  if (
    ADMIN_ROUTES.some((r) => pathname.startsWith(r)) &&
    user.role !== "ADMIN"
  ) {
    return NextResponse.redirect(new URL("/restaurants", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|public|api/auth).*)"],
};
