/**
 * Vendored from @alexanderfortin/pi-usage-lib (MIT).
 * User configuration management for color thresholds.
 */
import { readFileSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";
/** Default color thresholds used when no user overrides are present. */
export const DEFAULT_COLOR_THRESHOLDS = {
    percentage: { warning: 80, critical: 90 },
    credit: { warning: 5, critical: 1 },
};
/** Filename for user-managed settings, relative to the home directory. */
export const SETTINGS_RELATIVE_PATH = ".pi/agent/usage-lib.json";
/** Resolve the absolute path to the user settings file. */
export function getSettingsFilePath() {
    return join(homedir(), SETTINGS_RELATIVE_PATH);
}
/**
 * Merge a *partial* set of user-provided thresholds into the defaults.
 *
 * Only known, numeric keys are applied — everything else (unknown keys,
 * non-numeric values) is ignored so a malformed file cannot break rendering.
 */
export function mergeThresholds(defaults, overrides) {
    const o = (overrides ?? {});
    const pct = o.percentage;
    const credit = o.credit;
    return {
        percentage: {
            warning: pickNumber(pct?.warning, defaults.percentage.warning),
            critical: pickNumber(pct?.critical, defaults.percentage.critical),
        },
        credit: {
            warning: pickNumber(credit?.warning, defaults.credit.warning),
            critical: pickNumber(credit?.critical, defaults.credit.critical),
        },
    };
}
/** Return the value if it is a finite number, otherwise the fallback. */
function pickNumber(value, fallback) {
    return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}
let cachedThresholds = null;
/**
 * Load color thresholds from `~/.pi/agent/usage-lib.json`, merged with defaults.
 *
 * The file is read **once** per process and cached — subsequent calls return
 * the cached object without touching the filesystem.
 *
 * Returns the built-in defaults if the file is missing, unreadable, or
 * contains invalid JSON.
 */
export function loadColorThresholds() {
    if (cachedThresholds)
        return cachedThresholds;
    let fileContent;
    try {
        fileContent = readFileSync(getSettingsFilePath(), "utf-8");
    }
    catch {
        // File missing or unreadable — use defaults
        cachedThresholds = { ...DEFAULT_COLOR_THRESHOLDS };
        return cachedThresholds;
    }
    let parsed;
    try {
        parsed = JSON.parse(fileContent);
    }
    catch {
        // Invalid JSON — use defaults
        cachedThresholds = { ...DEFAULT_COLOR_THRESHOLDS };
        return cachedThresholds;
    }
    const thresholds = parsed?.thresholds;
    cachedThresholds = mergeThresholds(DEFAULT_COLOR_THRESHOLDS, thresholds);
    return cachedThresholds;
}
/**
 * Reset the internal cache so the next `loadColorThresholds()` call re-reads
 * the settings file. Primarily useful for testing.
 */
export function resetThresholdsCache() {
    cachedThresholds = null;
}
//# sourceMappingURL=config.js.map