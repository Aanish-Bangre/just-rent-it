import { NextRequest, NextResponse } from "next/server";
import { Databases, Client, Account, Query } from "appwrite";

const client = new Client()
  .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!)
  .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!);

const databases = new Databases(client);
const account = new Account(client);

const DATABASE_ID = process.env.NEXT_PUBLIC_DATABASE_ID!;
const BOOKINGS_COLLECTION_ID = process.env.NEXT_PUBLIC_BOOKINGS_COLLECTION_ID!;

export async function GET(req: NextRequest) {
  try {
    // Get JWT from HTTP-only cookie
    const jwt = req.cookies.get("appwrite_jwt")?.value;
    if (!jwt) {
      return NextResponse.json({ success: false, error: "Not authenticated." }, { status: 401 });
    }
    client.setJWT(jwt);

    // Get authenticated user's ID
    const user = await account.get();
    const userId = user.$id;

    // Query: get all bookings where renterId == current user
    const bookings = await databases.listDocuments(
      DATABASE_ID,
      BOOKINGS_COLLECTION_ID,
      [Query.equal('renterId', userId)]
    );

    return NextResponse.json({ success: true, data: bookings.documents });
  } catch (err: any) {
    console.error("Error:", err.message);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
