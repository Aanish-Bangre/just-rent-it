import { NextRequest, NextResponse } from "next/server";
import { Databases, Client, ID, Account } from "appwrite";

const client = new Client()
  .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!)
  .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!);

const databases = new Databases(client);
const account = new Account(client);

const DATABASE_ID = process.env.NEXT_PUBLIC_DATABASE_ID!;
const BOOKINGS_COLLECTION_ID = process.env.NEXT_PUBLIC_BOOKINGS_COLLECTION_ID!;

export async function POST(req: NextRequest, context: { params: Promise<{ listingId: string }> }) {
  try {
    const { listingId } = await context.params;
    const body = await req.json();
    const { startDate, endDate, totalAmount } = body;

    // Validate required fields
    if (!startDate || !endDate || !totalAmount) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Get JWT from HTTP-only cookie
    const jwt = req.cookies.get("appwrite_jwt")?.value;
    if (!jwt) {
      return NextResponse.json({ success: false, error: "Not authenticated." }, { status: 401 });
    }

    // Set JWT and verify user
    client.setJWT(jwt);
    
    try {
      // Verify the user is authenticated
      const user = await account.get();
      const renterId = user.$id;

      // Get item details to get ownerId
      const itemResponse = await databases.listDocuments(
        DATABASE_ID,
        process.env.NEXT_PUBLIC_ITEMS_COLLECTION_ID!,
        [require("appwrite").Query.equal('listingId', listingId)]
      );

      if (itemResponse.documents.length === 0) {
        return NextResponse.json({ success: false, error: "Item not found." }, { status: 404 });
      }

      const item = itemResponse.documents[0];
      const ownerId = item.ownerId;

      // Create booking document with exact schema attributes
      const bookingId = ID.unique();
      const booking = await databases.createDocument(
        DATABASE_ID,
        BOOKINGS_COLLECTION_ID,
        bookingId,
        {
          bookingId: bookingId,
          listingId: listingId,
          renterId: renterId,
          ownerId: ownerId,
          startDate: startDate,
          endDate: endDate,
          totalPrice: parseInt(totalAmount.toString()),
          createdAt: new Date().toISOString(),
          status: "confirmed"
        }
      );

      return NextResponse.json({ success: true, data: booking });
    } catch (authError: any) {
      console.error("Authentication error:", authError);
      if (authError.code === 401) {
        return NextResponse.json({ success: false, error: "Invalid or expired session. Please log in again." }, { status: 401 });
      }
      throw authError;
    }
  } catch (error: any) {
    console.error("Booking creation error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Booking creation failed" },
      { status: 500 }
    );
  }
}
