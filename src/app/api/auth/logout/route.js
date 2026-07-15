import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST() {
  try {
    const cookieStore = await cookies();

    // Invalidate the session cookie by overwriting it with an immediate expiration window
    cookieStore.set("session_token", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      expires: new Date(0), // ⏰ Tells the browser to delete the cookie right now
      path: "/",
    });

    return NextResponse.json({ success: true, message: "Logged out successfully" }, { status: 200 });
  } catch (error) {
    console.error("Signout API route execution failure:", error);
    return NextResponse.json({ message: "Internal Server Error during logout" }, { status: 500 });
  }
}