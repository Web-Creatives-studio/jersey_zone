import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { randomUUID } from "crypto";

const prisma = new PrismaClient();

export async function POST(request) {
  try {
    const { name, email, password } = await request.json();

    if (!name || !email || !password) {
      return NextResponse.json({ error: "Missing required profile registration parameters" }, { status: 400 });
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return NextResponse.json({ error: "An account with this email already exists" }, { status: 400 });
    }

    // Hash the password securely
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Save user to PostgreSQL database
    const newUser = await prisma.user.create({
      data: {
        id: randomUUID(),
        name,
        email,
        password: hashedPassword,
      },
    });

    // Strip out password string before returning to client frontend safety guidelines
    const { password: _, ...userResponse } = newUser;

    return NextResponse.json({ message: "Account created successfully", user: userResponse }, { status: 201 });
  } catch (error) {
    console.error("Signup handler failed:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}