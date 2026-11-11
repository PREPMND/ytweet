/** "1.2K views" / "3.4M views" -- compact, locale-aware. */
export function formatViews(views = 0) {
    const n = Number(views) || 0;
    const formatted = new Intl.NumberFormat(undefined, {
        notation: "compact",
        maximumFractionDigits: 1,
    }).format(n);

    return `${formatted} view${n === 1 ? "" : "s"}`;
}

const DIVISIONS = [
    { amount: 60, unit: "second" },
    { amount: 60, unit: "minute" },
    { amount: 24, unit: "hour" },
    { amount: 7, unit: "day" },
    { amount: 4.34524, unit: "week" },
    { amount: 12, unit: "month" },
    { amount: Number.POSITIVE_INFINITY, unit: "year" },
];

/**
 * "3 hours ago". Uses Intl.RelativeTimeFormat rather than a date library --
 * it is built into every modern browser, so it costs zero bundle bytes and
 * follows the user's locale for free.
 */
export function timeAgo(date) {
    if (!date) return "";

    const then = new Date(date);
    if (Number.isNaN(then.getTime())) return "";

    const formatter = new Intl.RelativeTimeFormat(undefined, { numeric: "auto" });

    let duration = (then.getTime() - Date.now()) / 1000;

    for (const division of DIVISIONS) {
        if (Math.abs(duration) < division.amount) {
            return formatter.format(Math.round(duration), division.unit);
        }
        duration /= division.amount;
    }

    return "";
}
