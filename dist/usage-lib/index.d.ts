/**
 * Vendored usage helper public API.
 *
 * Source adapted from @alexanderfortin/pi-usage-lib under the MIT license so
 * @beyona/pi-zai-usage can be redistributed without that runtime dependency.
 */
export { buildAuthHeaders, safeFetch, safeParseJson, UsageError } from "./api";
export { UsageCache } from "./cache";
export { colorForCredit, colorForPercentage } from "./color";
export { DEFAULT_COLOR_THRESHOLDS, getSettingsFilePath, loadColorThresholds, mergeThresholds, resetThresholdsCache, } from "./config";
export { formatInstantFromEpochMs, formatTimeRemainingFromEpochMs } from "./datetime";
export { createUsageExtension } from "./extension";
export type { ColorThresholds, FetchUsageFn, RenderErrorFn, RenderStatusFn, Theme, UsageExtensionConfig, } from "./types";
//# sourceMappingURL=index.d.ts.map