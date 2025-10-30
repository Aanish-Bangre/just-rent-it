"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { account } from "@/lib/appwrite";
import { Loader2 } from "lucide-react";

export default function AuthCallbackPage() {
  const router = useRouter();
  const [status, setStatus] = useState("Completing authentication...");

  useEffect(() => {
    const handleOAuthCallback = async () => {
      try {
        // Get the OAuth session (Appwrite automatically creates it)
        const session = await account.getSession("current");
        
        if (!session) {
          throw new Error("No session found");
        }

        setStatus("Creating secure session...");
        
        // Create JWT token
        const jwtResponse = await account.createJWT();
        const jwt = jwtResponse.jwt;
        
        // Set JWT cookie via API
        const response = await fetch("/api/set-jwt", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ jwt }),
          credentials: "include",
        });

        if (!response.ok) {
          throw new Error("Failed to create session");
        }

        setStatus("Success! Redirecting...");
        
        // Wait a bit for cookie to be set, then redirect
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Use window.location for full page reload to ensure cookies are loaded
        window.location.href = "/profile";
        
      } catch (error: any) {
        console.error("OAuth callback error:", error);
        setStatus("Authentication failed. Redirecting...");
        
        setTimeout(() => {
          router.push("/login");
        }, 2000);
      }
    };

    handleOAuthCallback();
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-white dark:bg-slate-950">
      <div className="text-center space-y-4">
        <Loader2 className="h-12 w-12 animate-spin mx-auto text-black dark:text-white" />
        <p className="text-lg font-medium text-slate-900 dark:text-white">
          {status}
        </p>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          Please wait a moment...
        </p>
      </div>
    </div>
  );
}
