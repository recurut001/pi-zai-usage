/**
 * Z.ai Usage Checker - Pi Extension
 * Provider-specific API interaction using vendored helper primitives.
 */
import { buildAuthHeaders, formatInstantFromEpochMs, formatTimeRemainingFromEpochMs, safeFetch, safeParseJson, UsageError, } from "./usage-lib";
const ZAI_USAGE_API_URL = "https://api.z.ai/api/monitor/usage/quota/limit";
// Z.ai limit unit constants from the local installed extension.
const UNIT_FIVE_HOUR = 3; // 5-hour TOKENS_LIMIT quota
const UNIT_WEEKLY = 6; // weekly TOKENS_LIMIT quota
const UNIT_MONTHLY = 5; // monthly TIME_LIMIT quota
/**
 * Fetch Z.ai usage from the API.
 *
 * Returns the same quota buckets as the local installed extension:
 * 5-hour TOKENS_LIMIT, weekly TOKENS_LIMIT, and optional monthly TIME_LIMIT.
 */
export async function getZaiUsage(modelRegistry) {
    const headers = await buildAuthHeaders(modelRegistry, "zai");
    const response = await safeFetch(ZAI_USAGE_API_URL, { headers });
    const parsed = await safeParseJson(response);
    // Z.ai API can return HTTP 200 with an error body
    // e.g. {"code":401,"msg":"token expired or incorrect","success":false}
    const apiError = parsed;
    if (typeof apiError.success === "boolean" && !apiError.success && apiError.msg) {
        throw new UsageError(`Z.ai API error: ${apiError.msg}`, `api${apiError.code ?? "unknown"}`);
    }
    const data = parsed;
    const limits = data.data?.limits ?? [];
    const tokenLimits = limits.filter((limit) => limit.type === "TOKENS_LIMIT");
    const timeLimits = limits.filter((limit) => limit.type === "TIME_LIMIT");
    const fiveHourLimit = tokenLimits.find((limit) => limit.unit === UNIT_FIVE_HOUR);
    const weeklyLimit = tokenLimits.find((limit) => limit.unit === UNIT_WEEKLY);
    const monthlyLimit = timeLimits.find((limit) => limit.unit === UNIT_MONTHLY);
    if (!fiveHourLimit) {
        throw new UsageError("Required TOKENS_LIMIT entry (5h) not found in API response", "nolimit");
    }
    const buildQuota = (limit) => {
        const quota = {
            percentage: limit.percentage,
        };
        if (limit.nextResetTime) {
            quota.resetTime = formatInstantFromEpochMs(limit.nextResetTime);
            quota.timeRemaining = formatTimeRemainingFromEpochMs(limit.nextResetTime);
        }
        else {
            // No reset time available — signal unknown, matching the local installed extension.
            quota.timeRemaining = "0";
        }
        return quota;
    };
    const result = {
        fiveHour: buildQuota(fiveHourLimit),
    };
    if (weeklyLimit) {
        result.weekly = buildQuota(weeklyLimit);
    }
    if (monthlyLimit) {
        result.monthly = buildQuota(monthlyLimit);
    }
    return result;
}
// Re-export UsageError for consumers that need it
export { UsageError };
//# sourceMappingURL=api.js.map