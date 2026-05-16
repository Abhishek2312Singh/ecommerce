import { useState, useEffect } from "react";
import Input from "../components/Input";
import Button from "../components/Button";
import AppShell, { ADMIN_NAV, getSession } from "../components/AppShell.jsx";
import ParkingMap from "../components/ParkingMap.jsx";
import { useToast } from "../components/Toast.jsx";
import {
  Users, ParkingSquare, Car, Ticket,
  UserPlus, Building2, IdCard, Lock, Hash, Tag,
  AlertTriangle,
} from "lucide-react";
import {
  apiGetAllUsers, apiCreateUser,
  apiGetAllSlots, apiGetAvailableCount, apiGetOccupiedCount,
  apiGetActiveVisitorCount, apiGetRecentLogs, apiGetVisitorDailyCount,
} from "../utils/api.js";

// NOTE: Campus list is fixed here; admins are locked to their own campus.
const CAMPUSES = [
  { id: "main",  label: "Main Campus"  },
  { id: "north", label: "North Campus" },
  { id: "east",  label: "East Campus"  },
  { id: "south", label: "South Campus" },
  { id: "west",  label: "West Campus"  },
];

// ADMIN deliberately excluded — campus admins cannot create admin accounts.
// Admin accounts are managed exclusively in the SuperAdmin → Admins section.
const CREATABLE_ROLES = ["STUDENT", "FACULTY", "STAFF"];

function StatCard({ label, value, sub, color = "default", Icon }) {
  const cfg = {
    default: { border: "border-white/[0.07]",        val: "text-slate-200",   bg: "bg-white/[0.05]"    },
    green:   { border: "border-emerald-500/20",       val: "text-emerald-400", bg: "bg-emerald-500/10"  },
    red:     { border: "border-red-500/20",           val: "text-red-400",     bg: "bg-red-500/10"      },
    amber:   { border: "border-amber-500/20",         val: "text-amber-400",   bg: "bg-amber-500/10"    },
    indigo:  { border: "border-indigo-500/20",        val: "text-indigo-400",  bg: "bg-indigo-500/10"   },
    violet:  { border: "border-violet-500/20",        val: "text-violet-400",  bg: "bg-violet-500/10"   },
  };
  const c = cfg[color] || cfg.default;
  return (
    <div className={`rounded-2xl border ${c.border} bg-white/[0.03] p-5`}>
      <div className="flex items-start justify-between">
        <div>
          <div className="text-xs text-slate-500 font-medium">{label}</div>
          <div className={`mt-1.5 text-2xl font-bold ${c.val}`}>{value ?? "—"}</div>
          {sub && <div className="mt-1 text-[11px] text-slate-600">{sub}</div>}
        </div>
        {Icon && (
          <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${c.bg} border ${c.border}`}>
            <Icon className={`h-5 w-5 ${c.val}`} strokeWidth={1.8} />
          </div>
        )}
      </div>
    </div>
  );
}

function formatLogTime(value) {
  if (!value) return "--";
  return new Date(value).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function tokenForUser(userId) {
  return `SPH-${String(userId || "").padStart(6, "0")}`;
}

function toActivityEvents(records) {
  return records
    .flatMap((record) => {
      const base = {
        id: record.id,
        userId: record.userId,
        vehicleNo: record.vehicleNo,
        slotId: record.slotId,
      };
      const events = [];
      if (record.entryTime) events.push({ ...base, event: "ENTRY", time: record.entryTime, key: `${record.id}-entry` });
      if (record.exitTime) events.push({ ...base, event: "EXIT", time: record.exitTime, key: `${record.id}-exit` });
      return events;
    })
    .sort((a, b) => new Date(b.time) - new Date(a.time));
}

function EventBadge({ event }) {
  const isEntry = event === "ENTRY";
  return (
    <span className={`inline-flex rounded-full border px-2.5 py-1 text-[10px] font-bold ${
      isEntry
        ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
        : "border-red-500/30 bg-red-500/10 text-red-300"
    }`}>
      {event}
    </span>
  );
}

export default function AdminDashboard() {
  const { user: sessionUser } = getSession();
  const { toast, showToast } = useToast();

  // ── Form state ────────────────────────────────────────────────────────────
  const [name,      setName]      = useState("");
  const [email,     setEmail]     = useState("");
  const [role,      setRole]      = useState("STUDENT");
  // Campus is locked to the admin's own campus
  const campus = sessionUser?.campus || "";
  const campusLabel = CAMPUSES.find((c) => c.id === campus)?.label || campus || "—";

  const [batch,     setBatch]     = useState("");
  const [collegeId, setCollegeId] = useState("");
  const [license,   setLicense]   = useState("");
  const [vehicle,   setVehicle]   = useState("");
  const [password,  setPassword]  = useState("");
  const [loading,   setLoading]   = useState(false);

  // ── Stats state ───────────────────────────────────────────────────────────
  const [totalUsers,     setTotalUsers]     = useState(null);
  const [availableSlots, setAvailableSlots] = useState(null);
  const [occupiedSlots,  setOccupiedSlots]  = useState(null);
  const [activeVisitors, setActiveVisitors] = useState(null);
  const [visitorsToday,  setVisitorsToday]  = useState(null);
  const [slots,          setSlots]          = useState([]);
  const [recentLogs,     setRecentLogs]     = useState([]);
  const [logsLoading,    setLogsLoading]    = useState(true);

  useEffect(() => {
    apiGetAllUsers()
      .then((data) => setTotalUsers(data.length))
      .catch(() => setTotalUsers("—"));
    apiGetAvailableCount()
      .then(setAvailableSlots)
      .catch(() => setAvailableSlots("—"));
    apiGetOccupiedCount()
      .then(setOccupiedSlots)
      .catch(() => setOccupiedSlots("—"));
    apiGetAllSlots()
      .then(setSlots)
      .catch(() => setSlots([]));
    apiGetActiveVisitorCount()
      .then(setActiveVisitors)
      .catch(() => setActiveVisitors("—"));
    apiGetRecentLogs(10)
      .then((data) => setRecentLogs(Array.isArray(data) ? data : []))
      .catch(() => setRecentLogs([]))
      .finally(() => setLogsLoading(false));
    apiGetVisitorDailyCount()
      .then((data) => setVisitorsToday(data?.count ?? 0))
      .catch(() => setVisitorsToday("-"));
  }, []);

  // ── Validation ────────────────────────────────────────────────────────────
  const validate = () => {
    if (!name.trim())     { showToast("error", "Full name is required.");            return false; }
    if (!email.trim())    { showToast("error", "Email is required.");                return false; }
    if (!password.trim()) { showToast("error", "Temporary password is required.");   return false; }
    if (role === "STUDENT" && !batch.trim()) {
      showToast("error", "Batch is required for students (e.g. BCA 2023–26).");
      return false;
    }
    return true;
  };

  // ── Create user ───────────────────────────────────────────────────────────
  const handleCreateUser = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      await apiCreateUser({
        name, email, role, campus,
        collegeId, license, vehicle,
        batch: role === "STUDENT" ? batch : "",
        password,
      });
      showToast("success", `${role.charAt(0) + role.slice(1).toLowerCase()} account created successfully!`);
      setName(""); setEmail(""); setRole("STUDENT");
      setBatch(""); setCollegeId(""); setLicense(""); setVehicle(""); setPassword("");
      apiGetAllUsers().then((d) => setTotalUsers(d.length)).catch(() => {});
    } catch (err) {
      showToast("error", err.message || "Failed to create user. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const recentEvents = toActivityEvents(recentLogs).slice(0, 6);

  return (
    <AppShell title="Admin Dashboard" subtitle="Campus parking control center" navItems={ADMIN_NAV}>
      {toast}
      <div className="space-y-6 fade-in">
        {/* ── Stat cards ── */}
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard label="Total Users"     value={totalUsers}     sub="Registered campus users" color="indigo" Icon={Users} />
          <StatCard label="Available Slots" value={availableSlots} sub="Right now"               color="green"  Icon={ParkingSquare} />
          <StatCard label="Occupied Slots"  value={occupiedSlots}  sub="Right now"               color="red"    Icon={Car} />
          <StatCard label="Active Visitors" value={activeVisitors} sub={`${visitorsToday ?? "-"} visitors today`} color="amber"  Icon={Ticket} />
        </div>

        {/* ── Main layout ── */}
        <div className="grid gap-6 xl:grid-cols-3">
          {/* Left — Parking Map + Recent Activity */}
          <div className="space-y-6 xl:col-span-2">
            <div className="rounded-2xl border border-white/[0.07] bg-white/[0.03] p-5">
              <ParkingMap slots={slots} />
            </div>

            {/* Recent activity placeholder */}
            <div className="rounded-2xl border border-white/[0.07] bg-white/[0.03] p-5">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <div className="text-sm font-semibold text-white">Recent Activity</div>
                  <div className="text-xs text-slate-500 mt-0.5">Latest entry / exit events</div>
                </div>
                <a href="/admin/logs" className="text-xs text-indigo-400 hover:underline">View all logs</a>
              </div>
              <div className="overflow-hidden rounded-xl border border-white/[0.06]">
                <table className="w-full text-left text-xs">
                  <thead className="bg-white/[0.04] text-slate-500 font-medium">
                    <tr>
                      <th className="px-4 py-3">Time</th>
                      <th className="px-4 py-3">Token / Pass</th>
                      <th className="px-4 py-3">Vehicle</th>
                      <th className="px-4 py-3">Gate</th>
                      <th className="px-4 py-3">Event</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/[0.04]">
                    {logsLoading ? (
                      <tr>
                        <td colSpan={5} className="px-4 py-8 text-center text-slate-600">
                          Loading recent events...
                        </td>
                      </tr>
                    ) : recentEvents.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-4 py-8 text-center text-slate-600">
                          No entry / exit events yet
                        </td>
                      </tr>
                    ) : (
                      recentEvents.map((event) => (
                        <tr key={event.key} className="hover:bg-white/[0.02] transition-colors">
                          <td className="px-4 py-3 text-slate-400">{formatLogTime(event.time)}</td>
                          <td className="px-4 py-3 font-mono text-slate-500">{tokenForUser(event.userId)}</td>
                          <td className="px-4 py-3 font-mono text-slate-500">{event.vehicleNo || "--"}</td>
                          <td className="px-4 py-3 text-slate-500">{event.slotId ? `Slot #${event.slotId}` : "Gate"}</td>
                          <td className="px-4 py-3"><EventBadge event={event.event} /></td>
                        </tr>
                      ))
                    )}
                    {false && <tr>
                      <th className="px-4 py-3">Time</th>
                      <th className="px-4 py-3">Token / Pass</th>
                      <th className="px-4 py-3">Vehicle</th>
                      <th className="px-4 py-3">Gate</th>
                      <th className="px-4 py-3">Event</th>
                    </tr>}
                  </tbody>
                  {false && <tbody className="divide-y divide-white/[0.04]">
                    <tr>
                      <td colSpan={5} className="px-4 py-8 text-center text-slate-600">
                        No events yet — connect parking records backend endpoint
                      </td>
                    </tr>
                  </tbody>}
                </table>
              </div>
            </div>
          </div>

          {/* Right — Create User form */}
          <div>
            <div className="sticky top-24 rounded-2xl border border-white/[0.07] bg-white/[0.03] p-5">
              <div className="mb-5 flex items-center gap-2">
                <UserPlus className="h-4 w-4 text-violet-400" strokeWidth={1.8} />
                <div>
                  <div className="text-sm font-semibold text-white">Create Account</div>
                  <div className="text-xs text-slate-500">Student, Faculty or Staff</div>
                </div>
              </div>

              <div className="space-y-3">
                {/* Campus — locked, display only */}
                <div>
                  <label className="mb-1.5 flex items-center gap-1.5 text-xs font-medium text-slate-400">
                    <Building2 className="h-3.5 w-3.5" strokeWidth={1.8} /> Campus
                  </label>
                  <div className="flex items-center gap-2 rounded-xl border border-white/[0.06] bg-white/[0.02] px-3 py-2.5 text-sm text-slate-300">
                    <Building2 className="h-3.5 w-3.5 text-slate-600 flex-shrink-0" strokeWidth={1.8} />
                    {campusLabel}
                    <span className="ml-auto rounded-full border border-indigo-500/20 bg-indigo-500/10 px-2 py-0.5 text-[10px] text-indigo-400">
                      your campus
                    </span>
                  </div>
                </div>

                {/* Role tabs — ADMIN excluded */}
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-slate-400">Role</label>
                  <div className="grid grid-cols-3 gap-1 rounded-xl border border-white/[0.08] bg-white/[0.03] p-1">
                    {CREATABLE_ROLES.map((r) => (
                      <button key={r} type="button" onClick={() => setRole(r)}
                        className={`rounded-lg py-1.5 text-xs font-medium transition-all duration-150 ${
                          role === r ? "bg-violet-500 text-white shadow-sm" : "text-slate-500 hover:text-slate-300"
                        }`}>
                        {r.charAt(0) + r.slice(1).toLowerCase()}
                      </button>
                    ))}
                  </div>
                  <p className="mt-1 text-[10px] text-slate-600">
                    To create an admin account, go to{" "}
                    <a href="/superadmin/admins" className="text-violet-400 hover:underline">SuperAdmin → Admins</a>.
                  </p>
                </div>

                {/* Batch — required for STUDENT, hidden otherwise */}
                {role === "STUDENT" && (
                  <div>
                    <label className="mb-1.5 flex items-center gap-1.5 text-xs font-medium text-slate-400">
                      <Tag className="h-3.5 w-3.5" strokeWidth={1.8} />
                      Batch <span className="text-red-400 ml-0.5">*</span>
                      <span className="text-slate-600 ml-1">(e.g. BCA 2023–26)</span>
                    </label>
                    <Input placeholder="BCA 2023–26" value={batch} onChange={(e) => setBatch(e.target.value)} />
                  </div>
                )}

                {/* College ID */}
                <div>
                  <label className="mb-1.5 flex items-center gap-1.5 text-xs font-medium text-slate-400">
                    <Hash className="h-3.5 w-3.5" strokeWidth={1.8} />
                    {role === "STUDENT" ? "Enrollment ID" : "Employee / Staff ID"}
                    {role === "STUDENT" && <span className="text-red-400 ml-0.5">*</span>}
                  </label>
                  <Input
                    placeholder={role === "STUDENT" ? "e.g. 23BCA1021" : "e.g. FAC-2045"}
                    value={collegeId}
                    onChange={(e) => setCollegeId(e.target.value)}
                  />
                </div>

                {/* Full name */}
                <div>
                  <label className="mb-1.5 flex items-center gap-1.5 text-xs font-medium text-slate-400">
                    <IdCard className="h-3.5 w-3.5" strokeWidth={1.8} /> Full Name <span className="text-red-400 ml-0.5">*</span>
                  </label>
                  <Input placeholder="Full name" value={name} onChange={(e) => setName(e.target.value)} />
                </div>

                {/* Email */}
                <div>
                  <label className="mb-1.5 text-xs font-medium text-slate-400">
                    Email <span className="text-red-400">*</span>
                  </label>
                  <Input placeholder="user@campus.edu" value={email} onChange={(e) => setEmail(e.target.value)} />
                </div>

                {/* Vehicle — not for ADMIN (ADMIN is already removed, but keep check) */}
                <div>
                  <label className="mb-1.5 flex items-center gap-1.5 text-xs font-medium text-slate-400">
                    <Car className="h-3.5 w-3.5" strokeWidth={1.8} /> Vehicle Number
                  </label>
                  <Input placeholder="e.g. UP14 AB 1234" value={vehicle} onChange={(e) => setVehicle(e.target.value)} />
                </div>
                <div>
                  <label className="mb-1.5 text-xs font-medium text-slate-400">Driving License</label>
                  <Input placeholder="License no." value={license} onChange={(e) => setLicense(e.target.value)} />
                </div>

                {/* Password */}
                <div>
                  <label className="mb-1.5 flex items-center gap-1.5 text-xs font-medium text-slate-400">
                    <Lock className="h-3.5 w-3.5" strokeWidth={1.8} /> Temporary Password <span className="text-red-400 ml-0.5">*</span>
                  </label>
                  <Input type="password" placeholder="Initial password" value={password} onChange={(e) => setPassword(e.target.value)} />
                </div>

                {role === "STUDENT" && (
                  <div className="flex items-start gap-1.5 rounded-lg border border-amber-500/20 bg-amber-500/10 px-2.5 py-2 text-[10px] text-amber-300">
                    <AlertTriangle className="h-3 w-3 flex-shrink-0 mt-0.5" strokeWidth={2} />
                    Batch and Enrollment ID are mandatory for student accounts.
                  </div>
                )}

                <Button
                  id="create-user-submit"
                  text={loading ? "Creating…" : "Create Account"}
                  color="violet"
                  disabled={loading}
                  onClick={handleCreateUser}
                />
                <p className="text-[11px] text-slate-600 text-center">
                  Visitors need a Visitor Pass, not a login account.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
