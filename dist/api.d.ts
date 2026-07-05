/**
 * Z.ai Usage Checker - Pi Extension
 * Provider-specific API interaction using vendored helper primitives.
 */
import type { ModelRegistry } from "@earendil-works/pi-coding-agent";
import { UsageError } from "./usage-lib";
export interface ZaiUsageResponse {
    data: {
        limits: Array<{
            type: string;
            unit: number;
            percentage: number;
            nextResetTime?: number;
        }>;
    };
}
export interface ZaiApiError {
    code: number;
    msg: string;
    success: boolean;
}
/** Single quota bucket (e.g. 5-hour or weekly) */
export interface QuotaInfo {
    /** Usage percentage (0–100) */
    percentage: number;
    /** Localized reset date/time string (only when nextResetTime is known) */
    resetTime?: string;
    /** Formatted time remaining string (e.g. "2d 7h 35m") or "0" when unknown */
    timeRemaining?: string;
}
/** Z.ai usage data: 5-hour, weekly, and monthly quotas */
export interface ZaiUsageData {
    fiveHour: QuotaInfo;
    weekly: QuotaInfo;
    /** Monthly TIME_LIMIT quota (may be absent on some plans) */
    monthly?: QuotaInfo;
}
/**
 * Fetch Z.ai usage from the API.
 *
 * Returns the same quota buckets as the local installed extension:
 * 5-hour TOKENS_LIMIT, weekly TOKENS_LIMIT, and optional monthly TIME_LIMIT.
 */
export declare function getZaiUsage(modelRegistry: Pick<ModelRegistry, "getApiKeyForProvider">): Promise<ZaiUsageData>;
export { UsageError };
//# sourceMappingURL=api.d.ts.map