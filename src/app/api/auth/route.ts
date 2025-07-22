// app/api/auth/route.ts
import { NextResponse } from "next/server";
import { Client, Account, ID } from "appwrite";

const client = new Client();
const account = new Account(client);

client
  .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!)
  .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!);

export async function POST(req: Request) {
  const { email, password, name } = await req.json();

  try {
    let session, user;
    if (name) {
      // Signup flow
      await account.create(ID.unique(), email, password, name);
      session = await account.createEmailPasswordSession(email, password);
      user = await account.get();
    } else {
      // Login flow
      session = await account.createEmailPasswordSession(email, password);
      user = await account.get();
    }
    return NextResponse.json({ status: "ok", session, user });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Login/signup failed" }, { status: 400 });
  }
}
