"use client";
import React, { useEffect, useState } from "react";
import { account } from "../appwrite";
import { useRouter } from "next/navigation";

const ProfilePage = () => {
  const [user, setUser] = useState<Record<string, unknown> | null>(null);
  const [session, setSession] = useState<Record<string, unknown> | null>(null);
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
      } catch (err: unknown) {
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
        {Object.entries(user || {}).map(([key, value]) => (
          typeof value === 'string' || typeof value === 'number' ? (
            <div key={key}>
              <span className="font-semibold">{key}:</span> {String(value)}
            </div>
          ) : null
        ))}
        {session && typeof session === 'object' && 'provider' in session && (
          <>
            <div><span className="font-semibold">OAuth Provider:</span> {String((session as Record<string, unknown>).provider)}</div>
            <div><span className="font-semibold">Provider UID:</span> {String((session as Record<string, unknown>).providerUid)}</div>
            <div><span className="font-semibold">Provider Access Token:</span> {String((session as Record<string, unknown>).providerAccessToken)}</div>
          </>
        )}
      </div>
    </div>
  );
};

export default ProfilePage;
