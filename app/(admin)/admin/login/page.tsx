"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Loader2, Eye, EyeOff, LogIn } from "lucide-react";
import { cn } from "@/lib/utils";

// ─── Admin Login Page ──────────────────────────────────────────
// Simple credentials login. No OAuth — admin only.
// On success: NextAuth sets JWT cookie, redirects to /admin.

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    setLoading(false);

    if (result?.error) {
      setError("Invalid email or password. Please try again.");
      return;
    }

    router.push("/admin");
  }

  return (
    <div className="min-h-screen bg-[#FAFAF9] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <h1
            className="text-3xl font-bold mb-1"
            style={{ color: "var(--forest-green)", fontFamily: "var(--font-playfair)" }}
          >
            Casa Brunelli
          </h1>
          <p className="text-sm" style={{ color: "var(--text-muted)" }}>
            Admin Dashboard
          </p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8">
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Sign in</h2>
            <p className="text-sm text-gray-500 mt-1">
              Enter your admin credentials to continue
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-gray-700">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@casabrunelli.com"
                required
                disabled={loading}
                className={cn(
                  "w-full px-3 py-2.5 border rounded-lg text-sm transition-all",
                  "focus:outline-none focus:ring-2 focus:ring-[#1a4a3a]/20 focus:border-[#1a4a3a]",
                  "disabled:bg-gray-50 disabled:cursor-not-allowed",
                  error ? "border-red-400" : "border-gray-300"
                )}
              />
            </div>

            {/* Password */}
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-gray-700">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  disabled={loading}
                  className={cn(
                    "w-full px-3 py-2.5 pr-10 border rounded-lg text-sm transition-all",
                    "focus:outline-none focus:ring-2 focus:ring-[#1a4a3a]/20 focus:border-[#1a4a3a]",
                    "disabled:bg-gray-50 disabled:cursor-not-allowed",
                    error ? "border-red-400" : "border-gray-300"
                  )}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg border border-red-200">
                {error}
              </p>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading || !email || !password}
              className={cn(
                "w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg",
                "text-sm font-medium text-white transition-all duration-200",
                "bg-[#1a4a3a] hover:bg-[#2d5a47] active:bg-[#163d30]",
                "disabled:opacity-50 disabled:cursor-not-allowed",
                "shadow-sm"
              )}
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Signing in…
                </>
              ) : (
                <>
                  <LogIn className="w-4 h-4" />
                  Sign in
                </>
              )}
            </button>
          </form>
        </div>

        <p className="text-center text-xs text-gray-400 mt-6">
          Casa Brunelli · Tuscany, Italy
        </p>
      </div>
    </div>
  );
}
