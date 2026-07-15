import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get("session_token")?.value;

    // If cookie doesn't exist, reject access immediately
    if (!sessionToken) {
      return NextResponse.json({ error: "Unauthorized session access" }, { status: 401 });
    }

    // Verify token validity and expiration window
    const secret = new TextEncoder().encode(process.env.JWT_SECRET);
    const { payload } = await jwtVerify(sessionToken, secret);

    // Return sanitized user profile payload info back to populate your frontend states
    return NextResponse.json({
      success: true,
      user: {
        id: payload.userId,
        email: payload.email,
        name: payload.name || "Customer Account",
      },
    });
  } catch (error) {
    console.error("Session verification endpoint error:", error.message);
    return NextResponse.json({ error: "Session expired or corrupted token" }, { status: 401 });
  }
}