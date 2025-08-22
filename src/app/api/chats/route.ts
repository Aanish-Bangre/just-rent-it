import { NextRequest, NextResponse } from "next/server";
import { Databases, Client, Account, Query } from "appwrite";

const client = new Client()
  .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!)
  .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!);

const databases = new Databases(client);
const account = new Account(client);

const DATABASE_ID = process.env.NEXT_PUBLIC_DATABASE_ID!;
const CHATS_COLLECTION_ID = process.env.NEXT_PUBLIC_CHATS_COLLECTION_ID!;

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

    // Fetch chats where the user is a participant
    const chats = await databases.listDocuments(
      DATABASE_ID,
      CHATS_COLLECTION_ID,
      [
        Query.search('participantIds', userId)
      ]
    );

    return NextResponse.json({ 
      success: true, 
      data: chats.documents 
    });

  } catch (err: any) {
    console.error("Error fetching chats:", err.message);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
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

    const { ownerId, bookingId } = await req.json();

    if (!ownerId || !bookingId) {
      return NextResponse.json({ success: false, error: "Missing required fields." }, { status: 400 });
    }

    // Generate a unique chatId
    const chatId = `chat_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Create chat document
    const chatDocument = await databases.createDocument(
      DATABASE_ID,
      CHATS_COLLECTION_ID,
      chatId,
      {
        chatId: chatId,
        participantIds: [userId, ownerId], // Array of participant user IDs
        messages: [], // Empty array initially
        lastMessage: "", // Empty string initially
        updatedAt: new Date().toISOString() // Current timestamp
      }
    );

    return NextResponse.json({ 
      success: true, 
      data: chatDocument,
      chatId: chatId 
    });

  } catch (err: any) {
    console.error("Error creating chat:", err.message);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
} 