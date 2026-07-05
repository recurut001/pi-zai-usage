/**
 * Vendored from @alexanderfortin/pi-usage-lib (MIT).
 * Color threshold helpers for usage display.
 */
import type { ColorThresholds, Theme } from "./types";
/**
 * Get the appropriate TUI color function for a percentage-based usage value.
 *
 * - accent (default) when percentage ≤ warning threshold
 * - warning when percentage > warning threshold
 * - error when percentage ≥ critical threshold
 */
export declare function colorForPercentage(percentage: number, theme: Theme, thresholds?: ColorThresholds): (text: string) => string;
/**
 * Get the appropriate TUI color function for a credit / monetary balance value.
 *
 * - accent (default) when credit ≥ warning threshold
 * - warning when credit < warning threshold
 * - error when credit ≤ critical threshold
 */
export declare function colorForCredit(credit: number, theme: Theme, thresholds?: ColorThresholds): (text: string) => string;
/** Default color thresholds — re-exported for convenience. */
export { DEFAULT_COLOR_THRESHOLDS } from "./config";
//# sourceMappingURL=color.d.ts.map