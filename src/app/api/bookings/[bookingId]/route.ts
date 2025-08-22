import { NextRequest, NextResponse } from "next/server";
import { Databases, Client, Account, Query } from "appwrite";

const client = new Client()
  .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!)
  .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!);

const databases = new Databases(client);
const account = new Account(client);

const DATABASE_ID = process.env.NEXT_PUBLIC_DATABASE_ID!;
const BOOKINGS_COLLECTION_ID = process.env.NEXT_PUBLIC_BOOKINGS_COLLECTION_ID!;

export async function GET(req: NextRequest, context: { params: Promise<{ bookingId: string }> }) {
  try {
    const { bookingId } = await context.params;
    
    // Get JWT from HTTP-only cookie
    const jwt = req.cookies.get("appwrite_jwt")?.value;
    if (!jwt) {
      return NextResponse.json({ success: false, error: "Not authenticated." }, { status: 401 });
    }
    client.setJWT(jwt);

    // Get authenticated user's ID
    const user = await account.get();
    const userId = user.$id;

    // Query: get the specific booking where bookingId matches and user is the renter
    const bookings = await databases.listDocuments(
      DATABASE_ID,
      BOOKINGS_COLLECTION_ID,
      [
        Query.equal('bookingId', bookingId),
        Query.equal('renterId', userId)
      ]
    );

    if (bookings.documents.length === 0) {
      return NextResponse.json({ success: false, error: "Booking not found." }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: bookings.documents[0] });
  } catch (err: any) {
    console.error("Error:", err.message);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
} 