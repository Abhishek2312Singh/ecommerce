import { useState, useEffect, useCallback } from "react";
import AppShell, { SUPER_ADMIN_NAV } from "../../components/AppShell.jsx";
import Button from "../../components/Button.jsx";
import Input from "../../components/Input.jsx";
import { useToast } from "../../components/Toast.jsx";
import {
  ShieldCheck, Building2, Plus, Trash2, Pencil, X,
  Lock, Mail, KeyRound, RefreshCw, UserCog,
} from "lucide-react";
import {
  apiGetAdmins, apiCreateAdmin, apiUpdateAdmin,
  apiDeleteAdmin, apiResetAdminPassword, apiGetCampuses,
} from "../../utils/api.js";

function AdminRow({ admin, onEdit, onDelete, onReset, campuses }) {
  const campusLabel =
    campuses.find((c) => c.campusKey === admin.campus || c.id === admin.campus)?.name ||
    admin.campus || "—";
  return (
    <tr className="hover:bg-white/[0.02] transition-colors">
      <td className="px-4 py-3">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-violet-500/20 border border-violet-400/20 text-[11px] font-bold text-violet-300 flex-shrink-0">
            {String(admin.name || "?").split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase()}
          </div>
          <div>
            <div className="text-xs font-medium text-slate-200">{admin.name}</div>
            <div className="text-[10px] text-slate-500">{admin.email}</div>
          </div>
        </div>
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-1.5 text-xs text-slate-400">
          <Building2 className="h-3.5 w-3.5 text-slate-600" strokeWidth={1.8} />
          {campusLabel}
        </div>
      </td>
      <td className="px-4 py-3">
        <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-0.5 text-[10px] font-semibold text-emerald-400">
          active
        </span>
      </td>
      <td className="px-4 py-3">
        <div className="flex gap-1.5 justify-end">
          <button
            onClick={() => onReset(admin)}
            title="Reset password"
            className="rounded-lg border border-violet-500/20 bg-violet-500/10 p-1.5 text-violet-400 hover:bg-violet-500/20 transition"
          >
            <KeyRound className="h-3.5 w-3.5" strokeWidth={1.8} />
          </button>
          <button
            onClick={() => onEdit(admin)}
            title="Edit admin"
            className="rounded-lg border border-white/[0.08] bg-white/[0.04] p-1.5 text-slate-400 hover:text-slate-200 transition"
          >
            <Pencil className="h-3.5 w-3.5" strokeWidth={1.8} />
          </button>
          <button
            onClick={() => onDelete(admin)}
            title="Delete admin"
            className="rounded-lg border border-red-500/20 bg-red-500/10 p-1.5 text-red-400 hover:bg-red-500/20 transition"
          >
            <Trash2 className="h-3.5 w-3.5" strokeWidth={1.8} />
          </button>
        </div>
      </td>
    </tr>
  );
}

export default function SuperAdminAdmins() {
  const { toast, showToast } = useToast();

  const [admins,      setAdmins]      = useState([]);
  const [campuses,    setCampuses]    = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [showForm,    setShowForm]    = useState(false);
  const [editTarget,  setEditTarget]  = useState(null);
  const [editForm,    setEditForm]    = useState({});
  const [confirmDel,  setConfirmDel]  = useState(null);
  const [resetTarget, setResetTarget] = useState(null);
  const [resetPwd,    setResetPwd]    = useState("");
  const [form,        setForm]        = useState({ name: "", email: "", campus: "", password: "" });
  const [saving,      setSaving]      = useState(false);

  const load = useCallback(() => {
    setLoading(true);
    Promise.all([apiGetAdmins(), apiGetCampuses()])
      .then(([a, c]) => { setAdmins(a); setCampuses(c); })
      .catch(() => showToast("error", "Could not load data. Is the backend running?"))
      .finally(() => setLoading(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => { load(); }, [load]);

  // ── Create admin ──────────────────────────────────────────────────────────
  const handleCreate = async () => {
    if (!form.name)     { showToast("error", "Admin name is required.");                return; }
    if (!form.email)    { showToast("error", "Email is required.");                     return; }
    if (!form.campus)   { showToast("error", "Please assign a campus.");                return; }
    if (!form.password) { showToast("error", "Temporary password is required.");        return; }
    setSaving(true);
    try {
      const a = await apiCreateAdmin({
        name: form.name, email: form.email,
        campus: form.campus, password: form.password,
      });
      setAdmins((p) => [a, ...p]);
      setForm({ name: "", email: "", campus: "", password: "" });
      setShowForm(false);
      showToast("success", `Campus admin "${form.name}" created successfully!`);
    } catch (e) {
      showToast("error", e.message || "Failed to create admin.");
    } finally { setSaving(false); }
  };

  // ── Edit admin ────────────────────────────────────────────────────────────
  const openEdit = (a) => {
    setEditTarget(a);
    setEditForm({ name: a.name, email: a.email, campus: a.campus || "" });
  };

  const handleEdit = async () => {
    if (!editTarget) return;
    if (!editForm.name)   { showToast("error", "Name is required.");   return; }
    if (!editForm.email)  { showToast("error", "Email is required.");  return; }
    if (!editForm.campus) { showToast("error", "Campus is required."); return; }
    setSaving(true);
    try {
      const updated = await apiUpdateAdmin(editTarget.id, editForm);
      setAdmins((p) => p.map((a) => a.id === editTarget.id ? { ...a, ...updated } : a));
      setEditTarget(null);
      showToast("success", "Admin details updated successfully.");
    } catch (e) {
      showToast("error", e.message || "Failed to update admin.");
    } finally { setSaving(false); }
  };

  // ── Delete admin ──────────────────────────────────────────────────────────
  const handleDelete = async () => {
    if (!confirmDel) return;
    try {
      await apiDeleteAdmin(confirmDel.id);
      setAdmins((p) => p.filter((a) => a.id !== confirmDel.id));
      const name = confirmDel.name;
      setConfirmDel(null);
      showToast("success", `Admin "${name}" removed.`);
    } catch (e) {
      showToast("error", e.message || "Failed to delete admin.");
    }
  };

  // ── Reset password ────────────────────────────────────────────────────────
  const handleReset = async () => {
    if (!resetTarget)        { showToast("error", "No admin selected.");       return; }
    if (!resetPwd.trim())    { showToast("error", "Enter a new password.");    return; }
    setSaving(true);
    try {
      await apiResetAdminPassword(resetTarget.id, resetPwd);
      setResetTarget(null);
      setResetPwd("");
      showToast("success", `Password reset for "${resetTarget.name}".`);
    } catch (e) {
      showToast("error", e.message || "Failed to reset password.");
    } finally { setSaving(false); }
  };

  const campusOptions = campuses.length > 0 ? campuses : [
    { id: "main",  campusKey: "main",  name: "Main Campus"  },
    { id: "north", campusKey: "north", name: "North Campus" },
    { id: "east",  campusKey: "east",  name: "East Campus"  },
  ];

  return (
    <AppShell
      title="Campus Admins"
      subtitle="Create and manage campus administrator accounts"
      navItems={SUPER_ADMIN_NAV}
    >
      {toast}

      {/* ── Confirm delete modal ── */}
      {confirmDel && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
          <div className="w-full max-w-sm rounded-2xl border border-red-500/20 bg-[#0c1120] p-6 shadow-2xl">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-500/10 border border-red-500/20 mb-4">
              <Trash2 className="h-5 w-5 text-red-400" strokeWidth={1.8} />
            </div>
            <div className="text-base font-semibold text-white mb-1">Remove admin?</div>
            <p className="text-sm text-slate-400 mb-5">
              <strong className="text-slate-200">{confirmDel.name}</strong> will lose all admin access and cannot log in.
            </p>
            <div className="flex gap-3">
              <Button text="Delete" color="danger" onClick={handleDelete} />
              <Button text="Cancel" color="ghost" onClick={() => setConfirmDel(null)} />
            </div>
          </div>
        </div>
      )}

      {/* ── Reset password modal ── */}
      {resetTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
          <div className="w-full max-w-sm rounded-2xl border border-violet-500/20 bg-[#0c1120] p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-5">
              <div className="text-sm font-semibold text-white flex items-center gap-2">
                <KeyRound className="h-4 w-4 text-violet-400" strokeWidth={1.8} />
                Reset Password — {resetTarget.name}
              </div>
              <button
                onClick={() => { setResetTarget(null); setResetPwd(""); }}
                className="text-slate-500 hover:text-slate-300"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="mb-1.5 block text-xs font-medium text-slate-400">New Password</label>
                <Input
                  type="password"
                  placeholder="Enter new password"
                  value={resetPwd}
                  onChange={(e) => setResetPwd(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleReset()}
                />
              </div>
              <div className="flex gap-2 pt-1">
                <Button
                  text={saving ? "Resetting…" : "Reset Password"}
                  color="violet"
                  disabled={saving}
                  onClick={handleReset}
                />
                <Button text="Cancel" color="ghost" onClick={() => { setResetTarget(null); setResetPwd(""); }} />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Edit modal ── */}
      {editTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
          <div className="w-full max-w-md rounded-2xl border border-violet-500/20 bg-[#0c1120] p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-5">
              <div className="text-sm font-semibold text-white flex items-center gap-2">
                <Pencil className="h-4 w-4 text-violet-400" strokeWidth={1.8} />
                Edit Admin — {editTarget.name}
              </div>
              <button onClick={() => setEditTarget(null)} className="text-slate-500 hover:text-slate-300">
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="mb-1.5 block text-xs font-medium text-slate-400">Full Name</label>
                <Input
                  placeholder="Full name"
                  value={editForm.name || ""}
                  onChange={(e) => setEditForm((f) => ({ ...f, name: e.target.value }))}
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium text-slate-400">Email</label>
                <Input
                  placeholder="email@campus.edu"
                  value={editForm.email || ""}
                  onChange={(e) => setEditForm((f) => ({ ...f, email: e.target.value }))}
                />
              </div>
              <div>
                <label className="mb-1.5 flex items-center gap-1.5 text-xs font-medium text-slate-400">
                  <Building2 className="h-3.5 w-3.5" strokeWidth={1.8} /> Campus
                </label>
                <select
                  value={editForm.campus || ""}
                  onChange={(e) => setEditForm((f) => ({ ...f, campus: e.target.value }))}
                  className="w-full rounded-xl border border-white/[0.08] bg-white/[0.04] px-3 py-2.5 text-sm text-slate-100 outline-none focus:border-violet-500/50 transition"
                >
                  <option value="">Select campus…</option>
                  {campusOptions.map((c) => (
                    <option key={c.campusKey || c.id} value={c.campusKey || c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div className="flex gap-2 pt-1">
                <Button
                  text={saving ? "Saving…" : "Save Changes"}
                  color="violet"
                  disabled={saving}
                  onClick={handleEdit}
                />
                <Button text="Cancel" color="ghost" onClick={() => setEditTarget(null)} />
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="fade-in space-y-6">
        {/* ── Header ── */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <UserCog className="h-4 w-4 text-violet-400" strokeWidth={1.8} />
              <div className="text-sm font-semibold text-white">Campus Administrators</div>
            </div>
            <div className="text-xs text-slate-500 mt-0.5 ml-6">
              Each admin manages exactly one campus. Admins cannot access other campuses.
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={load}
              className="flex items-center gap-1.5 rounded-xl border border-white/[0.08] bg-white/[0.04] px-3 py-2 text-xs text-slate-400 hover:text-slate-200 transition"
            >
              <RefreshCw className="h-3.5 w-3.5" strokeWidth={1.8} /> Refresh
            </button>
            <Button
              text={showForm ? "Cancel" : "Add Campus Admin"}
              color={showForm ? "ghost" : "violet"}
              onClick={() => setShowForm((v) => !v)}
              className="!w-auto px-4"
            />
          </div>
        </div>

        {/* ── Create form ── */}
        {showForm && (
          <div className="rounded-2xl border border-violet-500/20 bg-violet-500/5 p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2 text-sm font-semibold text-white">
                <Plus className="h-4 w-4 text-violet-400" strokeWidth={2} />
                Create Campus Admin
              </div>
              <button onClick={() => setShowForm(false)} className="text-slate-500 hover:text-slate-300">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 text-xs font-medium text-slate-400 flex items-center gap-1.5">
                  <ShieldCheck className="h-3.5 w-3.5" strokeWidth={1.8} /> Admin Name <span className="text-red-400">*</span>
                </label>
                <Input
                  placeholder="Full name"
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                />
              </div>
              <div>
                <label className="mb-1.5 text-xs font-medium text-slate-400 flex items-center gap-1.5">
                  <Mail className="h-3.5 w-3.5" strokeWidth={1.8} /> Email <span className="text-red-400">*</span>
                </label>
                <Input
                  placeholder="admin@campus.edu"
                  value={form.email}
                  onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                />
              </div>
              <div>
                <label className="mb-1.5 text-xs font-medium text-slate-400 flex items-center gap-1.5">
                  <Building2 className="h-3.5 w-3.5" strokeWidth={1.8} /> Assign Campus <span className="text-red-400">*</span>
                </label>
                <select
                  value={form.campus}
                  onChange={(e) => setForm((f) => ({ ...f, campus: e.target.value }))}
                  className="w-full rounded-xl border border-white/[0.08] bg-white/[0.04] px-3 py-2.5 text-sm text-slate-100 outline-none focus:border-violet-500/50 transition"
                >
                  <option value="">Select campus…</option>
                  {campusOptions.map((c) => (
                    <option key={c.campusKey || c.id} value={c.campusKey || c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1.5 text-xs font-medium text-slate-400 flex items-center gap-1.5">
                  <Lock className="h-3.5 w-3.5" strokeWidth={1.8} /> Temporary Password <span className="text-red-400">*</span>
                </label>
                <Input
                  type="password"
                  placeholder="Initial password"
                  value={form.password}
                  onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                />
              </div>
            </div>

            <div className="mt-3 rounded-xl border border-amber-500/20 bg-amber-500/10 px-3 py-2 text-xs text-amber-300">
              ⚠ This admin will only have access to the assigned campus. They cannot view or manage other campuses.
            </div>

            <div className="mt-4 flex gap-2">
              <Button
                text={saving ? "Creating…" : "Create Admin"}
                color="violet"
                disabled={saving}
                onClick={handleCreate}
                className="!w-auto px-5"
              />
              <Button text="Cancel" color="ghost" onClick={() => setShowForm(false)} className="!w-auto px-4" />
            </div>
          </div>
        )}

        {/* ── Admins table ── */}
        <div className="rounded-2xl border border-white/[0.07] bg-white/[0.03] p-5">
          {loading ? (
            <div className="py-10 text-center animate-pulse text-sm text-slate-500">Loading admins…</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs min-w-[500px]">
                <thead className="bg-white/[0.04] text-slate-500 font-medium">
                  <tr>
                    <th className="px-4 py-3">Admin</th>
                    <th className="px-4 py-3">Campus</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.04]">
                  {admins.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-4 py-10 text-center">
                        <ShieldCheck className="h-10 w-10 text-slate-700 mx-auto mb-2" strokeWidth={1} />
                        <div className="text-slate-600">No campus admins yet.</div>
                        <div className="text-xs text-slate-700 mt-0.5">Click "Add Campus Admin" to create one.</div>
                      </td>
                    </tr>
                  ) : (
                    admins.map((a) => (
                      <AdminRow
                        key={a.id}
                        admin={a}
                        campuses={campusOptions}
                        onEdit={openEdit}
                        onDelete={(admin) => setConfirmDel(admin)}
                        onReset={(admin) => { setResetTarget(admin); setResetPwd(""); }}
                      />
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}
