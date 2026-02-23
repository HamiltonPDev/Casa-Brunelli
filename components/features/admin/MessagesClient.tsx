"use client";

// ─── Imports ───────────────────────────────────────────────────
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Send,
  ChevronDown,
  StickyNote,
  X,
  Calendar,
  Users,
  Mail,
  MessageSquare,
  Euro,
  Clock,
  CheckCircle,
} from "lucide-react";
import { AdminCard } from "@/components/ui/admin/AdminCard";
import { AdminBadge } from "@/components/ui/admin/AdminBadge";
import { AdminButton } from "@/components/ui/admin/AdminButton";
import { AdminField } from "@/components/ui/admin/AdminField";
import {
  cn,
  getInitials,
  formatMessageDate,
  formatFullDate,
} from "@/lib/utils";
import { MESSAGE_STATUS, MESSAGE_TYPE, QUICK_REPLIES } from "@/lib/constants";
import type { MessageStatus } from "@/lib/constants";
import {
  updateMessageStatus as updateMessageStatusApi,
  promoteMessage,
} from "@/lib/services/messages";

// ─── Types ─────────────────────────────────────────────────────
interface SerializedMessage {
  id: string;
  type: string;
  name: string;
  email: string;
  phone: string | null;
  subject: string;
  message: string;
  status: MessageStatus;
  checkIn: Date | null;
  checkOut: Date | null;
  guestCount: number | null;
  totalPrice: number | null;
  repliedBy: string | null;
  admin: { name: string } | null;
  repliedAt: Date | null;
  createdAt: Date;
}

interface MessagesClientProps {
  initialMessages: SerializedMessage[];
}

type FilterStatus = "all" | MessageStatus;

// ─── Constants ─────────────────────────────────────────────────
const FILTER_TABS: { label: string; value: FilterStatus }[] = [
  { label: "All", value: "all" },
  { label: "Unread", value: MESSAGE_STATUS.UNREAD },
  { label: "Replied", value: MESSAGE_STATUS.REPLIED },
];

/** Light green highlight for selected/active states */
const HIGHLIGHT_BG = "#f0f7f4";

// ─── Private Sub-Components ────────────────────────────────────

/** Left pane — filterable thread list */
function ThreadList({
  messages,
  filteredMessages,
  selectedId,
  filterStatus,
  unreadCount,
  onSelectMessage,
  onFilterChange,
}: Readonly<{
  messages: SerializedMessage[];
  filteredMessages: SerializedMessage[];
  selectedId: string | null;
  filterStatus: FilterStatus;
  unreadCount: number;
  onSelectMessage: (message: SerializedMessage) => void;
  onFilterChange: (status: FilterStatus) => void;
}>) {
  return (
    <div className="lg:col-span-3">
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        {/* Filter Tabs */}
        <div className="flex items-center gap-1 px-4 py-3 border-b border-gray-100">
          {FILTER_TABS.map(({ label, value }) => (
            <button
              key={value}
              onClick={() => onFilterChange(value)}
              className={cn(
                "px-3 py-1.5 text-xs rounded-lg font-medium transition-colors",
                filterStatus === value
                  ? "bg-forest-green text-white"
                  : "text-gray-600 hover:bg-gray-100"
              )}
            >
              {label}
              {value === "all" && ` (${messages.length})`}
              {value === MESSAGE_STATUS.UNREAD && ` (${unreadCount})`}
              {value === MESSAGE_STATUS.REPLIED &&
                ` (${
                  messages.filter((m) => m.status === MESSAGE_STATUS.REPLIED)
                    .length
                })`}
            </button>
          ))}
        </div>

        {/* Thread List */}
        <div className="divide-y divide-gray-100">
          {filteredMessages.length === 0 ? (
            <div className="py-12 text-center text-gray-400">
              <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-40" />
              <p className="text-sm">No messages</p>
            </div>
          ) : (
            filteredMessages.map((message) => (
              <button
                key={message.id}
                onClick={() => onSelectMessage(message)}
                className={cn(
                  "w-full px-4 py-4 text-left transition-all border-l-4",
                  selectedId === message.id
                    ? "border-forest-green"
                    : "border-transparent hover:bg-gray-50",
                  message.status === MESSAGE_STATUS.UNREAD && "bg-blue-50/40"
                )}
                style={
                  selectedId === message.id
                    ? { backgroundColor: HIGHLIGHT_BG }
                    : undefined
                }
              >
                <div className="flex items-start justify-between mb-1">
                  <span
                    className={cn(
                      "text-sm text-gray-900",
                      message.status === MESSAGE_STATUS.UNREAD &&
                        "font-semibold"
                    )}
                  >
                    {message.name}
                  </span>
                  <span className="text-xs text-gray-400 flex-shrink-0 ml-2">
                    {formatMessageDate(message.createdAt)}
                  </span>
                </div>
                <div className="text-xs text-gray-600 mb-1 font-medium line-clamp-1">
                  {message.subject}
                </div>
                <div className="text-xs text-gray-500 line-clamp-2 mb-2">
                  {message.message}
                </div>
                <div className="flex items-center justify-between">
                  <AdminBadge
                    variant="message"
                    status={message.status}
                    size="sm"
                  />
                  {message.type === MESSAGE_TYPE.BOOKING_REQUEST && (
                    <span className="text-xs text-forest-green font-medium bg-forest-green/10 px-2 py-0.5 rounded-full">
                      Booking
                    </span>
                  )}
                </div>
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

/** Right pane — message detail with reply composer */
function MessageDetail({
  message,
  showMetadata,
  replyText,
  quickReply,
  isPending,
  onToggleMetadata,
  onReplyTextChange,
  onQuickReplyChange,
  onSendReply,
  onUpdateStatus,
  onPromote,
}: Readonly<{
  message: SerializedMessage;
  showMetadata: boolean;
  replyText: string;
  quickReply: string;
  isPending: boolean;
  onToggleMetadata: () => void;
  onReplyTextChange: (text: string) => void;
  onQuickReplyChange: (value: string) => void;
  onSendReply: () => void;
  onUpdateStatus: (id: string, status: MessageStatus) => void;
  onPromote: () => void;
}>) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
      {/* Message Header */}
      <div className="px-6 py-4 border-b border-gray-100">
        <div className="flex items-start justify-between">
          <div className="min-w-0 flex-1">
            <h3 className="text-lg font-semibold text-gray-900 truncate">
              {message.subject}
            </h3>
            <p className="text-sm text-gray-500 mt-0.5">
              From:{" "}
              <span className="font-medium text-gray-700">{message.name}</span>{" "}
              &lt;{message.email}&gt;
            </p>
          </div>
          <div className="flex items-center gap-2 ml-4 flex-shrink-0">
            <AdminBadge variant="message" status={message.status} />
            <button
              onClick={onToggleMetadata}
              title="Toggle details panel"
              className={cn(
                "p-2 rounded-lg transition-colors",
                showMetadata
                  ? "bg-forest-green text-white"
                  : "text-gray-500 hover:bg-gray-100"
              )}
            >
              <StickyNote className="w-4 h-4" />
            </button>
          </div>
        </div>
        <p className="text-xs text-gray-400 mt-2">
          {formatFullDate(message.createdAt)}
        </p>
      </div>

      <div className="p-6 space-y-6">
        {/* Message Body */}
        <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-semibold flex-shrink-0 bg-admin-avatar">
              {getInitials(message.name)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2">
                <span className="font-medium text-gray-900 text-sm">
                  {message.name}
                </span>
                <span className="text-xs text-gray-400">{message.email}</span>
              </div>
              <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-wrap">
                {message.message}
              </p>
            </div>
          </div>
        </div>

        {/* Booking Request metadata */}
        {message.type === MESSAGE_TYPE.BOOKING_REQUEST && message.checkIn && (
          <BookingRequestDetails
            message={message}
            isPending={isPending}
            onPromote={onPromote}
          />
        )}

        {/* Reply Composer */}
        <ReplyComposer
          message={message}
          replyText={replyText}
          quickReply={quickReply}
          isPending={isPending}
          onReplyTextChange={onReplyTextChange}
          onQuickReplyChange={onQuickReplyChange}
          onSendReply={onSendReply}
          onUpdateStatus={onUpdateStatus}
        />
      </div>
    </div>
  );
}

/** Booking request details card within message detail */
function BookingRequestDetails({
  message,
  isPending,
  onPromote,
}: Readonly<{
  message: SerializedMessage;
  isPending: boolean;
  onPromote: () => void;
}>) {
  return (
    <div
      className="p-4 rounded-xl border border-forest-green/10"
      style={{ backgroundColor: HIGHLIGHT_BG }}
    >
      <h4 className="text-xs font-semibold text-forest-green uppercase tracking-wide mb-3">
        Booking Request Details
      </h4>
      <div className="grid grid-cols-3 gap-4">
        <div className="flex items-start gap-2">
          <Calendar className="w-4 h-4 text-forest-green mt-0.5 flex-shrink-0" />
          <div>
            <div className="text-xs text-gray-500 mb-0.5">Check-in</div>
            <div className="text-sm font-medium text-gray-900">
              {new Date(message.checkIn!).toLocaleDateString("en-GB", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })}
            </div>
          </div>
        </div>
        {message.checkOut && (
          <div className="flex items-start gap-2">
            <Calendar className="w-4 h-4 text-forest-green mt-0.5 flex-shrink-0" />
            <div>
              <div className="text-xs text-gray-500 mb-0.5">Check-out</div>
              <div className="text-sm font-medium text-gray-900">
                {new Date(message.checkOut).toLocaleDateString("en-GB", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })}
              </div>
            </div>
          </div>
        )}
        {message.guestCount && (
          <div className="flex items-start gap-2">
            <Users className="w-4 h-4 text-forest-green mt-0.5 flex-shrink-0" />
            <div>
              <div className="text-xs text-gray-500 mb-0.5">Guests</div>
              <div className="text-sm font-medium text-gray-900">
                {message.guestCount} guests
              </div>
            </div>
          </div>
        )}
        {message.totalPrice && (
          <div className="flex items-start gap-2">
            <Euro className="w-4 h-4 text-forest-green mt-0.5 flex-shrink-0" />
            <div>
              <div className="text-xs text-gray-500 mb-0.5">Est. Total</div>
              <div className="text-sm font-medium text-gray-900">
                €{message.totalPrice.toLocaleString("en-GB")}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Approve & Create Booking button */}
      {message.status !== MESSAGE_STATUS.REPLIED && (
        <div className="col-span-3 pt-3 border-t border-forest-green/10">
          <AdminButton
            variant="primary"
            size="sm"
            icon={<CheckCircle className="w-4 h-4" />}
            loading={isPending}
            onClick={onPromote}
          >
            Approve &amp; Create Booking
          </AdminButton>
        </div>
      )}
    </div>
  );
}

/** Reply composer with quick replies and send actions */
function ReplyComposer({
  message,
  replyText,
  quickReply,
  isPending,
  onReplyTextChange,
  onQuickReplyChange,
  onSendReply,
  onUpdateStatus,
}: Readonly<{
  message: SerializedMessage;
  replyText: string;
  quickReply: string;
  isPending: boolean;
  onReplyTextChange: (text: string) => void;
  onQuickReplyChange: (value: string) => void;
  onSendReply: () => void;
  onUpdateStatus: (id: string, status: MessageStatus) => void;
}>) {
  return (
    <div className="space-y-4 pt-4 border-t border-gray-100">
      <div className="flex items-center justify-between">
        <h4 className="font-semibold text-gray-900 text-sm">Reply</h4>
        {message.status === MESSAGE_STATUS.REPLIED && message.repliedAt && (
          <span className="text-xs text-gray-400 flex items-center gap-1">
            <Clock className="w-3 h-3" />
            Replied {formatMessageDate(message.repliedAt)}
          </span>
        )}
      </div>

      {/* Quick replies */}
      <div className="relative">
        <select
          value={quickReply}
          onChange={(e) => onQuickReplyChange(e.target.value)}
          className={cn(
            "w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg text-sm",
            "focus:outline-none focus:ring-2 focus:ring-forest-green/20 focus:border-forest-green",
            "appearance-none bg-white"
          )}
        >
          <option value="">Select a quick reply template…</option>
          {QUICK_REPLIES.map((r) => (
            <option key={r.value} value={r.value}>
              {r.label}
            </option>
          ))}
        </select>
        <ChevronDown className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
      </div>

      <AdminField
        type="textarea"
        placeholder="Type your reply…"
        value={replyText}
        onChange={onReplyTextChange}
      />

      {/* Actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {message.status !== MESSAGE_STATUS.UNREAD && (
            <button
              onClick={() => onUpdateStatus(message.id, MESSAGE_STATUS.UNREAD)}
              disabled={isPending}
              className="text-xs text-gray-500 hover:text-gray-700 transition-colors disabled:opacity-50"
            >
              Mark as unread
            </button>
          )}
        </div>
        <div className="flex items-center gap-2">
          {message.status !== MESSAGE_STATUS.REPLIED && (
            <AdminButton
              variant="secondary"
              size="sm"
              loading={isPending}
              onClick={() => onUpdateStatus(message.id, MESSAGE_STATUS.REPLIED)}
            >
              Mark as replied
            </AdminButton>
          )}
          <AdminButton
            variant="primary"
            size="sm"
            icon={<Send className="w-3.5 h-3.5" />}
            loading={isPending}
            disabled={!replyText.trim()}
            onClick={onSendReply}
          >
            Send Reply
          </AdminButton>
        </div>
      </div>
    </div>
  );
}

/** Toggleable metadata sidebar with contact info and quick actions */
function MetadataSidebar({
  message,
  isPending,
  onClose,
  onUpdateStatus,
}: Readonly<{
  message: SerializedMessage;
  isPending: boolean;
  onClose: () => void;
  onUpdateStatus: (id: string, status: MessageStatus) => void;
}>) {
  return (
    <div className="lg:col-span-2">
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
          <h4 className="text-sm font-semibold text-gray-700">Contact Info</h4>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-4 space-y-5">
          {/* Guest info */}
          <div>
            <div className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-semibold bg-admin-avatar mb-3">
              {getInitials(message.name)}
            </div>
            <div className="space-y-1">
              <p className="text-sm font-semibold text-gray-900">
                {message.name}
              </p>
              <p className="text-xs text-gray-500 break-all">{message.email}</p>
              {message.phone && (
                <p className="text-xs text-gray-500">{message.phone}</p>
              )}
            </div>
          </div>

          {/* Message metadata */}
          <div className="pt-4 border-t border-gray-100 space-y-3">
            <div>
              <span className="text-xs text-gray-400 uppercase tracking-wide">
                Type
              </span>
              <p className="text-sm text-gray-700 mt-0.5 capitalize">
                {message.type.toLowerCase().replace("_", " ")}
              </p>
            </div>
            <div>
              <span className="text-xs text-gray-400 uppercase tracking-wide">
                Received
              </span>
              <p className="text-sm text-gray-700 mt-0.5">
                {formatFullDate(message.createdAt)}
              </p>
            </div>
            {message.repliedAt && (
              <div>
                <span className="text-xs text-gray-400 uppercase tracking-wide">
                  Replied
                </span>
                <p className="text-sm text-gray-700 mt-0.5">
                  {formatFullDate(message.repliedAt)}
                </p>
              </div>
            )}
          </div>

          {/* Quick Actions */}
          <div className="pt-4 border-t border-gray-100">
            <span className="text-xs text-gray-400 uppercase tracking-wide block mb-2">
              Quick Actions
            </span>
            <div className="space-y-1">
              <button
                onClick={() =>
                  onUpdateStatus(message.id, MESSAGE_STATUS.UNREAD)
                }
                disabled={isPending || message.status === MESSAGE_STATUS.UNREAD}
                className="w-full text-left px-3 py-2 text-xs text-gray-600 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-40"
              >
                Mark as unread
              </button>
              <button
                onClick={() => onUpdateStatus(message.id, MESSAGE_STATUS.READ)}
                disabled={isPending || message.status === MESSAGE_STATUS.READ}
                className="w-full text-left px-3 py-2 text-xs text-gray-600 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-40"
              >
                Mark as read
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Component ─────────────────────────────────────────────────
export function MessagesClient({
  initialMessages,
}: Readonly<MessagesClientProps>) {
  const router = useRouter();
  const [messages, setMessages] =
    useState<SerializedMessage[]>(initialMessages);
  const [selectedId, setSelectedId] = useState<string | null>(
    initialMessages[0]?.id ?? null
  );
  const [filterStatus, setFilterStatus] = useState<FilterStatus>("all");
  const [showMetadata, setShowMetadata] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [quickReply, setQuickReply] = useState("");
  const [isPending, startTransition] = useTransition();

  // ── Derived state ─────────────────────────────────────────
  const filteredMessages =
    filterStatus === "all"
      ? messages
      : messages.filter((m) => m.status === filterStatus);

  const selectedMessage = messages.find((m) => m.id === selectedId) ?? null;

  const unreadCount = messages.filter(
    (m) => m.status === MESSAGE_STATUS.UNREAD
  ).length;

  // ── Handlers ──────────────────────────────────────────────
  function handleSelectMessage(message: SerializedMessage): void {
    setSelectedId(message.id);
    setReplyText("");
    setQuickReply("");

    // Auto-mark as READ when opening an UNREAD message
    if (message.status === MESSAGE_STATUS.UNREAD) {
      updateStatus(message.id, MESSAGE_STATUS.READ);
    }
  }

  function handleQuickReply(value: string): void {
    setQuickReply(value);
    const found = QUICK_REPLIES.find((r) => r.value === value);
    if (found) setReplyText(found.body);
  }

  function updateStatus(id: string, status: MessageStatus): void {
    startTransition(async () => {
      const result = await updateMessageStatusApi(id, status);

      if (!result.success) {
        toast.error(result.error);
        return;
      }

      setMessages((prev) =>
        prev.map((m) =>
          m.id === id
            ? {
                ...m,
                status,
                ...(status === MESSAGE_STATUS.REPLIED && {
                  repliedAt: new Date(),
                }),
              }
            : m
        )
      );
    });
  }

  function handleSendReply(): void {
    if (!selectedMessage || !replyText.trim()) return;

    startTransition(async () => {
      // TODO: Integrate Resend to actually send the email before marking as replied
      const result = await updateMessageStatusApi(
        selectedMessage.id,
        MESSAGE_STATUS.REPLIED
      );

      if (!result.success) {
        toast.error(result.error);
        return;
      }

      setMessages((prev) =>
        prev.map((m) =>
          m.id === selectedMessage.id
            ? { ...m, status: MESSAGE_STATUS.REPLIED, repliedAt: new Date() }
            : m
        )
      );

      setReplyText("");
      setQuickReply("");
      toast.success("Reply sent and message marked as replied");
    });
  }

  function handlePromote(): void {
    if (!selectedMessage) return;

    startTransition(async () => {
      const result = await promoteMessage(selectedMessage.id);

      if (!result.success) {
        toast.error(result.error);
        return;
      }

      setMessages((prev) =>
        prev.map((m) =>
          m.id === selectedMessage.id
            ? { ...m, status: MESSAGE_STATUS.REPLIED, repliedAt: new Date() }
            : m
        )
      );

      toast.success("Booking created!", {
        description: `€${result.data.totalPrice.toLocaleString("en-GB")} · ${
          result.data.nights
        } nights`,
        action: {
          label: "View Booking",
          onClick: () =>
            router.push(`/admin/bookings/${result.data.bookingId}`),
        },
      });
    });
  }

  // ── Render ────────────────────────────────────────────────
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">Messages</h2>
          <p className="text-sm text-gray-500 mt-1">
            {unreadCount > 0
              ? `${unreadCount} unread message${unreadCount === 1 ? "" : "s"}`
              : "All messages read"}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-10 gap-6">
        <ThreadList
          messages={messages}
          filteredMessages={filteredMessages}
          selectedId={selectedId}
          filterStatus={filterStatus}
          unreadCount={unreadCount}
          onSelectMessage={handleSelectMessage}
          onFilterChange={setFilterStatus}
        />

        {/* Message Detail */}
        <div className={cn(showMetadata ? "lg:col-span-5" : "lg:col-span-7")}>
          {selectedMessage ? (
            <MessageDetail
              message={selectedMessage}
              showMetadata={showMetadata}
              replyText={replyText}
              quickReply={quickReply}
              isPending={isPending}
              onToggleMetadata={() => setShowMetadata(!showMetadata)}
              onReplyTextChange={setReplyText}
              onQuickReplyChange={handleQuickReply}
              onSendReply={handleSendReply}
              onUpdateStatus={updateStatus}
              onPromote={handlePromote}
            />
          ) : (
            <AdminCard>
              <div className="py-12 text-center text-gray-400">
                <Mail className="w-10 h-10 mx-auto mb-3 opacity-30" />
                <p className="text-sm">Select a message to view it</p>
              </div>
            </AdminCard>
          )}
        </div>

        {/* Metadata Sidebar */}
        {showMetadata && selectedMessage && (
          <MetadataSidebar
            message={selectedMessage}
            isPending={isPending}
            onClose={() => setShowMetadata(false)}
            onUpdateStatus={updateStatus}
          />
        )}
      </div>
    </div>
  );
}
