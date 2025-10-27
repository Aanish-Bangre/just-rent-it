// src/app/login/page.tsx
import { ShoppingBag, Sparkles } from "lucide-react";
import { LoginForm } from "@/components/login-form";

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
          <div className="w-full max-w-md">
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
