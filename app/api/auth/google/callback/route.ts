import { NextRequest, NextResponse } from "next/server"

const GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { code, redirect_uri } = body

    if (!code) {
      return NextResponse.json(
        { message: "Authorization code is required" },
        { status: 400 }
      )
    }

    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET

    if (!clientId || !clientSecret) {
      return NextResponse.json(
        { message: "Google OAuth is not configured on the server" },
        { status: 500 }
      )
    }

    // Exchange the authorization code for tokens
    const tokenResponse = await fetch(GOOGLE_TOKEN_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri,
        grant_type: "authorization_code",
      }),
    })

    if (!tokenResponse.ok) {
      const errorData = await tokenResponse.json()
      console.error("[v0] Google token exchange error:", errorData)
      return NextResponse.json(
        { message: errorData.error_description || "Failed to exchange authorization code" },
        { status: 400 }
      )
    }

    const tokens = await tokenResponse.json()

    // Return the ID token to the client
    return NextResponse.json({
      id_token: tokens.id_token,
      access_token: tokens.access_token,
    })
  } catch (error: any) {
    console.error("[v0] Google OAuth callback error:", error)
    return NextResponse.json(
      { message: error.message || "Internal server error" },
      { status: 500 }
    )
  }
}
