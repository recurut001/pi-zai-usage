/**
 * Vendored from @alexanderfortin/pi-usage-lib (MIT).
 * Color threshold helpers for usage display.
 */
import { loadColorThresholds } from "./config";
/**
 * Get the appropriate TUI color function for a percentage-based usage value.
 *
 * - accent (default) when percentage ≤ warning threshold
 * - warning when percentage > warning threshold
 * - error when percentage ≥ critical threshold
 */
export function colorForPercentage(percentage, theme, thresholds) {
    const t = thresholds ?? loadColorThresholds();
    if (percentage >= t.percentage.critical)
        return (s) => theme.fg("error", s);
    if (percentage > t.percentage.warning)
        return (s) => theme.fg("warning", s);
    return (s) => theme.fg("accent", s);
}
/**
 * Get the appropriate TUI color function for a credit / monetary balance value.
 *
 * - accent (default) when credit ≥ warning threshold
 * - warning when credit < warning threshold
 * - error when credit ≤ critical threshold
 */
export function colorForCredit(credit, theme, thresholds) {
    const t = thresholds ?? loadColorThresholds();
    if (credit <= t.credit.critical)
        return (s) => theme.fg("error", s);
    if (credit < t.credit.warning)
        return (s) => theme.fg("warning", s);
    return (s) => theme.fg("accent", s);
}
/** Default color thresholds — re-exported for convenience. */
export { DEFAULT_COLOR_THRESHOLDS } from "./config";
//# sourceMappingURL=color.js.map