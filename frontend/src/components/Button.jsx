// Redesigned Button — supports primary / danger / ghost / outline variants
function Button({ text, onClick, color = "blue", variant, disabled = false, className = "", type = "button" }) {
  // If explicit variant passed use it, else map old color prop
  const resolve = variant || color;

  const base =
    "inline-flex w-full items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/60 disabled:opacity-50 disabled:cursor-not-allowed";

  const variants = {
    primary:  "bg-indigo-500 text-white hover:bg-indigo-400 active:scale-[.98] shadow-lg shadow-indigo-500/20",
    blue:     "bg-indigo-500 text-white hover:bg-indigo-400 active:scale-[.98] shadow-lg shadow-indigo-500/20",
    green:    "bg-emerald-500 text-white hover:bg-emerald-400 active:scale-[.98] shadow-lg shadow-emerald-500/20",
    danger:   "bg-red-500 text-white hover:bg-red-400 active:scale-[.98] shadow-lg shadow-red-500/20",
    red:      "bg-red-500 text-white hover:bg-red-400 active:scale-[.98] shadow-lg shadow-red-500/20",
    violet:   "bg-violet-500 text-white hover:bg-violet-400 active:scale-[.98] shadow-lg shadow-violet-500/20",
    ghost:    "border border-slate-700 bg-white/[0.04] text-slate-200 hover:bg-white/[0.08] hover:border-slate-600",
    outline:  "border border-indigo-400/40 text-indigo-300 hover:bg-indigo-500/10",
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${base} ${variants[resolve] || variants.primary} ${className}`}
    >
      {text}
    </button>
  );
}

export default Button;