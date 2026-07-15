import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { cookies } from "next/headers";
import { SignJWT } from "jose";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

export async function POST(request) {
  try {
    const { email, password } = await request.json();

    // 1. Enforce strict parameter bounds requirements
    if (!email || !password) {
      return NextResponse.json({ message: "Email and password inputs are required" }, { status: 400 });
    }

    // 2. Fetch the candidate profile record directly from database user matching keys
    const user = await prisma.user.findUnique({ 
      where: { email: email.toLowerCase().trim() } 
    });
    
    if (!user) {
      return NextResponse.json({ message: "Invalid email or password credentials" }, { status: 401 });
    }

    // 3. Evaluate incoming plaintext string matches hashed database profile record safely
    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect) {
      return NextResponse.json({ message: "Invalid email or password credentials" }, { status: 401 });
    }

    // 4. Construct a lightweight session identity payload object (Exclude secure passwords hashes)
    const secretKey = new TextEncoder().encode(process.env.JWT_SECRET);
    
    const token = await new SignJWT({ 
        userId: user.id, 
        email: user.email,
        name: user.name || "Customer Account"
      })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime("2h") // ⏰ Set absolute life window limit constraint
      .sign(secretKey);

    // 5. Append the signed token down onto an isolated HttpOnly secure cookie block
    const cookieStore = await cookies();
    cookieStore.set("session_token", token, {
      httpOnly: true, // 🔒 Restricts complete execution extraction from client side script extensions (XSS safe)
      secure: process.env.NODE_ENV === "production", // Forces transport layer enforcement (HTTPS) in production environment
      sameSite: "lax",
      maxAge: 2 * 60 * 60, // ⏰ Exactly 2 hours in raw calculation seconds. Browser drops session state automatically once exceeded.
      path: "/",
    });

    // 6. Return standard user details back cleanly to update frontend layout wrappers
    const { password: _, ...userProfile } = user;
    
    return NextResponse.json({ 
      message: "Login successful", 
      user: userProfile 
    }, { status: 200 });

  } catch (error) {
    console.error("Complete core signin handler execution failure crash:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}