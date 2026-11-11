import { useEffect, useState } from "react";
import { CheckCircle2, AlertTriangle, Info, X } from "lucide-react";

/**
 * Event-based toasts.
 *
 * Using a DOM CustomEvent instead of context means non-React code can raise a
 * toast too -- which matters here, because the axios interceptor in
 * api/api.jsx already fires a "rate-limit" event from outside the component
 * tree and had nothing listening for it.
 *
 *   import { toast } from "../components/toast";
 *   toast("Saved to Watch later");
 *   toast("Could not save", { type: "error" });
 */
export function toast(message, { type = "success", duration = 2600 } = {}) {
    window.dispatchEvent(
        new CustomEvent("app-toast", { detail: { message, type, duration } })
    );
}

const ICONS = {
    success: CheckCircle2,
    error: AlertTriangle,
    info: Info,
};

const TONES = {
    success: "border-emerald-500/40 text-emerald-300",
    error: "border-red-500/40 text-red-300",
    info: "border-blue-500/40 text-blue-300",
};

export default function ToastHost() {
    const [toasts, setToasts] = useState([]);

    useEffect(() => {
        const push = ({ message, type, duration }) => {
            // `Date.now()` alone collides when two toasts fire in the same
            // millisecond, which React then warns about as a duplicate key.
            const id = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

            setToasts((prev) => [...prev.slice(-2), { id, message, type }]);

            setTimeout(() => {
                setToasts((prev) => prev.filter((t) => t.id !== id));
            }, duration);
        };

        const onToast = (e) => push(e.detail);
        const onRateLimit = (e) =>
            push({
                message: e.detail?.message || "You're going a bit fast.",
                type: "info",
                duration: 2600,
            });

        window.addEventListener("app-toast", onToast);
        window.addEventListener("rate-limit", onRateLimit);

        return () => {
            window.removeEventListener("app-toast", onToast);
            window.removeEventListener("rate-limit", onRateLimit);
        };
    }, []);

    if (!toasts.length) return null;

    return (
        <div
            // aria-live so screen readers announce these without stealing focus.
            aria-live="polite"
            className="pointer-events-none fixed bottom-24 left-1/2 z-[9999] flex -translate-x-1/2 flex-col items-center gap-2 px-4 md:bottom-10"
        >
            {toasts.map(({ id, message, type }) => {
                const Icon = ICONS[type] ?? Info;

                return (
                    <div
                        key={id}
                        className={`pointer-events-auto flex max-w-[90vw] items-center gap-3 rounded-xl border bg-neutral-900/95 px-4 py-3
                            text-[14px] text-white shadow-2xl backdrop-blur-sm ${TONES[type] ?? TONES.info}`}
                    >
                        <Icon size={17} className="shrink-0" />
                        <span className="text-white">{message}</span>
                        <button
                            onClick={() => setToasts((prev) => prev.filter((t) => t.id !== id))}
                            className="shrink-0 rounded p-0.5 text-neutral-400 transition-colors hover:text-white"
                            aria-label="Dismiss"
                        >
                            <X size={14} />
                        </button>
                    </div>
                );
            })}
        </div>
    );
}
