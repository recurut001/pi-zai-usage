/**
 * Vendored from @alexanderfortin/pi-usage-lib (MIT).
 * Factory for usage-monitoring Pi extensions.
 */
import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
import type { UsageExtensionConfig } from "./types";
/**
 * Create a Pi usage extension from a configuration object.
 *
 * Handles all boilerplate: event registration, provider matching,
 * cache management, and footer lifecycle.
 */
export declare function createUsageExtension<TData>(config: UsageExtensionConfig<TData>): (pi: ExtensionAPI) => void;
//# sourceMappingURL=extension.d.ts.map