"use client";

// ─── Imports ───────────────────────────────────────────────────
import { useState } from "react";
import { motion, AnimatePresence, type Variants } from "framer-motion";
import { toast } from "sonner";
import {
  Loader2,
  CheckCircle2,
  MapPin,
  Mail,
  Phone,
  Clock,
  Send,
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { APP_CONFIG } from "@/lib/constants";

// ─── Types ─────────────────────────────────────────────────────
interface FormState {
  name: string;
  email: string;
  subject: string;
  message: string;
}

type SubmitStatus = "idle" | "loading" | "success";

// ─── Constants ─────────────────────────────────────────────────
const CONTACT_DETAILS = [
  {
    icon: MapPin,
    label: "Address",
    content: (
      <>
        Via della Collina 12<br />
        53100 Siena<br />
        Tuscany, Italy
      </>
    ),
  },
  {
    icon: Mail,
    label: "Email",
    content: (
      <a
        href={`mailto:${APP_CONFIG.contactEmail}`}
        className="transition-opacity hover:opacity-70"
        style={{ color: "#8B9D83" }}
      >
        {APP_CONFIG.contactEmail}
      </a>
    ),
  },
  {
    icon: Phone,
    label: "Phone",
    content: (
      <a
        href="tel:+390577123456"
        className="transition-opacity hover:opacity-70"
        style={{ color: "#8B9D83" }}
      >
        +39 0577 123456
      </a>
    ),
  },
  {
    icon: Clock,
    label: "Response Time",
    content: "Within 24 hours",
  },
] as const;

const staggerContainer = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.08,
    },
  },
};

const staggerItem: Variants = {
  hidden: { opacity: 0, x: -12 },
  show: { opacity: 1, x: 0, transition: { duration: 0.4, type: "tween" } },
};

// ─── Component ─────────────────────────────────────────────────
export function ContactForm() {
  const [form, setForm] = useState<FormState>({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [status, setStatus] = useState<SubmitStatus>("idle");

  function updateField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (status === "loading" || status === "success") return;

    if (!form.name.trim()) {
      toast.error("Please enter your name.");
      return;
    }
    if (!form.email.trim()) {
      toast.error("Please enter your email address.");
      return;
    }
    if (!form.message.trim()) {
      toast.error("Please enter your message.");
      return;
    }

    setStatus("loading");

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name.trim(),
          email: form.email.trim(),
          subject: form.subject.trim() || "General enquiry",
          message: form.message.trim(),
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        const msg =
          data.issues?.[0]?.message ?? data.error ?? "Something went wrong";
        toast.error(msg);
        setStatus("idle");
        return;
      }

      setStatus("success");

      // Reset form after 4 seconds
      setTimeout(() => {
        setStatus("idle");
        setForm({ name: "", email: "", subject: "", message: "" });
      }, 4000);
    } catch {
      toast.error("Network error. Please try again.");
      setStatus("idle");
    }
  }

  const inputClass = cn(
    "w-full px-4 py-3 rounded-xl border text-sm outline-none transition-colors focus:ring-2 focus:ring-opacity-30"
  );
  const inputStyle = {
    backgroundColor: "white",
    borderColor: "rgba(139,157,131,0.3)",
    color: "#2D3A2E",
  };
  const labelClass = "block text-sm font-medium mb-1.5";
  const labelStyle = { color: "#2D3A2E" };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
      {/* ── Left: Form (2 cols) ─────────────────────────────── */}
      <div className="lg:col-span-2">
        <div
          className="bg-white rounded-2xl p-6 border"
          style={{ borderColor: "rgba(139,157,131,0.2)" }}
        >
          <h3 className="font-serif text-lg mb-6" style={{ color: "#2D3A2E" }}>
            Send us a Message
          </h3>

          <AnimatePresence mode="wait">
            {status === "success" ? (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3 }}
                className="py-12 text-center"
              >
                <div
                  className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6"
                  style={{ backgroundColor: "rgba(46,125,50,0.1)" }}
                >
                  <CheckCircle2 size={32} style={{ color: "#2E7D32" }} />
                </div>
                <h3
                  className="font-serif text-2xl mb-3"
                  style={{ color: "#2D3A2E" }}
                >
                  Message Sent!
                </h3>
                <p
                  className="max-w-md mx-auto text-sm"
                  style={{ color: "#3D5243CC" }}
                >
                  Thank you,{" "}
                  <strong style={{ color: "#2D3A2E" }}>
                    {form.name.split(" ")[0]}
                  </strong>
                  . We&apos;ll get back to you within 24 hours.
                </p>
              </motion.div>
            ) : (
              <motion.form
                key="form"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onSubmit={handleSubmit}
                className="space-y-5"
                noValidate
              >
                {/* Name + Email */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="contact-name" className={labelClass} style={labelStyle}>
                      Full Name <span style={{ color: "#C62828" }}>*</span>
                    </label>
                    <input
                      id="contact-name"
                      type="text"
                      required
                      autoComplete="name"
                      value={form.name}
                      onChange={(e) => updateField("name", e.target.value)}
                      placeholder="Maria Rossi"
                      className={inputClass}
                      style={inputStyle}
                    />
                  </div>
                  <div>
                    <label htmlFor="contact-email" className={labelClass} style={labelStyle}>
                      Email Address <span style={{ color: "#C62828" }}>*</span>
                    </label>
                    <input
                      id="contact-email"
                      type="email"
                      required
                      autoComplete="email"
                      value={form.email}
                      onChange={(e) => updateField("email", e.target.value)}
                      placeholder="you@example.com"
                      className={inputClass}
                      style={inputStyle}
                    />
                  </div>
                </div>

                {/* Subject */}
                <div>
                  <label htmlFor="contact-subject" className={labelClass} style={labelStyle}>
                    Subject{" "}
                    <span
                      className="text-xs font-normal"
                      style={{ color: "#3D5243" + "80" }}
                    >
                      (optional)
                    </span>
                  </label>
                  <input
                    id="contact-subject"
                    type="text"
                    value={form.subject}
                    onChange={(e) => updateField("subject", e.target.value)}
                    placeholder="Question about availability, facilities…"
                    className={inputClass}
                    style={inputStyle}
                  />
                </div>

                {/* Message */}
                <div>
                  <label htmlFor="contact-message" className={labelClass} style={labelStyle}>
                    Message <span style={{ color: "#C62828" }}>*</span>
                  </label>
                  <textarea
                    id="contact-message"
                    required
                    rows={6}
                    value={form.message}
                    onChange={(e) => updateField("message", e.target.value)}
                    placeholder="Tell us how we can help…"
                    className={cn(inputClass, "resize-none")}
                    style={inputStyle}
                  />
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  disabled={status === "loading"}
                  className={cn(
                    "flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl text-sm font-semibold text-white transition-all",
                    status === "loading"
                      ? "opacity-70 cursor-not-allowed"
                      : "hover:opacity-90 active:scale-[0.98]"
                  )}
                  style={{ backgroundColor: "#2D3A2E" }}
                >
                  {status === "loading" ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <Send size={16} />
                  )}
                  {status === "loading" ? "Sending…" : "Send Message"}
                </button>
              </motion.form>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* ── Right: Details sidebar (1 col) ──────────────────── */}
      <div className="lg:col-span-1 space-y-6">
        {/* Contact Details */}
        <div
          className="bg-white rounded-2xl p-6 border"
          style={{ borderColor: "rgba(139,157,131,0.2)" }}
        >
          <h3
            className="font-serif text-lg mb-6"
            style={{ color: "#2D3A2E" }}
          >
            Contact Details
          </h3>

          <motion.ul
            variants={staggerContainer}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-50px" }}
            className="space-y-5"
          >
            {CONTACT_DETAILS.map((item) => {
              const Icon = item.icon;
              return (
                <motion.li
                  key={item.label}
                  variants={staggerItem}
                  className="flex items-start gap-4"
                >
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: "rgba(139,157,131,0.1)" }}
                  >
                    <Icon size={18} style={{ color: "#8B9D83" }} />
                  </div>
                  <div>
                    <div
                      className="font-medium text-sm mb-0.5"
                      style={{ color: "#2D3A2E" }}
                    >
                      {item.label}
                    </div>
                    <div className="text-sm" style={{ color: "#3D5243CC" }}>
                      {item.content}
                    </div>
                  </div>
                </motion.li>
              );
            })}
          </motion.ul>
        </div>

        {/* Map placeholder */}
        <div
          className="bg-white rounded-2xl p-6 border"
          style={{ borderColor: "rgba(139,157,131,0.2)" }}
        >
          <h3
            className="font-serif text-lg mb-4"
            style={{ color: "#2D3A2E" }}
          >
            Location
          </h3>

          <div
            className="aspect-[4/3] rounded-xl border overflow-hidden relative"
            style={{
              backgroundColor: "#F5F3EF",
              borderColor: "rgba(139,157,131,0.2)",
            }}
          >
            {/* Gradient bg */}
            <div
              className="absolute inset-0"
              style={{
                background:
                  "linear-gradient(135deg, rgba(139,157,131,0.05) 0%, rgba(192,175,126,0.05) 100%)",
              }}
            />
            {/* Grid lines decoration */}
            <svg
              className="absolute inset-0 w-full h-full opacity-10"
              xmlns="http://www.w3.org/2000/svg"
            >
              <defs>
                <pattern
                  id="grid"
                  width="30"
                  height="30"
                  patternUnits="userSpaceOnUse"
                >
                  <path
                    d="M 30 0 L 0 0 0 30"
                    fill="none"
                    stroke="#8B9D83"
                    strokeWidth="0.5"
                  />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#grid)" />
            </svg>

            {/* Pin */}
            <div className="relative z-10 flex flex-col items-center justify-center h-full">
              <motion.div
                animate={{ y: [0, -6, 0] }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className="w-12 h-12 rounded-full flex items-center justify-center mb-3 shadow-lg"
                style={{ backgroundColor: "#8B9D83" }}
              >
                <MapPin size={22} style={{ color: "white" }} />
              </motion.div>
              <p className="text-sm font-medium" style={{ color: "#2D3A2E" }}>
                Siena, Tuscany
              </p>
              <p
                className="text-xs mt-1"
                style={{ color: "#3D5243" + "80" }}
              >
                Italy
              </p>
            </div>
          </div>

          <p
            className="text-xs text-center mt-3"
            style={{ color: "#3D5243CC" }}
          >
            15 minutes from Siena city centre, in the heart of the Tuscan
            countryside
          </p>
        </div>

        {/* CTA card */}
        <div
          className="rounded-2xl p-5 border"
          style={{
            backgroundColor: "#F5F3EF",
            borderColor: "rgba(139,157,131,0.2)",
          }}
        >
          <p
            className="font-serif text-base mb-2"
            style={{ color: "#2D3A2E" }}
          >
            Ready to book?
          </p>
          <p className="text-sm mb-4" style={{ color: "#3D5243CC" }}>
            Check live availability and select your dates to start a booking
            request.
          </p>
          <Link
            href="/availability"
            className="inline-flex items-center px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90 active:scale-[0.98]"
            style={{ backgroundColor: "#2D3A2E" }}
          >
            View Availability
          </Link>
        </div>
      </div>
    </div>
  );
}
