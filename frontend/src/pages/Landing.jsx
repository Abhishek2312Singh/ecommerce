import { Link } from "react-router-dom";

const STATS = [
  { value: "5", label: "Campuses" },
  { value: "80+", label: "Parking slots" },
  { value: "2,400+", label: "Registered users" },
  { value: "5 hrs", label: "Max visitor pass" },
];

const FEATURES = [
  {
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    ),
    title: "Role-based access",
    desc: "Students, faculty, and staff have permanent credentials. Only admin can create or revoke access.",
    accent: "indigo",
  },
  {
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
      </svg>
    ),
    title: "Permanent QR tokens",
    desc: "Each campus user gets a fixed QR/token tied to their vehicle — no re-registration needed.",
    accent: "cyan",
  },
  {
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
      </svg>
    ),
    title: "Visitor passes",
    desc: "Temporary 5-hour access pass issued by admin only — no self-registration for visitors.",
    accent: "violet",
  },
  {
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
    title: "Live slot visibility",
    desc: "Real-time visual map of parking occupancy across all zones and campuses.",
    accent: "emerald",
  },
  {
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
    title: "Batch management",
    desc: "Group users by batch (e.g., BCA 2023–26). Remove an entire batch's access in one click.",
    accent: "amber",
  },
  {
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
      </svg>
    ),
    title: "Multi-campus support",
    desc: "Centralized system managing parking across all branches of the university.",
    accent: "fuchsia",
  },
];

const ACCENT_CLASSES = {
  indigo:  { icon: "bg-indigo-500/10 text-indigo-400 border-indigo-500/20",  title: "text-indigo-300"  },
  cyan:    { icon: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",        title: "text-cyan-300"    },
  violet:  { icon: "bg-violet-500/10 text-violet-400 border-violet-500/20",  title: "text-violet-300"  },
  emerald: { icon: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20", title: "text-emerald-300"},
  amber:   { icon: "bg-amber-500/10 text-amber-400 border-amber-500/20",     title: "text-amber-300"   },
  fuchsia: { icon: "bg-fuchsia-500/10 text-fuchsia-400 border-fuchsia-500/20", title: "text-fuchsia-300"},
};

// Mini animated parking grid preview for hero section
function ParkingPreview() {
  const slots = [
    "taken","taken","free","free","free",
    "free","taken","taken","free","free",
    "taken","free","free","taken","free",
  ];
  const cls = { free: "bg-emerald-500/70", taken: "bg-red-500/70" };
  return (
    <div className="grid grid-cols-5 gap-1.5">
      {slots.map((s, i) => (
        <div
          key={i}
          className={`h-7 rounded-md border ${s === "free" ? "border-emerald-400/20" : "border-red-400/20"} ${cls[s]} transition-all duration-300`}
        />
      ))}
    </div>
  );
}

export default function Landing() {
  return (
    <div className="min-h-screen bg-[#080c14] text-slate-100">
      {/* Background blobs */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="blob-indigo -top-32 left-1/3 h-[32rem] w-[40rem]" />
        <div className="blob-cyan bottom-0 right-0 h-80 w-[28rem]" />
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wMiI+PHBhdGggZD0iTTM2IDM0djZoLTZWMzRoLTZ2LTZoNnYtNmg2djZoNnY2aC02eiIvPjwvZz48L2c+PC9zdmc+')] opacity-40" />
      </div>

      {/* ── Navigation ── */}
      <header className="relative z-20 border-b border-white/[0.05] bg-[#080c14]/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-cyan-500 shadow-lg shadow-indigo-500/20">
              <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8l1 12a2 2 0 002 2h8a2 2 0 002-2L19 8" />
              </svg>
            </div>
            <div>
              <div className="text-sm font-bold grad-text">SmartParkHub</div>
              {/* backend data: "university/college name" */}
              <div className="text-[10px] text-slate-500 leading-none">Campus Parking System</div>
            </div>
          </div>

          <Link
            to="/login"
            id="nav-user-login"
            className="rounded-xl bg-indigo-500 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-400 transition-all duration-150 shadow-lg shadow-indigo-500/20"
          >
            Sign In
          </Link>
        </div>
      </header>

      <main className="relative z-10">
        {/* ── Hero ── */}
        <section className="mx-auto max-w-7xl px-6 pt-20 pb-16">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            {/* Left: text */}
            <div className="fade-in">
              <div className="inline-flex items-center gap-2 rounded-full border border-indigo-500/20 bg-indigo-500/10 px-3 py-1.5 text-xs text-indigo-300 mb-6">
                <span className="pulse-dot" />
                {/* backend data: "total live users count across all campuses" */}
                Centralized · Multi-campus · Real-time
              </div>

              <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl leading-[1.1]">
                Smarter campus <br />
                <span className="grad-text">parking,</span> verified
                <br /> access.
              </h1>

              <p className="mt-6 max-w-lg text-base text-slate-400 leading-relaxed">
                A centralized parking management system for all campuses.
                Students, faculty and staff get permanent QR-based access.
                Visitors receive timed passes issued by admin.
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  id="hero-user-login"
                  to="/login"
                  className="group inline-flex items-center gap-2 rounded-xl bg-indigo-500 px-5 py-3 text-sm font-semibold text-white hover:bg-indigo-400 transition-all duration-150 shadow-lg shadow-indigo-500/25"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  Student / Faculty / Staff Login
                  <svg className="h-4 w-4 transition-transform duration-150 group-hover:translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
                <a
                  href="#features"
                  className="inline-flex items-center gap-2 rounded-xl border border-white/[0.1] bg-white/[0.04] px-5 py-3 text-sm font-medium text-slate-300 hover:bg-white/[0.07] transition-all duration-150"
                >
                  Learn more
                </a>
              </div>

              {/* Stats row */}
              <div className="mt-12 grid grid-cols-2 gap-3 sm:grid-cols-4">
                {STATS.map((s) => (
                  <div key={s.label} className="rounded-2xl border border-white/[0.06] bg-white/[0.03] px-4 py-3 text-center">
                    <div className="text-lg font-bold text-white">{s.value}</div>
                    <div className="text-[11px] text-slate-500 mt-0.5">{s.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: parking preview card */}
            <div className="relative fade-in">
              <div className="absolute -inset-4 rounded-3xl bg-gradient-to-br from-indigo-500/10 to-cyan-500/5 blur-2xl" />
              <div className="relative rounded-3xl border border-white/[0.08] bg-white/[0.03] p-6 backdrop-blur-sm">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <div className="text-sm font-semibold text-white">Live Parking Map</div>
                    {/* backend data: "currently selected campus for this user" */}
                    <div className="text-xs text-slate-500">Main Campus · Zone Overview</div>
                  </div>
                  <span className="flex items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-1 text-[11px] text-emerald-400">
                    <span className="pulse-dot h-1.5 w-1.5" />
                    Live
                  </span>
                </div>

                <ParkingPreview />

                <div className="mt-4 grid grid-cols-3 gap-2 text-center">
                  <div className="rounded-xl border border-white/[0.06] bg-white/[0.03] py-2.5">
                    <div className="text-sm font-bold text-emerald-400">38</div>
                    <div className="text-[10px] text-slate-500">Free</div>
                  </div>
                  <div className="rounded-xl border border-white/[0.06] bg-white/[0.03] py-2.5">
                    <div className="text-sm font-bold text-red-400">42</div>
                    <div className="text-[10px] text-slate-500">Taken</div>
                  </div>
                  <div className="rounded-xl border border-white/[0.06] bg-white/[0.03] py-2.5">
                    <div className="text-sm font-bold text-amber-400">52%</div>
                    <div className="text-[10px] text-slate-500">Full</div>
                  </div>
                </div>

                <div className="mt-4 flex items-center gap-2 rounded-xl border border-white/[0.05] bg-white/[0.03] px-4 py-3">
                  <svg className="h-4 w-4 text-slate-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-xs text-slate-400">
                    Login to see your zone and get your QR token.
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── Features ── */}
        <section id="features" className="mx-auto max-w-7xl px-6 py-16">
          <div className="mb-10 text-center">
            <h2 className="text-2xl font-bold text-white sm:text-3xl">Everything campus parking needs</h2>
            <p className="mt-3 text-slate-400 text-sm max-w-xl mx-auto">
              Built for universities with multiple campuses, multiple roles, and real security requirements.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((f) => {
              const a = ACCENT_CLASSES[f.accent];
              return (
                <div
                  key={f.title}
                  className="group rounded-2xl border border-white/[0.06] bg-white/[0.03] p-5 transition-all duration-200 hover:border-white/[0.12] hover:bg-white/[0.05]"
                >
                  <div className={`inline-flex h-10 w-10 items-center justify-center rounded-xl border ${a.icon}`}>
                    {f.icon}
                  </div>
                  <div className={`mt-3 text-sm font-semibold ${a.title}`}>{f.title}</div>
                  <div className="mt-1 text-xs text-slate-400 leading-relaxed">{f.desc}</div>
                </div>
              );
            })}
          </div>
        </section>

        {/* ── CTA ── */}
        <section className="mx-auto max-w-7xl px-6 pb-20">
          <div className="relative overflow-hidden rounded-3xl border border-indigo-500/20 bg-gradient-to-br from-indigo-500/10 to-cyan-500/5 p-8 text-center">
            <div className="blob-indigo -top-12 left-1/2 h-48 w-96 -translate-x-1/2" />
            <div className="relative">
              <h2 className="text-xl font-bold text-white sm:text-2xl">
                Ready to access campus parking?
              </h2>
              <p className="mt-2 text-sm text-slate-400">
                Your credentials are created by the admin. Contact your college admin if you need access.
              </p>
              <Link
                to="/login"
                id="cta-login"
                className="mt-6 inline-flex items-center gap-2 rounded-xl bg-indigo-500 px-6 py-3 text-sm font-semibold text-white hover:bg-indigo-400 transition-all shadow-lg shadow-indigo-500/20"
              >
                Sign in to your account
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          </div>
        </section>
      </main>

      <footer className="relative z-10 border-t border-white/[0.04] px-6 py-6 text-center text-xs text-slate-600">
        {/* backend data: "college/university name for footer" */}
        © 2026 SmartParkHub · Smart Parking Allotment System · All campuses
      </footer>
    </div>
  );
}
