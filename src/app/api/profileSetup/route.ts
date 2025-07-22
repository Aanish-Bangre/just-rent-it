// app/api/profile/route.ts
import { NextRequest, NextResponse } from "next/server";
import { Databases, Client, ID, Account, Query } from "appwrite";

const client = new Client()
  .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!)
  .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!);

const databases = new Databases(client);
const account = new Account(client);

const DATABASE_ID = process.env.NEXT_PUBLIC_DATABASE_ID!;
const USERS_COLLECTION_ID = process.env.NEXT_PUBLIC_USERS_COLLECTION_ID!;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userName, phone } = body;

    // Get JWT from HTTP-only cookie
    const jwt = req.cookies.get("appwrite_jwt")?.value;
    if (!jwt) {
      return NextResponse.json({ success: false, error: "Not authenticated." }, { status: 401 });
    }
    client.setJWT(jwt);

    // Get user info from Appwrite
    const user = await account.get();
    const userId = user.$id;
    const email = user.email;

    // Check if a profile document already exists for this user
    const existingProfile = await databases.listDocuments(
      DATABASE_ID,
      USERS_COLLECTION_ID,
      [Query.equal("userId", userId)]
    );

    let response;

    if (existingProfile.total > 0) {
      // If document exists, update it
      const documentId = existingProfile.documents[0].$id;
      response = await databases.updateDocument(
        DATABASE_ID,
        USERS_COLLECTION_ID,
        documentId,
        {
          userName,
          phone,
        }
      );
    } else {
      // If document does not exist, create it
      response = await databases.createDocument(
        DATABASE_ID,
        USERS_COLLECTION_ID,
        ID.unique(),
        {
          userId,
          userName,
          email,
          phone,
          reputationScore: 0,
          createdAt: new Date().toISOString(),
        }
      );
    }

    return NextResponse.json({ success: true, data: response });
  } catch (err: any) {
    console.error("Error:", err.message);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    // Get JWT from HTTP-only cookie
    const jwt = req.cookies.get("appwrite_jwt")?.value;
    if (!jwt) {
      return NextResponse.json({ success: false, error: "Not authenticated." }, { status: 401 });
    }
    client.setJWT(jwt);

    // Get user info from Appwrite
    const user = await account.get();
    const userId = user.$id;

    // Only fetch the profile for the logged-in user
    const response = await databases.listDocuments(
      DATABASE_ID,
      USERS_COLLECTION_ID,
      [Query.equal("userId", userId)]
    );
    // Remove userId from each document before returning
    const documents = (response.documents || []).map(({ userId, ...rest }) => rest);
    return NextResponse.json({ success: true, data: { documents } });
  } catch (err: any) {
    console.error("Error:", err.message);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}