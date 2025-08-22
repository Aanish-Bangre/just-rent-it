// src/app/api/set-jwt/route.ts
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { jwt } = await req.json();
  if (!jwt) {
    return NextResponse.json({ error: "Missing JWT" }, { status: 400 });
  }
  const response = NextResponse.json({ success: true });
  response.cookies.set("appwrite_jwt", jwt, {
    httpOnly: true,
    path: "/",
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24, // 1 day
  });
  return response;
}