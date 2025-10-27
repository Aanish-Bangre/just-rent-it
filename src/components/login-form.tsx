"use client"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { account } from "@/lib/appwrite"
import { Mail, Lock, Loader2, AlertCircle, Github } from "lucide-react"

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"form">) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const login = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      await account.deleteSession("current").catch(() => {})
      await account.createEmailPasswordSession(email, password)
      const jwtResponse = await account.createJWT()
      const jwt = jwtResponse.jwt
      const res = await fetch("/api/set-jwt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jwt }),
      })
      if (!res.ok) {
        throw new Error("Failed to set session cookie")
      }
      router.push("/profile")
    } catch (err: any) {
      setError(err.message || "Login failed. Please check your credentials.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <form className={cn("flex flex-col gap-6", className)} onSubmit={login} {...props}>
      <div className="flex flex-col gap-2 text-center">
        <h1 className="text-3xl font-bold text-black dark:text-white">
          Welcome Back
        </h1>
        <p className="text-muted-foreground text-sm">
          Enter your credentials to access your account
        </p>
      </div>
      
      <div className="grid gap-5">
        <div className="grid gap-2">
          <Label htmlFor="email" className="text-sm font-semibold flex items-center gap-2">
            <Mail className="h-4 w-4 text-muted-foreground" />
            Email Address
          </Label>
          <Input 
            id="email" 
            type="email" 
            placeholder="you@example.com" 
            required 
            value={email} 
            onChange={e => setEmail(e.target.value)}
            className="h-11 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm border-slate-200 dark:border-slate-800 focus:border-black dark:focus:border-white"
            disabled={loading}
          />
        </div>
        
        <div className="grid gap-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="password" className="text-sm font-semibold flex items-center gap-2">
              <Lock className="h-4 w-4 text-muted-foreground" />
              Password
            </Label>
            <a
              href="#"
              className="text-sm text-black hover:text-slate-700 dark:text-white dark:hover:text-slate-300 font-medium"
            >
              Forgot password?
            </a>
          </div>
          <Input 
            id="password" 
            type="password" 
            required 
            value={password} 
            onChange={e => setPassword(e.target.value)}
            className="h-11 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm border-slate-200 dark:border-slate-800 focus:border-black dark:focus:border-white"
            disabled={loading}
          />
        </div>
        
        {error && (
          <Alert className="border-red-200 bg-red-50 dark:bg-red-950/20 dark:border-red-900">
            <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
            <AlertDescription className="text-red-700 dark:text-red-400">
              {error}
            </AlertDescription>
          </Alert>
        )}
        
        <Button 
          type="submit" 
          className="w-full h-11 bg-black hover:bg-slate-800 text-white font-semibold shadow-lg hover:shadow-xl transition-all" 
          disabled={loading}
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Signing in...
            </>
          ) : (
            "Sign In"
          )}
        </Button>
        
        <div className="relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t after:border-slate-200 dark:after:border-slate-800">
          <span className="relative z-10 bg-white dark:from-slate-950 dark:to-slate-900 px-2 text-muted-foreground">
            Or continue with
          </span>
        </div>
        
        <Button 
          variant="outline" 
          className="w-full h-11 border-2 hover:bg-slate-50 dark:hover:bg-slate-900" 
          type="button"
        >
          <Github className="mr-2 h-4 w-4" />
          Continue with GitHub
        </Button>
      </div>
      
      <div className="text-center text-sm">
        <span className="text-muted-foreground">Don&apos;t have an account? </span>
        <a href="#" className="text-black hover:text-slate-700 dark:text-white dark:hover:text-slate-300 font-semibold underline-offset-4 hover:underline">
          Sign up
        </a>
      </div>
    </form>
  )
}
