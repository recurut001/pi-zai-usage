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
export declare function formatInstantFromEpochMs(ms: number): string;
/**
 * Format the remaining time from an instant (epoch milliseconds) to now.
 */
export declare function formatTimeRemainingFromEpochMs(ms: number): string;
//# sourceMappingURL=datetime.d.ts.map