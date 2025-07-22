// lib/appwrite.ts
import { Client, Databases, Account, ID } from "appwrite";

const client = new Client()
    .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!)
    .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!);

export const databases = new Databases(client);
export const clientAppwrite = client;
export const account = new Account(client);
export { ID };

export const DATABASE_ID = process.env.NEXT_PUBLIC_DATABASE_ID!;
export const USERS_COLLECTION_ID = process.env.NEXT_PUBLIC_USERS_COLLECTION_ID!;
