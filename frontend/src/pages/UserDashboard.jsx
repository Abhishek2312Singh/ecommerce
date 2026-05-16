import { useMemo, useEffect, useState } from "react";
import AppShell, { USER_NAV } from "../components/AppShell.jsx";
import ParkingMap from "../components/ParkingMap.jsx";
import Input from "../components/Input.jsx";
import Button from "../components/Button.jsx";
import {
  Car, MapPin, ShieldCheck, QrCode,
  Clock, History, TrendingUp, CircleCheck, CircleX,
  Timer, IdCard, Lock, KeyRound, CheckCircle2, XCircle, ChevronDown,
} from "lucide-react";
import { apiGetAllSlots, apiGetUserParkingHistory, apiChangePassword, apiToggleParking } from "../utils/api.js";

// ─────────────────────────────────────────────────────────────────────────────
// UserDashboard
// Shows: live parking status, QR token, vehicle details, parking history
// ─────────────────────────────────────────────────────────────────────────────

function getSession() {
  const raw = localStorage.getItem("sph_user");
  try { return raw ? JSON.parse(raw) : null; } catch { return null; }
}

function makeToken(collegeId = "") {
  const clean = String(collegeId).replace(/[^a-z0-9]/gi, "").toUpperCase();
  return `SPH-${clean.slice(-6).padStart(6, "0")}`;
}

function formatDate(isoOrMs) {
  if (!isoOrMs) return "—";
  const d = new Date(isoOrMs);
  return d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}

function formatTime(isoOrMs) {
  if (!isoOrMs) return "—";
  return new Date(isoOrMs).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
}

function formatDuration(ms) {
  if (!ms || ms < 0) return "—";
  const totalMin = Math.floor(ms / 60000);
  const h = Math.floor(totalMin / 60);
  const m = totalMin % 60;
  if (h === 0) return `${m}m`;
  return `${h}h ${m}m`;
}

const CAMPUS_LABELS = {
  main: "Main Campus", north: "North Campus",
  east: "East Campus", south: "South Campus", west: "West Campus",
};

const ROLE_ZONE = {
  STUDENT: "Zone A — Student",
  FACULTY: "Zone B — Faculty",
  STAFF:   "Zone C — Staff",
};

// ── Sub-components ────────────────────────────────────────────────────────────

function InfoRow({ label, value, mono = false }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-xl border border-white/[0.06] bg-white/[0.03] px-4 py-3">
      <span className="text-xs text-slate-500">{label}</span>
      <span className={`text-sm text-slate-200 font-medium ${mono ? "font-mono text-xs" : ""}`}>{value || "—"}</span>
    </div>
  );
}

function SessionEventBadge({ type }) {
  if (type === "ENTRY" || type === "entry") {
    return (
      <span className="flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 text-[10px] font-bold text-emerald-400">
        <CircleCheck className="h-3 w-3" strokeWidth={2} /> ENTRY
      </span>
    );
  }
  return (
    <span className="flex items-center gap-1.5 rounded-full border border-red-500/30 bg-red-500/10 px-2.5 py-1 text-[10px] font-bold text-red-400">
      <CircleX className="h-3 w-3" strokeWidth={2} /> EXIT
    </span>
  );
}

function ParkingSessionCard({ session }) {
  // session shape: { id, slotId, zone, entryTime, exitTime, duration, vehicleNo }
  const duration = session.exitTime
    ? formatDuration(new Date(session.exitTime) - new Date(session.entryTime))
    : null;

  const isActive = !session.exitTime;

  return (
    <div className={`rounded-2xl border p-4 transition-all hover:border-white/[0.12] ${
      isActive
        ? "border-indigo-500/30 bg-indigo-500/5"
        : "border-white/[0.06] bg-white/[0.03]"
    }`}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className={`flex h-9 w-9 items-center justify-center rounded-xl flex-shrink-0 ${
            isActive ? "bg-indigo-500/20 border border-indigo-500/30" : "bg-white/[0.05] border border-white/[0.08]"
          }`}>
            <Car className={`h-4 w-4 ${isActive ? "text-indigo-400" : "text-slate-500"}`} strokeWidth={1.8} />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-semibold text-slate-200">
                Slot {session.slotId || "—"}
              </span>
              {session.zone && (
                <span className="text-[10px] text-slate-500 border border-white/[0.06] rounded-md px-1.5 py-0.5">
                  {session.zone}
                </span>
              )}
            </div>
            <div className="text-[10px] text-slate-500 mt-0.5 font-mono">
              {session.vehicleNo || "—"}
            </div>
          </div>
        </div>

        <div className="text-right flex-shrink-0">
          {isActive ? (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-indigo-500/30 bg-indigo-500/15 px-2.5 py-1 text-[10px] font-bold text-indigo-300">
              <span className="pulse-dot h-1.5 w-1.5 flex-shrink-0" />
              Currently Parked
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 rounded-full border border-white/[0.08] bg-white/[0.04] px-2.5 py-1 text-[10px] text-slate-400">
              <Timer className="h-3 w-3" strokeWidth={1.8} /> {duration}
            </span>
          )}
        </div>
      </div>

      {/* Time row */}
      <div className="mt-3 grid grid-cols-2 gap-2">
        <div className="rounded-xl border border-emerald-500/15 bg-emerald-500/5 px-3 py-2">
          <div className="text-[9px] uppercase tracking-wide text-emerald-500/70 mb-0.5">Entry</div>
          <div className="text-xs font-semibold text-emerald-300">{formatTime(session.entryTime)}</div>
          <div className="text-[10px] text-slate-500">{formatDate(session.entryTime)}</div>
        </div>
        <div className={`rounded-xl border px-3 py-2 ${
          isActive ? "border-dashed border-white/[0.08] bg-white/[0.02]" : "border-red-500/15 bg-red-500/5"
        }`}>
          <div className={`text-[9px] uppercase tracking-wide mb-0.5 ${isActive ? "text-slate-600" : "text-red-500/70"}`}>Exit</div>
          <div className={`text-xs font-semibold ${isActive ? "text-slate-600 italic" : "text-red-300"}`}>
            {isActive ? "Still parked" : formatTime(session.exitTime)}
          </div>
          {!isActive && <div className="text-[10px] text-slate-500">{formatDate(session.exitTime)}</div>}
        </div>
      </div>

      {!isActive && (
        <div className="mt-3 flex items-center justify-between rounded-xl border border-white/[0.06] bg-white/[0.03] px-3 py-2">
          <span className="text-[10px] uppercase tracking-wide text-slate-500">Total Duration</span>
          <span className="text-xs font-bold text-white">{duration}</span>
        </div>
      )}
    </div>
  );
}

// ── Change Password Section ────────────────────────────────────────────────────

function ChangePasswordSection({ userId }) {
  const [open,    setOpen]    = useState(false);
  const [oldPwd,  setOldPwd]  = useState("");
  const [newPwd,  setNewPwd]  = useState("");
  const [confirm, setConfirm] = useState("");
  const [saving,  setSaving]  = useState(false);
  const [msg,     setMsg]     = useState("");

  const flash = (m) => { setMsg(m); setTimeout(() => setMsg(""), 5000); };

  const handle = async () => {
    if (!oldPwd || !newPwd || !confirm) { flash("error:All fields are required."); return; }
    if (newPwd !== confirm) { flash("error:New passwords do not match."); return; }
    if (newPwd.length < 6)  { flash("error:Password must be at least 6 characters."); return; }
    setSaving(true);
    try {
      await apiChangePassword(userId, oldPwd, newPwd);
      flash("success:Password changed successfully!");
      setOldPwd(""); setNewPwd(""); setConfirm("");
      setOpen(false);
    } catch (e) {
      flash(`error:${e.message || "Failed to change password."}`);
    } finally { setSaving(false); }
  };

  const isSuccess = msg.startsWith("success:");
  const msgText   = msg.replace(/^(error|success):/, "");

  return (
    <div className="rounded-2xl border border-white/[0.07] bg-white/[0.03] p-5">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between gap-3 text-left"
      >
        <div className="flex items-center gap-2">
          <KeyRound className="h-4 w-4 text-indigo-400" strokeWidth={1.8} />
          <div>
            <div className="text-sm font-semibold text-white">Change Password</div>
            <div className="text-xs text-slate-500">Update your login password</div>
          </div>
        </div>
        <ChevronDown className={`h-4 w-4 text-slate-500 transition-transform duration-200 ${open ? "" : "-rotate-90"}`} strokeWidth={2} />
      </button>

      {open && (
        <div className="mt-4 space-y-3 border-t border-white/[0.05] pt-4">
          {msgText && (
            <div className={`flex items-center gap-2 rounded-xl border px-3 py-2.5 text-xs ${
              isSuccess ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
                : "border-red-500/30 bg-red-500/10 text-red-300"
            }`}>
              {isSuccess ? <CheckCircle2 className="h-3.5 w-3.5 flex-shrink-0" /> : <XCircle className="h-3.5 w-3.5 flex-shrink-0" />}
              {msgText}
            </div>
          )}

          <div>
            <label className="mb-1.5 flex items-center gap-1.5 text-xs font-medium text-slate-400">
              <Lock className="h-3.5 w-3.5" strokeWidth={1.8} /> Current Password
            </label>
            <Input type="password" placeholder="Your current password" value={oldPwd} onChange={(e) => setOldPwd(e.target.value)} />
          </div>
          <div>
            <label className="mb-1.5 flex items-center gap-1.5 text-xs font-medium text-slate-400">
              <Lock className="h-3.5 w-3.5" strokeWidth={1.8} /> New Password
            </label>
            <Input type="password" placeholder="New password (min 6 chars)" value={newPwd} onChange={(e) => setNewPwd(e.target.value)} />
          </div>
          <div>
            <label className="mb-1.5 flex items-center gap-1.5 text-xs font-medium text-slate-400">
              <Lock className="h-3.5 w-3.5" strokeWidth={1.8} /> Confirm New Password
            </label>
            <Input type="password" placeholder="Repeat new password" value={confirm} onChange={(e) => setConfirm(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handle()} />
          </div>
          <Button text={saving ? "Changing…" : "Change Password"} color="primary" disabled={saving} onClick={handle} />
        </div>
      )}
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────

export default function UserDashboard() {

  const user       = getSession();
  const token      = useMemo(() => makeToken(user?.collegeId || user?.id), [user]);
  const campusLabel = CAMPUS_LABELS[user?.campus] || user?.campus || "Main Campus";

  const [slots,      setSlots]      = useState([]);
  const [history,    setHistory]    = useState([]);
  const [histLoading, setHistLoading] = useState(true);
  const [isParked,   setIsParked]   = useState(Boolean(user?.isParked));
  const [toggling,   setToggling]   = useState(false);

  const makeActiveFallbackSession = (record = {}) => ({
    id: record.id || `active-${user?.id || "session"}`,
    slotId: record.slotId || null,
    zone: record.zone || ROLE_ZONE[user?.role] || "Your zone",
    entryTime: record.entryTime || new Date().toISOString(),
    exitTime: null,
    vehicleNo: record.vehicleNo || user?.vehicle,
  });

  const applyHistory = (data, parkedFallback = isParked, recordFallback = null) => {
    const sessions = Array.isArray(data) ? data : [];
    if (sessions.length > 0) {
      setHistory(sessions);
      return;
    }
    if (recordFallback) {
      setHistory([recordFallback]);
      return;
    }
    setHistory(parkedFallback ? [makeActiveFallbackSession(recordFallback || {})] : []);
  };

  const refreshHistory = async (parkedFallback = isParked, recordFallback = null) => {
    if (!user?.id) {
      setHistory([]);
      return;
    }
    const data = await apiGetUserParkingHistory(user.id);
    applyHistory(data, parkedFallback, recordFallback);
  };

  useEffect(() => {
    apiGetAllSlots().then(setSlots).catch(() => setSlots([]));
    if (user?.id) {
      apiGetUserParkingHistory(user.id)
        .then((data) => { applyHistory(data, Boolean(user?.isParked)); })
        .catch(() => {
          setHistory(Boolean(user?.isParked) ? [makeActiveFallbackSession()] : []);
        })
        .finally(() => setHistLoading(false));
    } else {
      setHistLoading(false);
    }
  }, [user?.id]);

  // ── Parking toggle ──────────────────────────────────────────────────────────
  const handleParkingToggle = async () => {
    if (!user?.id || toggling) return;
    setToggling(true);
    try {
      const updated = await apiToggleParking(user.id);
      const newState = Boolean(updated?.isParked);
      setIsParked(newState);
      // Sync back to localStorage so it persists across page reloads
      const stored = JSON.parse(localStorage.getItem("sph_user") || "{}");
      localStorage.setItem("sph_user", JSON.stringify({ ...stored, isParked: newState }));
      if (updated?.parkingRecord) {
        setHistory((prev) => {
          const withoutDuplicate = prev.filter((s) => s.id !== updated.parkingRecord.id);
          return [updated.parkingRecord, ...withoutDuplicate];
        });
      } else if (newState) {
        setHistory((prev) => prev.some((s) => !s.exitTime) ? prev : [makeActiveFallbackSession(), ...prev]);
      } else {
        setHistory((prev) => prev.map((s) => (
          !s.exitTime ? { ...s, exitTime: new Date().toISOString() } : s
        )));
      }
      await Promise.all([
        refreshHistory(newState, updated?.parkingRecord).catch(() => {}),
        apiGetAllSlots().then(setSlots).catch(() => {}),
      ]);
    } catch {
      // silently ignore — optimistic UI already flipped
    } finally {
      setToggling(false);
    }
  };

  const currentSession = history.find((s) => !s.exitTime);
  const pastSessions   = history.filter((s) => !!s.exitTime);
  const totalSessions  = history.length;
  const totalMinutes   = pastSessions.reduce((sum, s) => {
    if (!s.entryTime || !s.exitTime) return sum;
    return sum + Math.floor((new Date(s.exitTime) - new Date(s.entryTime)) / 60000);
  }, 0);

  return (
    <AppShell
      title={`Welcome, ${user?.name || user?.collegeId || "Campus User"}`}
      subtitle={campusLabel}
      navItems={USER_NAV}
    >
      <div className="fade-in space-y-6">

        {/* ── Parking Toggle — prominent self-service button ── */}
        <div className={`rounded-2xl border p-5 flex flex-col sm:flex-row items-center justify-between gap-4 transition-all duration-500 ${
          isParked
            ? "border-indigo-500/30 bg-indigo-500/5 shadow-[0_0_30px_rgba(99,102,241,0.08)]"
            : "border-white/[0.07] bg-white/[0.03]"
        }`}>
          {/* Left — status info */}
          <div className="flex items-center gap-4">
            <div className={`relative flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-2xl transition-all duration-500 ${
              isParked
                ? "bg-indigo-500/15 border border-indigo-500/30"
                : "bg-white/[0.04] border border-white/[0.08]"
            }`}>
              <Car className={`h-7 w-7 transition-colors duration-300 ${
                isParked ? "text-indigo-400" : "text-slate-500"
              }`} strokeWidth={1.8} />
              {isParked && (
                <span className="absolute -top-1 -right-1 flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-indigo-500" />
                </span>
              )}
            </div>
            <div>
              <div className="text-xs text-slate-500 font-medium">Parking Status</div>
              <div className={`mt-0.5 text-lg font-bold transition-colors duration-300 ${
                isParked ? "text-indigo-300" : "text-slate-400"
              }`}>
                {isParked ? "Currently Parked" : "Not Parked"}
              </div>
              <div className="text-[11px] text-slate-600 mt-0.5">
                {isParked
                  ? `${ROLE_ZONE[user?.role] || "Your zone"} · ${campusLabel}`
                  : "Toggle when you park your vehicle"}
              </div>
            </div>
          </div>

          {/* Right — toggle button */}
          <button
            onClick={handleParkingToggle}
            disabled={toggling}
            className={`relative flex items-center gap-2.5 rounded-2xl border px-6 py-3 text-sm font-semibold transition-all duration-300 flex-shrink-0 ${
              toggling ? "opacity-60 cursor-wait" : "cursor-pointer active:scale-[0.97]"
            } ${
              isParked
                ? "border-red-500/30 bg-red-500/10 text-red-300 hover:bg-red-500/20 hover:border-red-400/50"
                : "border-indigo-500/30 bg-indigo-500/10 text-indigo-300 hover:bg-indigo-500/20 hover:border-indigo-400/50"
            }`}
          >
            {toggling ? (
              <><Car className="h-4 w-4 animate-pulse" strokeWidth={2} /> Updating…</>
            ) : isParked ? (
              <><CircleX className="h-4 w-4" strokeWidth={2} /> Mark as Left</>
            ) : (
              <><CircleCheck className="h-4 w-4" strokeWidth={2} /> Mark as Parked</>
            )}
          </button>
        </div>

        {/* ── Status strip ── */}
        <div className="grid gap-4 sm:grid-cols-3">
          {/* Current parking status — now driven by isParked toggle */}
          <div className={`rounded-2xl border p-5 flex items-center gap-4 ${
            isParked
              ? "border-indigo-500/20 bg-indigo-500/5"
              : "border-white/[0.07] bg-white/[0.03]"
          }`}>
            <div className={`flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl ${
              isParked ? "bg-indigo-500/10 border border-indigo-500/20" : "bg-slate-800/50 border border-white/[0.06]"
            }`}>
              <Car className={`h-6 w-6 ${isParked ? "text-indigo-400" : "text-slate-500"}`} strokeWidth={1.8} />
            </div>
            <div>
              <div className="text-xs text-slate-500">Parking Status</div>
              <div className={`mt-0.5 text-sm font-semibold ${isParked ? "text-indigo-300" : "text-slate-400"}`}>
                {isParked ? "Currently Parked" : "Not Parked"}
              </div>
              <div className="text-[10px] text-slate-600 mt-0.5">
                {isParked ? ROLE_ZONE[user?.role] || "" : "No active session"}
              </div>
            </div>
          </div>

          {/* Assigned zone */}
          <div className="rounded-2xl border border-indigo-500/20 bg-indigo-500/5 p-5 flex items-center gap-4">
            <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-indigo-500/10 border border-indigo-500/20">
              <MapPin className="h-6 w-6 text-indigo-400" strokeWidth={1.8} />
            </div>
            <div>
              <div className="text-xs text-slate-500">Your Zone</div>
              {/* backend data: "user's assigned zone from profile" */}
              <div className="mt-0.5 text-sm font-semibold text-indigo-300">
                {ROLE_ZONE[user?.role] || "—"}
              </div>
              <div className="text-[10px] text-slate-600 mt-0.5">{campusLabel}</div>
            </div>
          </div>

          {/* Access type */}
          <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-5 flex items-center gap-4">
            <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 border border-emerald-500/20">
              <ShieldCheck className="h-6 w-6 text-emerald-400" strokeWidth={1.8} />
            </div>
            <div>
              <div className="text-xs text-slate-500">Access Type</div>
              <div className="mt-0.5 text-sm font-semibold text-emerald-300">Permanent</div>
              <div className="text-[10px] text-slate-600 mt-0.5">{user?.role || "—"}</div>
            </div>
          </div>
        </div>

        {/* ── QR Token + Vehicle Details ── */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* QR Token card */}
          <div className="rounded-2xl border border-white/[0.07] bg-white/[0.03] p-5">
            <div className="mb-4 flex items-center gap-2">
              <QrCode className="h-4 w-4 text-indigo-400" strokeWidth={1.8} />
              <div>
                <div className="text-sm font-semibold text-white">Access Token</div>
                <div className="text-xs text-slate-500">Show at gate — permanent access</div>
              </div>
            </div>

            <div className="flex flex-col items-center gap-4 rounded-2xl border border-white/[0.07] bg-white/[0.03] p-6">
              {/* backend data: "GET /user/qr — returns base64 QR image data URL" */}
              <div className="flex flex-col items-center justify-center h-36 w-36 rounded-2xl border-2 border-dashed border-indigo-500/30 bg-indigo-500/5">
                <QrCode className="h-14 w-14 text-indigo-400/60" strokeWidth={1} />
                <div className="text-[10px] text-indigo-400/50 mt-1">Scan QR</div>
              </div>
              <div className="text-center">
                <div className="text-[10px] text-slate-500 mb-1 tracking-widest">PERMANENT TOKEN</div>
                <div className="font-mono text-2xl font-bold tracking-[0.2em] text-white">{token}</div>
                <div className="mt-2 flex items-center justify-center gap-1.5 text-xs text-emerald-400">
                  <span className="pulse-dot h-1.5 w-1.5" /> Active · Valid indefinitely
                </div>
              </div>
            </div>
          </div>

          {/* Vehicle details + Change Password */}
          <div className="space-y-4">
            <div className="rounded-2xl border border-white/[0.07] bg-white/[0.03] p-5">
              <div className="mb-4 flex items-center gap-2">
                <Car className="h-4 w-4 text-slate-400" strokeWidth={1.8} />
                <div>
                  <div className="text-sm font-semibold text-white">Vehicle &amp; Profile</div>
                  <div className="text-xs text-slate-500">Registered vehicle info</div>
                </div>
              </div>
              <div className="space-y-2">
                <InfoRow label="College ID"      value={user?.collegeId}   mono />
                <InfoRow label="Role"            value={user?.role} />
                <InfoRow label="Vehicle Number"  value={user?.vehicle}     mono />
                <InfoRow label="Driving License" value={user?.license}     mono />
                <InfoRow label="Vehicle Name"    value={user?.vehicleName} />
              </div>
              <div className="mt-3 rounded-xl border border-amber-500/20 bg-amber-500/10 px-3 py-2.5 text-xs text-amber-300">
                To update vehicle or profile info, contact your campus admin.
              </div>
            </div>

            {/* ── Change Password ── */}
            <ChangePasswordSection userId={user?.id} />
          </div>
        </div>

        {/* ── Parking History ── */}
        <div className="grid gap-6 xl:grid-cols-3">
          {/* Left — session list */}
          <div className="xl:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <History className="h-4 w-4 text-slate-400" strokeWidth={1.8} />
                <span className="text-sm font-semibold text-white">Parking History</span>
              </div>
              {/* backend data: "total session count for this user" */}
              {totalSessions > 0 && (
                <span className="text-xs text-slate-500">{totalSessions} sessions total</span>
              )}
            </div>

            {histLoading ? (
              <div className="rounded-2xl border border-white/[0.06] bg-white/[0.03] p-8 text-center">
                <div className="animate-pulse text-xs text-slate-500">Loading history…</div>
              </div>
            ) : history.length === 0 ? (
              <div className="rounded-2xl border border-white/[0.06] bg-white/[0.03] p-10 text-center">
                <History className="h-10 w-10 text-slate-700 mx-auto mb-3" strokeWidth={1} />
                <div className="text-sm text-slate-500">No parking sessions yet</div>
                <div className="text-xs text-slate-600 mt-1">
                  {/* backend data: "sessions from GET /parking/user/:id once backend is wired" */}
                  Sessions will appear here after your first gate scan
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {/* Active session first */}
                {currentSession && (
                  <div>
                    <div className="text-xs text-indigo-400 font-medium mb-2 flex items-center gap-1.5">
                      <span className="pulse-dot h-1.5 w-1.5" /> Active Session
                    </div>
                    <ParkingSessionCard session={currentSession} />
                  </div>
                )}

                {/* Past sessions */}
                {pastSessions.length > 0 && (
                  <div>
                    <div className="text-xs text-slate-500 font-medium mb-2 flex items-center gap-1.5">
                      <Clock className="h-3.5 w-3.5" strokeWidth={1.8} /> Past Sessions
                    </div>
                    {pastSessions.map((s) => (
                      <div key={s.id} className="mb-3">
                        <ParkingSessionCard session={s} />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right — Stats sidebar */}
          <div className="space-y-4">
            {/* Usage stats */}
            <div className="rounded-2xl border border-white/[0.07] bg-white/[0.03] p-5">
              <div className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-slate-400" strokeWidth={1.8} />
                Your Stats
              </div>
              <div className="space-y-3">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-xs text-slate-500">Total Sessions</span>
                  <span className="font-bold text-white">{totalSessions}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-xs text-slate-500">Total Time Parked</span>
                  <span className="font-bold text-white">
                    {totalMinutes >= 60
                      ? `${Math.floor(totalMinutes / 60)}h ${totalMinutes % 60}m`
                      : `${totalMinutes}m`}
                  </span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-xs text-slate-500">Average Duration</span>
                  <span className="font-bold text-white">
                    {pastSessions.length
                      ? formatDuration(Math.floor(totalMinutes / pastSessions.length) * 60000)
                      : "—"}
                  </span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-xs text-slate-500">Status</span>
                  <span className={`font-bold ${currentSession ? "text-indigo-400" : "text-slate-400"}`}>
                    {currentSession ? "Parked Now" : "Not Parked"}
                  </span>
                </div>
              </div>
            </div>

            {/* Quick tips */}
            <div className="rounded-2xl border border-white/[0.07] bg-white/[0.03] p-5">
              <div className="text-xs font-semibold text-white mb-3">Tips</div>
              <div className="space-y-2">
                <div className="flex items-start gap-2.5 text-xs text-slate-400">
                  <QrCode className="h-3.5 w-3.5 text-slate-600 flex-shrink-0 mt-0.5" strokeWidth={1.8} />
                  Keep QR handy at the gate for fast entry
                </div>
                <div className="flex items-start gap-2.5 text-xs text-slate-400">
                  <MapPin className="h-3.5 w-3.5 text-slate-600 flex-shrink-0 mt-0.5" strokeWidth={1.8} />
                  Park only in your assigned zone
                </div>
                <div className="flex items-start gap-2.5 text-xs text-slate-400">
                  <Car className="h-3.5 w-3.5 text-slate-600 flex-shrink-0 mt-0.5" strokeWidth={1.8} />
                  Check live map for available slots
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Live Parking Map ── */}
        <div className="rounded-2xl border border-white/[0.07] bg-white/[0.03] p-5">
          <div className="mb-3 flex items-center gap-2">
            <MapPin className="h-4 w-4 text-indigo-400" strokeWidth={1.8} />
            <span className="text-sm font-semibold text-white">Live Parking Map</span>
            <span className="ml-auto text-xs text-slate-500">{campusLabel}</span>
          </div>
          {/* backend data: "pass campus-specific slot data for the map" */}
          <ParkingMap slots={slots} />
        </div>
      </div>
    </AppShell>
  );
}
