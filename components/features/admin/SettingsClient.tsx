"use client";

// ─── Imports ───────────────────────────────────────────────────
import { useState } from "react";
import { toast } from "sonner";
import {
  Upload,
  Copy,
  Check,
  Send,
  Eye,
  Trash2,
  UserPlus,
  CheckCircle,
  AlertTriangle,
  X,
} from "lucide-react";
import { AdminCard } from "@/components/ui/admin/AdminCard";
import { AdminButton } from "@/components/ui/admin/AdminButton";
import { AdminField } from "@/components/ui/admin/AdminField";
import { cn } from "@/lib/utils";

// ─── Types ─────────────────────────────────────────────────────
type SettingsTab = "general" | "payments" | "email" | "access";

interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  category: string;
  updatedAt: string;
}

interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: string;
  lastLoginAt: string | null;
}

interface SettingsClientProps {
  emailTemplates: EmailTemplate[];
  adminUsers: AdminUser[];
}

// ─── Component ─────────────────────────────────────────────────
export function SettingsClient({
  emailTemplates,
  adminUsers,
}: SettingsClientProps) {
  const [activeTab, setActiveTab] = useState<SettingsTab>("general");
  const [copied, setCopied] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);

  // General form state
  const [propertyName, setPropertyName] = useState("Casa Brunelli");
  const [address, setAddress] = useState(
    "Via della Collina 12, 53100 Siena, Tuscany, Italy"
  );
  const [contactEmail, setContactEmail] = useState("info@casabrunelli.it");
  const [phone, setPhone] = useState("+39 0577 123456");
  const [locale, setLocale] = useState("en-GB");
  const [currency, setCurrency] = useState("EUR");

  // Payments state
  const [depositPercentage, setDepositPercentage] = useState("30");
  const [refundWindow, setRefundWindow] = useState("14");
  const [taxRate, setTaxRate] = useState("10");

  // Email state
  const [fromName, setFromName] = useState("Casa Brunelli");
  const [fromEmail, setFromEmail] = useState("noreply@casabrunelli.it");

  function markChanged<T>(setter: (v: T) => void) {
    return (v: T) => {
      setter(v);
      setHasChanges(true);
    };
  }

  function handleCopy(text: string, key: string) {
    void navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  }

  function handleSave() {
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      setHasChanges(false);
      toast.success("Settings saved successfully");
    }, 800);
  }

  function handleDiscard() {
    setHasChanges(false);
    toast.info("Changes discarded");
  }

  const TABS: { id: SettingsTab; label: string }[] = [
    { id: "general", label: "General" },
    { id: "payments", label: "Payments" },
    { id: "email", label: "Email" },
    { id: "access", label: "Access" },
  ];

  return (
    <div className="space-y-6 pb-24">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Settings</h1>
        <p className="text-sm text-gray-500 mt-1">
          Manage your property and admin preferences
        </p>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <div className="flex gap-6">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "pb-3 px-1 font-medium transition-colors border-b-2 text-sm",
                activeTab === tab.id
                  ? "border-admin-sage text-admin-sage"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── General ────────────────────────────────────────── */}
      {activeTab === "general" && (
        <div className="space-y-6">
          <AdminCard title="Property Information">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <AdminField
                  label="Property Name"
                  value={propertyName}
                  onChange={markChanged(setPropertyName)}
                />
              </div>
              <div className="md:col-span-2">
                <AdminField
                  type="textarea"
                  label="Address"
                  value={address}
                  onChange={markChanged(setAddress)}
                />
              </div>
              <AdminField
                type="email"
                label="Contact Email"
                value={contactEmail}
                onChange={markChanged(setContactEmail)}
              />
              <AdminField
                label="Phone"
                value={phone}
                onChange={markChanged(setPhone)}
              />
              <AdminField
                type="select"
                label="Locale"
                value={locale}
                onChange={markChanged(setLocale)}
                options={[
                  { value: "en-GB", label: "English (UK)" },
                  { value: "en-US", label: "English (US)" },
                  { value: "it-IT", label: "Italiano" },
                  { value: "fr-FR", label: "Français" },
                ]}
              />
              <AdminField
                type="select"
                label="Currency"
                value={currency}
                onChange={markChanged(setCurrency)}
                options={[
                  { value: "EUR", label: "Euro (€)" },
                  { value: "USD", label: "US Dollar ($)" },
                  { value: "GBP", label: "British Pound (£)" },
                ]}
              />
            </div>
          </AdminCard>

          <AdminCard title="Brand">
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Logo
                </label>
                <div className="flex items-center gap-4">
                  <div className="w-32 h-32 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center bg-gray-50">
                    <Upload className="w-8 h-8 text-gray-400" />
                  </div>
                  <div className="flex-1">
                    <AdminButton
                      variant="secondary"
                      size="sm"
                      icon={<Upload className="w-4 h-4" />}
                    >
                      Upload Logo
                    </AdminButton>
                    <p className="text-sm text-gray-500 mt-2">
                      SVG, PNG or JPG. Max 2MB.
                    </p>
                  </div>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Primary Color
                </label>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-lg bg-admin-sage border border-gray-300" />
                  <div>
                    <p className="text-sm text-gray-600 font-mono">#6B705C</p>
                    <p className="text-sm text-gray-500">
                      Defined in brand guidelines
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </AdminCard>
        </div>
      )}

      {/* ── Payments ───────────────────────────────────────── */}
      {activeTab === "payments" && (
        <div className="space-y-6">
          <AdminCard title="Stripe Integration">
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-700" />
                  <div>
                    <p className="font-medium text-gray-900">Connected</p>
                    <p className="text-sm text-gray-600">
                      Account: acct_1A2B3C4D5E6F
                    </p>
                  </div>
                </div>
                <AdminButton variant="secondary" size="sm">
                  Disconnect
                </AdminButton>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Webhook Secret
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value="whsec_••••••••••••••••••••••••••••"
                    readOnly
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 font-mono text-sm"
                  />
                  <button
                    onClick={() => handleCopy("whsec_example", "webhook")}
                    className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    {copied === "webhook" ? (
                      <Check className="w-4 h-4 text-green-600" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          </AdminCard>

          <AdminCard title="Booking Rules">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <AdminField
                  label="Deposit Percentage"
                  value={depositPercentage}
                  onChange={markChanged(setDepositPercentage)}
                />
                <p className="text-sm text-gray-500 mt-1">Default: 30%</p>
              </div>
              <div>
                <AdminField
                  label="Refund Window (days)"
                  value={refundWindow}
                  onChange={markChanged(setRefundWindow)}
                />
                <p className="text-sm text-gray-500 mt-1">
                  Days before check-in
                </p>
              </div>
              <div>
                <AdminField
                  label="Tax Rate (%)"
                  value={taxRate}
                  onChange={markChanged(setTaxRate)}
                />
                <p className="text-sm text-gray-500 mt-1">
                  Applied to all bookings
                </p>
              </div>
            </div>
          </AdminCard>
        </div>
      )}

      {/* ── Email ──────────────────────────────────────────── */}
      {activeTab === "email" && (
        <div className="space-y-6">
          <AdminCard title="Email Provider">
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-4 bg-gray-50 border border-gray-200 rounded-lg">
                <div className="flex-1">
                  <p className="font-medium text-gray-900">Resend</p>
                  <p className="text-sm text-gray-600">
                    Transactional email service
                  </p>
                </div>
                <AdminButton
                  variant="ghost"
                  size="sm"
                  icon={<Send className="w-4 h-4" />}
                >
                  Send Test Email
                </AdminButton>
              </div>
            </div>
          </AdminCard>

          <AdminCard title="Email Configuration">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <AdminField
                label="From Name"
                value={fromName}
                onChange={markChanged(setFromName)}
              />
              <AdminField
                type="email"
                label="From Email"
                value={fromEmail}
                onChange={markChanged(setFromEmail)}
              />
            </div>
          </AdminCard>

          <AdminCard title="Email Templates">
            <div className="overflow-x-auto -mx-6 -mb-6">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50">
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                      Template
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                      Category
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                      Last Updated
                    </th>
                    <th className="px-6 py-3 text-right text-sm font-semibold text-gray-700">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {emailTemplates.map((t) => (
                    <tr
                      key={t.id}
                      className="border-b border-gray-100 hover:bg-gray-50"
                    >
                      <td className="px-6 py-4 font-medium text-gray-900">
                        {t.name}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {t.category.replace("_", " ").toLowerCase()}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {new Date(t.updatedAt).toLocaleDateString("en-GB")}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-3">
                          <button className="text-sm text-admin-sage hover:text-admin-sage-hover font-medium flex items-center gap-1">
                            <Eye className="w-4 h-4" />
                            Preview
                          </button>
                          <span className="text-gray-300">|</span>
                          <button className="text-sm text-admin-sage hover:text-admin-sage-hover font-medium">
                            Edit
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </AdminCard>
        </div>
      )}

      {/* ── Access ─────────────────────────────────────────── */}
      {activeTab === "access" && (
        <div className="space-y-6">
          <AdminCard
            title="Users"
            subtitle="Manage admin access"
            actions={
              <AdminButton
                variant="primary"
                size="sm"
                icon={<UserPlus className="w-4 h-4" />}
                onClick={() => setShowInviteModal(true)}
              >
                Invite User
              </AdminButton>
            }
          >
            <div className="overflow-x-auto -mx-6 -mb-6">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50">
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                      Name
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                      Role
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                      Last Login
                    </th>
                    <th className="px-6 py-3 text-right text-sm font-semibold text-gray-700">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {adminUsers.map((user, idx) => (
                    <tr
                      key={user.id}
                      className="border-b border-gray-100 hover:bg-gray-50"
                    >
                      <td className="px-6 py-4 font-medium text-gray-900">
                        {user.name}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {user.email}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={cn(
                            "inline-flex items-center px-2 py-1 rounded-md text-xs font-medium",
                            user.role === "SUPER_ADMIN" || user.role === "ADMIN"
                              ? "bg-admin-sage/10 text-admin-sage"
                              : "bg-gray-100 text-gray-700"
                          )}
                        >
                          {user.role === "SUPER_ADMIN"
                            ? "Super Admin"
                            : user.role === "ADMIN"
                            ? "Admin"
                            : "Viewer"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {user.lastLoginAt
                          ? new Date(user.lastLoginAt).toLocaleDateString(
                              "en-GB"
                            )
                          : "Never"}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          disabled={idx === 0}
                          className="text-sm text-red-600 hover:text-red-700 font-medium flex items-center gap-1 ml-auto disabled:opacity-30 disabled:cursor-not-allowed"
                        >
                          <Trash2 className="w-4 h-4" />
                          Remove
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </AdminCard>

          <AdminCard title="Danger Zone">
            <div className="flex items-start gap-4 p-4 border-2 border-red-200 rounded-lg bg-red-50">
              <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-gray-900 mb-1">
                  Remove User Access
                </p>
                <p className="text-sm text-gray-600">
                  Removing a user immediately revokes their access. This cannot
                  be undone. Use the "Remove" button in the users table above.
                </p>
              </div>
            </div>
          </AdminCard>
        </div>
      )}

      {/* Sticky save bar */}
      {hasChanges && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-50">
          <div className="max-w-screen-xl mx-auto px-8 py-4 flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse" />
              You have unsaved changes
            </div>
            <div className="flex items-center gap-3">
              <AdminButton variant="secondary" onClick={handleDiscard}>
                Discard
              </AdminButton>
              <AdminButton
                variant="primary"
                loading={saving}
                onClick={handleSave}
              >
                Save Changes
              </AdminButton>
            </div>
          </div>
        </div>
      )}

      {/* Invite user modal */}
      {showInviteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-900">
                Invite User
              </h3>
              <button
                onClick={() => setShowInviteModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              <AdminField
                type="email"
                label="Email Address"
                placeholder="user@example.com"
              />
              <AdminField
                type="select"
                label="Role"
                options={[
                  { value: "ADMIN", label: "Admin — Full access" },
                  { value: "VIEWER", label: "Viewer — Read-only access" },
                ]}
              />
              <div className="flex items-center gap-3 pt-4">
                <AdminButton
                  variant="secondary"
                  onClick={() => setShowInviteModal(false)}
                  className="flex-1"
                >
                  Cancel
                </AdminButton>
                <AdminButton
                  variant="primary"
                  className="flex-1"
                  onClick={() => {
                    toast.success("Invite sent!");
                    setShowInviteModal(false);
                  }}
                >
                  Send Invite
                </AdminButton>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
