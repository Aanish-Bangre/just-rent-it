"use client"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { account } from "@/lib/appwrite"
import { OAuthProvider, ID } from "appwrite"
import { Mail, Lock, Loader2, AlertCircle, User } from "lucide-react"

export function SignupForm({
  className,
  ...props
}: React.ComponentProps<"form">) {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleGoogleSignup = async () => {
    try {
      setLoading(true)
      setError(null)
      
      // Delete any existing session first
      try {
        await account.deleteSession("current")
      } catch (e) {
        // No session to delete, that's fine
      }
      
      const successUrl = `${window.location.origin}/auth/callback`
      const failureUrl = `${window.location.origin}/signup`
      
      await account.createOAuth2Session(
        OAuthProvider.Google,
        successUrl,
        failureUrl
      )
    } catch (err: any) {
      setError(err.message || "Google signup failed")
      setLoading(false)
    }
  }

  const signup = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    // Validation
    if (!name.trim()) {
      setError("Please enter your name")
      setLoading(false)
      return
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters long")
      setLoading(false)
      return
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match")
      setLoading(false)
      return
    }

    try {
      // Delete any existing session
      await account.deleteSession("current").catch(() => {})
      
      // Create new account
      await account.create(ID.unique(), email, password, name)
      
      // Create session
      await account.createEmailPasswordSession(email, password)
      
      // Create JWT and set cookie
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
      
      // Redirect to profile page
      router.push("/profile")
    } catch (err: any) {
      if (err.message.includes("user_already_exists")) {
        setError("An account with this email already exists. Please login instead.")
      } else {
        setError(err.message || "Signup failed. Please try again.")
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <form className={cn("flex flex-col gap-6", className)} onSubmit={signup} {...props}>
      <div className="flex flex-col gap-2 text-center">
        <h1 className="text-3xl font-bold text-black dark:text-white">
          Create Account
        </h1>
        <p className="text-muted-foreground text-sm">
          Enter your details to get started
        </p>
      </div>
      
      <div className="grid gap-5">
        <div className="grid gap-2">
          <Label htmlFor="name" className="text-sm font-semibold flex items-center gap-2">
            <User className="h-4 w-4 text-muted-foreground" />
            Full Name
          </Label>
          <Input 
            id="name" 
            type="text" 
            placeholder="John Doe" 
            required 
            value={name} 
            onChange={e => setName(e.target.value)}
            className="h-11 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm border-slate-200 dark:border-slate-800 focus:border-black dark:focus:border-white"
            disabled={loading}
          />
        </div>

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
          <Label htmlFor="password" className="text-sm font-semibold flex items-center gap-2">
            <Lock className="h-4 w-4 text-muted-foreground" />
            Password
          </Label>
          <Input 
            id="password" 
            type="password" 
            required 
            value={password} 
            onChange={e => setPassword(e.target.value)}
            className="h-11 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm border-slate-200 dark:border-slate-800 focus:border-black dark:focus:border-white"
            disabled={loading}
            placeholder="At least 8 characters"
          />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="confirmPassword" className="text-sm font-semibold flex items-center gap-2">
            <Lock className="h-4 w-4 text-muted-foreground" />
            Confirm Password
          </Label>
          <Input 
            id="confirmPassword" 
            type="password" 
            required 
            value={confirmPassword} 
            onChange={e => setConfirmPassword(e.target.value)}
            className="h-11 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm border-slate-200 dark:border-slate-800 focus:border-black dark:focus:border-white"
            disabled={loading}
            placeholder="Re-enter your password"
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
              Creating account...
            </>
          ) : (
            "Create Account"
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
          onClick={handleGoogleSignup}
          disabled={loading}
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Connecting...
            </>
          ) : (
            <>
              <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Sign up with Google
            </>
          )}
        </Button>
      </div>
      
      <div className="text-center text-sm">
        <span className="text-muted-foreground">Already have an account? </span>
        <a href="/login" className="text-black hover:text-slate-700 dark:text-white dark:hover:text-slate-300 font-semibold underline-offset-4 hover:underline">
          Sign in
        </a>
      </div>
    </form>
  )
}
