
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    const response = await fetch(`${`http://${process.env.BACKEND_API_SERVICE_HOST}:${process.env.BACKEND_API_SERVICE_PORT}`}/api/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) throw new Error("Registration failed");

    const data: { message: string } = await response.json();
    return NextResponse.json({ message: data.message });
  } catch (error) {
    return NextResponse.json({ error: "Registration failed" }, { status: 400 });
  }
}