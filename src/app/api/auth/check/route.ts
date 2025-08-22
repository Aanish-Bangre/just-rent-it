import { NextRequest, NextResponse } from "next/server";
import { Client, Account } from "appwrite";

const client = new Client()
  .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!)
  .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!);

const account = new Account(client);

export async function GET(req: NextRequest) {
  try {
    // Get JWT from HTTP-only cookie
    const jwt = req.cookies.get("appwrite_jwt")?.value;
    if (!jwt) {
      return NextResponse.json({ 
        success: false, 
        authenticated: false,
        error: "No JWT token found" 
      }, { status: 401 });
    }

    client.setJWT(jwt);

    // Try to get user info from Appwrite
    const user = await account.get();
    
    return NextResponse.json({ 
      success: true, 
      authenticated: true,
      data: {
        userId: user.$id,
        email: user.email,
        name: user.name
      }
    });

  } catch (err: any) {
    console.error("Auth check error:", err.message);
    return NextResponse.json({ 
      success: false, 
      authenticated: false,
      error: err.message 
    }, { status: 401 });
  }
} 