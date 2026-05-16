import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import Input from "../components/Input.jsx";
import Button from "../components/Button.jsx";
import { Lock, IdCard, Building2, ShieldCheck, AlertCircle, CheckCircle2 } from "lucide-react";
import { apiLogin, apiGetCampuses } from "../utils/api.js";

// Static fallback — shown if the campus API is unreachable
const FALLBACK_CAMPUSES = [
  { id: "main",  label: "Main Campus"  },
  { id: "north", label: "North Campus" },
  { id: "east",  label: "East Campus"  },
  { id: "south", label: "South Campus" },
  { id: "west",  label: "West Campus"  },
];

const ROLES = ["STUDENT", "FACULTY", "STAFF"];

export default function Login() {
  const navigate = useNavigate();
  const [campuses,  setCampuses]  = useState(FALLBACK_CAMPUSES);
  const [campus,    setCampus]    = useState("");
  const [email,     setEmail]     = useState("");
  const [password,  setPassword]  = useState("");
  const [role,      setRole]      = useState("STUDENT");
  const [error,     setError]     = useState("");
  const [loading,   setLoading]   = useState(false);

  // Fetch campus list dynamically
  useEffect(() => {
    apiGetCampuses()
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setCampuses(
            data.map((c) => ({
              id:    c.campusKey || c.id,
              label: c.name || c.campusKey || c.id,
            }))
          );
        }
      })
      .catch(() => { /* silently use fallback */ });
  }, []);

  const handleLogin = async () => {
    if (!campus)   { setError("Please select your campus.");           return; }
    if (!email)    { setError("Please enter your email.");             return; }
    if (!password) { setError("Please enter your password.");          return; }
    setError("");
    setLoading(true);

    try {
      const response = await apiLogin(email, password);

      if (!response || !response.token || !response.user) {
        setError("Invalid credentials. Check your email and password.");
        setLoading(false);
        return;
      }

      const { token, user: userData } = response;

      // ── 1. Role check ─────────────────────────────────────────────────────
      if (userData.role !== role) {
        const friendlyRole = userData.role?.charAt(0) + userData.role?.slice(1).toLowerCase();
        setError(
          `Your account is registered as "${friendlyRole}", not "${role.charAt(0) + role.slice(1).toLowerCase()}". Please select the correct role tab.`
        );
        setLoading(false);
        return;
      }

      // ── 2. Campus check ───────────────────────────────────────────────────
      // Compare selected campus against the campus stored in the user record.
      const userCampus = userData.campus?.trim()?.toLowerCase();
      const selCampus  = campus?.trim()?.toLowerCase();

      if (userCampus && selCampus && userCampus !== selCampus) {
        const campusLabel = campuses.find((c) => c.id?.toLowerCase() === userCampus)?.label || userData.campus;
        setError(
          `Your account belongs to "${campusLabel}". Please select the correct campus and try again.`
        );
        setLoading(false);
        return;
      }

      // ── 3. Persist session ────────────────────────────────────────────────
      localStorage.setItem("sph_token", token);
      localStorage.setItem("sph_role",  userData.role);
      localStorage.setItem("sph_user",  JSON.stringify({ ...userData, campus: userData.campus || campus }));
      navigate("/app");
    } catch (err) {
      setError(err.message || "Login failed. Please check your credentials.");
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleLogin();
  };

  return (
    <div className="min-h-screen bg-[#080c14] text-slate-100 flex">
      {/* ── Left branding panel ── */}
      <div className="hidden lg:flex lg:w-[46%] flex-col justify-between bg-gradient-to-br from-indigo-600/20 to-[#080c14] border-r border-white/[0.05] p-10 relative overflow-hidden">
        <div className="blob-indigo -top-20 -left-20 h-96 w-96" />
        <div className="blob-cyan bottom-0 right-0 h-72 w-72" />

        <div className="relative flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-cyan-500 shadow-lg">
            <ShieldCheck className="h-6 w-6 text-white" strokeWidth={2} />
          </div>
          <div>
            <div className="text-sm font-bold grad-text">SmartParkHub</div>
            <div className="text-[10px] text-slate-500">Campus Parking System</div>
          </div>
        </div>

        <div className="relative space-y-6">
          <h1 className="text-3xl font-extrabold text-white leading-snug">
            Your campus,<br />
            <span className="grad-text">your parking spot.</span>
          </h1>
          <p className="text-sm text-slate-400 leading-relaxed max-w-xs">
            Permanent access for students, faculty and staff. Scan in, park smart, leave fast.
          </p>
          <div className="space-y-3">
            {[
              "Permanent QR token — no re-registration",
              "Batch-managed credentials by admin",
              "Live slot availability across all zones",
            ].map((t) => (
              <div key={t} className="flex items-center gap-3 text-sm text-slate-300">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-indigo-500/20 border border-indigo-500/30 flex-shrink-0">
                  <CheckCircle2 className="h-3 w-3 text-indigo-400" strokeWidth={2.5} />
                </span>
                {t}
              </div>
            ))}
          </div>
        </div>

        {/* Campus-lock notice */}
        <div className="relative rounded-xl border border-indigo-500/20 bg-indigo-500/10 px-4 py-3 text-xs text-indigo-300">
          <div className="font-semibold mb-0.5">🔒 Campus-scoped access</div>
          Your credentials are valid only for your registered campus. Select the correct campus before signing in.
        </div>

        <div className="relative text-[11px] text-slate-600">
          © 2026 SmartParkHub · All campuses
        </div>
      </div>

      {/* ── Right login form ── */}
      <div className="flex flex-1 items-center justify-center px-6 py-12 relative">
        <div className="blob-indigo top-0 right-0 h-64 w-64 lg:hidden" />

        <div className="relative w-full max-w-md fade-in">
          <Link to="/" className="mb-6 inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-300 transition-colors">
            ← Back to home
          </Link>

          <div className="rounded-3xl border border-white/[0.08] bg-white/[0.03] p-8 backdrop-blur-sm">
            <div className="mb-7">
              <h2 className="text-2xl font-bold text-white">Welcome back</h2>
              <p className="mt-1 text-sm text-slate-400">Login with your campus credentials.</p>
            </div>

            {error && (
              <div className="mb-4 flex items-start gap-2 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
                {error}
              </div>
            )}

            <div className="space-y-4" onKeyDown={handleKeyDown}>
              {/* Campus */}
              <div>
                <label className="mb-1.5 flex items-center gap-1.5 text-xs font-medium text-slate-400">
                  <Building2 className="h-3.5 w-3.5" strokeWidth={1.8} /> Campus
                  <span className="ml-auto text-[10px] text-slate-600">must match your registered campus</span>
                </label>
                <select
                  value={campus} onChange={(e) => setCampus(e.target.value)}
                  id="login-campus"
                  className="w-full rounded-xl border border-white/[0.08] bg-white/[0.04] px-4 py-3 text-sm text-slate-100 outline-none transition focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/20"
                >
                  <option value="">Select your campus…</option>
                  {campuses.map((c) => (
                    <option key={c.id} value={c.id}>{c.label}</option>
                  ))}
                </select>
              </div>

              {/* Role tabs */}
              <div>
                <label className="mb-1.5 block text-xs font-medium text-slate-400">I am a…</label>
                <div className="grid grid-cols-3 gap-1.5 rounded-xl border border-white/[0.08] bg-white/[0.03] p-1">
                  {ROLES.map((r) => (
                    <button key={r} type="button" onClick={() => setRole(r)}
                      id={`role-tab-${r.toLowerCase()}`}
                      className={`rounded-lg py-2 text-xs font-semibold transition-all duration-150 ${
                        role === r ? "bg-indigo-500 text-white shadow-sm" : "text-slate-400 hover:text-slate-200"
                      }`}>
                      {r.charAt(0) + r.slice(1).toLowerCase()}
                    </button>
                  ))}
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="mb-1.5 flex items-center gap-1.5 text-xs font-medium text-slate-400">
                  <IdCard className="h-3.5 w-3.5" strokeWidth={1.8} />
                  {role === "STUDENT" ? "Email / Enrollment ID" : "Email"}
                </label>
                <Input
                  id="login-email"
                  placeholder={role === "STUDENT" ? "student@campus.edu" : "faculty@campus.edu"}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              {/* Password */}
              <div>
                <div className="mb-1.5 flex items-center justify-between">
                  <label className="flex items-center gap-1.5 text-xs font-medium text-slate-400">
                    <Lock className="h-3.5 w-3.5" strokeWidth={1.8} /> Password
                  </label>
                  <span className="text-[11px] text-slate-600">Issued by admin only</span>
                </div>
                <Input
                  id="login-password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>

              <Button
                id="login-submit"
                text={loading ? "Signing in…" : "Sign in"}
                color="primary"
                disabled={loading}
                onClick={handleLogin}
              />
            </div>

            <div className="mt-5 rounded-xl text-xs text-slate-500 text-center">
              Don't have access?{" "}
              <strong className="text-slate-400">Contact your campus admin</strong> to get credentials.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}