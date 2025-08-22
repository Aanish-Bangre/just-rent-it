import { NextRequest, NextResponse } from "next/server";
import { Databases, Client, Query } from "appwrite";
import { Account } from "appwrite";

const client = new Client()
  .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!)
  .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!);

const databases = new Databases(client);
const account = new Account(client);

const DATABASE_ID = process.env.NEXT_PUBLIC_DATABASE_ID!;
const ITEMS_COLLECTION_ID = process.env.NEXT_PUBLIC_ITEMS_COLLECTION_ID!;

// GET: Fetch a single item by listingId
export async function GET(req: NextRequest, { params }: { params: { listingId: string } }) {
  try {
    // Get JWT from HTTP-only cookie
    const jwt = req.cookies.get("appwrite_jwt")?.value;
    if (!jwt) {
      return NextResponse.json({ success: false, error: "Not authenticated." }, { status: 401 });
    }
    client.setJWT(jwt);

    // Optionally, you can get the user (to verify the JWT is valid)
    // const user = await account.get();

    const { listingId } = params;
    // Query for the document with the given listingId
    const items = await databases.listDocuments(
      DATABASE_ID,
      ITEMS_COLLECTION_ID,
      [Query.equal('listingId', listingId)]
    );
    if (items.documents.length === 0) {
      return NextResponse.json({ success: false, error: "Item not found." }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: items.documents[0] });
  } catch (err: any) {
    console.error("Error:", err.message);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
} 