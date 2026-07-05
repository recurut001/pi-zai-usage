/**
 * Vendored helper date/time formatting utilities.
 *
 * This package intentionally avoids a runtime Temporal polyfill dependency.
 * The Z.ai statusline only needs localized reset timestamps and compact
 * remaining-time display, which built-in Date/Intl APIs cover.
 */
/**
 * Format an instant (epoch milliseconds) as a localized date/time string.
 */
export function formatInstantFromEpochMs(ms) {
    return new Date(ms).toLocaleString(undefined, {
        weekday: "short",
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        timeZoneName: "short",
    });
}
/**
 * Format the remaining time from an instant (epoch milliseconds) to now.
 */
export function formatTimeRemainingFromEpochMs(ms) {
    const deltaMs = ms - Date.now();
    // If the target time is in the past, return zero.
    if (deltaMs < 0) {
        return "0h 0m";
    }
    const totalSeconds = Math.round(deltaMs / 1000);
    const days = Math.floor(totalSeconds / 86400);
    const hours = Math.floor((totalSeconds % 86400) / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    if (days > 0) {
        return `${days}d ${hours}h ${minutes}m`;
    }
    if (hours > 0) {
        return `${hours}h ${minutes}m`;
    }
    if (minutes > 0) {
        return `${minutes}m`;
    }
    return "<1m";
}
//# sourceMappingURL=datetime.js.map