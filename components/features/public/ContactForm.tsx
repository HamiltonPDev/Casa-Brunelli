"use client";

// ─── Imports ───────────────────────────────────────────────────
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence, type Variants } from "framer-motion";
import { toast } from "sonner";
import { CheckCircle2, MapPin, Mail, Phone, Clock, Send } from "lucide-react";
import Link from "next/link";
import { APP_CONFIG } from "@/lib/constants";
import { Card } from "@/components/ui/public/Card";
import { Button } from "@/components/ui/public/Button";
import { FormField } from "@/components/ui/public/FormField";

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
        Via della Collina 12
        <br />
        53100 Siena
        <br />
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
        style={{ color: "var(--sage-variant)" }}
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
        style={{ color: "var(--sage-variant)" }}
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
  const resetTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── Cleanup timeout on unmount ────────────────────────────
  useEffect(() => {
    return () => {
      if (resetTimerRef.current) clearTimeout(resetTimerRef.current);
    };
  }, []);

  function updateField<K extends keyof FormState>(
    key: K,
    value: FormState[K]
  ): void {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent): Promise<void> {
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
      resetTimerRef.current = setTimeout(() => {
        setStatus("idle");
        setForm({ name: "", email: "", subject: "", message: "" });
      }, 4000);
    } catch {
      toast.error("Network error. Please try again.");
      setStatus("idle");
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
      {/* ── Left: Form (2 cols) ─────────────────────────────── */}
      <div className="lg:col-span-2">
        <Card title="Send us a Message">
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
                  style={{ color: "var(--dark-forest)" }}
                >
                  Message Sent!
                </h3>
                <p
                  className="max-w-md mx-auto text-sm"
                  style={{ color: "#3D5243CC" }}
                >
                  Thank you,{" "}
                  <strong style={{ color: "var(--dark-forest)" }}>
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
                  <FormField
                    id="contact-name"
                    label="Full Name"
                    required
                    value={form.name}
                    onChange={(v) => updateField("name", v)}
                    placeholder="Maria Rossi"
                    autoComplete="name"
                  />
                  <FormField
                    id="contact-email"
                    label="Email Address"
                    type="email"
                    required
                    value={form.email}
                    onChange={(v) => updateField("email", v)}
                    placeholder="you@example.com"
                    autoComplete="email"
                  />
                </div>

                {/* Subject */}
                <FormField
                  id="contact-subject"
                  label="Subject"
                  optional
                  value={form.subject}
                  onChange={(v) => updateField("subject", v)}
                  placeholder="Question about availability, facilities…"
                />

                {/* Message */}
                <FormField
                  id="contact-message"
                  label="Message"
                  type="textarea"
                  required
                  rows={6}
                  value={form.message}
                  onChange={(v) => updateField("message", v)}
                  placeholder="Tell us how we can help…"
                />

                {/* Submit */}
                <Button
                  type="submit"
                  loading={status === "loading"}
                  loadingText="Sending…"
                >
                  <Send size={16} />
                  Send Message
                </Button>
              </motion.form>
            )}
          </AnimatePresence>
        </Card>
      </div>

      {/* ── Right: Details sidebar (1 col) ──────────────────── */}
      <div className="lg:col-span-1 space-y-6">
        {/* Contact Details */}
        <Card title="Contact Details">
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
                    <Icon size={18} style={{ color: "var(--sage-variant)" }} />
                  </div>
                  <div>
                    <div
                      className="font-medium text-sm mb-0.5"
                      style={{ color: "var(--dark-forest)" }}
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
        </Card>

        {/* Map placeholder */}
        <Card>
          <h3
            className="font-serif text-lg mb-4"
            style={{ color: "var(--dark-forest)" }}
          >
            Location
          </h3>

          <div
            className="aspect-[4/3] rounded-xl border overflow-hidden relative"
            style={{
              backgroundColor: "var(--cream)",
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
                style={{ backgroundColor: "var(--sage-variant)" }}
              >
                <MapPin size={22} style={{ color: "white" }} />
              </motion.div>
              <p
                className="text-sm font-medium"
                style={{ color: "var(--dark-forest)" }}
              >
                Siena, Tuscany
              </p>
              <p className="text-xs mt-1" style={{ color: "#3D524380" }}>
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
        </Card>

        {/* CTA card */}
        <div
          className="rounded-2xl p-5 border"
          style={{
            backgroundColor: "var(--cream)",
            borderColor: "rgba(139,157,131,0.2)",
          }}
        >
          <p
            className="font-serif text-base mb-2"
            style={{ color: "var(--dark-forest)" }}
          >
            Ready to book?
          </p>
          <p className="text-sm mb-4" style={{ color: "#3D5243CC" }}>
            Check live availability and select your dates to start a booking
            request.
          </p>
          <Button href="/availability">View Availability</Button>
        </div>
      </div>
    </div>
  );
}
