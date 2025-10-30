"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { account } from "@/lib/appwrite";
import { Loader2 } from "lucide-react";

function AuthCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState("Completing authentication...");

  useEffect(() => {
    const handleOAuthCallback = async () => {
      try {
        // Check if there's an error in the URL params from Appwrite
        const errorParam = searchParams.get("error");
        const errorDescription = searchParams.get("error_description");
        
        if (errorParam) {
          throw new Error(errorDescription || errorParam);
        }
        
        setStatus("Verifying authentication...");
        
        // Give Appwrite more time to set the session cookie after OAuth redirect
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // Try to get the current user to verify session with retries
        let user;
        let retries = 3;
        
        while (retries > 0) {
          try {
            user = await account.get();
            break; // Success, exit retry loop
          } catch (error: any) {
            retries--;
            console.log(`Retry attempt ${4 - retries}/3 failed:`, error.message);
            
            if (retries === 0) {
              console.error("Failed to get user after all retries:", error);
              throw new Error("Unable to verify authentication. The session may not have been created properly. Please try again.");
            }
            // Wait before retry
            await new Promise(resolve => setTimeout(resolve, 1000));
          }
        }
        
        if (!user) {
          throw new Error("No user found");
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
        
        // Parse the error message
        let errorMessage = error.message || "Authentication failed";
        let errorType = "unknown";
        
        if (error.message?.includes("User (role: guests)") || error.message?.includes("missing scopes")) {
          errorMessage = "OAuth authentication failed. This might be due to browser security settings or Appwrite configuration. Please try email login instead.";
          errorType = "oauth_incomplete";
        }
        
        const errorObj = {
          type: errorType,
          message: errorMessage
        };
        
        setStatus("Authentication failed. Redirecting...");
        
        setTimeout(() => {
          router.push(`/login?error=${encodeURIComponent(JSON.stringify(errorObj))}`);
        }, 1500);
      }
    };

    handleOAuthCallback();
  }, [router, searchParams]);

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

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-slate-950">
        <div className="text-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin mx-auto text-black dark:text-white" />
          <p className="text-lg font-medium text-slate-900 dark:text-white">
            Loading...
          </p>
        </div>
      </div>
    }>
      <AuthCallbackContent />
    </Suspense>
  );
}
