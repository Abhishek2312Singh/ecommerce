import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import Input from "../components/Input.jsx";
import Button from "../components/Button.jsx";
import { Lock, Mail, Shield, AlertCircle, CheckCircle2 } from "lucide-react";
import { apiLogin } from "../utils/api.js";

export default function SuperAdminLogin() {
  const navigate = useNavigate();
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [error, setError]       = useState("");
  const [loading, setLoading]   = useState(false);

  const handleLogin = async () => {
    if (!email || !password) { setError("All fields are required."); return; }
    setError("");
    setLoading(true);
    try {
      // POST /login returns { token, user: { id, name, email, role, campus, ... } }
      const response = await apiLogin(email, password);

      if (!response || !response.token || !response.user) {
        setError("Invalid credentials. Please try again.");
        setLoading(false);
        return;
      }

      const { token, user: userData } = response;

      if (userData.role !== "SUPER_ADMIN") {
        setError("Not a super admin account. Please use the correct login portal.");
        setLoading(false);
        return;
      }

      // Persist full session (same pattern as other login pages)
      localStorage.setItem("sph_token", token);
      localStorage.setItem("sph_role",  "SUPER_ADMIN");
      localStorage.setItem("sph_user",  JSON.stringify(userData));
      navigate("/superadmin");
    } catch (err) {
      setError(err.message || "Authentication failed. Check your credentials.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#080c14] text-slate-100 flex items-center justify-center px-4">
      <div className="blob-violet top-0 right-0 h-96 w-96" />
      <div className="pointer-events-none absolute bottom-0 left-0 h-72 w-72 rounded-full bg-rose-500/10 blur-[100px]" />

      <div className="relative w-full max-w-md fade-in">
        <div className="rounded-3xl border border-rose-500/20 bg-white/[0.03] p-8 backdrop-blur-sm">
          {/* Header */}
          <div className="mb-7 flex items-center gap-4">
            <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-rose-500 to-orange-500 shadow-lg shadow-rose-500/20">
              <Shield className="h-7 w-7 text-white" strokeWidth={2} />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">Super Admin</h2>
              <p className="text-sm text-slate-500 mt-0.5">System-level access portal</p>
            </div>
          </div>

          <div className="mb-5 flex items-center gap-2 rounded-xl border border-red-500/20 bg-red-500/10 px-3 py-2.5 text-xs text-red-400">
            <AlertCircle className="h-4 w-4 flex-shrink-0" strokeWidth={1.8} />
            Extremely restricted. Manages all campuses and admins.
          </div>

          {error && (
            <div className="mb-4 flex items-center gap-2 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
              {error}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="mb-1.5 flex items-center gap-1.5 text-xs font-medium text-slate-400">
                <Mail className="h-3.5 w-3.5" strokeWidth={1.8} /> Email
              </label>
              <Input
                placeholder="superadmin@college.edu"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleLogin()}
              />
            </div>
            <div>
              <label className="mb-1.5 flex items-center gap-1.5 text-xs font-medium text-slate-400">
                <Lock className="h-3.5 w-3.5" strokeWidth={1.8} /> Password
              </label>
              <Input
                type="password"
                placeholder="Super admin password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleLogin()}
              />
            </div>
            <Button
              text={loading ? "Authenticating…" : "Login as Super Admin"}
              color="danger"
              disabled={loading}
              onClick={handleLogin}
            />
          </div>

          <div className="mt-5 text-center text-xs text-slate-600">
            <Link to="/admin/login" className="text-slate-500 hover:text-indigo-400 transition">
              ← Campus Admin Login
            </Link>
            {" · "}
            <Link to="/" className="text-slate-500 hover:text-slate-300 transition">
              Back to home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
