import { NextRequest, NextResponse } from "next/server";
import { Databases, Client, ID, Account, Query } from "appwrite";

const client = new Client()
  .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!)
  .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!);

const databases = new Databases(client);
const account = new Account(client);

const DATABASE_ID = process.env.NEXT_PUBLIC_DATABASE_ID!;
const ITEMS_COLLECTION_ID = process.env.NEXT_PUBLIC_ITEMS_COLLECTION_ID!;

// POST: Create item
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      title,
      description,
      images,
      categories,
      deposit,
      pricePerDay,
      location,
      status,
    } = body;
    // Get JWT from HTTP-only cookie
    const jwt = req.cookies.get("appwrite_jwt")?.value;
    if (!jwt) {
      return NextResponse.json({ success: false, error: "Not authenticated." }, { status: 401 });
    }
    client.setJWT(jwt);

    // Get authenticated user's ID
    const user = await account.get();
    const ownerId = user.$id;

    // Generate a unique listingId
    const uniqueListingId = ID.unique();

    const response = await databases.createDocument(
      DATABASE_ID,
      ITEMS_COLLECTION_ID,
      uniqueListingId,
      {
        listingId: uniqueListingId,
        ownerId,
        title,
        description,
        images,
        categories,
        deposit,
        pricePerDay,
        location,
        status,
      }
    );

    return NextResponse.json({ success: true, data: response });
  } catch (err: any) {
    console.error("Error:", err.message);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

// GET: Fetch all items except those owned by the logged-in user
export async function GET(req: NextRequest) {
  try {
    // Get JWT from HTTP-only cookie
    const jwt = req.cookies.get("appwrite_jwt")?.value;
    if (!jwt) {
      return NextResponse.json({ success: false, error: "Not authenticated." }, { status: 401 });
    }
    client.setJWT(jwt);

    const user = await account.get();
    const userId = user.$id;

    // Query: exclude documents where ownerId == current user
    const items = await databases.listDocuments(
      DATABASE_ID,
      ITEMS_COLLECTION_ID,
      [
        Query.notEqual('ownerId', userId)
      ]
    );
    return NextResponse.json({ success: true, data: items.documents });
  } catch (err: any) {
    console.error("Error:", err.message);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
