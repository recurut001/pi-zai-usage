/**
 * Vendored from @alexanderfortin/pi-usage-lib (MIT).
 * Generic usage cache with themed footer rendering.
 */
import { UsageError } from "./api";
/** Build the default error renderer for a given label */
function defaultRenderError(label) {
    return (error, theme) => {
        const code = error instanceof UsageError ? error.code : "fetch";
        return theme.fg("muted", `${label}:`) + theme.fg("error", `<err:${code}>`);
    };
}
/** Generic cache for usage data with cooldown and themed footer rendering */
export class UsageCache {
    statusKey;
    fetchUsage;
    renderStatus;
    cooldownMs;
    lastData = null;
    lastFetchTime = 0;
    renderError;
    constructor(statusKey, label, fetchUsage, renderStatus, renderError, cooldownMs = 30_000) {
        this.statusKey = statusKey;
        this.fetchUsage = fetchUsage;
        this.renderStatus = renderStatus;
        this.cooldownMs = cooldownMs;
        // Use default error rendering
        this.renderError = renderError ?? defaultRenderError(label);
    }
    /** Update footer status from API or cache */
    async updateStatus(ctx) {
        try {
            const now = Date.now();
            // Use cached data if still fresh
            if (this.lastData && now - this.lastFetchTime < this.cooldownMs) {
                ctx.ui.setStatus(this.statusKey, this.renderStatus(this.lastData, ctx.ui.theme));
                return;
            }
            const data = await this.fetchUsage(ctx.modelRegistry);
            this.lastData = data;
            this.lastFetchTime = now;
            ctx.ui.setStatus(this.statusKey, this.renderStatus(data, ctx.ui.theme));
        }
        catch (error) {
            // Show error code in footer (no console.error)
            const rendered = this.renderError(error, ctx.ui.theme);
            ctx.ui.setStatus(this.statusKey, rendered); // undefined → clears
        }
    }
    /** Clear footer status */
    clear(ctx) {
        ctx.ui.setStatus(this.statusKey, undefined);
    }
}
//# sourceMappingURL=cache.js.map