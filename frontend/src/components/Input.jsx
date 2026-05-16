// Redesigned Input — clean glass-morphism style with icon slot
function Input({
  type = "text",
  placeholder,
  value,
  onChange,
  className = "",
  icon,
  label,
  id,
}) {
  return (
    <div className="relative w-full">
      {icon && (
        <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500">
          {icon}
        </span>
      )}
      <input
        id={id}
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className={[
          "w-full rounded-xl border border-white/[0.08] bg-white/[0.04] px-4 py-3 text-sm text-slate-100",
          "placeholder:text-slate-600 outline-none transition-all duration-150",
          "focus:border-indigo-500/50 focus:bg-white/[0.07] focus:ring-2 focus:ring-indigo-500/20",
          icon ? "pl-10" : "",
          className,
        ]
          .filter(Boolean)
          .join(" ")}
      />
    </div>
  );
}

export default Input;