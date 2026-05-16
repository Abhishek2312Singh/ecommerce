import { useState, useEffect, useCallback } from "react";
import AppShell, { SUPER_ADMIN_NAV } from "../../components/AppShell.jsx";
import Button from "../../components/Button.jsx";
import Input from "../../components/Input.jsx";
import { Building2, Plus, Pencil, Trash2, X, CheckCircle2, XCircle, Globe, RefreshCw, AlertCircle } from "lucide-react";
import { apiGetCampuses, apiCreateCampus, apiUpdateCampus, apiDeleteCampus } from "../../utils/api.js";

function CampusCard({ campus, onEdit, onDelete }) {
  return (
    <div className="rounded-2xl border border-white/[0.07] bg-white/[0.03] p-5 hover:border-white/[0.12] transition-all">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-500/10 border border-rose-500/20 flex-shrink-0">
            <Building2 className="h-5 w-5 text-rose-400" strokeWidth={1.8} />
          </div>
          <div>
            <div className="font-semibold text-sm text-white">{campus.name}</div>
            <div className="text-xs text-slate-500 mt-0.5 flex items-center gap-1">
              <Globe className="h-3 w-3" strokeWidth={1.8} />{campus.location || "—"}
            </div>
            {campus.campusKey && (
              <div className="mt-1 inline-flex items-center gap-1 rounded-md border border-white/[0.08] bg-white/[0.04] px-1.5 py-0.5 text-[10px] text-slate-500 font-mono">
                key: {campus.campusKey}
              </div>
            )}
          </div>
        </div>
        <div className="flex items-center gap-1.5 flex-shrink-0">
          <button onClick={() => onEdit(campus)} className="rounded-lg border border-white/[0.08] bg-white/[0.04] p-1.5 text-slate-400 hover:text-slate-200 transition">
            <Pencil className="h-3.5 w-3.5" strokeWidth={1.8} />
          </button>
          <button onClick={() => onDelete(campus)} className="rounded-lg border border-red-500/20 bg-red-500/10 p-1.5 text-red-400 hover:bg-red-500/20 transition">
            <Trash2 className="h-3.5 w-3.5" strokeWidth={1.8} />
          </button>
        </div>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-2 text-center">
        <div className="rounded-xl border border-white/[0.05] bg-white/[0.02] py-2.5">
          <div className="text-sm font-bold text-white">{campus.totalSlots ?? "—"}</div>
          <div className="text-[10px] text-slate-500">Total Slots</div>
        </div>
        <div className="rounded-xl border border-white/[0.05] bg-white/[0.02] py-2.5">
          <div className="text-sm font-bold text-indigo-400">#{campus.id}</div>
          <div className="text-[10px] text-slate-500">Campus ID</div>
        </div>
      </div>
    </div>
  );
}

export default function SuperAdminCampuses() {
  const [campuses,   setCampuses]   = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [showForm,   setShowForm]   = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [confirmDel, setConfirmDel] = useState(null);
  const [form, setForm] = useState({ name: "", location: "", totalSlots: "", campusKey: "" });
  const [editForm, setEditForm] = useState({});
  const [msg,  setMsg]  = useState("");
  const [saving, setSaving] = useState(false);

  const flash = (m) => { setMsg(m); setTimeout(() => setMsg(""), 4000); };

  const load = useCallback(() => {
    setLoading(true);
    apiGetCampuses().then(setCampuses).catch(() => flash("error:Could not load campuses.")).finally(() => setLoading(false));
  }, []);
  useEffect(() => { load(); }, [load]);

  const handleCreate = async () => {
    if (!form.name.trim()) { flash("error:Campus name is required."); return; }
    setSaving(true);
    try {
      const c = await apiCreateCampus({ name: form.name, location: form.location, totalSlots: parseInt(form.totalSlots) || 0, campusKey: form.campusKey || form.name.toLowerCase().replace(/[^a-z0-9]+/g, "-") });
      setCampuses((p) => [...p, c]);
      setForm({ name: "", location: "", totalSlots: "", campusKey: "" });
      setShowForm(false);
      flash("success:Campus created!");
    } catch (e) { flash(`error:${e.message}`); }
    finally { setSaving(false); }
  };

  const openEdit = (c) => { setEditTarget(c); setEditForm({ name: c.name, location: c.location || "", totalSlots: c.totalSlots ?? "", campusKey: c.campusKey || "" }); };

  const handleEdit = async () => {
    if (!editTarget) return;
    setSaving(true);
    try {
      const updated = await apiUpdateCampus(editTarget.id, { ...editForm, totalSlots: parseInt(editForm.totalSlots) || 0 });
      setCampuses((p) => p.map((c) => c.id === editTarget.id ? updated : c));
      setEditTarget(null);
      flash("success:Campus updated.");
    } catch (e) { flash(`error:${e.message}`); }
    finally { setSaving(false); }
  };

  const handleDelete = async () => {
    if (!confirmDel) return;
    try {
      await apiDeleteCampus(confirmDel.id);
      setCampuses((p) => p.filter((c) => c.id !== confirmDel.id));
      setConfirmDel(null);
      flash("success:Campus removed.");
    } catch (e) { flash(`error:${e.message}`); }
  };

  const isSuccess = msg.startsWith("success:");
  const msgText   = msg.replace(/^(error|success):/, "");

  return (
    <AppShell title="Manage Campuses" subtitle="Create, edit and remove campus branches" navItems={SUPER_ADMIN_NAV}>
      <div className="fade-in space-y-6">

        {confirmDel && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
            <div className="w-full max-w-sm rounded-2xl border border-red-500/20 bg-[#0c1120] p-6 shadow-2xl">
              <AlertCircle className="h-10 w-10 text-red-400 mb-3" strokeWidth={1.5} />
              <div className="text-base font-semibold text-white mb-1">Remove campus?</div>
              <p className="text-sm text-slate-400 mb-5"><strong className="text-slate-200">{confirmDel.name}</strong> will be permanently deleted.</p>
              <div className="flex gap-3">
                <Button text="Delete" color="danger" onClick={handleDelete} />
                <Button text="Cancel" color="ghost" onClick={() => setConfirmDel(null)} />
              </div>
            </div>
          </div>
        )}

        {editTarget && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
            <div className="w-full max-w-md rounded-2xl border border-rose-500/20 bg-[#0c1120] p-6 shadow-2xl">
              <div className="flex items-center justify-between mb-5">
                <div className="text-sm font-semibold text-white flex items-center gap-2"><Building2 className="h-4 w-4 text-rose-400" strokeWidth={1.8} />Edit Campus</div>
                <button onClick={() => setEditTarget(null)} className="text-slate-500 hover:text-slate-300"><X className="h-4 w-4" strokeWidth={2} /></button>
              </div>
              <div className="space-y-3">
                {[["Campus Name *", "name", "Main Campus"], ["Location", "location", "City Centre"], ["Total Slots", "totalSlots", "80"], ["Campus Key", "campusKey", "main"]].map(([lbl, key, ph]) => (
                  <div key={key}>
                    <label className="mb-1.5 block text-xs font-medium text-slate-400">{lbl}</label>
                    <Input placeholder={ph} value={editForm[key] ?? ""} onChange={(e) => setEditForm((f) => ({ ...f, [key]: e.target.value }))} />
                  </div>
                ))}
                <div className="flex gap-2 pt-1">
                  <Button text={saving ? "Saving…" : "Save Changes"} color="primary" disabled={saving} onClick={handleEdit} />
                  <Button text="Cancel" color="ghost" onClick={() => setEditTarget(null)} />
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="text-xs text-slate-500">{campuses.length} campus{campuses.length !== 1 ? "es" : ""} registered</div>
          <div className="flex gap-2">
            <button onClick={load} className="flex items-center gap-1.5 rounded-xl border border-white/[0.08] bg-white/[0.04] px-3 py-2 text-xs text-slate-400 hover:text-slate-200 transition">
              <RefreshCw className="h-3.5 w-3.5" strokeWidth={1.8} />Refresh
            </button>
            <Button text={showForm ? "Cancel" : "Add Campus"} color="primary" onClick={() => setShowForm((v) => !v)} className="!w-auto px-4" />
          </div>
        </div>

        {msgText && (
          <div className={`flex items-center gap-2 rounded-xl border px-4 py-3 text-sm ${isSuccess ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300" : "border-red-500/30 bg-red-500/10 text-red-300"}`}>
            {isSuccess ? <CheckCircle2 className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}{msgText}
          </div>
        )}

        {showForm && (
          <div className="rounded-2xl border border-rose-500/20 bg-rose-500/5 p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2 text-sm font-semibold text-white"><Plus className="h-4 w-4 text-rose-400" />New Campus</div>
              <button onClick={() => setShowForm(false)} className="text-slate-500 hover:text-slate-300"><X className="h-4 w-4" /></button>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <Input placeholder="Campus name *" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
              <Input placeholder="Location" value={form.location} onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))} />
              <Input placeholder="Total slots" value={form.totalSlots} onChange={(e) => setForm((f) => ({ ...f, totalSlots: e.target.value }))} />
              <Input placeholder="Key (e.g. main)" value={form.campusKey} onChange={(e) => setForm((f) => ({ ...f, campusKey: e.target.value }))} />
            </div>
            <div className="mt-3 flex gap-2">
              <Button text={saving ? "Creating…" : "Create Campus"} color="primary" disabled={saving} onClick={handleCreate} className="!w-auto px-5" />
              <Button text="Cancel" color="ghost" onClick={() => setShowForm(false)} className="!w-auto px-4" />
            </div>
          </div>
        )}

        {loading ? (
          <div className="rounded-2xl border border-white/[0.06] bg-white/[0.03] p-12 text-center">
            <div className="animate-pulse text-sm text-slate-500">Loading campuses…</div>
          </div>
        ) : campuses.length === 0 ? (
          <div className="rounded-2xl border border-white/[0.06] bg-white/[0.03] p-14 text-center">
            <Building2 className="h-12 w-12 text-slate-700 mx-auto mb-3" strokeWidth={1} />
            <div className="text-sm text-slate-500">No campuses yet</div>
            <div className="text-xs text-slate-600 mt-1">Click "Add Campus" to register your first branch.</div>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {campuses.map((c) => <CampusCard key={c.id} campus={c} onEdit={openEdit} onDelete={() => setConfirmDel(c)} />)}
          </div>
        )}
      </div>
    </AppShell>
  );
}
