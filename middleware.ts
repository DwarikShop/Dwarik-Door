/**
 * middleware.ts  (Next.js Edge Middleware)
 *
 * Runs on every matched request BEFORE the page renders.
 * Enforces authentication and role-based access control.
 *
 * Route rules:
 *   Public  — /, /home, /login          → always accessible
 *   Owner   — /dashboard, /orders, /inventory, /employees, /place-order, /profile
 *   Employee — /employee/*, /inventory, /profile
 *   API     — /api/auth/* public; all other /api/* require a valid token
 */

import { NextRequest, NextResponse } from "next/server";
import { verifyTokenSafe, AUTH_COOKIE } from "./src/lib/jwt";

// ── Route definitions ─────────────────────────────────────────────────────────

const PUBLIC_ROUTES = ["/", "/home", "/login"];

/** Routes only owners can access */
const OWNER_ONLY_ROUTES = [
  "/dashboard",
  "/place-order",
  "/orders",
  "/employees",
  "/demand-analysis",
];

/** Routes only employees can access */
const EMPLOYEE_ONLY_ROUTES = ["/employee"];

/** Routes both roles can access once authenticated */
const SHARED_AUTH_ROUTES = ["/inventory", "/profile"];

// ── Helpers ───────────────────────────────────────────────────────────────────

function isPublic(pathname: string): boolean {
  return PUBLIC_ROUTES.includes(pathname);
}

function isOwnerOnly(pathname: string): boolean {
  return OWNER_ONLY_ROUTES.some(
    (r) => pathname === r || pathname.startsWith(r + "/"),
  );
}

function isEmployeeOnly(pathname: string): boolean {
  // Must match /employee/ prefix exactly — NOT /employees (owner route)
  return EMPLOYEE_ONLY_ROUTES.some((r) => pathname.startsWith(r + "/"));
}

function isSharedAuth(pathname: string): boolean {
  return SHARED_AUTH_ROUTES.some(
    (r) => pathname === r || pathname.startsWith(r + "/"),
  );
}

function isProtectedApi(pathname: string): boolean {
  return pathname.startsWith("/api/") && !pathname.startsWith("/api/auth/");
}

// ── Middleware ────────────────────────────────────────────────────────────────

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Always allow public routes and Next.js internals
  if (
    isPublic(pathname) ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon")
  ) {
    return NextResponse.next();
  }

  // Read and verify the auth cookie
  const token = request.cookies.get(AUTH_COOKIE)?.value;
  const user = token ? await verifyTokenSafe(token) : null;

  // ── Unauthenticated ───────────────────────────────────────────────────────
  if (!user) {
    // API routes → 401 JSON
    if (isProtectedApi(pathname)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    // Page routes → redirect to login
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("from", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // ── Role enforcement ──────────────────────────────────────────────────────
  if (isOwnerOnly(pathname) && user.role !== "owner") {
    // Employee trying to access owner route → send to their dashboard
    return NextResponse.redirect(new URL("/employee/dashboard", request.url));
  }

  if (isEmployeeOnly(pathname) && user.role !== "employee") {
    // Owner trying to access employee route → send to their dashboard
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // Shared auth routes (/inventory, /profile) — any authenticated role is fine
  if (isSharedAuth(pathname) || isProtectedApi(pathname)) {
    return NextResponse.next();
  }

  return NextResponse.next();
}

// ── Matcher ───────────────────────────────────────────────────────────────────
// Exclude: Next.js internals, static files, public assets, auth API routes

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|manifest.json|icons/|api/auth/|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|json|pdf)$).*)",
  ],
};
