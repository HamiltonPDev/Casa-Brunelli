"use client";

// ─── Imports ───────────────────────────────────────────────────
import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Eye, EyeOff, Lock, Mail, LogIn } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

// ─── Constants ─────────────────────────────────────────────────
// Fixed positions — no Math.random() in render (SSR/hydration safety)
const PARTICLES = [
  { left: "15%", top: "20%" },
  { left: "75%", top: "35%" },
  { left: "40%", top: "70%" },
  { left: "88%", top: "15%" },
  { left: "25%", top: "85%" },
];

const BG_IMAGE =
  "https://images.unsplash.com/photo-1685711907206-0e57ac67d14f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0dXNjYW55JTIwY291bnRyeXNpZGUlMjBsYW5kc2NhcGUlMjByb2xsaW5nJTIwaGlsbHN8ZW58MXx8fHwxNzcwODI0MTU3fDA&ixlib=rb-4.1.0&q=80&w=1080";

// ─── Component ─────────────────────────────────────────────────
export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    // Client-side validation
    const newErrors: { email?: string; password?: string } = {};
    if (!email) newErrors.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      newErrors.email = "Invalid email format";
    if (!password) newErrors.password = "Password is required";
    else if (password.length < 6)
      newErrors.password = "Password must be at least 6 characters";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    setLoading(true);

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    setLoading(false);

    if (result?.error) {
      // Toast top-right con animación de sonner
      toast.error("Invalid credentials", {
        description: "Please check your email and password",
      });
      // También marcar los campos con error
      setErrors({
        email: "Invalid email or password",
        password: "Invalid email or password",
      });
      return;
    }

    toast.success("Welcome back!", {
      description: "Successfully logged in to Casa Brunelli Admin",
    });
    router.push("/admin");
  }

  return (
    <div className="min-h-screen relative flex items-center justify-center overflow-hidden">

      {/* ── Background: Tuscan photo + dark overlay ─────────── */}
      <div className="absolute inset-0 z-0">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={BG_IMAGE}
          alt="Tuscan countryside"
          className="w-full h-full object-cover scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/60 to-black/80 backdrop-blur-sm" />
      </div>

      {/* ── Floating particles — z-20 so they sit above overlay ─ */}
      {PARTICLES.map((pos, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 rounded-full bg-admin-sage/20 z-20 pointer-events-none"
          style={{ left: pos.left, top: pos.top }}
          animate={{ y: [-10, 10, -10], opacity: [0.1, 0.3, 0.1] }}
          transition={{
            duration: 5 + i,
            repeat: Infinity,
            ease: "easeInOut",
            delay: i * 0.5,
          }}
        />
      ))}

      {/* ── Login card ───────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="relative z-10 w-full max-w-md mx-4"
      >
        <div className="bg-white/80 backdrop-blur-2xl rounded-3xl shadow-xl border border-white/40 overflow-hidden">

          {/* Header */}
          <div className="px-8 py-10 text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="w-16 h-16 mx-auto mb-6 rounded-full flex items-center justify-center bg-admin-sage/5"
            >
              <Lock className="w-8 h-8 text-admin-sage" />
            </motion.div>

            <h1
              className="text-3xl text-dark-forest mb-2"
              style={{ fontFamily: "var(--font-playfair)" }}
            >
              Casa Brunelli
            </h1>
            <p className="text-sm text-admin-sage">Admin Dashboard Access</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="px-8 pb-8 space-y-5">

            {/* Email */}
            <div className="space-y-2">
              <label
                htmlFor="email"
                className="text-sm font-medium text-dark-forest"
              >
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-admin-sage" />
                <input
                  id="email"
                  type="email"
                  placeholder="admin@casabrunelli.com"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setErrors((prev) => ({ ...prev, email: undefined }));
                  }}
                  disabled={loading}
                  className={cn(
                    "w-full pl-11 pr-4 h-12 border rounded-xl text-sm text-dark-forest",
                    "bg-white/60 backdrop-blur-sm placeholder:text-admin-sage/50",
                    "focus:outline-none focus:ring-2 focus:ring-admin-sage/20 focus:border-admin-sage",
                    "disabled:opacity-50 disabled:cursor-not-allowed transition-all",
                    errors.email
                      ? "border-red-400 focus:border-red-400 focus:ring-red-200"
                      : "border-admin-sage/20"
                  )}
                />
              </div>
              <AnimatePresence>
                {errors.email && (
                  <motion.p
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    className="text-xs text-red-600"
                  >
                    {errors.email}
                  </motion.p>
                )}
              </AnimatePresence>
            </div>

            {/* Password */}
            <div className="space-y-2">
              <label
                htmlFor="password"
                className="text-sm font-medium text-dark-forest"
              >
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-admin-sage" />
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setErrors((prev) => ({ ...prev, password: undefined }));
                  }}
                  disabled={loading}
                  className={cn(
                    "w-full pl-11 pr-11 h-12 border rounded-xl text-sm text-dark-forest",
                    "bg-white/60 backdrop-blur-sm placeholder:text-admin-sage/50",
                    "focus:outline-none focus:ring-2 focus:ring-admin-sage/20 focus:border-admin-sage",
                    "disabled:opacity-50 disabled:cursor-not-allowed transition-all",
                    errors.password
                      ? "border-red-400 focus:border-red-400 focus:ring-red-200"
                      : "border-admin-sage/20"
                  )}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={loading}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-admin-sage hover:text-dark-forest transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
              <AnimatePresence>
                {errors.password && (
                  <motion.p
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    className="text-xs text-red-600"
                  >
                    {errors.password}
                  </motion.p>
                )}
              </AnimatePresence>
            </div>

            {/* Demo Credentials — exactly as in the Figma prototype */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="bg-admin-sage/5 rounded-xl p-3 border border-admin-sage/10"
            >
              <p className="text-admin-sage text-xs font-medium mb-1.5">
                Demo Credentials:
              </p>
              <div className="space-y-0.5">
                <p className="text-dark-forest/70 text-xs font-mono">
                  admin@casabrunelli.com
                </p>
                <p className="text-dark-forest/70 text-xs font-mono">
                  admin123
                </p>
              </div>
            </motion.div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className={cn(
                "w-full h-12 flex items-center justify-center gap-2",
                "rounded-xl text-sm font-medium text-white",
                "bg-admin-sage hover:bg-admin-sage-hover",
                "shadow-md hover:shadow-lg transition-all duration-300",
                "disabled:opacity-50 disabled:cursor-not-allowed"
              )}
            >
              {loading ? (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                />
              ) : (
                <>
                  <LogIn className="w-5 h-5" />
                  Sign In to Dashboard
                </>
              )}
            </button>
          </form>
        </div>

        {/* Footer */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="text-center mt-6 text-sm text-white/50"
        >
          © 2025 Casa Brunelli
        </motion.p>
      </motion.div>
    </div>
  );
}
