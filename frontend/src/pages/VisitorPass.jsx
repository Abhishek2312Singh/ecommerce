import { useEffect, useMemo, useState } from "react";
import Input from "../components/Input.jsx";
import Button from "../components/Button.jsx";
import AppShell, { ADMIN_NAV, getSession } from "../components/AppShell.jsx";
import { apiCreateVisitorPass, apiGetVisitorDailyCount, apiGetVisitorPassLogs } from "../utils/api.js";
import {
  Building2, User, Car, FileText, Users,
  QrCode, Timer, AlertTriangle, Info, Trash2,
  Lock, CheckCircle2, XCircle,
} from "lucide-react";


// backend data: "list of campuses from GET /api/admin/campuses"
const CAMPUSES = [
  { id: "main",  label: "Main Campus"  },
  { id: "north", label: "North Campus" },
  { id: "east",  label: "East Campus"  },
  { id: "south", label: "South Campus" },
  { id: "west",  label: "West Campus"  },
];

function randomPass(length = 8) {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let out = "";
  for (let i = 0; i < length; i++) out += chars[Math.floor(Math.random() * chars.length)];
  return out;
}

function formatDuration(ms) {
  const s = Math.max(0, Math.floor(ms / 1000));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
}

export default function VisitorPass() {
  const { user: sessionUser } = getSession();
  const [name, setName]           = useState("");
  const [campus, setCampus]       = useState(sessionUser?.campus || "");
  const [vehicleNo, setVehicleNo] = useState("");
  const [purpose, setPurpose]     = useState("");
  const [host, setHost]           = useState("");
  const [error, setError]         = useState("");
  const [issued, setIssued]       = useState(null);
  const [now, setNow]             = useState(Date.now());
  const [todayCount, setTodayCount] = useState(0);
  const [visitorLogs, setVisitorLogs] = useState([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  const loadVisitorStats = () => {
    apiGetVisitorDailyCount()
      .then((data) => setTodayCount(data?.count ?? 0))
      .catch(() => setTodayCount(0));
    apiGetVisitorPassLogs()
      .then((data) => setVisitorLogs(Array.isArray(data) ? data : []))
      .catch(() => setVisitorLogs([]));
  };

  useEffect(() => {
    loadVisitorStats();
  }, []);

  const remainingMs = useMemo(() => {
    if (!issued?.expiresAt) return 0;
    return new Date(issued.expiresAt).getTime() - now;
  }, [issued, now]);

  const isExpired = issued ? remainingMs <= 0 : false;

  const handleGenerate = async () => {
    if (!name || !campus || !vehicleNo || !purpose) {
      setError("Name, campus, vehicle number, and purpose are required.");
      return;
    }
    setError("");
    setSaving(true);
    try {
      const pass = await apiCreateVisitorPass({ passCode: randomPass(8), name, campus, vehicleNo, purpose, host });
      setIssued(pass);
      localStorage.setItem("sph_visitor_pass", JSON.stringify(pass));
      setName(""); setVehicleNo(""); setPurpose(""); setHost("");
      loadVisitorStats();
    } catch (err) {
      setError(err.message || "Failed to generate visitor pass.");
    } finally {
      setSaving(false);
    }
    if (false) {

    // backend data: "POST /api/admin/visitor-pass — create pass, get passCode + QR from server"
    const pass = {
      passCode:  randomPass(8),
      name,
      campus,
      vehicleNo,
      purpose,
      host,
      issuedAt:  Date.now(),
      expiresAt: Date.now() + 5 * 60 * 60 * 1000, // 5 hours
    };
    setIssued(pass);
    localStorage.setItem("sph_visitor_pass", JSON.stringify(pass));
    }
  };

  const handleClear = () => {
    localStorage.removeItem("sph_visitor_pass");
    setIssued(null);
  };

  const campusLabel = CAMPUSES.find((c) => c.id === issued?.campus)?.label || issued?.campus || "";
  const selectedCampusLabel = CAMPUSES.find((c) => c.id === campus)?.label || campus || "your campus";

  return (
    <AppShell title="Visitor Pass" subtitle="Issue temporary campus access" navItems={ADMIN_NAV} >
      <div className="fade-in">
        {/* Info bar */}
        <div className="mb-6 flex flex-wrap items-center gap-2 rounded-xl border border-amber-500/20 bg-amber-500/10 px-4 py-3">
          <svg className="h-4 w-4 flex-shrink-0 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="text-sm text-amber-300">
            Only admin can generate visitor passes. Each pass is valid for{" "}
            <strong>5 hours</strong> from issue time.
          </span>
        </div>

        <div className="mb-6 grid gap-3 sm:grid-cols-2">
          <div className="rounded-2xl border border-amber-500/20 bg-amber-500/10 p-4">
            <div className="text-xs text-amber-300">Visitors Today</div>
            <div className="mt-1 text-2xl font-bold text-white">{todayCount}</div>
            <div className="text-[11px] text-slate-500">{selectedCampusLabel}</div>
          </div>
          <div className="rounded-2xl border border-white/[0.07] bg-white/[0.03] p-4">
            <div className="text-xs text-slate-400">Recent Visitor Passes</div>
            <div className="mt-1 text-2xl font-bold text-white">{visitorLogs.length}</div>
            <div className="text-[11px] text-slate-500">Latest 50 records</div>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* ── Form ── */}
          <div className="rounded-2xl border border-white/[0.07] bg-white/[0.03] p-6">
            <div className="mb-5">
              <div className="text-sm font-semibold text-white">Visitor Details</div>
              <div className="text-xs text-slate-500 mt-0.5">Fill all required fields to generate a pass.</div>
            </div>

            {error && (
              <div className="mb-4 flex items-center gap-2 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                <svg className="h-4 w-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {error}
              </div>
            )}

            <div className="space-y-4">
              {/* Campus selector */}
              <div>
                <label className="mb-1.5 block text-xs font-medium text-slate-400">
                  Campus <span className="text-red-400">*</span>
                </label>
                {/* backend data: "fetch campus list from GET /api/admin/campuses" */}
                <select
                  value={campus}
                  onChange={(e) => setCampus(e.target.value)}
                  disabled={Boolean(sessionUser?.campus)}
                  id="visitor-campus"
                  className="w-full rounded-xl border border-white/[0.08] bg-white/[0.04] px-4 py-3 text-sm text-slate-100 outline-none focus:border-amber-500/50 focus:ring-2 focus:ring-amber-500/20 transition disabled:opacity-70"
                >
                  <option value="">Select campus for this visit…</option>
                  {CAMPUSES.map((c) => (
                    <option key={c.id} value={c.id}>{c.label}</option>
                  ))}
                </select>
              </div>

              {/* Visitor name */}
              <div>
                <label className="mb-1.5 block text-xs font-medium text-slate-400">
                  Visitor Full Name <span className="text-red-400">*</span>
                </label>
                <Input
                  id="visitor-name"
                  placeholder="Full name of visitor"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  icon={
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  }
                />
              </div>

              {/* Vehicle no */}
              <div>
                <label className="mb-1.5 block text-xs font-medium text-slate-400">
                  Vehicle Number <span className="text-red-400">*</span>
                </label>
                <Input
                  id="visitor-vehicle"
                  placeholder="e.g. UP14 AB 1234"
                  value={vehicleNo}
                  onChange={(e) => setVehicleNo(e.target.value)}
                  icon={
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0zM13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414A1 1 0 0121 11.414V16a1 1 0 01-1 1h-1" />
                    </svg>
                  }
                />
              </div>

              {/* Purpose */}
              <div>
                <label className="mb-1.5 block text-xs font-medium text-slate-400">
                  Purpose of Visit <span className="text-red-400">*</span>
                </label>
                <Input
                  id="visitor-purpose"
                  placeholder="Meeting / Delivery / Interview / Event…"
                  value={purpose}
                  onChange={(e) => setPurpose(e.target.value)}
                />
              </div>

              {/* Host (optional) */}
              <div>
                <label className="mb-1.5 block text-xs font-medium text-slate-400">
                  Host / Department <span className="text-slate-600">(optional)</span>
                </label>
                <Input
                  id="visitor-host"
                  placeholder="e.g. Prof. Sharma / CS Dept."
                  value={host}
                  onChange={(e) => setHost(e.target.value)}
                />
              </div>

              <Button
                id="visitor-generate"
                text={saving ? "Generating..." : "Generate 5-Hour Pass"}
                color="green"
                disabled={saving}
                onClick={handleGenerate}
              />

              <div className="text-[11px] text-slate-600 text-center">
                Guard can verify using the pass code + vehicle number.
              </div>
            </div>
          </div>

          {/* ── Pass card ── */}
          <div className="rounded-2xl border border-white/[0.07] bg-white/[0.03] p-6">
            <div className="flex items-center justify-between mb-5">
              <div>
                <div className="text-sm font-semibold text-white">Visitor Pass</div>
                <div className="text-xs text-slate-500 mt-0.5">Show to security guard at gate.</div>
              </div>
              {issued && (
                <button
                  onClick={handleClear}
                  className="rounded-xl border border-white/[0.08] bg-white/[0.04] px-3 py-1.5 text-xs text-slate-400 hover:text-red-300 hover:border-red-500/20 transition-colors"
                >
                  Clear pass
                </button>
              )}
            </div>

            {!issued ? (
              <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-white/[0.05] bg-white/[0.02] py-16 text-center">
                <svg className="h-10 w-10 text-slate-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                </svg>
                <div className="text-sm text-slate-600">No pass generated yet.</div>
                <div className="text-xs text-slate-700">Fill the form and click "Generate".</div>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Pass code card */}
                <div
                  className={`rounded-2xl border p-5 text-center ${
                    isExpired
                      ? "border-red-500/30 bg-red-500/10"
                      : "border-emerald-500/30 bg-emerald-500/10"
                  }`}
                >
                  <div className="text-[10px] font-semibold tracking-widest text-slate-400 mb-1">VISITOR PASS CODE</div>
                  <div className="font-mono text-4xl font-bold tracking-[0.3em] text-white">
                    {issued.passCode}
                  </div>
                  <div className="mt-3 flex flex-wrap justify-center gap-2 text-xs">
                    <span className={`rounded-full border px-3 py-1 font-medium ${isExpired ? "border-red-400/30 text-red-300" : "border-emerald-400/30 text-emerald-300"}`}>
                      {isExpired ? "EXPIRED" : "VALID — 5 hours"}
                    </span>
                    {!isExpired && (
                      <span className="rounded-full border border-white/[0.12] px-3 py-1 font-mono text-slate-200">
                        ⏱ {formatDuration(remainingMs)}
                      </span>
                    )}
                  </div>

                  {/* QR placeholder */}
                  {/* backend data: "render actual QR image from API response — pass.qrDataUrl" */}
                  <div className="mt-4 mx-auto flex h-24 w-24 items-center justify-center rounded-xl border border-white/[0.10] bg-white/[0.05]">
                    <div className="text-center">
                      <div className="text-2xl">▦</div>
                      <div className="text-[9px] text-slate-600 mt-0.5">QR</div>
                    </div>
                  </div>
                </div>

                {/* Details */}
                <div className="rounded-2xl border border-white/[0.06] bg-white/[0.03] p-4 space-y-2.5 text-sm">
                  {[
                    { label: "Name",    value: issued.name },
                    { label: "Campus",  value: campusLabel },
                    { label: "Vehicle", value: issued.vehicleNo },
                    { label: "Purpose", value: issued.purpose },
                    ...(issued.host ? [{ label: "Host", value: issued.host }] : []),
                    {
                      label: "Issued",
                      value: new Date(issued.issuedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
                    },
                    {
                      label: "Expires",
                      value: new Date(issued.expiresAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
                    },
                  ].map(({ label, value }) => (
                    <div key={label} className="flex items-center justify-between gap-3">
                      <span className="text-slate-500 text-xs">{label}</span>
                      <span className="font-medium text-slate-200 text-xs text-right">{value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="mt-6 rounded-2xl border border-white/[0.07] bg-white/[0.03] p-5">
          <div className="mb-4">
            <div className="text-sm font-semibold text-white">Visitor Log History</div>
            <div className="text-xs text-slate-500 mt-0.5">Campus-wise issued visitor passes</div>
          </div>
          <div className="overflow-x-auto rounded-xl border border-white/[0.06]">
            <table className="w-full text-left text-xs min-w-[620px]">
              <thead className="bg-white/[0.04] text-slate-500 font-medium">
                <tr>
                  <th className="px-4 py-3">Issued</th>
                  <th className="px-4 py-3">Pass Code</th>
                  <th className="px-4 py-3">Visitor</th>
                  <th className="px-4 py-3">Vehicle</th>
                  <th className="px-4 py-3">Campus</th>
                  <th className="px-4 py-3">Purpose</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {visitorLogs.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-slate-600">No visitor passes issued yet</td>
                  </tr>
                ) : (
                  visitorLogs.slice(0, 10).map((pass) => (
                    <tr key={pass.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="px-4 py-3 text-slate-400">
                        {new Date(pass.issuedAt).toLocaleString("en-IN", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}
                      </td>
                      <td className="px-4 py-3 font-mono text-amber-300">{pass.passCode}</td>
                      <td className="px-4 py-3 text-slate-300">{pass.name}</td>
                      <td className="px-4 py-3 font-mono text-slate-500">{pass.vehicleNo}</td>
                      <td className="px-4 py-3 text-slate-500">{CAMPUSES.find((c) => c.id === pass.campus)?.label || pass.campus}</td>
                      <td className="px-4 py-3 text-slate-500">{pass.purpose}</td>
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
