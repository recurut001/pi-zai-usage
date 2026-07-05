/**
 * Vendored from @alexanderfortin/pi-usage-lib (MIT).
 * User configuration management for color thresholds.
 */
import type { ColorThresholds } from "./types";
/** Default color thresholds used when no user overrides are present. */
export declare const DEFAULT_COLOR_THRESHOLDS: ColorThresholds;
/** Filename for user-managed settings, relative to the home directory. */
export declare const SETTINGS_RELATIVE_PATH = ".pi/agent/usage-lib.json";
/** Resolve the absolute path to the user settings file. */
export declare function getSettingsFilePath(): string;
/**
 * Merge a *partial* set of user-provided thresholds into the defaults.
 *
 * Only known, numeric keys are applied — everything else (unknown keys,
 * non-numeric values) is ignored so a malformed file cannot break rendering.
 */
export declare function mergeThresholds(defaults: ColorThresholds, overrides: unknown): ColorThresholds;
/**
 * Load color thresholds from `~/.pi/agent/usage-lib.json`, merged with defaults.
 *
 * The file is read **once** per process and cached — subsequent calls return
 * the cached object without touching the filesystem.
 *
 * Returns the built-in defaults if the file is missing, unreadable, or
 * contains invalid JSON.
 */
export declare function loadColorThresholds(): ColorThresholds;
/**
 * Reset the internal cache so the next `loadColorThresholds()` call re-reads
 * the settings file. Primarily useful for testing.
 */
export declare function resetThresholdsCache(): void;
//# sourceMappingURL=config.d.ts.map