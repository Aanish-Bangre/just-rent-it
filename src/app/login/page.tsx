"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { account } from "../appwrite";
import Link from "next/link";

const LoginPage = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [googleLoading, setGoogleLoading] = useState(false);
    const router = useRouter();

    const login = async (email: string, password: string) => {
        setLoading(true);
        setError(null);
        try {
            await account.createEmailPasswordSession(email, password);
            router.push("/profile");
        } catch (err: any) {
            setError(err?.message || "Login failed");
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        await login(email, password);
    };

    const handleGoogleSignIn = async () => {
        setGoogleLoading(true);
        setError(null);
        try {
            await account.createOAuth2Session(
                "google" as any,
                window.location.origin + "/profile",
                window.location.origin + "/login"
            );
        } catch (err: any) {
            setError(err?.message || "Google sign-in failed");
            setGoogleLoading(false);
        }
    };

    return (
        <div className="max-w-md mx-auto p-8 bg-card rounded shadow mt-8">
            <h1 className="text-2xl font-bold mb-6 text-center">Login</h1>
            <form className="flex flex-col gap-6" onSubmit={handleSubmit}>
                <div>
                    <label htmlFor="email" className="block text-sm font-medium mb-1">Email</label>
                    <input
                        type="email"
                        id="email"
                        name="email"
                        required
                        placeholder="you@example.com"
                        className="w-full px-4 py-2 rounded border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                    />
                </div>
                <div>
                    <label htmlFor="password" className="block text-sm font-medium mb-1">Password</label>
                    <input
                        type="password"
                        id="password"
                        name="password"
                        required
                        placeholder="••••••••"
                        className="w-full px-4 py-2 rounded border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                    />
                </div>
                {error && <div className="text-red-500 text-sm">{error}</div>}
                <button
                    type="submit"
                    className="w-full py-2 rounded bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition"
                    disabled={loading}
                >
                    {loading ? "Logging in..." : "Log In"}
                </button>
            </form>
            <div className="my-4 flex items-center justify-center">
                <span className="h-px flex-1 bg-border" />
                <span className="px-3 text-xs text-muted-foreground">OR</span>
                <span className="h-px flex-1 bg-border" />
            </div>
            <button
                type="button"
                onClick={handleGoogleSignIn}
                className="w-full py-2 rounded bg-white text-black font-semibold border border-border hover:bg-gray-100 transition flex items-center justify-center gap-2 disabled:opacity-60"
                disabled={googleLoading}
            >
                <svg width="20" height="20" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg"><g clipPath="url(#clip0_17_40)"><path d="M47.532 24.552c0-1.636-.146-3.2-.418-4.704H24.48v9.02h13.02c-.528 2.84-2.12 5.24-4.52 6.86v5.68h7.32c4.28-3.94 6.73-9.74 6.73-16.856z" fill="#4285F4"/><path d="M24.48 48c6.12 0 11.24-2.04 14.98-5.54l-7.32-5.68c-2.04 1.36-4.66 2.16-7.66 2.16-5.88 0-10.86-3.98-12.64-9.32H4.98v5.86C8.7 43.98 15.02 48 24.48 48z" fill="#34A853"/><path d="M11.84 29.62A14.98 14.98 0 0 1 10.1 24c0-1.96.36-3.86 1.74-5.62v-5.86H4.98A23.98 23.98 0 0 0 .96 24c0 3.98.96 7.78 2.7 11.14l8.18-5.52z" fill="#FBBC05"/><path d="M24.48 9.54c3.34 0 6.32 1.14 8.68 3.38l6.48-6.48C35.72 2.04 30.6 0 24.48 0 15.02 0 8.7 4.02 4.98 9.54l8.18 6.34c1.78-5.34 6.76-9.32 12.64-9.32z" fill="#EA4335"/></g><defs><clipPath id="clip0_17_40"><path fill="#fff" d="M0 0h48v48H0z"/></clipPath></defs></svg>
                {googleLoading ? "Signing in with Google..." : "Sign in with Google"}
            </button>
            <div className="mt-4 text-center text-sm text-muted-foreground">
                Don't have an account?{' '}
                <Link href="/signup" className="text-primary hover:underline">Sign up</Link>
            </div>
        </div>
    );
};

export default LoginPage;
