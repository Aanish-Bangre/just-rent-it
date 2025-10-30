"use client";
import { ShoppingBag, Sparkles, AlertCircle } from "lucide-react";
import { LoginForm } from "@/components/login-form";
import { useSearchParams, useRouter } from "next/navigation";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { account } from "@/lib/appwrite";
import { useState, Suspense } from "react";

function LoginError() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const errorParam = searchParams.get("error");
  const [clearing, setClearing] = useState(false);
  
  let errorMessage = null;
  if (errorParam) {
    try {
      const errorObj = JSON.parse(decodeURIComponent(errorParam));
      if (errorObj.type === "user_already_exists") {
        errorMessage = "This account already exists. Please try logging in again.";
      } else {
        errorMessage = errorObj.message || "Authentication failed. Please try again.";
      }
    } catch (e) {
      errorMessage = "Authentication failed. Please try again.";
    }
  }

  const handleClearSession = async () => {
    setClearing(true);
    try {
      await account.deleteSession("current").catch(() => {});
      await fetch("/api/kill-jwt", { method: "POST" });
      router.push("/login");
      window.location.reload();
    } catch (e) {
      console.error("Clear session error:", e);
    } finally {
      setClearing(false);
    }
  };

  if (!errorMessage) return null;

  return (
    <Alert className="border-amber-200 bg-amber-50 dark:bg-amber-950/20 dark:border-amber-900">
      <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
      <AlertDescription className="text-amber-700 dark:text-amber-400 space-y-2">
        <p>{errorMessage}</p>
        <Button
          variant="outline"
          size="sm"
          onClick={handleClearSession}
          disabled={clearing}
          className="w-full mt-2 border-amber-300 hover:bg-amber-100"
        >
          {clearing ? "Clearing..." : "Clear Session & Retry"}
        </Button>
      </AlertDescription>
    </Alert>
  );
}

export default function LoginPage() {
  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      <div className="flex flex-col gap-4 p-6 md:p-10 bg-white dark:from-slate-950 dark:to-slate-900">
        <div className="flex justify-center gap-2 md:justify-start">
          <a href="/" className="flex items-center gap-3 font-bold text-xl group">
            <div className="bg-black text-white flex size-10 items-center justify-center rounded-xl shadow-lg group-hover:shadow-xl transition-all">
              <ShoppingBag className="size-5" />
            </div>
            <span className="text-black dark:text-white">
              Just Rent It
            </span>
          </a>
        </div>
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-md space-y-4">
            <Suspense fallback={null}>
              <LoginError />
            </Suspense>
            <LoginForm />
          </div>
        </div>
      </div>
      <div className="relative hidden lg:block overflow-hidden bg-black">
        <div className="absolute inset-0 bg-grid-white/10 [mask-image:linear-gradient(0deg,transparent,rgba(255,255,255,0.3))]"></div>
        
        <div className="relative h-full flex flex-col items-center justify-center p-12 text-white">
          <div className="max-w-lg space-y-8 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full border border-white/20">
              <Sparkles className="h-4 w-4" />
              <span className="text-sm font-medium">Welcome Back!</span>
            </div>
            
            <h2 className="text-5xl font-black tracking-tight">
              Your Gateway to
              <br />
              Endless Rentals
            </h2>
            
            <p className="text-xl text-white/90 leading-relaxed">
              Access thousands of items, connect with trusted owners, and manage your rentals seamlessly.
            </p>
            
            <div className="grid grid-cols-3 gap-6 pt-8">
              <div className="space-y-2">
                <div className="text-3xl font-bold">10K+</div>
                <div className="text-sm text-white/80">Items</div>
              </div>
              <div className="space-y-2">
                <div className="text-3xl font-bold">5K+</div>
                <div className="text-sm text-white/80">Users</div>
              </div>
              <div className="space-y-2">
                <div className="text-3xl font-bold">98%</div>
                <div className="text-sm text-white/80">Satisfied</div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Decorative elements */}
        <div className="absolute top-20 left-20 w-72 h-72 bg-white/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-white/5 rounded-full blur-3xl"></div>
      </div>
    </div>
  );
}
