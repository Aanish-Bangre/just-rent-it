"use client";
import React, { useEffect, useState } from "react";
import { account } from "../appwrite";
import { useRouter } from "next/navigation";

const ProfilePage = () => {
  const [user, setUser] = useState<any>(null);
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    async function fetchUser() {
      try {
        const userData = await account.get();
        setUser(userData);
        const sessionData = await account.getSession('current');
        setSession(sessionData);
      } catch (err: any) {
        setError("Not logged in");
        setTimeout(() => router.push("/login"), 1500);
      } finally {
        setLoading(false);
      }
    }
    fetchUser();
  }, [router]);

  if (loading) return <div className="p-8">Loading...</div>;
  if (error) return <div className="p-8 text-red-500">{error}</div>;

  return (
    <div className="max-w-lg mx-auto p-8 bg-card rounded shadow mt-8">
      <h1 className="text-2xl font-bold mb-4">Profile</h1>
      <div className="space-y-2">
        {Object.entries(user).map(([key, value]) => (
          <div key={key}>
            <span className="font-semibold">{key}:</span> {typeof value === 'object' ? JSON.stringify(value) : String(value)}
          </div>
        ))}
        {session && session.provider && (
          <>
            <div><span className="font-semibold">OAuth Provider:</span> {session.provider}</div>
            <div><span className="font-semibold">Provider UID:</span> {session.providerUid}</div>
            <div><span className="font-semibold">Provider Access Token:</span> {session.providerAccessToken}</div>
          </>
        )}
      </div>
    </div>
  );
};

export default ProfilePage;
