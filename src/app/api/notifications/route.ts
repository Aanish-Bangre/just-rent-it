import { NextRequest, NextResponse } from "next/server";
import { Databases, Client, Account, Query } from "appwrite";

const client = new Client()
  .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!)
  .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!);

const databases = new Databases(client);
const account = new Account(client);

const DATABASE_ID = process.env.NEXT_PUBLIC_DATABASE_ID!;
const NOTIFICATIONS_COLLECTION_ID = process.env.NEXT_PUBLIC_NOTIFICATIONS_COLLECTION_ID!;

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
    const fromId = user.$id;

    const { toId, type = "chat", message } = await req.json();

    if (!toId || !message) {
      return NextResponse.json({ 
        success: false, 
        error: "Missing required fields: toId, message" 
      }, { status: 400 });
    }

    // Generate a unique notificationId
    const notificationId = `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Create notification document
    const notificationDocument = await databases.createDocument(
      DATABASE_ID,
      NOTIFICATIONS_COLLECTION_ID,
      notificationId,
      {
        notificationId: notificationId,
        fromId: fromId,
        toId: toId,
        type: type, // "chat", "video_call", etc.
        lastUpdated: new Date().toISOString()
      }
    );

    return NextResponse.json({ 
      success: true, 
      data: notificationDocument,
      notificationId: notificationId 
    });

  } catch (err: any) {
    console.error("Error creating notification:", err.message);
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

    // Get authenticated user's ID
    const user = await account.get();
    const userId = user.$id;

    // Get query parameters
    const { searchParams } = new URL(req.url);
    const type = searchParams.get('type');
    const limit = searchParams.get('limit') || '50';

    // Build query filters - fetch notifications where user is the receiver (toId)
    const queries = [Query.equal('toId', userId)];
    
    if (type) {
      queries.push(Query.equal('type', type));
    }

    // Fetch notifications for the user
    const notifications = await databases.listDocuments(
      DATABASE_ID,
      NOTIFICATIONS_COLLECTION_ID,
      queries
    );

    return NextResponse.json({ 
      success: true, 
      data: notifications.documents 
    });

  } catch (err: any) {
    console.error("Error fetching notifications:", err.message);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
