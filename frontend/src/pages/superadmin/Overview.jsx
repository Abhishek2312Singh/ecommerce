import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AppShell, { SUPER_ADMIN_NAV } from "../../components/AppShell.jsx";
import ParkingMap from "../../components/ParkingMap.jsx";
import {
  Users, Building2, ParkingSquare, ShieldCheck, ArrowRight,
  RefreshCw, AlertCircle, TrendingUp,
} from "lucide-react";
import { apiGetSuperAdminStats, apiGetAllSlots, apiGetCampusSummary } from "../../utils/api.js";

// ── Color config for stat cards ──────────────────────────────────────────────
const COLOR_CONFIG = {
  rose:   {
    border: "border-rose-500/20", borderHover: "hover:border-rose-400/60",
    val: "text-rose-400", bg: "bg-rose-500/10",
    glow: "hover:shadow-[0_0_28px_rgba(244,63,94,0.15)]",
    accent: "text-rose-300", bar: "bg-rose-500/40",
  },
  violet: {
    border: "border-violet-500/20", borderHover: "hover:border-violet-400/60",
    val: "text-violet-400", bg: "bg-violet-500/10",
    glow: "hover:shadow-[0_0_28px_rgba(139,92,246,0.15)]",
    accent: "text-violet-300", bar: "bg-violet-500/40",
  },
  green:  {
    border: "border-emerald-500/20", borderHover: "hover:border-emerald-400/60",
    val: "text-emerald-400", bg: "bg-emerald-500/10",
    glow: "hover:shadow-[0_0_28px_rgba(52,211,153,0.15)]",
    accent: "text-emerald-300", bar: "bg-emerald-500/40",
  },
  amber:  {
    border: "border-amber-500/20", borderHover: "hover:border-amber-400/60",
    val: "text-amber-400", bg: "bg-amber-500/10",
    glow: "hover:shadow-[0_0_28px_rgba(251,191,36,0.15)]",
    accent: "text-amber-300", bar: "bg-amber-500/40",
  },
};

// ── Stat card (clickable) ────────────────────────────────────────────────────
function StatCard({ label, value, sub, color, Icon, to, manageTip }) {
  const navigate  = useNavigate();
  const c         = COLOR_CONFIG[color] || COLOR_CONFIG.green;
  const clickable = Boolean(to);

  return (
    <div
      role={clickable ? "button" : undefined}
      tabIndex={clickable ? 0 : undefined}
      onClick={clickable ? () => navigate(to) : undefined}
      onKeyDown={clickable ? (e) => e.key === "Enter" && navigate(to) : undefined}
      className={[
        "group relative rounded-2xl border bg-white/[0.03] p-5 transition-all duration-300",
        c.border,
        clickable
          ? `cursor-pointer ${c.borderHover} ${c.glow} hover:-translate-y-[2px] hover:bg-white/[0.05] active:scale-[0.98] active:translate-y-0 focus:outline-none focus:ring-2 focus:ring-white/20`
          : "",
      ].join(" ")}
    >
      {clickable && (
        <div className={`absolute top-0 left-6 right-6 h-[2px] rounded-b-full ${c.bar} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
      )}
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <div className="text-xs text-slate-500 font-medium">{label}</div>
          <div className={`mt-1.5 text-2xl font-bold ${c.val}`}>{value ?? "—"}</div>
          {sub && <div className="mt-1 text-[11px] text-slate-600">{sub}</div>}
        </div>
        {Icon && (
          <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${c.bg} border ${c.border} flex-shrink-0 transition-transform duration-300 group-hover:scale-110`}>
            <Icon className={`h-5 w-5 ${c.val}`} strokeWidth={1.8} />
          </div>
        )}
      </div>
      {clickable && (
        <div className={`mt-3 flex items-center gap-1 text-[10px] font-semibold ${c.accent} opacity-0 group-hover:opacity-100 transition-opacity duration-200`}>
          <span>{manageTip || "Manage"}</span>
          <ArrowRight className="h-3 w-3" strokeWidth={2.5} />
        </div>
      )}
    </div>
  );
}

// ── Load bar ─────────────────────────────────────────────────────────────────
function LoadBar({ pct }) {
  if (pct == null) return <span className="text-slate-600 text-[11px]">—</span>;
  const color =
    pct >= 90 ? "bg-red-500"    :
    pct >= 70 ? "bg-amber-500"  :
    pct >= 40 ? "bg-yellow-400" : "bg-emerald-500";
  return (
    <div className="flex items-center gap-2">
      <div className="w-20 h-1.5 rounded-full bg-white/[0.07] overflow-hidden">
        <div className={`h-full rounded-full ${color} transition-all duration-500`} style={{ width: `${pct}%` }} />
      </div>
      <span className={`text-[11px] font-semibold ${
        pct >= 90 ? "text-red-400" : pct >= 70 ? "text-amber-400" : "text-emerald-400"
      }`}>{pct}%</span>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function SuperAdminOverview() {
  const [stats,   setStats]   = useState(null);
  const [slots,   setSlots]   = useState([]);
  const [summary, setSummary] = useState([]);
  const [sumLoading, setSumLoading] = useState(true);
  const [sumError,   setSumError]   = useState(false);

  const loadAll = () => {
    apiGetSuperAdminStats().then(setStats).catch(() => {});
    apiGetAllSlots().then(setSlots).catch(() => setSlots([]));

    setSumLoading(true);
    setSumError(false);
    apiGetCampusSummary()
      .then((data) => { setSummary(Array.isArray(data) ? data : []); })
      .catch(() => setSumError(true))
      .finally(() => setSumLoading(false));
  };

  useEffect(() => { loadAll(); }, []);

  return (
    <AppShell title="Super Admin Overview" subtitle="All campuses · System-wide view" navItems={SUPER_ADMIN_NAV}>
      <div className="fade-in space-y-6">

        {/* ── Stat cards ── */}
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard label="Total Campuses" value={stats?.campusCount} sub="Registered branches"   color="rose"   Icon={Building2}    to="/superadmin/campuses" manageTip="Manage Campuses" />
          <StatCard label="Campus Admins"  value={stats?.adminCount}  sub="Active admin accounts" color="violet" Icon={ShieldCheck}  to="/superadmin/admins"   manageTip="Manage Admins" />
          <StatCard label="Total Users"    value={stats?.totalUsers}  sub="All campuses"           color="green"  Icon={Users}        to="/superadmin/admins"   manageTip="View via Admins" />
          <StatCard label="Parking Slots"  value={slots.length || "—"} sub="Registered slots"     color="amber"  Icon={ParkingSquare} to="/superadmin/slots"   manageTip="Manage Slots" />
        </div>

        {/* ── Campus Breakdown ── */}
        <div className="rounded-2xl border border-white/[0.07] bg-white/[0.03] p-5">
          <div className="flex items-center justify-between mb-5">
            <div>
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-rose-400" strokeWidth={1.8} />
                <div className="text-sm font-semibold text-white">Campus Breakdown</div>
              </div>
              <div className="text-xs text-slate-500 mt-0.5 ml-6">
                Occupancy across all branches — live from backend
              </div>
            </div>
            <button
              onClick={loadAll}
              className="flex items-center gap-1.5 rounded-xl border border-white/[0.08] bg-white/[0.04] px-3 py-1.5 text-xs text-slate-400 hover:text-slate-200 transition"
            >
              <RefreshCw className="h-3.5 w-3.5" strokeWidth={1.8} /> Refresh
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs min-w-[600px]">
              <thead className="bg-white/[0.04] text-slate-500 font-medium">
                <tr>
                  <th className="px-4 py-3">Campus</th>
                  <th className="px-4 py-3">Admin</th>
                  <th className="px-4 py-3 text-right">Total Slots</th>
                  <th className="px-4 py-3 text-right">Available</th>
                  <th className="px-4 py-3 text-right">Occupied</th>
                  <th className="px-4 py-3">Load</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {sumLoading ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-10 text-center">
                      <div className="animate-pulse text-slate-500 text-sm">Loading campus stats…</div>
                    </td>
                  </tr>
                ) : sumError ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center">
                      <div className="inline-flex items-center gap-2 text-red-400 text-sm">
                        <AlertCircle className="h-4 w-4" strokeWidth={1.8} />
                        Could not load campus stats — is the backend running?
                      </div>
                    </td>
                  </tr>
                ) : summary.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-slate-600">
                      No campuses registered yet.{" "}
                      <a href="/superadmin/campuses" className="text-rose-400 hover:underline">Add one →</a>
                    </td>
                  </tr>
                ) : (
                  summary.map((row) => (
                    <tr key={row.id} className="hover:bg-white/[0.02] transition-colors group">
                      {/* Campus name + key */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2.5">
                          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-rose-500/10 border border-rose-500/20 flex-shrink-0">
                            <Building2 className="h-3.5 w-3.5 text-rose-400" strokeWidth={1.8} />
                          </div>
                          <div>
                            <div className="font-medium text-slate-200">{row.name}</div>
                            {row.campusKey && (
                              <div className="text-[10px] text-slate-600 font-mono">{row.campusKey}</div>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Admin */}
                      <td className="px-4 py-3">
                        {row.admin === "—" ? (
                          <span className="text-slate-600 italic">unassigned</span>
                        ) : (
                          <div className="flex items-center gap-1.5">
                            <div className="flex h-5 w-5 items-center justify-center rounded-full bg-violet-500/20 border border-violet-500/20 text-[9px] font-bold text-violet-300 flex-shrink-0">
                              {(row.admin || "?").charAt(0).toUpperCase()}
                            </div>
                            <span className="text-slate-300">{row.admin}</span>
                          </div>
                        )}
                      </td>

                      {/* Total Slots */}
                      <td className="px-4 py-3 text-right">
                        <span className="font-semibold text-slate-200">{row.totalSlots ?? "—"}</span>
                      </td>

                      {/* Available */}
                      <td className="px-4 py-3 text-right">
                        {row.available != null ? (
                          <span className="font-semibold text-emerald-400">{row.available}</span>
                        ) : (
                          <span className="text-slate-600 text-[11px]">no slots</span>
                        )}
                      </td>

                      {/* Occupied */}
                      <td className="px-4 py-3 text-right">
                        {row.occupied != null ? (
                          <span className="font-semibold text-red-400">{row.occupied}</span>
                        ) : (
                          <span className="text-slate-600 text-[11px]">—</span>
                        )}
                      </td>

                      {/* Load bar */}
                      <td className="px-4 py-3">
                        <LoadBar pct={row.loadPct} />
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* ── System-wide Parking Map ── */}
        <div className="rounded-2xl border border-white/[0.07] bg-white/[0.03] p-5">
          <div className="mb-3 flex items-center gap-2">
            <ParkingSquare className="h-4 w-4 text-rose-400" strokeWidth={1.8} />
            <span className="text-sm font-semibold text-white">System-wide Parking Map</span>
          </div>
          <ParkingMap slots={slots} />
        </div>

      </div>
    </AppShell>
  );
}
