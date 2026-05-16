import { useEffect, useState } from "react";
import { CheckCircle2, XCircle, Info, X } from "lucide-react";

/**
 * Toast — floating popup notification
 *
 * Props:
 *   type    : "success" | "error" | "info"   (default "info")
 *   message : string
 *   onClose : () => void   (called when the toast is dismissed / expires)
 *   duration: number (ms)  (default 4000, pass 0 for sticky)
 */
export default function Toast({ type = "info", message, onClose, duration = 4000 }) {
  const [visible, setVisible] = useState(false);
  const [leaving, setLeaving] = useState(false);

  // mount animation
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 10);
    return () => clearTimeout(t);
  }, []);

  // auto-dismiss
  useEffect(() => {
    if (!duration || !message) return;
    const t = setTimeout(() => dismiss(), duration);
    return () => clearTimeout(t);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [duration, message]);

  const dismiss = () => {
    setLeaving(true);
    setTimeout(() => {
      setVisible(false);
      onClose?.();
    }, 300);
  };

  if (!message) return null;

  const cfg = {
    success: {
      border: "border-emerald-500/40",
      bg:     "bg-[#0c1120]/95",
      icon:   <CheckCircle2 className="h-5 w-5 text-emerald-400 flex-shrink-0" strokeWidth={2} />,
      bar:    "bg-emerald-500",
      text:   "text-emerald-100",
    },
    error: {
      border: "border-red-500/40",
      bg:     "bg-[#0c1120]/95",
      icon:   <XCircle className="h-5 w-5 text-red-400 flex-shrink-0" strokeWidth={2} />,
      bar:    "bg-red-500",
      text:   "text-red-100",
    },
    info: {
      border: "border-indigo-500/40",
      bg:     "bg-[#0c1120]/95",
      icon:   <Info className="h-5 w-5 text-indigo-400 flex-shrink-0" strokeWidth={2} />,
      bar:    "bg-indigo-500",
      text:   "text-indigo-100",
    },
  };

  const c = cfg[type] || cfg.info;

  return (
    <div
      className={`
        fixed bottom-6 right-6 z-[9999] w-full max-w-sm
        rounded-2xl border ${c.border} ${c.bg}
        shadow-2xl backdrop-blur-md
        transition-all duration-300 ease-out overflow-hidden
        ${visible && !leaving ? "opacity-100 translate-y-0 scale-100" : "opacity-0 translate-y-4 scale-95"}
      `}
    >
      {/* progress bar */}
      {duration > 0 && (
        <div className="absolute top-0 left-0 h-[2px] w-full overflow-hidden rounded-t-2xl">
          <div
            className={`h-full ${c.bar} origin-left`}
            style={{
              animation: `toast-shrink ${duration}ms linear forwards`,
            }}
          />
        </div>
      )}

      <div className="flex items-start gap-3 p-4">
        {c.icon}
        <p className={`flex-1 text-sm leading-snug ${c.text}`}>{message}</p>
        <button
          onClick={dismiss}
          className="ml-1 flex-shrink-0 rounded-lg p-0.5 text-slate-500 hover:text-slate-300 transition-colors"
        >
          <X className="h-3.5 w-3.5" strokeWidth={2.5} />
        </button>
      </div>

      <style>{`
        @keyframes toast-shrink {
          from { transform: scaleX(1); }
          to   { transform: scaleX(0); }
        }
      `}</style>
    </div>
  );
}

/**
 * useToast — lightweight hook to drive the Toast component
 *
 * Usage:
 *   const { toast, showToast } = useToast();
 *   showToast("success", "User created!");
 *   ...
 *   return <>{toast}</>;
 */
export function useToast() {
  const [toastState, setToastState] = useState(null);

  const showToast = (type, message, duration = 4000) => {
    // bump key so React re-mounts the toast on rapid consecutive calls
    setToastState({ type, message, duration, key: Date.now() });
  };

  const toast = toastState ? (
    <Toast
      key={toastState.key}
      type={toastState.type}
      message={toastState.message}
      duration={toastState.duration}
      onClose={() => setToastState(null)}
    />
  ) : null;

  return { toast, showToast };
}
