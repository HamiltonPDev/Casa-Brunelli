"use client";

// ─── Imports ───────────────────────────────────────────────────
import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Calendar, Users, Edit } from "lucide-react";
import { formatDateShort, formatDateLong, formatEur } from "@/lib/utils";
import {
  MAX_GUESTS,
  MIN_GUESTS,
  COUNTRIES,
  BALANCE_DUE_DAYS_BEFORE_CHECKIN,
} from "@/lib/constants";
import {
  submitBookingRequest,
  type BookingRequestResult,
} from "@/lib/services/booking-request";
import { Card } from "@/components/ui/public/Card";
import { Button } from "@/components/ui/public/Button";
import { FormField } from "@/components/ui/public/FormField";
import { SuccessConfirmation } from "@/components/shared/public/SuccessConfirmation";

// ─── Types ─────────────────────────────────────────────────────

interface BookingFormProps {
  checkIn: string; // yyyy-MM-dd
  checkOut: string; // yyyy-MM-dd
  nights: number;
  guests?: number; // pre-filled from availability selection
  totalPrice: number; // server-calculated total for the date range
  depositAmount: number; // 30% deposit
  balanceAmount: number; // 70% balance (totalPrice - depositAmount)
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

type SubmitStatus = "idle" | "loading" | "success";

// ─── Constants ─────────────────────────────────────────────────

const PAYMENT_POLICIES = [
  { strong: "Deposit:", text: "30% due at booking confirmation" },
  {
    strong: "Balance:",
    text: `Due ${BALANCE_DUE_DAYS_BEFORE_CHECKIN} days before check-in`,
  },
  { strong: "Payment:", text: "Secure payment link via Stripe" },
  {
    strong: "Cancellation:",
    text: `Free cancellation up to ${BALANCE_DUE_DAYS_BEFORE_CHECKIN} days before check-in`,
  },
] as const;

// ─── Private Sub-components ────────────────────────────────────

/** Inline summary row for the sidebar */
function SummaryRow({
  label,
  value,
}: Readonly<{ label: string; value: string }>) {
  return (
    <div className="flex justify-between items-center text-sm">
      <span style={{ color: "#3D5243CC" }}>{label}</span>
      <span className="font-medium" style={{ color: "var(--dark-forest)" }}>
        {value}
      </span>
    </div>
  );
}

/** Stay detail chip (check-in/check-out/duration display) */
function StayDetail({
  icon,
  label,
  value,
}: Readonly<{ icon: React.ReactNode; label: string; value: string }>) {
  return (
    <div className="rounded-xl p-4" style={{ backgroundColor: "var(--cream)" }}>
      <div
        className="flex items-center gap-2 text-sm mb-1"
        style={{ color: "#3D5243CC" }}
      >
        {icon}
        {label}
      </div>
      <div
        className="font-medium text-sm"
        style={{ color: "var(--dark-forest)" }}
      >
        {value}
      </div>
    </div>
  );
}

// ─── Component ─────────────────────────────────────────────────

export function BookingForm({
  checkIn,
  checkOut,
  nights,
  guests = 2,
  totalPrice,
  depositAmount,
  balanceAmount,
}: Readonly<BookingFormProps>) {
  const router = useRouter();

  // ── State ──────────────────────────────────────────────────
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
  const [pricing, setPricing] = useState<BookingRequestResult | null>(null);

  // ── Handlers ───────────────────────────────────────────────

  function updateField<K extends keyof FormState>(
    key: K,
    value: FormState[K]
  ): void {
    setForm((prev) => ({ ...prev, [key]: value }));
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

  async function handleSubmit(e: React.SubmitEvent<HTMLFormElement>): Promise<void> {
    e.preventDefault();
    if (status === "loading" || status === "success") return;

    if (!validate()) {
      toast.error("Please fix the errors in the form");
      return;
    }

    setStatus("loading");

    const result = await submitBookingRequest({
      name: `${form.firstName.trim()} ${form.lastName.trim()}`,
      email: form.email.trim(),
      phone: form.phone.trim() || undefined,
      checkIn,
      checkOut,
      guestCount: form.guestCount,
      specialRequests: form.specialRequests.trim() || undefined,
    });

    if (!result.success) {
      toast.error(result.error);
      setStatus("idle");
      return;
    }

    setPricing(result.data);
    setStatus("success");
  }

  // ─── Success State ─────────────────────────────────────────

  if (status === "success" && pricing) {
    return (
      <SuccessConfirmation
        fullscreen
        heading="Booking Request Received"
        message={
          <>
            Thank you, {form.firstName}. We&apos;ll review your details and send
            a secure payment link to{" "}
            <strong style={{ color: "var(--dark-forest)" }}>
              {form.email}
            </strong>{" "}
            within 24 hours.
          </>
        }
        summary={[
          { label: "Check-in", value: formatDateLong(checkIn) },
          { label: "Check-out", value: formatDateLong(checkOut) },
          { label: "Guests", value: `${form.guestCount} guests` },
          {
            label: "Estimated Total",
            value: formatEur(pricing.totalPrice),
            highlight: true,
          },
        ]}
        ctaLabel="Back to Home"
        ctaAction={() => router.push("/")}
      />
    );
  }

  // ─── Form ──────────────────────────────────────────────────

  return (
    <form onSubmit={handleSubmit} noValidate>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* ── Left column: form sections ─────────────────────── */}
        <div className="lg:col-span-2 space-y-6">
          {/* Your Stay */}
          <Card title="Your Stay">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <StayDetail
                icon={<Calendar size={14} />}
                label="Check-in"
                value={formatDateShort(checkIn)}
              />
              <StayDetail
                icon={<Calendar size={14} />}
                label="Check-out"
                value={formatDateShort(checkOut)}
              />
              <StayDetail
                icon={<Users size={14} />}
                label="Duration"
                value={`${nights} night${nights !== 1 ? "s" : ""}`}
              />
            </div>
            <button
              type="button"
              onClick={() => router.push("/availability")}
              className="flex items-center gap-1.5 text-sm font-medium transition-opacity hover:opacity-70"
              style={{ color: "var(--sage-variant)" }}
            >
              <Edit size={14} />
              Change dates
            </button>
          </Card>

          {/* Guests */}
          <Card title="Guests">
            <FormField
              id="guestCount"
              type="select"
              value={String(form.guestCount)}
              onChange={(v) => updateField("guestCount", Number(v))}
              options={Array.from(
                { length: MAX_GUESTS - MIN_GUESTS + 1 },
                (_, i) => ({
                  value: String(i + MIN_GUESTS),
                  label: `${i + MIN_GUESTS} ${
                    i + MIN_GUESTS === 1 ? "guest" : "guests"
                  }`,
                })
              )}
              icon={
                <Users size={16} style={{ color: "var(--sage-variant)" }} />
              }
            />
          </Card>

          {/* Contact Information */}
          <Card title="Contact Information">
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  id="firstName"
                  label="First Name"
                  required
                  value={form.firstName}
                  onChange={(v) => updateField("firstName", v)}
                  placeholder="John"
                  autoComplete="given-name"
                  error={errors.firstName}
                />
                <FormField
                  id="lastName"
                  label="Last Name"
                  required
                  value={form.lastName}
                  onChange={(v) => updateField("lastName", v)}
                  placeholder="Smith"
                  autoComplete="family-name"
                  error={errors.lastName}
                />
              </div>
              <FormField
                id="email"
                label="Email Address"
                type="email"
                required
                value={form.email}
                onChange={(v) => updateField("email", v)}
                placeholder="john.smith@example.com"
                autoComplete="email"
                error={errors.email}
                hint="We'll send booking confirmation to this email"
              />
              <FormField
                id="phone"
                label="Phone Number"
                type="tel"
                required
                value={form.phone}
                onChange={(v) => updateField("phone", v)}
                placeholder="+44 20 1234 5678"
                autoComplete="tel"
                error={errors.phone}
              />
            </div>
          </Card>

          {/* Address */}
          <Card title="Address">
            <div className="space-y-4">
              <FormField
                id="street"
                label="Street Address"
                required
                value={form.street}
                onChange={(v) => updateField("street", v)}
                placeholder="123 Main Street"
                autoComplete="street-address"
                error={errors.street}
              />
              <FormField
                id="apt"
                label="Apartment, Suite, etc."
                optional
                value={form.apt}
                onChange={(v) => updateField("apt", v)}
                placeholder="Apt 4B"
                autoComplete="address-line2"
              />
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField
                  id="city"
                  label="City"
                  required
                  value={form.city}
                  onChange={(v) => updateField("city", v)}
                  placeholder="London"
                  autoComplete="address-level2"
                  error={errors.city}
                />
                <FormField
                  id="zip"
                  label="ZIP / Postal Code"
                  required
                  value={form.zip}
                  onChange={(v) => updateField("zip", v)}
                  placeholder="SW1A 1AA"
                  autoComplete="postal-code"
                  error={errors.zip}
                />
                <FormField
                  id="country"
                  label="Country"
                  type="select"
                  required
                  value={form.country}
                  onChange={(v) => updateField("country", v)}
                  placeholder="Select country"
                  options={COUNTRIES}
                  error={errors.country}
                />
              </div>
            </div>
          </Card>

          {/* Special Requests */}
          <Card title="Special Requests">
            <FormField
              id="specialRequests"
              type="textarea"
              value={form.specialRequests}
              onChange={(v) => updateField("specialRequests", v)}
              placeholder="Dietary requirements, accessibility needs, celebrations, arrival time…"
              hint="Optional — we'll do our best to accommodate your requests"
            />
          </Card>

          {/* Terms */}
          <Card>
            <div className="space-y-3">
              <label className="flex items-start gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={form.agreeTerms}
                  onChange={(e) => updateField("agreeTerms", e.target.checked)}
                  className="mt-1 w-4 h-4 rounded cursor-pointer"
                  style={{ accentColor: "var(--sage-variant)" }}
                />
                <span
                  className="text-sm"
                  style={{ color: "var(--dark-forest)" }}
                >
                  I agree to the{" "}
                  <a
                    href="#"
                    className="underline transition-opacity hover:opacity-70"
                    style={{ color: "var(--sage-variant)" }}
                  >
                    Terms and Conditions
                  </a>{" "}
                  and{" "}
                  <a
                    href="#"
                    className="underline transition-opacity hover:opacity-70"
                    style={{ color: "var(--sage-variant)" }}
                  >
                    Cancellation Policy
                  </a>
                </span>
              </label>
              {errors.agreeTerms && (
                <p
                  className="text-xs flex items-center gap-1"
                  style={{ color: "#C62828" }}
                >
                  {errors.agreeTerms}
                </p>
              )}
            </div>
          </Card>
        </div>

        {/* ── Right column: sticky sidebar ───────────────────── */}
        <div className="lg:col-span-1">
          <div className="sticky top-24 space-y-5">
            {/* Booking Summary */}
            <Card>
              <h3
                className="font-serif text-lg mb-5"
                style={{ color: "var(--dark-forest)" }}
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
                  style={{ color: "#3D524380" }}
                >
                  Stay Details
                </p>
                <SummaryRow label="Check-in" value={formatDateShort(checkIn)} />
                <SummaryRow
                  label="Check-out"
                  value={formatDateShort(checkOut)}
                />
                <SummaryRow
                  label="Guests"
                  value={`${form.guestCount} guest${
                    form.guestCount !== 1 ? "s" : ""
                  }`}
                />
              </div>

              {/* Duration */}
              <SummaryRow
                label="Duration"
                value={`${nights} night${nights !== 1 ? "s" : ""}`}
              />

              {/* Pricing breakdown */}
              <div
                className="mt-4 pt-4 border-t space-y-2"
                style={{ borderColor: "rgba(139,157,131,0.1)" }}
              >
                <p
                  className="text-xs font-medium uppercase tracking-wider mb-3"
                  style={{ color: "#3D524380" }}
                >
                  Estimated Pricing
                </p>
                <SummaryRow
                  label={`${nights} night${nights !== 1 ? "s" : ""} avg.`}
                  value={formatEur(totalPrice / nights)}
                />
                <div
                  className="pt-3 mt-3 border-t"
                  style={{ borderColor: "rgba(139,157,131,0.1)" }}
                >
                  <div className="flex justify-between items-center text-sm font-semibold">
                    <span style={{ color: "var(--dark-forest)" }}>Total</span>
                    <span style={{ color: "var(--dark-forest)" }}>
                      {formatEur(totalPrice)}
                    </span>
                  </div>
                </div>
                <SummaryRow
                  label="Deposit (30%)"
                  value={formatEur(depositAmount)}
                />
                <SummaryRow
                  label="Balance (70%)"
                  value={formatEur(balanceAmount)}
                />
              </div>

              <div
                className="mt-4 pt-4 border-t text-xs"
                style={{
                  borderColor: "rgba(139,157,131,0.1)",
                  color: "#3D524380",
                }}
              >
                Final pricing will be confirmed in our reply. Rates may vary by
                season.
              </div>
            </Card>

            {/* Payment & Policies */}
            <Card title="Payment &amp; Policies">
              <ul className="space-y-3 text-sm" style={{ color: "#3D5243CC" }}>
                {PAYMENT_POLICIES.map((item) => (
                  <li key={item.strong} className="flex items-start gap-2">
                    <div
                      className="w-1.5 h-1.5 rounded-full mt-2 shrink-0"
                      style={{ backgroundColor: "var(--sage-variant)" }}
                    />
                    <p>
                      <strong style={{ color: "var(--dark-forest)" }}>
                        {item.strong}
                      </strong>{" "}
                      {item.text}
                    </p>
                  </li>
                ))}
              </ul>
            </Card>

            {/* Submit button */}
            <Button
              type="submit"
              size="lg"
              loading={status === "loading"}
              loadingText="Sending Request…"
              className="w-full"
            >
              Send Booking Request
            </Button>

            <p className="text-xs text-center" style={{ color: "#3D524380" }}>
              You won&apos;t be charged yet. We&apos;ll send a secure payment
              link after reviewing your request.
            </p>
          </div>
        </div>
      </div>
    </form>
  );
}
