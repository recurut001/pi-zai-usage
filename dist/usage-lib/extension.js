/**
 * Vendored from @alexanderfortin/pi-usage-lib (MIT).
 * Factory for usage-monitoring Pi extensions.
 */
import { UsageCache } from "./cache";
/** Check if a provider name matches the given prefix (case-insensitive) */
function isProviderMatch(provider, prefix) {
    return provider?.toLowerCase().startsWith(prefix) ?? false;
}
/** Check if the current model's provider matches the given prefix */
function isCurrentProvider(ctx, prefix) {
    return isProviderMatch(ctx.model?.provider, prefix);
}
/**
 * Create a Pi usage extension from a configuration object.
 *
 * Handles all boilerplate: event registration, provider matching,
 * cache management, and footer lifecycle.
 */
export function createUsageExtension(config) {
    const { providerPrefix, statusKey, label, cooldownMs = 30_000 } = config;
    return function extension(pi) {
        const cache = new UsageCache(statusKey, label, config.fetchUsage, config.renderStatus, config.renderError, cooldownMs);
        // Show footer at session start (only when using matching model)
        pi.on("session_start", async (_event, ctx) => {
            if (isCurrentProvider(ctx, providerPrefix)) {
                await cache.updateStatus(ctx);
            }
        });
        // Update footer on model select
        pi.on("model_select", async (event, ctx) => {
            if (isProviderMatch(event.model.provider, providerPrefix)) {
                await cache.updateStatus(ctx);
            }
            else {
                cache.clear(ctx);
            }
        });
        // Update footer after each turn
        pi.on("turn_end", async (_event, ctx) => {
            if (isCurrentProvider(ctx, providerPrefix)) {
                await cache.updateStatus(ctx);
            }
        });
        // Clear footer on session shutdown
        pi.on("session_shutdown", async (_event, ctx) => {
            cache.clear(ctx);
        });
    };
}
//# sourceMappingURL=extension.js.map