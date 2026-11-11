/**
 * Small, dependency-free loaders.
 *
 * LoaderTwo (assets/loading2.jsx) is a full-screen overlay that mounts 80
 * animated nodes and locks body scroll -- great as a route-level splash,
 * far too heavy for "this button is busy". These are the lightweight ones.
 */

/** Inline spinner. Sized in `em` so it inherits the surrounding font size. */
export function Spinner({ size = 18, className = "", label = "Loading" }) {
    return (
        <span
            role="status"
            aria-label={label}
            className={`inline-block shrink-0 animate-spin rounded-full border-2 border-current border-t-transparent ${className}`}
            style={{ width: size, height: size, opacity: 0.7 }}
        />
    );
}

/** Centred block loader for a panel or list that is still fetching. */
export function BlockLoader({ text = "Loading", darkMode, className = "" }) {
    return (
        <div
            className={`flex flex-col items-center justify-center gap-3 py-16 ${className}`}
            role="status"
            aria-live="polite"
        >
            <Spinner size={28} className={darkMode ? "text-white" : "text-neutral-800"} />
            <p className={`text-sm ${darkMode ? "text-neutral-400" : "text-neutral-500"}`}>
                {text}
            </p>
        </div>
    );
}

/**
 * Generic shimmer box. Pair it with layout classes so the placeholder has the
 * same dimensions as the real content -- that is what stops the page from
 * jumping when data arrives (cumulative layout shift).
 */
export function Skeleton({ className = "" }) {
    return <div className={`skeleton ${className}`} aria-hidden="true" />;
}

/** Button content that swaps its label for a spinner while busy. */
export function ButtonSpinner({ busy, children, busyLabel = "Working..." }) {
    if (!busy) return children;

    return (
        <span className="inline-flex items-center gap-2">
            <Spinner size={14} />
            {busyLabel}
        </span>
    );
}
