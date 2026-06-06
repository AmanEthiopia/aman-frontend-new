import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

const TRAVELER_ONLY = ["/home", "/bookings", "/book/", "/wishlist"]
const PROVIDER_ONLY = ["/provider"]
const AUTH_REQUIRED = ["/home", "/bookings", "/book/", "/wishlist", "/provider"]
const AUTH_REDIRECT = ["/login", "/register"]

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const token = request.cookies.get("aman_token")?.value
  const role = request.cookies.get("aman_role")?.value

  const isAuthenticated = !!token
  const isProvider = role === "provider"
  const isTraveler = role === "traveler"
  const roleKnown = !!role

  // Root "/" — redirect authenticated users to their dashboard
  if (pathname === "/") {
    if (isAuthenticated) {
      if (roleKnown) {
        return NextResponse.redirect(new URL(isProvider ? "/provider" : "/home", request.url))
      }
      // Role not yet set (existing session without role cookie) — go to /home,
      // the dashboard layout will redirect providers to /provider client-side
      return NextResponse.redirect(new URL("/home", request.url))
    }
    return NextResponse.next()
  }

  // Already authenticated → skip login/register
  if (isAuthenticated && AUTH_REDIRECT.some((r) => pathname === r || pathname.startsWith(r + "/"))) {
    if (roleKnown) {
      return NextResponse.redirect(new URL(isProvider ? "/provider" : "/home", request.url))
    }
    return NextResponse.redirect(new URL("/home", request.url))
  }

  // Require auth for protected routes
  if (!isAuthenticated && AUTH_REQUIRED.some((r) => pathname === r || pathname.startsWith(r + "/"))) {
    const loginUrl = new URL("/login", request.url)
    loginUrl.searchParams.set("next", pathname)
    return NextResponse.redirect(loginUrl)
  }

  // Block providers from traveler-only routes
  if (isAuthenticated && isProvider) {
    const blockedForProvider = [
      ...TRAVELER_ONLY,
      "/hotels", "/restaurants", "/experiences", "/guides",
      "/transport", "/transports", "/attractions", "/cities", "/planner",
    ]
    if (blockedForProvider.some((r) => pathname === r || pathname.startsWith(r + "/"))) {
      return NextResponse.redirect(new URL("/provider", request.url))
    }
  }

  // Block travelers from provider routes
  if (isAuthenticated && isTraveler) {
    if (PROVIDER_ONLY.some((r) => pathname === r || pathname.startsWith(r + "/"))) {
      return NextResponse.redirect(new URL("/home", request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon\\.ico|.*\\.png$|.*\\.jpg$|.*\\.svg$).*)"],
}
