import { NavLink, useNavigate } from "react-router-dom";
import { useState } from "react";
import {
  LayoutDashboard, Users, Ticket, ParkingSquare,
  ClipboardList, Shield, ShieldCheck, Building2,
  LogOut, Menu, X, ChevronDown, Activity,
} from "lucide-react";

function cx(...classes) {
  return classes.filter(Boolean).join(" ");
}

export function getSession() {
  const role = localStorage.getItem("sph_role") || "";
  const raw  = localStorage.getItem("sph_user");
  let user   = null;
  try { user = raw ? JSON.parse(raw) : null; } catch { /* empty */ }
  return { role, user };
}

function Initials({ name }) {
  const letters = String(name || "U")
    .split(/\s+/).map((w) => w[0]).slice(0, 2).join("").toUpperCase();
  return (
    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-500/20 border border-indigo-400/30 text-xs font-bold text-indigo-300 select-none flex-shrink-0">
      {letters}
    </div>
  );
}

// ──────────────────────────────────────────────────────────────
// Nav definitions per role
// ──────────────────────────────────────────────────────────────
export const SUPER_ADMIN_NAV = [
  { to: "/superadmin",           label: "Overview",       Icon: LayoutDashboard, end: true },
  { to: "/superadmin/campuses",  label: "Manage Campuses", Icon: Building2 },
  { to: "/superadmin/admins",    label: "Campus Admins",   Icon: ShieldCheck },
  { to: "/superadmin/slots",     label: "All Slots",       Icon: ParkingSquare },
  { to: "/superadmin/logs",      label: "System Logs",     Icon: ClipboardList },
];

export const ADMIN_NAV = [
  { to: "/admin",              label: "Dashboard",    Icon: LayoutDashboard, end: true },
  { to: "/admin/users",        label: "Manage Users", Icon: Users },
  { to: "/admin/visitor-pass", label: "Visitor Pass", Icon: Ticket },
  { to: "/admin/slots",        label: "Slots",        Icon: ParkingSquare },
  { to: "/admin/logs",         label: "Logs",         Icon: ClipboardList },
];

export const USER_NAV = [
  { to: "/app", label: "Dashboard", Icon: LayoutDashboard, end: true },
];

// ──────────────────────────────────────────────────────────────
export default function AppShell({ title, navItems, children, subtitle }) {
  const navigate   = useNavigate();
  const { role, user } = getSession();
  const isSuperAdmin = role === "SUPER_ADMIN";
  const isAdmin    = role === "ADMIN";
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem("sph_token");
    localStorage.removeItem("sph_role");
    localStorage.removeItem("sph_user");
    navigate("/");
  };

  // Color theming per role
  const theme = {
    SUPER_ADMIN: {
      logoGrad:   "from-rose-500 to-orange-500",
      textGrad:   "from-rose-400 to-orange-400",
      activeLink: "bg-rose-500/15 text-rose-300 border border-rose-500/25",
      accent:     "rose",
    },
    ADMIN: {
      logoGrad:   "from-violet-500 to-fuchsia-600",
      textGrad:   "from-violet-400 to-fuchsia-400",
      activeLink: "bg-violet-500/15 text-violet-300 border border-violet-500/25",
      accent:     "violet",
    },
    default: {
      logoGrad:   "from-indigo-500 to-cyan-500",
      textGrad:   "from-indigo-400 to-cyan-400",
      activeLink: "bg-indigo-500/15 text-indigo-300 border border-indigo-500/25",
      accent:     "indigo",
    },
  };

  const t = theme[role] || theme.default;

  const roleLabel = {
    SUPER_ADMIN: "Super Admin",
    ADMIN:       "Campus Admin",
    STUDENT:     "Student",
    FACULTY:     "Faculty",
    STAFF:       "Staff",
  }[role] || role;

  const displayName = user?.name || user?.username || user?.email || "User";
  const campusLabel = user?.campus
    ? user.campus.charAt(0).toUpperCase() + user.campus.slice(1) + " Campus"
    : "SmartParkHub";

  const SidebarContent = () => (
    <div className="flex h-full flex-col overflow-hidden">
      {/* Logo */}
      <div className="px-4 pt-5 pb-3 flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className={`flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br ${t.logoGrad} shadow-lg flex-shrink-0`}>
            {isSuperAdmin ? (
              <ShieldCheck className="h-5 w-5 text-white" strokeWidth={2} />
            ) : isAdmin ? (
              <Shield className="h-5 w-5 text-white" strokeWidth={2} />
            ) : (
              <ParkingSquare className="h-5 w-5 text-white" strokeWidth={2} />
            )}
          </div>
          <div className="min-w-0">
            <div className={`text-sm font-bold bg-gradient-to-r ${t.textGrad} bg-clip-text text-transparent truncate`}>
              SmartParkHub
            </div>
            <div className="text-[10px] text-slate-500 leading-none mt-0.5 truncate">
              {isSuperAdmin ? "Super Admin Panel" : isAdmin ? "Campus Admin" : "Parking Portal"}
            </div>
          </div>
        </div>

        {/* Campus / scope badge */}
        <div className="mt-3 flex items-center gap-2 rounded-lg border border-white/[0.06] bg-white/[0.03] px-3 py-2">
          <Building2 className="h-3.5 w-3.5 text-slate-500 flex-shrink-0" strokeWidth={1.8} />
          {/* backend data: "active campus name from logged-in user/admin session" */}
          <span className="text-xs text-slate-400 truncate">
            {isSuperAdmin ? "All Campuses" : campusLabel}
          </span>
        </div>
      </div>

      <div className="mx-4 h-px bg-white/[0.05] flex-shrink-0" />

      {/* Nav */}
      <nav className="flex-1 space-y-0.5 overflow-y-auto px-3 py-3">
        {navItems.map(({ to, label, Icon, end, badge }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            onClick={() => setSidebarOpen(false)}
            className={({ isActive }) =>
              cx(
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-150",
                isActive ? t.activeLink : "text-slate-400 hover:bg-white/[0.05] hover:text-slate-200"
              )
            }
          >
            {Icon && <Icon className="h-4 w-4 flex-shrink-0" strokeWidth={1.8} />}
            <span className="truncate">{label}</span>
            {badge && (
              <span className="ml-auto rounded-full bg-indigo-500 px-1.5 py-0.5 text-[10px] font-bold text-white flex-shrink-0">
                {badge}
              </span>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="mx-4 h-px bg-white/[0.05] flex-shrink-0" />

      {/* User chip + logout */}
      <div className="p-4 space-y-2 flex-shrink-0">
        <div className="flex items-center gap-3 rounded-xl border border-white/[0.06] bg-white/[0.03] px-3 py-2.5">
          <Initials name={displayName} />
          <div className="min-w-0 flex-1">
            <div className="truncate text-xs font-semibold text-slate-200">{displayName}</div>
            <div className="text-[10px] text-slate-500 mt-0.5 truncate">{roleLabel}</div>
          </div>
          <span className="text-[9px] font-bold tracking-wide uppercase px-1.5 py-0.5 rounded-md border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 flex-shrink-0">
            Active
          </span>
        </div>

        <button
          onClick={handleLogout}
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-white/[0.06] bg-white/[0.03] px-3 py-2 text-sm text-slate-400 transition hover:bg-red-500/10 hover:border-red-500/30 hover:text-red-300"
        >
          <LogOut className="h-4 w-4" strokeWidth={1.8} />
          Logout
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-[#080c14] text-slate-100">
      {/* Desktop sidebar */}
      <aside className="hidden md:flex w-64 flex-col border-r border-white/[0.05] bg-[#0c1120] fixed left-0 top-0 h-screen z-30">
        <SidebarContent />
      </aside>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Mobile sidebar */}
      <aside
        className={cx(
          "fixed left-0 top-0 h-screen w-64 flex-col border-r border-white/[0.05] bg-[#0c1120] z-50 md:hidden flex transition-transform duration-300",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <SidebarContent />
      </aside>

      {/* Main area */}
      <div className="flex flex-1 flex-col md:pl-64 min-h-screen">
        {/* Top bar */}
        <header className="sticky top-0 z-20 border-b border-white/[0.05] bg-[#080c14]/80 backdrop-blur-xl">
          <div className="flex items-center justify-between px-4 py-3.5">
            <div className="flex items-center gap-3">
              <button
                className="md:hidden rounded-lg border border-white/[0.08] bg-white/[0.04] p-2 text-slate-400 hover:text-slate-200"
                onClick={() => setSidebarOpen((v) => !v)}
              >
                {sidebarOpen ? <X className="h-5 w-5" strokeWidth={2} /> : <Menu className="h-5 w-5" strokeWidth={2} />}
              </button>
              <div>
                <div className="text-base font-semibold text-white">{title}</div>
                {subtitle && <div className="text-xs text-slate-500">{subtitle}</div>}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="hidden sm:flex items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.04] px-3 py-1.5 text-xs text-slate-400">
                <Activity className="h-3 w-3 text-emerald-400" />
                System live
              </span>
              <div className="hidden sm:block">
                <Initials name={displayName} />
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto">
          <div className="mx-auto max-w-7xl px-4 py-6">{children}</div>
        </main>

        <footer className="border-t border-white/[0.04] px-4 py-3 text-[11px] text-slate-600 text-center">
          © 2026 SmartParkHub · Campus Parking Management System
        </footer>
      </div>
    </div>
  );
}
