"use client";

// ─── Imports ───────────────────────────────────────────────────
import { useState, useTransition } from "react";
import { toast } from "sonner";
import {
  Plus,
  Calendar,
  Table as TableIcon,
  Edit,
  Copy,
  Archive,
  Play,
  Pause,
  Trash2,
  X,
} from "lucide-react";
import { AdminCard } from "@/components/ui/admin/AdminCard";
import { AdminButton } from "@/components/ui/admin/AdminButton";
import { AdminBadge } from "@/components/ui/admin/AdminBadge";
import { AdminField } from "@/components/ui/admin/AdminField";
import { cn } from "@/lib/utils";
import { DAYS_OF_WEEK, SEASON_STATUS } from "@/lib/constants";
import {
  createSeason,
  updateSeason,
  duplicateSeason as duplicateSeasonApi,
  archiveSeason,
  activateSeason,
  deactivateSeason,
  deleteSeason,
} from "@/lib/services/seasons";

// ─── Types ─────────────────────────────────────────────────────
interface DowOverride {
  id: string;
  dayOfWeek: number;
  type: "ADD" | "SUBTRACT" | "CUSTOM";
  amount: number;
}

interface Season {
  id: string;
  name: string;
  colorTag: string;
  startDate: string;
  endDate: string;
  baseRate: number;
  minStay: number;
  priority: number;
  status: string;
  notes?: string;
  updatedAt: string;
  dowOverrides: DowOverride[];
}

interface SeasonalPricingClientProps {
  initialSeasons: Season[];
}

interface SeasonFormData {
  name: string;
  colorTag: string;
  startDate: string;
  endDate: string;
  baseRate: string;
  minStay: string;
  priority: string;
  notes: string;
}

// ─── Constants ─────────────────────────────────────────────────
const EMPTY_FORM: SeasonFormData = {
  name: "",
  colorTag: "#6B705C",
  startDate: "",
  endDate: "",
  baseRate: "",
  minStay: "7",
  priority: "1",
  notes: "",
};

// ─── Private Sub-Components ────────────────────────────────────

/** Modal for creating/editing a season */
function SeasonModal({
  form,
  editingSeason,
  isPending,
  onFormChange,
  onSave,
  onClose,
}: Readonly<{
  form: SeasonFormData;
  editingSeason: Season | null;
  isPending: boolean;
  onFormChange: (updater: (prev: SeasonFormData) => SeasonFormData) => void;
  onSave: () => void;
  onClose: () => void;
}>) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-lg w-full shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h3 className="text-xl font-semibold text-gray-900">
            {editingSeason ? "Edit Season" : "Add Season"}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-6 space-y-4">
          <AdminField
            label="Season Name"
            placeholder="e.g. High Season"
            value={form.name}
            onChange={(v) => onFormChange((f) => ({ ...f, name: v }))}
            required
          />
          <div className="grid grid-cols-2 gap-4">
            <AdminField
              type="date"
              label="Start Date"
              value={form.startDate}
              onChange={(v) => onFormChange((f) => ({ ...f, startDate: v }))}
              required
            />
            <AdminField
              type="date"
              label="End Date"
              value={form.endDate}
              onChange={(v) => onFormChange((f) => ({ ...f, endDate: v }))}
              required
            />
          </div>
          <div className="grid grid-cols-3 gap-4">
            <AdminField
              type="number"
              label="Base Rate (€/night)"
              placeholder="500"
              value={form.baseRate}
              onChange={(v) => onFormChange((f) => ({ ...f, baseRate: v }))}
              required
            />
            <AdminField
              type="number"
              label="Min Stay (nights)"
              placeholder="7"
              value={form.minStay}
              onChange={(v) => onFormChange((f) => ({ ...f, minStay: v }))}
            />
            <AdminField
              type="number"
              label="Priority"
              placeholder="1"
              value={form.priority}
              onChange={(v) => onFormChange((f) => ({ ...f, priority: v }))}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              Color Tag
            </label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={form.colorTag}
                onChange={(e) =>
                  onFormChange((f) => ({ ...f, colorTag: e.target.value }))
                }
                className="w-10 h-10 rounded-lg border border-gray-300 cursor-pointer"
              />
              <span className="text-sm text-gray-600 font-mono">
                {form.colorTag}
              </span>
            </div>
          </div>
          <AdminField
            type="textarea"
            label="Notes (optional)"
            placeholder="Additional notes about this season…"
            value={form.notes}
            onChange={(v) => onFormChange((f) => ({ ...f, notes: v }))}
          />
        </div>
        <div className="flex items-center gap-3 p-6 border-t border-gray-200">
          <AdminButton variant="secondary" onClick={onClose} className="flex-1">
            Cancel
          </AdminButton>
          <AdminButton
            variant="primary"
            loading={isPending}
            onClick={onSave}
            className="flex-1"
          >
            {editingSeason ? "Save Changes" : "Create Season"}
          </AdminButton>
        </div>
      </div>
    </div>
  );
}

// ─── Component ─────────────────────────────────────────────────
export function SeasonalPricingClient({
  initialSeasons,
}: Readonly<SeasonalPricingClientProps>) {
  const [seasons, setSeasons] = useState<Season[]>(initialSeasons);
  const [view, setView] = useState<"table" | "calendar">("table");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editingSeason, setEditingSeason] = useState<Season | null>(null);
  const [form, setForm] = useState<SeasonFormData>(EMPTY_FORM);
  const [deletingSeasonId, setDeletingSeasonId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  // ── Modal openers ─────────────────────────────────────────
  function openAdd(): void {
    setEditingSeason(null);
    setForm(EMPTY_FORM);
    setShowModal(true);
  }

  function openEdit(season: Season): void {
    setEditingSeason(season);
    setForm({
      name: season.name,
      colorTag: season.colorTag,
      startDate: season.startDate.split("T")[0],
      endDate: season.endDate.split("T")[0],
      baseRate: String(season.baseRate),
      minStay: String(season.minStay),
      priority: String(season.priority),
      notes: season.notes ?? "",
    });
    setShowModal(true);
  }

  // ── Handlers ──────────────────────────────────────────────
  function handleSave(): void {
    if (!form.name || !form.startDate || !form.endDate || !form.baseRate) {
      toast.error("Please fill in all required fields");
      return;
    }

    const payload = {
      name: form.name,
      colorTag: form.colorTag,
      startDate: form.startDate,
      endDate: form.endDate,
      baseRate: Number(form.baseRate),
      minStay: Number(form.minStay),
      priority: Number(form.priority),
      notes: form.notes || undefined,
    };

    startTransition(async () => {
      const result = editingSeason
        ? await updateSeason(editingSeason.id, payload)
        : await createSeason(payload);

      if (result.success) {
        if (editingSeason) {
          setSeasons((prev) =>
            prev.map((s) => (s.id === editingSeason.id ? result.data : s))
          );
          toast.success("Season updated");
        } else {
          setSeasons((prev) => [...prev, result.data]);
          toast.success("Season created");
        }
        setShowModal(false);
      } else {
        toast.error(result.error);
      }
    });
  }

  function handleDuplicate(season: Season): void {
    startTransition(async () => {
      const result = await duplicateSeasonApi({
        name: season.name,
        colorTag: season.colorTag,
        startDate: season.startDate.split("T")[0],
        endDate: season.endDate.split("T")[0],
        baseRate: season.baseRate,
        minStay: season.minStay,
        priority: season.priority,
        notes: season.notes,
      });

      if (result.success) {
        setSeasons((prev) => [...prev, result.data]);
        toast.success("Season duplicated");
      } else {
        toast.error(result.error);
      }
    });
  }

  function handleArchive(seasonId: string): void {
    startTransition(async () => {
      const result = await archiveSeason(seasonId);

      if (result.success) {
        setSeasons((prev) =>
          prev.map((s) =>
            s.id === seasonId ? { ...s, status: SEASON_STATUS.ARCHIVED } : s
          )
        );
        toast.success("Season archived");
      } else {
        toast.error(result.error);
      }
    });
  }

  function handleDeactivate(seasonId: string): void {
    startTransition(async () => {
      const result = await deactivateSeason(seasonId);

      if (result.success) {
        setSeasons((prev) =>
          prev.map((s) =>
            s.id === seasonId ? { ...s, status: SEASON_STATUS.INACTIVE } : s
          )
        );
        toast.success("Season deactivated");
      } else {
        toast.error(result.error);
      }
    });
  }

  function handleActivate(seasonId: string): void {
    startTransition(async () => {
      const result = await activateSeason(seasonId);

      if (result.success) {
        setSeasons((prev) =>
          prev.map((s) =>
            s.id === seasonId ? { ...s, status: SEASON_STATUS.ACTIVE } : s
          )
        );
        toast.success("Season activated");
      } else {
        toast.error(result.error);
      }
    });
  }

  function handleDelete(seasonId: string): void {
    startTransition(async () => {
      const result = await deleteSeason(seasonId);

      if (result.success) {
        setSeasons((prev) => prev.filter((s) => s.id !== seasonId));
        setSelectedIds((prev) => prev.filter((id) => id !== seasonId));
        toast.success("Season deleted");
      } else {
        toast.error(result.error);
      }
      setDeletingSeasonId(null);
    });
  }

  function handleBulkActivate(): void {
    startTransition(async () => {
      const results = await Promise.all(
        selectedIds.map((id) => activateSeason(id))
      );

      const failedCount = results.filter((r) => !r.success).length;

      if (failedCount > 0) {
        toast.error(`Failed to activate ${failedCount} season(s)`);
      }

      const succeededIds = selectedIds.filter((_, i) => results[i].success);
      setSeasons((prev) =>
        prev.map((s) =>
          succeededIds.includes(s.id)
            ? { ...s, status: SEASON_STATUS.ACTIVE }
            : s
        )
      );

      if (succeededIds.length > 0) {
        toast.success(`${succeededIds.length} season(s) activated`);
      }
      setSelectedIds([]);
    });
  }

  function toggleSelect(id: string): void {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  }

  // ── Render ────────────────────────────────────────────────
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">
            Seasonal Pricing
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Define seasons and dynamic nightly rates
          </p>
        </div>
        <div className="flex items-center gap-3">
          {/* View toggle */}
          <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
            {(["table", "calendar"] as const).map((v) => (
              <button
                key={v}
                onClick={() => setView(v)}
                className={cn(
                  "px-3 py-1.5 rounded-md text-sm font-medium transition-colors capitalize flex items-center gap-1.5",
                  view === v
                    ? "bg-white text-gray-900 shadow-sm"
                    : "text-gray-500 hover:text-gray-700"
                )}
              >
                {v === "table" ? (
                  <TableIcon className="w-4 h-4" />
                ) : (
                  <Calendar className="w-4 h-4" />
                )}
                {v.charAt(0).toUpperCase() + v.slice(1)}
              </button>
            ))}
          </div>
          <AdminButton
            variant="primary"
            onClick={openAdd}
            icon={<Plus className="w-4 h-4" />}
          >
            Add Season
          </AdminButton>
        </div>
      </div>

      {/* Bulk actions */}
      {selectedIds.length > 0 && (
        <div className="bg-admin-sage/10 border border-admin-sage/30 rounded-lg px-4 py-3 flex items-center justify-between">
          <span className="text-sm font-medium text-gray-900">
            {selectedIds.length} season{selectedIds.length > 1 ? "s" : ""}{" "}
            selected
          </span>
          <div className="flex items-center gap-2">
            <AdminButton
              variant="secondary"
              size="sm"
              onClick={handleBulkActivate}
              loading={isPending}
            >
              Activate
            </AdminButton>
            <AdminButton
              variant="ghost"
              size="sm"
              onClick={() => setSelectedIds([])}
            >
              Clear
            </AdminButton>
          </div>
        </div>
      )}

      {/* Table view */}
      {view === "table" && (
        <AdminCard>
          <div className="overflow-x-auto -mx-6 -mb-6">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="px-6 py-3 text-left">
                    <input
                      type="checkbox"
                      checked={
                        selectedIds.length === seasons.length &&
                        seasons.length > 0
                      }
                      onChange={(e) =>
                        setSelectedIds(
                          e.target.checked ? seasons.map((s) => s.id) : []
                        )
                      }
                      className="w-4 h-4 rounded border-gray-300 accent-admin-sage"
                    />
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                    Season
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                    Date Range
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                    Base Rate
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                    Min Stay
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                    DOW Overrides
                  </th>
                  <th className="px-6 py-3 text-center text-sm font-semibold text-gray-700">
                    Priority
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                    Status
                  </th>
                  <th className="px-6 py-3 text-right text-sm font-semibold text-gray-700">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {seasons.map((season) => (
                  <tr
                    key={season.id}
                    className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(season.id)}
                        onChange={() => toggleSelect(season.id)}
                        className="w-4 h-4 rounded border-gray-300 accent-admin-sage"
                      />
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-3 h-3 rounded-full shrink-0"
                          style={{ backgroundColor: season.colorTag }}
                        />
                        <div>
                          <p className="font-medium text-gray-900">
                            {season.name}
                          </p>
                          {season.notes && (
                            <p className="text-xs text-gray-500 mt-0.5">
                              {season.notes}
                            </p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {new Date(season.startDate).toLocaleDateString("en-GB", {
                        day: "numeric",
                        month: "short",
                      })}
                      {" → "}
                      {new Date(season.endDate).toLocaleDateString("en-GB", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">
                      €{season.baseRate.toLocaleString()}/night
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {season.minStay}{" "}
                      {season.minStay === 1 ? "night" : "nights"}
                    </td>
                    <td className="px-6 py-4">
                      {season.dowOverrides.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {season.dowOverrides.map((d) => (
                            <span
                              key={d.id}
                              className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-gray-100 text-gray-700"
                            >
                              {DAYS_OF_WEEK[d.dayOfWeek].short}{" "}
                              {d.type === "ADD"
                                ? "+"
                                : d.type === "SUBTRACT"
                                ? "-"
                                : "="}
                              €{d.amount}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-sm text-gray-400">None</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-admin-sage/10 text-sm font-semibold text-gray-900">
                        {season.priority}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <AdminBadge
                        variant={
                          season.status === SEASON_STATUS.ACTIVE
                            ? "success"
                            : "default"
                        }
                        size="sm"
                      >
                        {season.status === SEASON_STATUS.ACTIVE
                          ? "Active"
                          : season.status === SEASON_STATUS.ARCHIVED
                          ? "Archived"
                          : "Inactive"}
                      </AdminBadge>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => openEdit(season)}
                          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <Edit className="w-4 h-4 text-gray-600" />
                        </button>
                        <button
                          onClick={() => handleDuplicate(season)}
                          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                          title="Duplicate"
                          disabled={isPending}
                        >
                          <Copy className="w-4 h-4 text-gray-600" />
                        </button>
                        {season.status === SEASON_STATUS.ACTIVE ? (
                          <button
                            onClick={() => handleDeactivate(season.id)}
                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                            title="Deactivate"
                            disabled={isPending}
                          >
                            <Pause className="w-4 h-4 text-gray-600" />
                          </button>
                        ) : (
                          <button
                            onClick={() => handleActivate(season.id)}
                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                            title="Activate"
                            disabled={isPending}
                          >
                            <Play className="w-4 h-4 text-gray-600" />
                          </button>
                        )}
                        {season.status !== SEASON_STATUS.ARCHIVED && (
                          <button
                            onClick={() => handleArchive(season.id)}
                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                            title="Archive"
                            disabled={isPending}
                          >
                            <Archive className="w-4 h-4 text-gray-600" />
                          </button>
                        )}
                        <button
                          onClick={() => setDeletingSeasonId(season.id)}
                          className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete"
                          disabled={isPending}
                        >
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </AdminCard>
      )}

      {/* Calendar view — simple visual representation */}
      {view === "calendar" && (
        <AdminCard
          title="Season Calendar"
          subtitle="Visual overview of all seasons"
        >
          <div className="space-y-3">
            {seasons.map((season) => {
              const start = new Date(season.startDate);
              const end = new Date(season.endDate);
              const days = Math.ceil(
                (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)
              );
              return (
                <div
                  key={season.id}
                  className="flex items-center gap-4 p-3 rounded-lg border border-gray-200 hover:bg-gray-50"
                >
                  <div
                    className="w-4 h-4 rounded-full shrink-0"
                    style={{ backgroundColor: season.colorTag }}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900">{season.name}</p>
                    <p className="text-sm text-gray-500">
                      {start.toLocaleDateString("en-GB", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                      {" → "}
                      {end.toLocaleDateString("en-GB", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                      {" · "}
                      {days} days
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-gray-900">
                      €{season.baseRate}/night
                    </p>
                    <p className="text-xs text-gray-500">
                      min {season.minStay} nights
                    </p>
                  </div>
                  <AdminBadge
                    variant={
                      season.status === SEASON_STATUS.ACTIVE
                        ? "success"
                        : "default"
                    }
                    size="sm"
                  >
                    {season.status === SEASON_STATUS.ACTIVE
                      ? "Active"
                      : "Inactive"}
                  </AdminBadge>
                  <button
                    onClick={() => openEdit(season)}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <Edit className="w-4 h-4 text-gray-600" />
                  </button>
                </div>
              );
            })}
          </div>
        </AdminCard>
      )}

      {/* Season modal */}
      {showModal && (
        <SeasonModal
          form={form}
          editingSeason={editingSeason}
          isPending={isPending}
          onFormChange={setForm}
          onSave={handleSave}
          onClose={() => setShowModal(false)}
        />
      )}

      {/* Delete confirmation dialog */}
      {deletingSeasonId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-sm w-full shadow-2xl">
            <div className="p-6 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center shrink-0">
                  <Trash2 className="w-5 h-5 text-red-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    Delete Season
                  </h3>
                  <p className="text-sm text-gray-500">
                    Are you sure? This action cannot be undone.
                  </p>
                </div>
              </div>
              <p className="text-sm text-gray-600">
                Season{" "}
                <span className="font-medium text-gray-900">
                  {seasons.find((s) => s.id === deletingSeasonId)?.name}
                </span>{" "}
                will be permanently removed from the database.
              </p>
            </div>
            <div className="flex items-center gap-3 p-6 border-t border-gray-200">
              <AdminButton
                variant="secondary"
                onClick={() => setDeletingSeasonId(null)}
                className="flex-1"
              >
                Cancel
              </AdminButton>
              <AdminButton
                variant="danger"
                loading={isPending}
                onClick={() => handleDelete(deletingSeasonId)}
                className="flex-1"
              >
                Delete
              </AdminButton>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
