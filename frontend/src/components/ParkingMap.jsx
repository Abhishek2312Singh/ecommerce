import { useState } from "react";

// ─────────────────────────────────────────────────────────────────────────────
// ParkingMap — Visual parking area visualization shared by admin & user dashboards
//
// Assumes a moderate campus parking layout:
//   Zone A — Student     (40 slots: rows 4 × 10)
//   Zone B — Faculty     (20 slots: rows 2 × 10)
//   Zone C — Staff       (12 slots: rows 2 × 6)
//   Zone D — Visitor     (8 slots: rows 1 × 8)
// Total: 80 slots
//
// Each slot can be: "free" | "taken" | "reserved" | "visitor"
// ─────────────────────────────────────────────────────────────────────────────

// backend data: "real-time slot occupancy per zone per campus — replace MOCK_SLOTS"
function generateMockZone(total, takenCount, type = "taken") {
  return Array.from({ length: total }, (_, i) => ({
    id: i + 1,
    status: i < takenCount ? type : "free",
  }));
}

const ZONE_META = {
  student:  { label: "Zone A — Student",  color: "indigo", rows: 4, cols: 10 },
  faculty:  { label: "Zone B — Faculty",  color: "violet", rows: 2, cols: 10 },
  staff:    { label: "Zone C — Staff",    color: "cyan",   rows: 2, cols: 6  },
  visitor:  { label: "Zone D — Visitor",  color: "amber",  rows: 1, cols: 8  },
};

const STATUS_STYLE = {
  free:     "bg-emerald-500/80 border-emerald-400/30 hover:bg-emerald-400",
  taken:    "bg-red-500/80 border-red-400/30 cursor-not-allowed",
  reserved: "bg-amber-500/80 border-amber-400/30",
  visitor:  "bg-sky-400/80 border-sky-300/30",
};

function SlotGrid({ slots, cols }) {
  return (
    <div
      className="grid gap-1"
      style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}
    >
      {slots.map((slot) => (
        <div
          key={slot.id}
          title={`Slot #${slot.id} — ${slot.status}`}
          className={`h-5 w-full rounded-sm border transition-all duration-150 ${STATUS_STYLE[slot.status]}`}
        />
      ))}
    </div>
  );
}

function ZoneCard({ zoneKey, slots }) {
  const meta = ZONE_META[zoneKey];
  const free = slots.filter((s) => s.status === "free").length;
  const taken = slots.length - free;
  const pct = Math.round((taken / slots.length) * 100);

  const ringColors = {
    indigo: "border-indigo-500/30",
    violet: "border-violet-500/30",
    cyan:   "border-cyan-500/30",
    amber:  "border-amber-500/30",
  };
  const textColors = {
    indigo: "text-indigo-400",
    violet: "text-violet-400",
    cyan:   "text-cyan-400",
    amber:  "text-amber-400",
  };
  const barColors = {
    indigo: "bg-indigo-500",
    violet: "bg-violet-500",
    cyan:   "bg-cyan-500",
    amber:  "bg-amber-500",
  };

  return (
    <div className={`rounded-2xl border ${ringColors[meta.color]} bg-white/[0.03] p-4`}>
      <div className="flex items-center justify-between mb-3">
        <div>
          <div className={`text-xs font-semibold ${textColors[meta.color]}`}>{meta.label}</div>
          <div className="text-[11px] text-slate-500 mt-0.5">{slots.length} total slots</div>
        </div>
        <div className="text-right">
          <div className="text-lg font-bold text-white">{free}</div>
          <div className="text-[10px] text-slate-500">available</div>
        </div>
      </div>

      {/* Progress bar */}
      <div className="mb-3 h-1.5 w-full rounded-full bg-white/[0.06] overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${pct > 80 ? "bg-red-500" : pct > 50 ? "bg-amber-500" : barColors[meta.color]}`}
          style={{ width: `${pct}%` }}
        />
      </div>

      <SlotGrid slots={slots} cols={meta.cols} />

      <div className="mt-2 flex gap-1.5 text-[10px] text-slate-500 justify-end">
        <span>{taken} occupied</span>
        <span>·</span>
        <span>{free} free</span>
        <span>·</span>
        <span className={pct > 80 ? "text-red-400 font-semibold" : ""}>{pct}% full</span>
      </div>
    </div>
  );
}

  export default function ParkingMap({ slots = [], compact = false }) {
  const [activeZone, setActiveZone] = useState("all");

  const zoneMapping = {
  STUDENT: "student",
  FACULTY: "faculty",
  STAFF: "staff",
  VISITOR: "visitor",
};

const zonesData = {
  student: [],
  faculty: [],
  staff: [],
  visitor: [],
};

slots.forEach((slot) => {
  const key = zoneMapping[slot.type];
  if (zonesData[key]) {
    zonesData[key].push({
      id: slot.id,
      status: slot.occupied ? "taken" : "free",
    });
  }
});

  const totalSlots = slots.length;

const totalFree = slots.filter(s => !s.occupied).length;

const totalTaken = slots.filter(s => s.occupied).length;

const overallPct = totalSlots === 0 ? 0 : Math.round((totalTaken / totalSlots) * 100);

  const zones = activeZone === "all"
    ? Object.keys(zonesData)
    : [activeZone];

  return (
    <div className="space-y-4">
      {/* ── Header bar ── */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-white">Parking Area — Live View</span>
            <span className="flex items-center gap-1 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2 py-0.5 text-[10px] text-emerald-400">
              <span className="pulse-dot h-1.5 w-1.5" />
              {/* backend data: "live connection status to parking sensor API" */}
              Live
            </span>
          </div>
          {/* backend data: "campus name for which this map is rendered" */}
          <div className="text-xs text-slate-500 mt-0.5">Main Campus · 80 total slots</div>
        </div>

        {/* Overall stat */}
        <div className="flex items-center gap-3">
          <div className="rounded-xl border border-white/[0.07] bg-white/[0.03] px-3 py-2 text-center">
            <div className="text-xs text-slate-500">Available</div>
            <div className="text-lg font-bold text-emerald-400">{totalFree}</div>
          </div>
          <div className="rounded-xl border border-white/[0.07] bg-white/[0.03] px-3 py-2 text-center">
            <div className="text-xs text-slate-500">Occupied</div>
            <div className="text-lg font-bold text-red-400">{totalTaken}</div>
          </div>
          <div className="rounded-xl border border-white/[0.07] bg-white/[0.03] px-3 py-2 text-center">
            <div className="text-xs text-slate-500">Capacity</div>
            <div className={`text-lg font-bold ${overallPct > 80 ? "text-red-400" : overallPct > 50 ? "text-amber-400" : "text-slate-200"}`}>
              {overallPct}%
            </div>
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-3 text-[11px] text-slate-400">
        {[
          { cls: "bg-emerald-500/80", label: "Available" },
          { cls: "bg-red-500/80",     label: "Occupied" },
          { cls: "bg-amber-500/80",   label: "Reserved" },
          { cls: "bg-sky-400/80",     label: "Visitor" },
        ].map((l) => (
          <span key={l.label} className="flex items-center gap-1.5">
            <span className={`inline-block h-3 w-3 rounded-sm ${l.cls}`} />
            {l.label}
          </span>
        ))}
      </div>

      {/* Zone filter tabs */}
      <div className="flex flex-wrap gap-2">
        {[["all", "All Zones"], ["student", "Student"], ["faculty", "Faculty"], ["staff", "Staff"], ["visitor", "Visitor"]].map(
          ([key, label]) => (
            <button
              key={key}
              onClick={() => setActiveZone(key)}
              className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition-all duration-150 ${
                activeZone === key
                  ? "border-indigo-500/40 bg-indigo-500/20 text-indigo-300"
                  : "border-white/[0.06] bg-white/[0.03] text-slate-400 hover:border-white/[0.12] hover:text-slate-200"
              }`}
            >
              {label}
            </button>
          )
        )}
      </div>

      {/* Zone grids */}
      <div className={`grid gap-4 ${compact ? "grid-cols-1" : "grid-cols-1 lg:grid-cols-2"}`}>
        {zones.map((z) => (
          <ZoneCard key={z} zoneKey={z} slots={zonesData[z]} />
        ))}
      </div>
    </div>
  );
}
