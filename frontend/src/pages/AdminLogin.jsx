import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import Input from "../components/Input.jsx";
import Button from "../components/Button.jsx";
import { Lock, Mail, Shield, AlertCircle, CheckCircle2, Building2, Loader2 } from "lucide-react";
import { apiLogin, apiGetCampuses } from "../utils/api.js";

// Static fallback — shown while API loads or if unreachable
const FALLBACK_CAMPUSES = [
  { id: "main",  label: "Main Campus"  },
  { id: "north", label: "North Campus" },
  { id: "east",  label: "East Campus"  },
  { id: "south", label: "South Campus" },
  { id: "west",  label: "West Campus"  },
];

export default function AdminLogin() {
  const navigate = useNavigate();

  const [campuses,        setCampuses]        = useState(FALLBACK_CAMPUSES);
  const [campusesLoading, setCampusesLoading] = useState(true);
  const [campus,          setCampus]          = useState("");
  const [email,           setEmail]           = useState("");
  const [password,        setPassword]        = useState("");
  const [error,           setError]           = useState("");
  const [loading,         setLoading]         = useState(false);

  // ── Fetch campus list from backend (mirrors Login.jsx) ────────────────────
  useEffect(() => {
    apiGetCampuses()
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setCampuses(
            data.map((c) => ({
              id:    c.campusKey || String(c.id),
              label: c.name || c.campusKey || String(c.id),
            }))
          );
        }
      })
      .catch(() => { /* silently use fallback */ })
      .finally(() => setCampusesLoading(false));
  }, []);

  // ── Login handler ─────────────────────────────────────────────────────────
  const handleLogin = async () => {
    if (!campus)   { setError("Please select your campus.");  return; }
    if (!email)    { setError("Please enter your email.");    return; }
    if (!password) { setError("Please enter your password."); return; }

    setError("");
    setLoading(true);
    try {
      const response = await apiLogin(email, password);

      if (!response || !response.token || !response.user) {
        setError("Invalid credentials."); setLoading(false); return;
      }

      const { token, user: userData } = response;

      // ── 1. Role check ──────────────────────────────────────────────────────
      if (userData.role !== "ADMIN" && userData.role !== "SUPER_ADMIN") {
        setError("This account does not have admin privileges.");
        setLoading(false); return;
      }

      // ── 2. Campus check — ADMIN only (SUPER_ADMIN is not campus-scoped) ───
      if (userData.role === "ADMIN") {
        const userCampus = userData.campus?.trim()?.toLowerCase();
        const selCampus  = campus?.trim()?.toLowerCase();

        if (userCampus && selCampus && userCampus !== selCampus) {
          const campusLabel =
            campuses.find((c) => c.id?.toLowerCase() === userCampus)?.label ||
            userData.campus;
          setError(
            `Your account is assigned to "${campusLabel}". Please select the correct campus and try again.`
          );
          setLoading(false);
          return;
        }
      }

      // ── 3. Persist JWT session ─────────────────────────────────────────────
      localStorage.setItem("sph_token", token);
      localStorage.setItem("sph_role",  userData.role);
      localStorage.setItem("sph_user",  JSON.stringify({
        ...userData,
        campus: userData.campus || campus,
      }));

      // ── 4. Route by role ───────────────────────────────────────────────────
      if (userData.role === "SUPER_ADMIN") {
        navigate("/superadmin");
      } else {
        navigate("/admin");
      }
    } catch (err) {
      setError(err.message || "Authentication failed. Check your credentials.");
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => { if (e.key === "Enter") handleLogin(); };

  return (
    <div className="min-h-screen bg-[#080c14] text-slate-100 flex">
      {/* ── Left branding (violet theme) ── */}
      <div className="hidden lg:flex lg:w-[46%] flex-col justify-between bg-gradient-to-br from-violet-600/15 to-[#080c14] border-r border-white/[0.05] p-10 relative overflow-hidden">
        <div className="blob-violet -top-20 -left-20 h-96 w-96" />
        <div className="pointer-events-none absolute bottom-0 right-0 h-72 w-72 rounded-full bg-fuchsia-500/8 blur-[80px]" />

        <div className="relative flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-600 shadow-lg shadow-violet-500/20">
            <Shield className="h-6 w-6 text-white" strokeWidth={2} />
          </div>
          <div>
            <div className="text-sm font-bold grad-text-violet">SmartParkHub · Campus Admin</div>
            <div className="text-[10px] text-slate-500">Restricted Administration Panel</div>
          </div>
        </div>

        <div className="relative space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/20 bg-amber-500/10 px-3 py-1.5 text-xs text-amber-400">
            <AlertCircle className="h-3.5 w-3.5" strokeWidth={1.8} />
            Restricted — campus administrators only
          </div>
          <h1 className="text-3xl font-extrabold text-white leading-snug">
            Admin control<br />
            <span className="grad-text-violet">center.</span>
          </h1>
          <p className="text-sm text-slate-400 leading-relaxed max-w-xs">
            Manage your campus users, issue visitor passes, and monitor parking occupancy.
          </p>
          <div className="space-y-3">
            {[
              "Create & manage users by batch",
              "Issue time-limited visitor passes",
              "Monitor real-time parking occupancy",
              "Review access logs and entry history",
            ].map((t) => (
              <div key={t} className="flex items-center gap-3 text-sm text-slate-300">
                <span className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-violet-500/20 border border-violet-500/30">
                  <CheckCircle2 className="h-3 w-3 text-violet-400" strokeWidth={2.5} />
                </span>
                {t}
              </div>
            ))}
          </div>

          {/* Campus-lock notice */}
          <div className="rounded-xl border border-violet-500/20 bg-violet-500/10 px-4 py-3 text-xs text-violet-300">
            <div className="font-semibold mb-0.5">🔒 Campus-scoped access</div>
            Your credentials are valid only for your assigned campus. Select the correct campus before signing in.
          </div>
        </div>

        <div className="relative text-[11px] text-slate-600">
          © 2026 SmartParkHub · Admin Portal
        </div>
      </div>

      {/* ── Right form ── */}
      <div className="flex flex-1 items-center justify-center px-6 py-12 relative">
        <div className="blob-violet top-0 right-0 h-64 w-64 lg:hidden" />

        <div className="relative w-full max-w-md fade-in">
          <Link to="/" className="mb-6 inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-300 transition-colors">
            ← Back to home
          </Link>

          <div className="rounded-3xl border border-violet-500/20 bg-white/[0.03] p-8 backdrop-blur-sm">
            <div className="mb-7 flex items-start gap-4">
              <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-600 shadow-lg">
                <Shield className="h-6 w-6 text-white" strokeWidth={2} />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">Admin Login</h2>
                <p className="mt-1 text-sm text-slate-400">Authorized personnel only.</p>
              </div>
            </div>

            {error && (
              <div className="mb-4 flex items-start gap-2 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" /> {error}
              </div>
            )}

            <div className="space-y-4" onKeyDown={handleKeyDown}>
              {/* ── Campus selector ── */}
              <div>
                <label className="mb-1.5 flex items-center gap-1.5 text-xs font-medium text-slate-400">
                  <Building2 className="h-3.5 w-3.5" strokeWidth={1.8} /> Your Campus
                  <span className="ml-auto text-[10px] text-slate-600">must match your assigned campus</span>
                </label>

                {campusesLoading ? (
                  /* Skeleton while API loads */
                  <div className="flex items-center gap-2 w-full rounded-xl border border-white/[0.08] bg-white/[0.04] px-4 py-3 text-sm text-slate-500">
                    <Loader2 className="h-3.5 w-3.5 animate-spin text-violet-400" strokeWidth={2} />
                    Loading campuses…
                  </div>
                ) : (
                  <select
                    value={campus}
                    onChange={(e) => setCampus(e.target.value)}
                    id="admin-login-campus"
                    className="w-full rounded-xl border border-white/[0.08] bg-white/[0.04] px-4 py-3 text-sm text-slate-100 outline-none transition focus:border-violet-500/50 focus:ring-2 focus:ring-violet-500/20"
                  >
                    <option value="">Select campus you manage…</option>
                    {campuses.map((c) => (
                      <option key={c.id} value={c.id}>{c.label}</option>
                    ))}
                  </select>
                )}
              </div>

              {/* ── Email ── */}
              <div>
                <label className="mb-1.5 flex items-center gap-1.5 text-xs font-medium text-slate-400">
                  <Mail className="h-3.5 w-3.5" strokeWidth={1.8} /> Email
                </label>
                <Input
                  id="admin-login-email"
                  placeholder="admin@campus.edu"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              {/* ── Password ── */}
              <div>
                <label className="mb-1.5 flex items-center gap-1.5 text-xs font-medium text-slate-400">
                  <Lock className="h-3.5 w-3.5" strokeWidth={1.8} /> Password
                </label>
                <Input
                  id="admin-login-password"
                  type="password"
                  placeholder="Admin password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>

              <Button
                id="admin-login-submit"
                text={loading ? "Authenticating…" : "Login as Admin"}
                color="violet"
                disabled={loading}
                onClick={handleLogin}
              />
            </div>

            <div className="mt-5 text-center text-xs text-slate-500">
              Not an admin?{" "}
              <Link to="/login" className="text-indigo-400 hover:underline">Go to user login</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
