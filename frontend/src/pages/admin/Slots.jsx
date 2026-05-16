import { useState, useEffect, useCallback } from "react";
import AppShell, { ADMIN_NAV, SUPER_ADMIN_NAV, getSession } from "../../components/AppShell.jsx";
import ParkingMap from "../../components/ParkingMap.jsx";
import Button from "../../components/Button.jsx";
import { useToast } from "../../components/Toast.jsx";
import {
  Building2, ParkingSquare, RefreshCw,
  CheckCircle2, XCircle, Car, Layers,
  Plus, Trash2, Settings2, X,
} from "lucide-react";
import {
  apiGetAllSlots, apiGetSlotsByCampus,
  apiUpdateSlot, apiSeedCampusSlots, apiDeleteCampusSlots,
} from "../../utils/api.js";

const ZONE_CFG = [
  { key: "A", label: "Zone A — Student",  color: "indigo" },
  { key: "B", label: "Zone B — Faculty",  color: "violet" },
  { key: "C", label: "Zone C — Staff",    color: "cyan"   },
  { key: "D", label: "Zone D — Visitor",  color: "amber"  },
];

const COLOR_MAP = {
  indigo: { card: "border-indigo-500/20 bg-indigo-500/5", text: "text-indigo-400" },
  violet: { card: "border-violet-500/20 bg-violet-500/5", text: "text-violet-400" },
  cyan:   { card: "border-cyan-500/20   bg-cyan-500/5",   text: "text-cyan-400"   },
  amber:  { card: "border-amber-500/20  bg-amber-500/5",  text: "text-amber-400"  },
};

const SLOT_TYPES = ["STUDENT", "FACULTY", "STAFF", "VISITOR"];

function StatusBadge({ occupied }) {
  return occupied ? (
    <span className="flex items-center gap-1 rounded-full border border-red-500/30 bg-red-500/10 px-2 py-0.5 text-[10px] font-semibold text-red-400">
      <XCircle className="h-3 w-3" strokeWidth={2} /> Occupied
    </span>
  ) : (
    <span className="flex items-center gap-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-400">
      <CheckCircle2 className="h-3 w-3" strokeWidth={2} /> Free
    </span>
  );
}

export default function Slots() {
  const { role, user: sessionUser } = getSession();
  const isSuperAdmin = role === "SUPER_ADMIN";
  const navItems     = isSuperAdmin ? SUPER_ADMIN_NAV : ADMIN_NAV;
  const campusKey    = sessionUser?.campus || "";

  const { toast, showToast } = useToast();

  const [slots,      setSlots]      = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [toggling,   setToggling]   = useState({});
  const [filterZone, setFilterZone] = useState("all");

  // ── Seed-slots modal state ────────────────────────────────────────────────
  const [showSeed,   setShowSeed]   = useState(false);
  const [seedZone,   setSeedZone]   = useState("A");
  const [seedType,   setSeedType]   = useState("STUDENT");
  const [seedCount,  setSeedCount]  = useState(10);
  const [seeding,    setSeeding]    = useState(false);
  const [showReset,  setShowReset]  = useState(false);
  const [resetting,  setResetting]  = useState(false);

  // ── Load slots (campus-scoped for admin, all for super admin) ─────────────
  const loadSlots = useCallback(() => {
    setLoading(true);
    const call = isSuperAdmin
      ? apiGetAllSlots()
      : apiGetSlotsByCampus(campusKey);

    call
      .then(setSlots)
      .catch(() => showToast("error", "Could not load slots. Check backend connection."))
      .finally(() => setLoading(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSuperAdmin, campusKey]);

  useEffect(() => { loadSlots(); }, [loadSlots]);

  // ── Toggle park / unpark ──────────────────────────────────────────────────
  const handleToggle = async (slot) => {
    setToggling((p) => ({ ...p, [slot.id]: true }));
    const newOccupied = !slot.occupied;
    try {
      const updated = await apiUpdateSlot(slot.id, newOccupied);
      setSlots((prev) =>
        prev.map((s) => s.id === slot.id ? { ...s, occupied: updated?.occupied ?? newOccupied } : s)
      );
      showToast("success", newOccupied ? `Slot #${slot.id} marked Parked.` : `Slot #${slot.id} marked Free.`);
    } catch (e) {
      showToast("error", e.message || "Failed to update slot.");
    } finally {
      setToggling((p) => ({ ...p, [slot.id]: false }));
    }
  };

  // ── Seed slots ────────────────────────────────────────────────────────────
  const handleSeed = async () => {
    if (!campusKey && !isSuperAdmin) { showToast("error", "No campus assigned to your account."); return; }
    setSeeding(true);
    try {
      const created = await apiSeedCampusSlots(campusKey || "main", {
        count: Number(seedCount), zone: seedZone, type: seedType,
      });
      await loadSlots();
      setShowSeed(false);
      showToast("success", `${created.length} slots added to Zone ${seedZone} (${seedType}).`);
    } catch (e) {
      showToast("error", e.message || "Failed to add slots.");
    } finally { setSeeding(false); }
  };

  // ── Reset slots ───────────────────────────────────────────────────────────
  const handleReset = async () => {
    if (!campusKey && !isSuperAdmin) { showToast("error", "No campus assigned to your account."); return; }
    setResetting(true);
    try {
      const res = await apiDeleteCampusSlots(campusKey || "main");
      setSlots([]);
      setShowReset(false);
      showToast("success", `${res?.deleted ?? "All"} slots removed.`);
    } catch (e) {
      showToast("error", e.message || "Failed to reset slots.");
    } finally { setResetting(false); }
  };

  // ── Derived ───────────────────────────────────────────────────────────────
  const countByZone = (zone) => {
    const zSlots = zone === "all" ? slots : slots.filter((s) => s.zone?.toUpperCase() === zone);
    return { free: zSlots.filter((s) => !s.occupied).length, total: zSlots.length };
  };

  const visibleSlots = filterZone === "all"
    ? slots
    : slots.filter((s) => s.zone?.toUpperCase() === filterZone);

  const totalFree = slots.filter((s) => !s.occupied).length;
  const totalOcc  = slots.filter((s) =>  s.occupied).length;

  return (
    <AppShell
      title="Parking Slots"
      subtitle={isSuperAdmin ? "System-wide slot management" : `${campusKey ? campusKey.charAt(0).toUpperCase() + campusKey.slice(1) + " Campus" : "Campus"} slot management`}
      navItems={navItems}
    >
      {toast}

      {/* ── Seed modal ── */}
      {showSeed && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
          <div className="w-full max-w-sm rounded-2xl border border-violet-500/20 bg-[#0c1120] p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2 text-sm font-semibold text-white">
                <Plus className="h-4 w-4 text-violet-400" strokeWidth={2} />
                Add Parking Slots
              </div>
              <button onClick={() => setShowSeed(false)} className="text-slate-500 hover:text-slate-300">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Zone */}
              <div>
                <label className="mb-1.5 block text-xs font-medium text-slate-400">Zone</label>
                <div className="grid grid-cols-4 gap-1.5 rounded-xl border border-white/[0.08] bg-white/[0.03] p-1">
                  {ZONE_CFG.map((z) => (
                    <button key={z.key} type="button" onClick={() => setSeedZone(z.key)}
                      className={`rounded-lg py-2 text-xs font-semibold transition-all ${
                        seedZone === z.key ? "bg-violet-500 text-white shadow-sm" : "text-slate-400 hover:text-slate-200"
                      }`}>
                      {z.key}
                    </button>
                  ))}
                </div>
                <div className="mt-1 text-[10px] text-slate-600">
                  {ZONE_CFG.find((z) => z.key === seedZone)?.label}
                </div>
              </div>

              {/* Type */}
              <div>
                <label className="mb-1.5 block text-xs font-medium text-slate-400">Slot Type</label>
                <select
                  value={seedType}
                  onChange={(e) => setSeedType(e.target.value)}
                  className="w-full rounded-xl border border-white/[0.08] bg-white/[0.04] px-3 py-2.5 text-sm text-slate-100 outline-none focus:border-violet-500/50 transition"
                >
                  {SLOT_TYPES.map((t) => (
                    <option key={t} value={t}>{t.charAt(0) + t.slice(1).toLowerCase()}</option>
                  ))}
                </select>
              </div>

              {/* Count */}
              <div>
                <label className="mb-1.5 flex items-center justify-between text-xs font-medium text-slate-400">
                  <span>Number of Slots</span>
                  <span className="text-violet-400 font-bold">{seedCount}</span>
                </label>
                <input
                  type="range" min={1} max={100} value={seedCount}
                  onChange={(e) => setSeedCount(e.target.value)}
                  className="w-full accent-violet-500"
                />
                <div className="flex justify-between text-[10px] text-slate-600 mt-0.5">
                  <span>1</span><span>100</span>
                </div>
              </div>

              <div className="flex gap-2 pt-1">
                <Button
                  text={seeding ? "Adding…" : `Add ${seedCount} Slots`}
                  color="violet" disabled={seeding} onClick={handleSeed}
                />
                <Button text="Cancel" color="ghost" onClick={() => setShowSeed(false)} />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Reset confirm modal ── */}
      {showReset && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
          <div className="w-full max-w-sm rounded-2xl border border-red-500/20 bg-[#0c1120] p-6 shadow-2xl">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-500/10 border border-red-500/20 mb-4">
              <Trash2 className="h-5 w-5 text-red-400" strokeWidth={1.8} />
            </div>
            <div className="text-base font-semibold text-white mb-1">Reset all slots?</div>
            <p className="text-sm text-slate-400 mb-5">
              All <strong className="text-slate-200">{slots.length} slots</strong> for{" "}
              <strong className="text-slate-200">{campusKey || "this campus"}</strong> will be permanently deleted. This cannot be undone.
            </p>
            <div className="flex gap-3">
              <Button text={resetting ? "Resetting…" : "Reset Slots"} color="danger" disabled={resetting} onClick={handleReset} />
              <Button text="Cancel" color="ghost" onClick={() => setShowReset(false)} />
            </div>
          </div>
        </div>
      )}

      <div className="fade-in space-y-6">

        {/* ── Top bar ── */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            {/* Campus badge (admin) */}
            {!isSuperAdmin && campusKey && (
              <div className="flex items-center gap-1.5 rounded-xl border border-violet-500/20 bg-violet-500/10 px-3 py-2 text-xs text-violet-300">
                <Building2 className="h-3.5 w-3.5" strokeWidth={1.8} />
                {campusKey.charAt(0).toUpperCase() + campusKey.slice(1)} Campus
              </div>
            )}

            {/* Zone filter */}
            <div className="flex items-center gap-2 rounded-xl border border-white/[0.07] bg-white/[0.03] px-3 py-2">
              <Layers className="h-4 w-4 text-slate-500 flex-shrink-0" strokeWidth={1.8} />
              <select
                value={filterZone}
                onChange={(e) => setFilterZone(e.target.value)}
                className="bg-transparent text-sm text-slate-300 outline-none"
              >
                <option value="all">All Zones</option>
                {ZONE_CFG.map((z) => <option key={z.key} value={z.key}>Zone {z.key}</option>)}
              </select>
            </div>

            <div className="flex items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1.5 text-xs text-emerald-400">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Live
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Manage slots — only for campus admins & super admin */}
            {!isSuperAdmin && (
              <>
                <button
                  onClick={() => setShowSeed(true)}
                  className="flex items-center gap-1.5 rounded-xl border border-violet-500/30 bg-violet-500/10 px-3 py-2 text-xs text-violet-300 hover:bg-violet-500/20 transition"
                >
                  <Plus className="h-3.5 w-3.5" strokeWidth={2} /> Add Slots
                </button>
                <button
                  onClick={() => setShowReset(true)}
                  disabled={slots.length === 0}
                  className="flex items-center gap-1.5 rounded-xl border border-red-500/20 bg-red-500/10 px-3 py-2 text-xs text-red-400 hover:bg-red-500/20 transition disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <Trash2 className="h-3.5 w-3.5" strokeWidth={2} /> Reset Slots
                </button>
              </>
            )}

            {isSuperAdmin && (
              <div className="flex items-center gap-1.5 rounded-xl border border-white/[0.07] bg-white/[0.03] px-3 py-2 text-xs text-slate-400">
                <Settings2 className="h-3.5 w-3.5" strokeWidth={1.8} />
                Admins seed slots from their campus panel
              </div>
            )}

            <button
              onClick={loadSlots}
              className="flex items-center gap-1.5 rounded-xl border border-white/[0.08] bg-white/[0.04] px-3 py-2 text-xs text-slate-400 hover:text-slate-200 transition"
            >
              <RefreshCw className="h-3.5 w-3.5" strokeWidth={1.8} /> Refresh
            </button>
          </div>
        </div>

        {/* ── Summary stat pills ── */}
        <div className="flex flex-wrap gap-3">
          <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-2.5 text-sm">
            <span className="text-slate-500 text-xs">Free:</span>{" "}
            <span className="font-bold text-emerald-400">{totalFree}</span>
          </div>
          <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-2.5 text-sm">
            <span className="text-slate-500 text-xs">Occupied:</span>{" "}
            <span className="font-bold text-red-400">{totalOcc}</span>
          </div>
          <div className="rounded-xl border border-white/[0.07] bg-white/[0.03] px-4 py-2.5 text-sm">
            <span className="text-slate-500 text-xs">Total:</span>{" "}
            <span className="font-bold text-slate-200">{slots.length}</span>
          </div>
          {/* Load % */}
          {slots.length > 0 && (
            <div className="rounded-xl border border-white/[0.07] bg-white/[0.03] px-4 py-2.5 text-sm">
              <span className="text-slate-500 text-xs">Load:</span>{" "}
              <span className={`font-bold ${totalOcc / slots.length >= 0.9 ? "text-red-400" : totalOcc / slots.length >= 0.7 ? "text-amber-400" : "text-emerald-400"}`}>
                {Math.round(totalOcc / slots.length * 100)}%
              </span>
            </div>
          )}
        </div>

        {/* ── Zone summary cards ── */}
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {ZONE_CFG.map((z) => {
            const { free, total } = countByZone(z.key);
            const cc = COLOR_MAP[z.color];
            return (
              <div
                key={z.key}
                className={`rounded-2xl border ${cc.card} p-4 cursor-pointer hover:opacity-80 transition`}
                onClick={() => setFilterZone(filterZone === z.key ? "all" : z.key)}
              >
                <div className={`text-xs font-semibold ${cc.text} mb-1`}>{z.label}</div>
                <div className="flex items-end gap-2">
                  <div className="text-xl font-bold text-white">{loading ? "…" : free}</div>
                  <div className="text-xs text-slate-500 mb-0.5">/ {loading ? "…" : total} free</div>
                </div>
                {filterZone === z.key && (
                  <div className={`mt-1 text-[10px] ${cc.text} opacity-60`}>▸ filtering</div>
                )}
              </div>
            );
          })}
        </div>

        {/* ── Parking Map ── */}
        <div className="rounded-2xl border border-white/[0.07] bg-white/[0.03] p-5">
          <ParkingMap slots={slots} />
        </div>

        {/* ── Slot table ── */}
        <div className="rounded-2xl border border-white/[0.07] bg-white/[0.03] p-5">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <div className="text-sm font-semibold text-white">All Slots</div>
              <div className="text-xs text-slate-500 mt-0.5">
                {visibleSlots.length} slot{visibleSlots.length !== 1 ? "s" : ""} shown
                {filterZone !== "all" ? ` (Zone ${filterZone})` : ""}
              </div>
            </div>
            {filterZone !== "all" && (
              <button onClick={() => setFilterZone("all")} className="text-xs text-indigo-400 hover:underline">
                Show all zones
              </button>
            )}
          </div>

          <div className="overflow-x-auto rounded-xl border border-white/[0.06]">
            <table className="w-full text-left text-xs min-w-[520px]">
              <thead className="bg-white/[0.04] text-slate-500 font-medium">
                <tr>
                  <th className="px-4 py-3">Slot ID</th>
                  <th className="px-4 py-3">Zone</th>
                  <th className="px-4 py-3">Type</th>
                  {isSuperAdmin && <th className="px-4 py-3">Campus</th>}
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {loading ? (
                  <tr>
                    <td colSpan={isSuperAdmin ? 6 : 5} className="px-4 py-8 text-center">
                      <div className="animate-pulse text-slate-500">Loading slots…</div>
                    </td>
                  </tr>
                ) : visibleSlots.length === 0 ? (
                  <tr>
                    <td colSpan={isSuperAdmin ? 6 : 5} className="px-4 py-10 text-center">
                      <ParkingSquare className="h-10 w-10 text-slate-700 mx-auto mb-2" strokeWidth={1} />
                      <div className="text-slate-600">No slots found.</div>
                      {!isSuperAdmin && (
                        <button
                          onClick={() => setShowSeed(true)}
                          className="mt-3 inline-flex items-center gap-1.5 rounded-xl border border-violet-500/30 bg-violet-500/10 px-3 py-1.5 text-xs text-violet-300 hover:bg-violet-500/20 transition"
                        >
                          <Plus className="h-3.5 w-3.5" strokeWidth={2} /> Add slots for your campus
                        </button>
                      )}
                    </td>
                  </tr>
                ) : (
                  visibleSlots.map((slot) => (
                    <tr key={slot.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="px-4 py-3 font-mono text-slate-300">#{slot.id}</td>
                      <td className="px-4 py-3 text-slate-400">Zone {slot.zone || "—"}</td>
                      <td className="px-4 py-3">
                        {slot.type ? (
                          <span className="rounded-full border border-white/[0.08] bg-white/[0.04] px-2 py-0.5 text-[10px] text-slate-400 capitalize">
                            {slot.type.toLowerCase()}
                          </span>
                        ) : "—"}
                      </td>
                      {isSuperAdmin && (
                        <td className="px-4 py-3 text-slate-500 font-mono text-[10px]">
                          {slot.campusKey || "—"}
                        </td>
                      )}
                      <td className="px-4 py-3">
                        <StatusBadge occupied={slot.occupied} />
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          disabled={toggling[slot.id]}
                          onClick={() => handleToggle(slot)}
                          className={`flex items-center gap-1.5 ml-auto rounded-xl border px-3 py-1.5 text-[11px] font-medium transition-all ${
                            toggling[slot.id] ? "opacity-50 cursor-wait" : ""
                          } ${slot.occupied
                            ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20"
                            : "border-red-500/30    bg-red-500/10    text-red-400    hover:bg-red-500/20"
                          }`}
                        >
                          {toggling[slot.id] ? (
                            <RefreshCw className="h-3 w-3 animate-spin" strokeWidth={2} />
                          ) : slot.occupied ? (
                            <><CheckCircle2 className="h-3 w-3" strokeWidth={2} /> Unpark</>
                          ) : (
                            <><Car className="h-3 w-3" strokeWidth={2} /> Park</>
                          )}
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
