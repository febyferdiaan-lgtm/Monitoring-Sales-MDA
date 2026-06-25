// src/middleware.ts
import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const role = (req.nextauth.token as any)?.role;
    const path = req.nextUrl.pathname;

    // Finance & Manager only
    if (path.startsWith("/ar-monitoring") || path.startsWith("/payment")) {
      if (!["ADMIN", "FINANCE", "MANAGER"].includes(role)) {
        return NextResponse.redirect(new URL("/dashboard", req.url));
      }
    }

    // Admin only
    if (path.startsWith("/master/sales") || path.startsWith("/settings")) {
      if (role !== "ADMIN") {
        return NextResponse.redirect(new URL("/dashboard", req.url));
      }
    }

    return NextResponse.next();
  },
  {
    pages: { signIn: "/login" },
  }
);

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/master/:path*",
    "/rfq/:path*",
    "/quotation/:path*",
    "/po/:path*",
    "/delivery/:path*",
    "/invoice/:path*",
    "/payment/:path*",
    "/ar-monitoring/:path*",
    "/reports/:path*",
    "/settings/:path*",
  ],
};
