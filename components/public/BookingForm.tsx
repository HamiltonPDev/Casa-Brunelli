"use client";

// ─── Imports ───────────────────────────────────────────────────
import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import {
  Calendar,
  Users,
  Loader2,
  CheckCircle2,
  Edit,
  AlertCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { MAX_GUESTS, MIN_GUESTS } from "@/lib/constants";

// ─── Types ─────────────────────────────────────────────────────
interface BookingFormProps {
  checkIn: string; // yyyy-MM-dd
  checkOut: string; // yyyy-MM-dd
  nights: number;
  guests?: number; // pre-filled from availability selection
}

interface FormState {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  guestCount: number;
  street: string;
  apt: string;
  city: string;
  zip: string;
  country: string;
  specialRequests: string;
  agreeTerms: boolean;
}

interface FormErrors {
  [key: string]: string;
}

interface PricingResult {
  nights: number;
  totalPrice: number;
  depositAmount: number;
  minStayRequired: number | null;
  minStayValid: boolean;
}

type SubmitStatus = "idle" | "loading" | "success";

// ─── Constants ─────────────────────────────────────────────────
const COUNTRIES = [
  { value: "IT", label: "Italy" },
  { value: "GB", label: "United Kingdom" },
  { value: "US", label: "United States" },
  { value: "FR", label: "France" },
  { value: "DE", label: "Germany" },
  { value: "ES", label: "Spain" },
  { value: "NL", label: "Netherlands" },
  { value: "CH", label: "Switzerland" },
  { value: "AT", label: "Austria" },
  { value: "BE", label: "Belgium" },
  { value: "AU", label: "Australia" },
  { value: "CA", label: "Canada" },
] as const;

// ─── Helpers ───────────────────────────────────────────────────
function formatDate(iso: string): string {
  return new Date(iso + "T00:00:00").toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function formatDateLong(iso: string): string {
  return new Date(iso + "T00:00:00").toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function formatEur(amount: number): string {
  return new Intl.NumberFormat("en-EU", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

// ─── Sub-components ────────────────────────────────────────────
function SectionCard({
  title,
  children,
  className,
}: {
  title?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "bg-white rounded-2xl p-6 border",
        className
      )}
      style={{ borderColor: "rgba(139,157,131,0.2)" }}
    >
      {title && (
        <h3
          className="font-serif text-lg mb-4"
          style={{ color: "#2D3A2E" }}
        >
          {title}
        </h3>
      )}
      {children}
    </div>
  );
}

function FieldLabel({
  htmlFor,
  required,
  optional,
  children,
}: {
  htmlFor: string;
  required?: boolean;
  optional?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label
      htmlFor={htmlFor}
      className="block text-sm font-medium mb-1.5"
      style={{ color: "#2D3A2E" }}
    >
      {children}
      {required && <span className="ml-0.5" style={{ color: "#C62828" }}> *</span>}
      {optional && (
        <span className="ml-1 text-xs font-normal" style={{ color: "#3D5243" + "99" }}>
          (optional)
        </span>
      )}
    </label>
  );
}

function FieldInput({
  id,
  type = "text",
  value,
  onChange,
  placeholder,
  autoComplete,
  required,
  hasError,
}: {
  id: string;
  type?: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  autoComplete?: string;
  required?: boolean;
  hasError?: boolean;
}) {
  return (
    <input
      id={id}
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      autoComplete={autoComplete}
      required={required}
      className={cn(
        "w-full px-4 py-3 rounded-xl border text-sm outline-none transition-colors focus:ring-2 focus:ring-opacity-30",
        hasError && "border-red-400"
      )}
      style={{
        backgroundColor: "white",
        borderColor: hasError ? "#C62828" : "rgba(139,157,131,0.3)",
        color: "#2D3A2E",
      }}
    />
  );
}

function FieldError({ message }: { message: string }) {
  return (
    <p className="mt-1 text-xs flex items-center gap-1" style={{ color: "#C62828" }}>
      <AlertCircle size={12} />
      {message}
    </p>
  );
}

// ─── Component ─────────────────────────────────────────────────
export function BookingForm({ checkIn, checkOut, nights, guests = 2 }: BookingFormProps) {
  const router = useRouter();

  const [form, setForm] = useState<FormState>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    guestCount: guests,
    street: "",
    apt: "",
    city: "",
    zip: "",
    country: "",
    specialRequests: "",
    agreeTerms: false,
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [status, setStatus] = useState<SubmitStatus>("idle");
  const [pricing, setPricing] = useState<PricingResult | null>(null);

  function updateField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
    // Clear error on change
    if (errors[key]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[key];
        return next;
      });
    }
  }

  function validate(): boolean {
    const newErrors: FormErrors = {};

    if (!form.firstName.trim()) newErrors.firstName = "First name is required";
    if (!form.lastName.trim()) newErrors.lastName = "Last name is required";
    if (!form.email.trim()) newErrors.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      newErrors.email = "Invalid email address";
    if (!form.phone.trim()) newErrors.phone = "Phone number is required";
    if (!form.street.trim()) newErrors.street = "Street address is required";
    if (!form.city.trim()) newErrors.city = "City is required";
    if (!form.zip.trim()) newErrors.zip = "ZIP / postal code is required";
    if (!form.country) newErrors.country = "Country is required";
    if (!form.agreeTerms) newErrors.agreeTerms = "You must agree to the terms";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (status === "loading" || status === "success") return;

    if (!validate()) {
      toast.error("Please fix the errors in the form");
      return;
    }

    setStatus("loading");

    try {
      const res = await fetch("/api/booking-request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: `${form.firstName.trim()} ${form.lastName.trim()}`,
          email: form.email.trim(),
          phone: form.phone.trim() || undefined,
          checkIn,
          checkOut,
          guestCount: form.guestCount,
          specialRequests: form.specialRequests.trim() || undefined,
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

      setPricing(data.data as PricingResult);
      setStatus("success");
    } catch {
      toast.error("Network error. Please try again.");
      setStatus("idle");
    }
  }

  // ─── Success state ─────────────────────────────────────────
  if (status === "success" && pricing) {
    return (
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="min-h-[60vh] flex items-center justify-center"
        >
          <div
            className="max-w-2xl w-full text-center bg-white rounded-2xl p-10 border"
            style={{ borderColor: "rgba(139,157,131,0.2)" }}
          >
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6"
              style={{ backgroundColor: "rgba(46,125,50,0.1)" }}
            >
              <CheckCircle2 size={32} style={{ color: "#2E7D32" }} />
            </div>
            <h2
              className="font-serif text-3xl mb-4"
              style={{ color: "#2D3A2E" }}
            >
              Booking Request Received
            </h2>
            <p className="mb-8 max-w-md mx-auto" style={{ color: "#3D5243CC" }}>
              Thank you, {form.firstName}. We&apos;ll review your details and
              send a secure payment link to{" "}
              <strong style={{ color: "#2D3A2E" }}>{form.email}</strong> within
              24 hours.
            </p>

            {/* Summary grid */}
            <div
              className="rounded-xl p-6 mb-8 text-left max-w-md mx-auto"
              style={{ backgroundColor: "#F5F3EF" }}
            >
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="mb-1" style={{ color: "#3D5243" + "99" }}>
                    Check-in
                  </div>
                  <div className="font-medium" style={{ color: "#2D3A2E" }}>
                    {formatDateLong(checkIn)}
                  </div>
                </div>
                <div>
                  <div className="mb-1" style={{ color: "#3D5243" + "99" }}>
                    Check-out
                  </div>
                  <div className="font-medium" style={{ color: "#2D3A2E" }}>
                    {formatDateLong(checkOut)}
                  </div>
                </div>
                <div>
                  <div className="mb-1" style={{ color: "#3D5243" + "99" }}>
                    Guests
                  </div>
                  <div className="font-medium" style={{ color: "#2D3A2E" }}>
                    {form.guestCount} guests
                  </div>
                </div>
                <div>
                  <div className="mb-1" style={{ color: "#3D5243" + "99" }}>
                    Estimated Total
                  </div>
                  <div className="font-medium font-serif text-lg" style={{ color: "#2D3A2E" }}>
                    {formatEur(pricing.totalPrice)}
                  </div>
                </div>
              </div>
            </div>

            <button
              onClick={() => router.push("/")}
              className="inline-flex items-center justify-center px-8 py-3.5 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90 active:scale-[0.98]"
              style={{ backgroundColor: "#2D3A2E" }}
            >
              Back to Home
            </button>
          </div>
        </motion.div>
      </AnimatePresence>
    );
  }

  // ─── Form ──────────────────────────────────────────────────
  return (
    <form onSubmit={handleSubmit} noValidate>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* ── Left column: form sections ─────────────────────── */}
        <div className="lg:col-span-2 space-y-6">

          {/* Your Stay */}
          <SectionCard title="Your Stay">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div
                className="rounded-xl p-4"
                style={{ backgroundColor: "#F5F3EF" }}
              >
                <div
                  className="flex items-center gap-2 text-sm mb-1"
                  style={{ color: "#3D5243CC" }}
                >
                  <Calendar size={14} />
                  Check-in
                </div>
                <div className="font-medium text-sm" style={{ color: "#2D3A2E" }}>
                  {formatDate(checkIn)}
                </div>
              </div>
              <div
                className="rounded-xl p-4"
                style={{ backgroundColor: "#F5F3EF" }}
              >
                <div
                  className="flex items-center gap-2 text-sm mb-1"
                  style={{ color: "#3D5243CC" }}
                >
                  <Calendar size={14} />
                  Check-out
                </div>
                <div className="font-medium text-sm" style={{ color: "#2D3A2E" }}>
                  {formatDate(checkOut)}
                </div>
              </div>
              <div
                className="rounded-xl p-4"
                style={{ backgroundColor: "#F5F3EF" }}
              >
                <div
                  className="flex items-center gap-2 text-sm mb-1"
                  style={{ color: "#3D5243CC" }}
                >
                  <Users size={14} />
                  Duration
                </div>
                <div className="font-medium text-sm" style={{ color: "#2D3A2E" }}>
                  {nights} night{nights !== 1 ? "s" : ""}
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={() => router.push("/availability")}
              className="flex items-center gap-1.5 text-sm font-medium transition-opacity hover:opacity-70"
              style={{ color: "#8B9D83" }}
            >
              <Edit size={14} />
              Change dates
            </button>
          </SectionCard>

          {/* Guests */}
          <SectionCard title="Guests">
            <div className="relative">
              <Users
                size={16}
                className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none"
                style={{ color: "#8B9D83" }}
              />
              <select
                id="guestCount"
                value={form.guestCount}
                onChange={(e) => updateField("guestCount", Number(e.target.value))}
                className="w-full pl-10 pr-4 py-3 rounded-xl border text-sm outline-none appearance-none cursor-pointer focus:ring-2 focus:ring-opacity-30"
                style={{
                  backgroundColor: "white",
                  borderColor: "rgba(139,157,131,0.3)",
                  color: "#2D3A2E",
                }}
              >
                {Array.from(
                  { length: MAX_GUESTS - MIN_GUESTS + 1 },
                  (_, i) => i + MIN_GUESTS
                ).map((n) => (
                  <option key={n} value={n}>
                    {n} {n === 1 ? "guest" : "guests"}
                  </option>
                ))}
              </select>
            </div>
          </SectionCard>

          {/* Contact Information */}
          <SectionCard title="Contact Information">
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <FieldLabel htmlFor="firstName" required>First Name</FieldLabel>
                  <FieldInput
                    id="firstName"
                    value={form.firstName}
                    onChange={(v) => updateField("firstName", v)}
                    placeholder="John"
                    autoComplete="given-name"
                    required
                    hasError={!!errors.firstName}
                  />
                  {errors.firstName && <FieldError message={errors.firstName} />}
                </div>
                <div>
                  <FieldLabel htmlFor="lastName" required>Last Name</FieldLabel>
                  <FieldInput
                    id="lastName"
                    value={form.lastName}
                    onChange={(v) => updateField("lastName", v)}
                    placeholder="Smith"
                    autoComplete="family-name"
                    required
                    hasError={!!errors.lastName}
                  />
                  {errors.lastName && <FieldError message={errors.lastName} />}
                </div>
              </div>
              <div>
                <FieldLabel htmlFor="email" required>Email Address</FieldLabel>
                <FieldInput
                  id="email"
                  type="email"
                  value={form.email}
                  onChange={(v) => updateField("email", v)}
                  placeholder="john.smith@example.com"
                  autoComplete="email"
                  required
                  hasError={!!errors.email}
                />
                {errors.email ? (
                  <FieldError message={errors.email} />
                ) : (
                  <p className="mt-1 text-xs" style={{ color: "#3D5243" + "80" }}>
                    We&apos;ll send booking confirmation to this email
                  </p>
                )}
              </div>
              <div>
                <FieldLabel htmlFor="phone" required>Phone Number</FieldLabel>
                <FieldInput
                  id="phone"
                  type="tel"
                  value={form.phone}
                  onChange={(v) => updateField("phone", v)}
                  placeholder="+44 20 1234 5678"
                  autoComplete="tel"
                  required
                  hasError={!!errors.phone}
                />
                {errors.phone && <FieldError message={errors.phone} />}
              </div>
            </div>
          </SectionCard>

          {/* Address */}
          <SectionCard title="Address">
            <div className="space-y-4">
              <div>
                <FieldLabel htmlFor="street" required>Street Address</FieldLabel>
                <FieldInput
                  id="street"
                  value={form.street}
                  onChange={(v) => updateField("street", v)}
                  placeholder="123 Main Street"
                  autoComplete="street-address"
                  required
                  hasError={!!errors.street}
                />
                {errors.street && <FieldError message={errors.street} />}
              </div>
              <div>
                <FieldLabel htmlFor="apt" optional>Apartment, Suite, etc.</FieldLabel>
                <FieldInput
                  id="apt"
                  value={form.apt}
                  onChange={(v) => updateField("apt", v)}
                  placeholder="Apt 4B"
                  autoComplete="address-line2"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <FieldLabel htmlFor="city" required>City</FieldLabel>
                  <FieldInput
                    id="city"
                    value={form.city}
                    onChange={(v) => updateField("city", v)}
                    placeholder="London"
                    autoComplete="address-level2"
                    required
                    hasError={!!errors.city}
                  />
                  {errors.city && <FieldError message={errors.city} />}
                </div>
                <div>
                  <FieldLabel htmlFor="zip" required>ZIP / Postal Code</FieldLabel>
                  <FieldInput
                    id="zip"
                    value={form.zip}
                    onChange={(v) => updateField("zip", v)}
                    placeholder="SW1A 1AA"
                    autoComplete="postal-code"
                    required
                    hasError={!!errors.zip}
                  />
                  {errors.zip && <FieldError message={errors.zip} />}
                </div>
                <div>
                  <FieldLabel htmlFor="country" required>Country</FieldLabel>
                  <select
                    id="country"
                    value={form.country}
                    onChange={(e) => updateField("country", e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border text-sm outline-none appearance-none cursor-pointer focus:ring-2 focus:ring-opacity-30"
                    style={{
                      backgroundColor: "white",
                      borderColor: errors.country
                        ? "#C62828"
                        : "rgba(139,157,131,0.3)",
                      color: form.country ? "#2D3A2E" : "#3D524380",
                    }}
                  >
                    <option value="" disabled>
                      Select country
                    </option>
                    {COUNTRIES.map((c) => (
                      <option key={c.value} value={c.value}>
                        {c.label}
                      </option>
                    ))}
                  </select>
                  {errors.country && <FieldError message={errors.country} />}
                </div>
              </div>
            </div>
          </SectionCard>

          {/* Special Requests */}
          <SectionCard title="Special Requests">
            <textarea
              id="specialRequests"
              rows={4}
              value={form.specialRequests}
              onChange={(e) => updateField("specialRequests", e.target.value)}
              placeholder="Dietary requirements, accessibility needs, celebrations, arrival time…"
              className="w-full px-4 py-3 rounded-xl border text-sm outline-none resize-none focus:ring-2 focus:ring-opacity-30"
              style={{
                backgroundColor: "white",
                borderColor: "rgba(139,157,131,0.3)",
                color: "#2D3A2E",
              }}
            />
            <p className="mt-2 text-xs" style={{ color: "#3D5243" + "80" }}>
              Optional — we&apos;ll do our best to accommodate your requests
            </p>
          </SectionCard>

          {/* Terms */}
          <SectionCard>
            <div className="space-y-3">
              <label className="flex items-start gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={form.agreeTerms}
                  onChange={(e) => updateField("agreeTerms", e.target.checked)}
                  className="mt-1 w-4 h-4 rounded cursor-pointer"
                  style={{ accentColor: "#8B9D83" }}
                />
                <span className="text-sm" style={{ color: "#2D3A2E" }}>
                  I agree to the{" "}
                  <a
                    href="#"
                    className="underline transition-opacity hover:opacity-70"
                    style={{ color: "#8B9D83" }}
                  >
                    Terms and Conditions
                  </a>{" "}
                  and{" "}
                  <a
                    href="#"
                    className="underline transition-opacity hover:opacity-70"
                    style={{ color: "#8B9D83" }}
                  >
                    Cancellation Policy
                  </a>
                </span>
              </label>
              {errors.agreeTerms && (
                <FieldError message={errors.agreeTerms} />
              )}
            </div>
          </SectionCard>
        </div>

        {/* ── Right column: sticky sidebar ───────────────────── */}
        <div className="lg:col-span-1">
          <div className="sticky top-24 space-y-5">
            {/* Booking Summary */}
            <div
              className="bg-white rounded-2xl p-6 border"
              style={{ borderColor: "rgba(139,157,131,0.2)" }}
            >
              <h3
                className="font-serif text-lg mb-5"
                style={{ color: "#2D3A2E" }}
              >
                Booking Summary
              </h3>

              {/* Stay details */}
              <div
                className="pb-4 mb-4 border-b space-y-2 text-sm"
                style={{ borderColor: "rgba(139,157,131,0.1)" }}
              >
                <p
                  className="text-xs font-medium uppercase tracking-wider mb-3"
                  style={{ color: "#3D5243" + "80" }}
                >
                  Stay Details
                </p>
                <div className="flex justify-between">
                  <span style={{ color: "#3D5243CC" }}>Check-in</span>
                  <span className="font-medium" style={{ color: "#2D3A2E" }}>
                    {formatDate(checkIn)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span style={{ color: "#3D5243CC" }}>Check-out</span>
                  <span className="font-medium" style={{ color: "#2D3A2E" }}>
                    {formatDate(checkOut)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span style={{ color: "#3D5243CC" }}>Guests</span>
                  <span className="font-medium" style={{ color: "#2D3A2E" }}>
                    {form.guestCount} guest{form.guestCount !== 1 ? "s" : ""}
                  </span>
                </div>
              </div>

              {/* Duration */}
              <div className="flex justify-between items-center text-sm mb-1">
                <span style={{ color: "#3D5243CC" }}>Duration</span>
                <span className="font-medium" style={{ color: "#2D3A2E" }}>
                  {nights} night{nights !== 1 ? "s" : ""}
                </span>
              </div>

              <div
                className="mt-4 pt-4 border-t text-xs"
                style={{ borderColor: "rgba(139,157,131,0.1)", color: "#3D5243" + "80" }}
              >
                Final pricing will be confirmed in our reply. Rates vary by
                season.
              </div>
            </div>

            {/* Payment & Policies */}
            <div
              className="bg-white rounded-2xl p-6 border"
              style={{ borderColor: "rgba(139,157,131,0.2)" }}
            >
              <h3
                className="font-serif text-lg mb-4"
                style={{ color: "#2D3A2E" }}
              >
                Payment &amp; Policies
              </h3>
              <ul className="space-y-3 text-sm" style={{ color: "#3D5243CC" }}>
                {[
                  {
                    strong: "Deposit:",
                    text: "30% due at booking confirmation",
                  },
                  {
                    strong: "Balance:",
                    text: "Due 14 days before check-in",
                  },
                  {
                    strong: "Payment:",
                    text: "Secure payment link via Stripe",
                  },
                  {
                    strong: "Cancellation:",
                    text: "Free cancellation up to 14 days before check-in",
                  },
                ].map((item) => (
                  <li key={item.strong} className="flex items-start gap-2">
                    <div
                      className="w-1.5 h-1.5 rounded-full mt-2 flex-shrink-0"
                      style={{ backgroundColor: "#8B9D83" }}
                    />
                    <p>
                      <strong style={{ color: "#2D3A2E" }}>{item.strong}</strong>{" "}
                      {item.text}
                    </p>
                  </li>
                ))}
              </ul>
            </div>

            {/* Submit button */}
            <button
              type="submit"
              disabled={status === "loading"}
              className={cn(
                "w-full flex items-center justify-center gap-2 px-6 py-4 rounded-xl font-semibold text-sm text-white transition-all",
                status === "loading"
                  ? "opacity-70 cursor-not-allowed"
                  : "hover:opacity-90 active:scale-[0.98]"
              )}
              style={{ backgroundColor: "#2D3A2E" }}
            >
              {status === "loading" && (
                <Loader2 size={16} className="animate-spin" />
              )}
              {status === "loading" ? "Sending Request…" : "Send Booking Request"}
            </button>

            <p
              className="text-xs text-center"
              style={{ color: "#3D5243" + "80" }}
            >
              You won&apos;t be charged yet. We&apos;ll send a secure payment
              link after reviewing your request.
            </p>
          </div>
        </div>
      </div>
    </form>
  );
}
