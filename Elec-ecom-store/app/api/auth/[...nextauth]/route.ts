// async function login(email: string, password: string) {
//   const response = await fetch("http://ecom-node-container/api/auth/login", {
//     method: "POST",
//     headers: { "Content-Type": "application/json" },
//     body: JSON.stringify({ email, password }),
//   });

//   const data = await response.json();
//   console.log(data);
// }
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();
    const response = await fetch(`${`http://${process.env.BACKEND_API_SERVICE_HOST}:${process.env.BACKEND_API_SERVICE_PORT}`}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) throw new Error("Login failed");

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: "Authentication error" }, { status: 400 });
  }
}