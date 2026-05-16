import { useEffect, useState } from "react";
import AppShell, { ADMIN_NAV, SUPER_ADMIN_NAV, getSession } from "../../components/AppShell.jsx";
import { Download, RefreshCw } from "lucide-react";
import { apiGetRecentLogs } from "../../utils/api.js";

const CAMPUSES = [
  { id: "all", label: "All Campuses" },
  { id: "main", label: "Main Campus" },
  { id: "north", label: "North Campus" },
  { id: "east", label: "East Campus" },
  { id: "south", label: "South Campus" },
  { id: "west", label: "West Campus" },
];

const RESULT_STYLE = {
  ENTRY: "border-emerald-500/30 bg-emerald-500/10 text-emerald-300",
  EXIT: "border-red-500/30 bg-red-500/10 text-red-300",
};

function formatDateTime(value) {
  if (!value) return "--";
  return new Date(value).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function csvEscape(value) {
  return `"${String(value ?? "").replace(/"/g, '""')}"`;
}

function tokenForUser(userId) {
  return `SPH-${String(userId || "").padStart(6, "0")}`;
}

export default function Logs() {
  const { role, user } = getSession();
  const isSuperAdmin = role === "SUPER_ADMIN";
  const navItems = isSuperAdmin ? SUPER_ADMIN_NAV : ADMIN_NAV;

  const [campus, setCampus] = useState(isSuperAdmin ? "all" : user?.campus || "all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadLogs = () => {
    setLoading(true);
    setError("");
    apiGetRecentLogs(50)
      .then((data) => setLogs(Array.isArray(data) ? data : []))
      .catch((err) => {
        setLogs([]);
        setError(err.message || "Could not load parking logs.");
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    const timer = window.setTimeout(loadLogs, 0);
    return () => window.clearTimeout(timer);
  }, []);

  const campusOptions = isSuperAdmin
    ? CAMPUSES
    : CAMPUSES.filter((c) => c.id === (user?.campus || campus));

  const visibleLogs = logs.filter((log) => {
    const eventTime = log.exitTime || log.entryTime;
    const eventDate = eventTime ? new Date(eventTime) : null;

    if (campus !== "all" && String(log.campus || "").toLowerCase() !== campus.toLowerCase()) {
      return false;
    }
    if (roleFilter !== "ALL" && String(log.userRole || "").toUpperCase() !== roleFilter) {
      return false;
    }
    if (dateFrom && eventDate && eventDate < new Date(`${dateFrom}T00:00:00`)) {
      return false;
    }
    if (dateTo && eventDate && eventDate > new Date(`${dateTo}T23:59:59`)) {
      return false;
    }
    return true;
  });

  const exportCsv = () => {
    const header = ["Date & Time", "Token", "User", "Role", "Vehicle", "Gate", "Campus", "Event"];
    const rows = visibleLogs.map((log) => {
      const event = log.exitTime ? "EXIT" : "ENTRY";
      return [
        formatDateTime(log.exitTime || log.entryTime),
        tokenForUser(log.userId),
        log.userName || log.userEmail || "--",
        log.userRole || "--",
        log.vehicleNo || "--",
        log.slotId ? `Slot #${log.slotId}` : "Gate",
        log.campus || "--",
        event,
      ];
    });
    const csv = [header, ...rows].map((row) => row.map(csvEscape).join(",")).join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8;" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = "parking-logs.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <AppShell title="Access Logs" subtitle="Entry, exit, and gate events" navItems={navItems}>
      <div className="fade-in space-y-5">
        <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-white/[0.07] bg-white/[0.03] p-4">
          <div className="flex items-center gap-2">
            <svg className="h-4 w-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
            <span className="text-xs font-medium text-slate-400">Filters</span>
          </div>

          <select
            value={campus}
            onChange={(e) => setCampus(e.target.value)}
            disabled={!isSuperAdmin}
            className="rounded-xl border border-white/[0.08] bg-white/[0.04] px-3 py-2 text-xs text-slate-300 outline-none focus:border-indigo-500/40 transition disabled:opacity-60"
          >
            {campusOptions.map((c) => (
              <option key={c.id} value={c.id}>{c.label}</option>
            ))}
          </select>

          <div className="flex gap-1">
            {["ALL", "STUDENT", "FACULTY", "STAFF", "VISITOR"].map((r) => (
              <button
                key={r}
                onClick={() => setRoleFilter(r)}
                className={`rounded-lg border px-2.5 py-1.5 text-[11px] font-medium transition-all duration-150 ${
                  roleFilter === r
                    ? "border-indigo-500/40 bg-indigo-500/20 text-indigo-300"
                    : "border-white/[0.06] bg-white/[0.03] text-slate-500 hover:text-slate-300"
                }`}
              >
                {r}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 ml-auto">
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="rounded-xl border border-white/[0.08] bg-white/[0.04] px-3 py-2 text-xs text-slate-300 outline-none focus:border-indigo-500/40 transition"
            />
            <span className="text-xs text-slate-600">to</span>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="rounded-xl border border-white/[0.08] bg-white/[0.04] px-3 py-2 text-xs text-slate-300 outline-none focus:border-indigo-500/40 transition"
            />
          </div>
        </div>

        <div className="flex flex-wrap gap-3 text-[11px] text-slate-500">
          <span className={`flex items-center gap-1.5 rounded-full border px-2.5 py-1 ${RESULT_STYLE.ENTRY}`}>
            ENTRY - User entered parking
          </span>
          <span className={`flex items-center gap-1.5 rounded-full border px-2.5 py-1 ${RESULT_STYLE.EXIT}`}>
            EXIT - User exited parking
          </span>
        </div>

        <div className="rounded-2xl border border-white/[0.07] bg-white/[0.03] p-5">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <div className="text-sm font-semibold text-white">Event Log</div>
              <div className="text-xs text-slate-500 mt-0.5">Showing live parking records from the backend</div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={loadLogs}
                className="inline-flex items-center gap-1.5 rounded-xl border border-white/[0.08] bg-white/[0.04] px-3 py-1.5 text-xs text-slate-400 hover:text-slate-200 transition"
              >
                <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} strokeWidth={1.8} />
                Refresh
              </button>
              <button
                onClick={exportCsv}
                disabled={visibleLogs.length === 0}
                className="inline-flex items-center gap-1.5 rounded-xl border border-white/[0.08] bg-white/[0.04] px-3 py-1.5 text-xs text-slate-400 hover:text-slate-200 transition disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <Download className="h-3.5 w-3.5" strokeWidth={1.8} />
                Export CSV
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs min-w-[600px]">
              <thead className="bg-white/[0.04] text-slate-500 font-medium">
                <tr>
                  <th className="px-4 py-3">Date & Time</th>
                  <th className="px-4 py-3">Token / Pass</th>
                  <th className="px-4 py-3">User / Visitor</th>
                  <th className="px-4 py-3">Vehicle</th>
                  <th className="px-4 py-3">Gate</th>
                  <th className="px-4 py-3">Campus</th>
                  <th className="px-4 py-3">Event</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-12 text-center">
                      <div className="animate-pulse text-slate-500">Loading logs...</div>
                    </td>
                  </tr>
                ) : error ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-12 text-center text-red-300">{error}</td>
                  </tr>
                ) : visibleLogs.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-12 text-center">
                      <div className="flex flex-col items-center gap-2 text-slate-600">
                        <svg className="h-8 w-8 opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <div>No logs match the current filters</div>
                      </div>
                    </td>
                  </tr>
                ) : (
                  visibleLogs.map((log) => {
                    const event = log.exitTime ? "EXIT" : "ENTRY";
                    return (
                      <tr key={log.id} className="hover:bg-white/[0.02] transition-colors">
                        <td className="px-4 py-3 text-slate-400">{formatDateTime(log.exitTime || log.entryTime)}</td>
                        <td className="px-4 py-3 font-mono text-slate-500">{tokenForUser(log.userId)}</td>
                        <td className="px-4 py-3">
                          <div className="font-medium text-slate-300">{log.userName || "--"}</div>
                          <div className="text-[10px] text-slate-600">{log.userRole || log.userEmail || "--"}</div>
                        </td>
                        <td className="px-4 py-3 font-mono text-slate-500">{log.vehicleNo || "--"}</td>
                        <td className="px-4 py-3 text-slate-500">{log.slotId ? `Slot #${log.slotId}` : "Gate"}</td>
                        <td className="px-4 py-3 text-slate-500">{log.campus || "--"}</td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex rounded-full border px-2.5 py-1 text-[10px] font-bold ${RESULT_STYLE[event]}`}>
                            {event}
                          </span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          <div className="mt-4 flex items-center justify-between border-t border-white/[0.05] pt-4">
            <div className="text-xs text-slate-600">Showing {visibleLogs.length} of {logs.length} events</div>
            <div className="text-xs text-slate-600">Latest 50 records</div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
