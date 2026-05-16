import { useMemo, useState, useEffect, useCallback } from "react";
import AppShell, { ADMIN_NAV } from "../../components/AppShell.jsx";
import Input from "../../components/Input.jsx";
import Button from "../../components/Button.jsx";
import { useToast } from "../../components/Toast.jsx";
import {
  Users, Search, Trash2, Pencil, X, XCircle,
  Building2, Tag, IdCard, Lock, Car, ChevronDown, UserPlus,
  KeyRound, RefreshCw, AlertTriangle,
} from "lucide-react";
import {
  apiGetAllUsers, apiCreateUser, apiUpdateUser, apiDeleteUser, apiResetUserPassword,
} from "../../utils/api.js";

const CAMPUSES = [
  { id: "main",  label: "Main Campus"  },
  { id: "north", label: "North Campus" },
  { id: "east",  label: "East Campus"  },
  { id: "south", label: "South Campus" },
  { id: "west",  label: "West Campus"  },
];

function RoleBadge({ role }) {
  const cls = {
    STUDENT:    "border-indigo-500/30 bg-indigo-500/10 text-indigo-300",
    FACULTY:    "border-violet-500/30 bg-violet-500/10 text-violet-300",
    STAFF:      "border-cyan-500/30 bg-cyan-500/10 text-cyan-300",
    ADMIN:      "border-amber-500/30 bg-amber-500/10 text-amber-300",
    SUPER_ADMIN:"border-rose-500/30 bg-rose-500/10 text-rose-300",
  };
  return (
    <span className={`rounded-full border px-2.5 py-0.5 text-[10px] font-semibold tracking-wide ${cls[role] || "border-slate-700 text-slate-400"}`}>
      {role}
    </span>
  );
}

function Initials({ name }) {
  const l = String(name || "?").split(/\s+/).map((w) => w[0]).slice(0, 2).join("").toUpperCase();
  return (
    <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-indigo-500/20 border border-indigo-400/20 text-[11px] font-bold text-indigo-300">
      {l}
    </div>
  );
}

// ── Reset Password Modal ──────────────────────────────────────────────────────
function ResetPasswordModal({ user, onClose, onReset }) {
  const [pwd, setPwd]       = useState("");
  const [saving, setSaving] = useState(false);
  const [err, setErr]       = useState("");

  const handle = async () => {
    if (!pwd.trim()) { setErr("Enter a new password."); return; }
    setSaving(true); setErr("");
    try {
      await onReset(user.id, pwd);
      onClose();
    } catch (e) {
      setErr(e.message || "Failed to reset password.");
    } finally { setSaving(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
      <div className="w-full max-w-sm rounded-2xl border border-violet-500/20 bg-[#0c1120] p-6 shadow-2xl">
        <div className="flex items-center gap-3 mb-5">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-violet-500/10 border border-violet-500/20">
            <KeyRound className="h-5 w-5 text-violet-400" strokeWidth={1.8} />
          </div>
          <div>
            <div className="text-sm font-semibold text-white">Reset Password</div>
            <div className="text-xs text-slate-500 mt-0.5">{user.name} · {user.email}</div>
          </div>
          <button onClick={onClose} className="ml-auto text-slate-500 hover:text-slate-300">
            <X className="h-4 w-4" strokeWidth={2} />
          </button>
        </div>

        {err && (
          <div className="mb-3 flex items-center gap-2 rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs text-red-300">
            <XCircle className="h-3.5 w-3.5 flex-shrink-0" /> {err}
          </div>
        )}

        <div className="space-y-3">
          <div>
            <label className="mb-1.5 flex items-center gap-1.5 text-xs font-medium text-slate-400">
              <Lock className="h-3.5 w-3.5" strokeWidth={1.8} /> New Password
            </label>
            <Input
              type="password"
              placeholder="Enter new password"
              value={pwd}
              onChange={(e) => setPwd(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handle()}
            />
          </div>
          <div className="flex gap-2 pt-1">
            <Button text={saving ? "Resetting…" : "Reset Password"} color="violet" disabled={saving} onClick={handle} />
            <Button text="Cancel" color="ghost" onClick={onClose} />
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Delete Confirmation Modal ─────────────────────────────────────────────────
function ConfirmDeleteModal({ user, onClose, onDelete }) {
  const [loading, setLoading] = useState(false);
  const handle = async () => {
    setLoading(true);
    try { await onDelete(user.id); }
    finally { setLoading(false); }
  };
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
      <div className="w-full max-w-sm rounded-2xl border border-red-500/20 bg-[#0c1120] p-6 shadow-2xl">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-500/10 border border-red-500/20 mb-4">
          <Trash2 className="h-5 w-5 text-red-400" strokeWidth={1.8} />
        </div>
        <div className="text-base font-semibold text-white mb-1">Delete user?</div>
        <p className="text-sm text-slate-400 mb-5">
          <strong className="text-slate-200">{user.name}</strong> ({user.email}) will be permanently removed and cannot log in anymore.
        </p>
        <div className="flex gap-3">
          <Button text={loading ? "Deleting…" : "Delete"} color="danger" disabled={loading} onClick={handle} />
          <Button text="Cancel" color="ghost" onClick={onClose} />
        </div>
      </div>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function ManageUsers() {
  const { toast, showToast } = useToast();

  const [users, setUsers]       = useState([]);
  const [q, setQ]               = useState("");
  const [editing, setEditing]   = useState(null);
  const [expanded, setExpanded] = useState({});
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [resetTarget, setResetTarget]     = useState(null);
  const [fetchError, setFetchError] = useState(false);
  const [saving, setSaving]     = useState(false);
  const [loading, setLoading]   = useState(true);

  const loadUsers = useCallback(() => {
    setLoading(true);
    apiGetAllUsers()
      .then(setUsers)
      .catch(() => { setFetchError(true); setUsers([]); })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { loadUsers(); }, [loadUsers]);

  const filtered = useMemo(() => {
    const q2 = q.trim().toLowerCase();
    if (!q2) return users;
    return users.filter((u) =>
      [u.name, u.email, u.role, u.vehicle, u.license, u.batch, u.campus, u.collegeId]
        .some((v) => String(v || "").toLowerCase().includes(q2))
    );
  }, [users, q]);

  // Group by role instead of batch so ADMIN users appear separately and clearly
  const grouped = useMemo(() => {
    const roleOrder = ["STUDENT", "FACULTY", "STAFF", "ADMIN", "SUPER_ADMIN"];
    const map = {};
    filtered.forEach((u) => {
      const key = u.role || "—";
      if (!map[key]) map[key] = [];
      map[key].push(u);
    });
    // Sort by batch within STUDENT group
    if (map["STUDENT"]) {
      map["STUDENT"].sort((a, b) => {
        const ba = a.batch?.trim() || "zzz";
        const bb = b.batch?.trim() || "zzz";
        return ba.localeCompare(bb);
      });
    }
    const sortedKeys = roleOrder.filter((k) => map[k]).concat(
      Object.keys(map).filter((k) => !roleOrder.includes(k))
    );
    return { map, keys: sortedKeys };
  }, [filtered]);

  const toggleGroup = (key) => setExpanded((p) => ({ ...p, [key]: !p[key] }));

  // ── CRUD handlers ─────────────────────────────────────────────────────────
  const handleDelete = async (id) => {
    try {
      await apiDeleteUser(id);
      setUsers((p) => p.filter((u) => u.id !== id));
      setConfirmDelete(null);
      showToast("success", "User deleted successfully.");
    } catch (e) {
      showToast("error", e.message || "Failed to delete user.");
    }
  };

  const validateEdit = () => {
    if (!editing?.name)  { showToast("error", "Full name is required."); return false; }
    if (!editing?.email) { showToast("error", "Email is required.");     return false; }
    if (!editing?.role)  { showToast("error", "Role is required.");      return false; }
    if (editing.role === "STUDENT" && !editing.batch?.trim()) {
      showToast("error", "Batch is required for students (e.g. BCA 2023–26).");
      return false;
    }
    return true;
  };

  const saveEdit = async () => {
    if (!editing?.id || !validateEdit()) return;
    setSaving(true);
    try {
      const updated = await apiUpdateUser(editing.id, {
        name:        editing.name,
        email:       editing.email,
        role:        editing.role,
        campus:      editing.campus,
        batch:       editing.role === "STUDENT" ? editing.batch : "",
        collegeId:   editing.collegeId,
        vehicle:     editing.vehicle,
        license:     editing.license,
        vehicleName: editing.vehicleName,
      });
      setUsers((p) => p.map((u) => u.id === editing.id ? { ...u, ...updated } : u));
      setEditing(null);
      showToast("success", "User updated successfully.");
    } catch (e) {
      showToast("error", e.message || "Failed to update user.");
    } finally { setSaving(false); }
  };

  const handleResetPassword = async (id, newPassword) => {
    await apiResetUserPassword(id, newPassword);
    showToast("success", "Password reset successfully.");
    setResetTarget(null);
  };

  // ── Role group colors ─────────────────────────────────────────────────────
  const roleColor = {
    STUDENT:    { ring: "border-indigo-500/20", icon: "bg-indigo-500/10 border-indigo-500/20", iconText: "text-indigo-400" },
    FACULTY:    { ring: "border-violet-500/20", icon: "bg-violet-500/10 border-violet-500/20", iconText: "text-violet-400" },
    STAFF:      { ring: "border-cyan-500/20",   icon: "bg-cyan-500/10   border-cyan-500/20",   iconText: "text-cyan-400"   },
    ADMIN:      { ring: "border-amber-500/20",  icon: "bg-amber-500/10  border-amber-500/20",  iconText: "text-amber-400"  },
    SUPER_ADMIN:{ ring: "border-rose-500/20",   icon: "bg-rose-500/10   border-rose-500/20",   iconText: "text-rose-400"   },
  };

  return (
    <AppShell title="Manage Users" subtitle="Edit, delete and reset passwords for campus users" navItems={ADMIN_NAV}>
      {toast}

      {/* Modals */}
      {confirmDelete && (
        <ConfirmDeleteModal
          user={confirmDelete}
          onClose={() => setConfirmDelete(null)}
          onDelete={handleDelete}
        />
      )}
      {resetTarget && (
        <ResetPasswordModal
          user={resetTarget}
          onClose={() => setResetTarget(null)}
          onReset={handleResetPassword}
        />
      )}

      <div className="fade-in space-y-5">
        <div className="grid gap-6 xl:grid-cols-3">
          {/* ── Users list ── */}
          <div className="space-y-4 xl:col-span-2">
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex-1 min-w-[200px]">
                <Input
                  id="user-search"
                  placeholder="Search name, email, batch, vehicle…"
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  icon={<Search className="h-4 w-4" strokeWidth={1.8} />}
                />
              </div>
              <div className="rounded-xl border border-white/[0.07] bg-white/[0.03] px-4 py-2.5 text-sm">
                <span className="text-slate-500">Total:</span>{" "}
                <span className="font-semibold text-white">{users.length}</span>
              </div>
              <button
                onClick={loadUsers}
                className="flex items-center gap-1.5 rounded-xl border border-white/[0.08] bg-white/[0.04] px-3 py-2.5 text-xs text-slate-400 hover:text-slate-200 transition"
              >
                <RefreshCw className="h-3.5 w-3.5" strokeWidth={1.8} /> Refresh
              </button>
            </div>

            {fetchError && (
              <div className="flex items-center gap-2 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-300">
                <XCircle className="h-4 w-4 flex-shrink-0" />
                Could not reach backend. Check that it is running on port 8080.
              </div>
            )}

            {loading ? (
              <div className="rounded-2xl border border-white/[0.06] bg-white/[0.03] p-10 text-center">
                <div className="animate-pulse text-sm text-slate-500">Loading users…</div>
              </div>
            ) : grouped.keys.length === 0 ? (
              <div className="rounded-2xl border border-white/[0.06] bg-white/[0.03] p-12 text-center">
                <Users className="h-12 w-12 text-slate-700 mx-auto mb-3" strokeWidth={1} />
                <div className="text-sm text-slate-500">No users found</div>
                <div className="text-xs text-slate-600 mt-1">Create users from the Admin Dashboard</div>
              </div>
            ) : (
              grouped.keys.map((roleKey) => {
                const rc = roleColor[roleKey] || roleColor.STUDENT;
                const groupUsers = grouped.map[roleKey];
                const isOpen = expanded[roleKey] !== false; // default open
                return (
                  <div key={roleKey} className={`rounded-2xl border ${rc.ring} bg-white/[0.03] overflow-hidden`}>
                    {/* Group header */}
                    <div
                      className="flex cursor-pointer items-center justify-between px-5 py-3.5 hover:bg-white/[0.03] transition-colors"
                      onClick={() => toggleGroup(roleKey)}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${rc.icon} border`}>
                          <Users className={`h-4 w-4 ${rc.iconText}`} strokeWidth={1.8} />
                        </div>
                        <div>
                          <span className="text-sm font-semibold text-white capitalize">
                            {roleKey.replace("_", " ").toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase())}
                          </span>
                          <span className="ml-2 rounded-full border border-white/[0.08] bg-white/[0.05] px-2 py-0.5 text-[10px] text-slate-400">
                            {groupUsers.length} users
                          </span>
                        </div>
                      </div>
                      <ChevronDown
                        className={`h-4 w-4 text-slate-500 transition-transform duration-200 ${isOpen ? "" : "-rotate-90"}`}
                        strokeWidth={2}
                      />
                    </div>

                    {isOpen && (
                      <div className="border-t border-white/[0.04]">
                        <table className="w-full text-left text-xs">
                          <thead className="bg-white/[0.03] text-slate-500 font-medium">
                            <tr>
                              <th className="px-5 py-2.5">User</th>
                              <th className="px-4 py-2.5 hidden sm:table-cell">Campus</th>
                              {roleKey === "STUDENT" && <th className="px-4 py-2.5 hidden md:table-cell">Batch</th>}
                              <th className="px-4 py-2.5 hidden md:table-cell">Vehicle</th>
                              <th className="px-4 py-2.5 text-right">Actions</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-white/[0.04]">
                            {groupUsers.map((u) => (
                              <tr key={u.id} className="hover:bg-white/[0.02] transition-colors">
                                <td className="px-5 py-3">
                                  <div className="flex items-center gap-2.5">
                                    <Initials name={u.name} />
                                    <div>
                                      <div className="text-xs font-medium text-slate-200">{u.name}</div>
                                      <div className="text-[10px] text-slate-500">{u.email}</div>
                                    </div>
                                  </div>
                                </td>
                                <td className="px-4 py-3 text-slate-400 hidden sm:table-cell capitalize text-xs">
                                  {CAMPUSES.find((c) => c.id === u.campus)?.label || u.campus || "—"}
                                </td>
                                {roleKey === "STUDENT" && (
                                  <td className="px-4 py-3 text-slate-400 hidden md:table-cell text-xs">
                                    {u.batch || <span className="text-slate-600">—</span>}
                                  </td>
                                )}
                                <td className="px-4 py-3 font-mono text-[10px] text-slate-400 hidden md:table-cell">
                                  {u.vehicle || "—"}
                                </td>
                                <td className="px-4 py-3 text-right">
                                  <div className="flex justify-end gap-1.5">
                                    <button
                                      title="Reset password"
                                      onClick={() => setResetTarget(u)}
                                      className="rounded-lg border border-violet-500/20 bg-violet-500/10 p-1.5 text-violet-400 hover:bg-violet-500/20 transition"
                                    >
                                      <KeyRound className="h-3.5 w-3.5" strokeWidth={1.8} />
                                    </button>
                                    <button
                                      title="Edit user"
                                      onClick={() => setEditing({ ...u, password: "" })}
                                      className="rounded-lg border border-white/[0.08] bg-white/[0.04] p-1.5 text-slate-400 hover:text-slate-200 transition"
                                    >
                                      <Pencil className="h-3.5 w-3.5" strokeWidth={1.8} />
                                    </button>
                                    <button
                                      title="Delete user"
                                      onClick={() => setConfirmDelete(u)}
                                      className="rounded-lg border border-red-500/20 bg-red-500/10 p-1.5 text-red-400 hover:bg-red-500/20 transition"
                                    >
                                      <Trash2 className="h-3.5 w-3.5" strokeWidth={1.8} />
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>

          {/* ── Edit panel ── */}
          <div>
            <div className="sticky top-24 rounded-2xl border border-white/[0.07] bg-white/[0.03] p-5">
              <div className="mb-4 flex items-center gap-2">
                <Pencil className="h-4 w-4 text-slate-400" strokeWidth={1.8} />
                <div>
                  <div className="text-sm font-semibold text-white">Edit User</div>
                  <div className="text-xs text-slate-500">Click ✏ on any user to edit</div>
                </div>
                {editing && (
                  <button onClick={() => setEditing(null)} className="ml-auto text-slate-500 hover:text-slate-300">
                    <X className="h-4 w-4" strokeWidth={2} />
                  </button>
                )}
              </div>

              {!editing ? (
                <div className="rounded-xl border border-white/[0.05] bg-white/[0.02] py-10 text-center">
                  <UserPlus className="h-8 w-8 text-slate-700 mx-auto mb-2" strokeWidth={1} />
                  <div className="text-sm text-slate-600">No user selected</div>
                </div>
              ) : (
                <div className="space-y-3">
                  {/* Role selector */}
                  <div>
                    <label className="mb-1.5 block text-xs font-medium text-slate-400">Role</label>
                    <div className="grid grid-cols-3 gap-1 rounded-xl border border-white/[0.08] bg-white/[0.03] p-1">
                      {["STUDENT", "FACULTY", "STAFF"].map((r) => (
                        <button key={r} type="button"
                          onClick={() => setEditing((s) => ({ ...s, role: r }))}
                          className={`rounded-lg py-1.5 text-xs font-medium transition-all duration-150 ${
                            editing.role === r ? "bg-indigo-500 text-white" : "text-slate-500 hover:text-slate-300"
                          }`}>
                          {r.charAt(0) + r.slice(1).toLowerCase()}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Campus */}
                  <div>
                    <label className="mb-1.5 flex items-center gap-1.5 text-xs font-medium text-slate-400">
                      <Building2 className="h-3.5 w-3.5" strokeWidth={1.8} /> Campus
                    </label>
                    <select
                      value={editing.campus || ""}
                      onChange={(e) => setEditing((s) => ({ ...s, campus: e.target.value }))}
                      className="w-full rounded-xl border border-white/[0.08] bg-white/[0.04] px-3 py-2.5 text-sm text-slate-100 outline-none focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/20 transition"
                    >
                      <option value="">Select campus…</option>
                      {CAMPUSES.map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}
                    </select>
                  </div>

                  {/* Batch — only for STUDENT */}
                  {editing.role === "STUDENT" ? (
                    <div>
                      <label className="mb-1.5 flex items-center gap-1.5 text-xs font-medium text-slate-400">
                        <Tag className="h-3.5 w-3.5" strokeWidth={1.8} />
                        Batch <span className="text-red-400 ml-0.5">*</span>
                      </label>
                      <Input
                        value={editing.batch || ""}
                        placeholder="BCA 2023–26"
                        onChange={(e) => setEditing((s) => ({ ...s, batch: e.target.value }))}
                      />
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5 rounded-lg border border-slate-700/40 bg-white/[0.02] px-3 py-2 text-[10px] text-slate-600">
                      <Tag className="h-3 w-3 flex-shrink-0" strokeWidth={1.8} />
                      Batch — not applicable for {editing.role?.toLowerCase() || "this"} role
                    </div>
                  )}

                  {/* Other fields */}
                  {[
                    { label: "College / Staff ID", key: "collegeId",  placeholder: "23BCA1021",    Icon: IdCard },
                    { label: "Full Name",           key: "name",       placeholder: "Full name",    Icon: null   },
                    { label: "Email",               key: "email",      placeholder: "Email address",Icon: null   },
                    { label: "Vehicle No",          key: "vehicle",    placeholder: "UP14 AB 1234", Icon: Car    },
                    { label: "License",             key: "license",    placeholder: "License no.",  Icon: null   },
                    { label: "Vehicle Name",        key: "vehicleName",placeholder: "Honda Activa", Icon: null   },
                  ].map(({ label, key, placeholder, Icon }) => (
                    <div key={key}>
                      <label className="mb-1.5 flex items-center gap-1.5 text-xs font-medium text-slate-400">
                        {Icon && <Icon className="h-3.5 w-3.5" strokeWidth={1.8} />}
                        {label}
                      </label>
                      <Input
                        value={editing[key] || ""}
                        placeholder={placeholder}
                        onChange={(e) => setEditing((s) => ({ ...s, [key]: e.target.value }))}
                      />
                    </div>
                  ))}

                  {editing.role === "STUDENT" && !editing.batch?.trim() && (
                    <div className="flex items-start gap-1.5 rounded-lg border border-amber-500/20 bg-amber-500/10 px-2.5 py-2 text-[10px] text-amber-300">
                      <AlertTriangle className="h-3 w-3 flex-shrink-0 mt-0.5" strokeWidth={2} />
                      Batch is required for student accounts.
                    </div>
                  )}

                  <div className="flex gap-2 pt-1">
                    <Button text={saving ? "Saving…" : "Save Changes"} color="green" disabled={saving} onClick={saveEdit} />
                    <Button text="Cancel" color="ghost" onClick={() => setEditing(null)} />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
