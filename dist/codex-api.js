/**
 * OpenAI Codex Usage Checker - bundled API interaction.
 *
 * Uses Pi's openai-codex provider auth and the ChatGPT Codex usage endpoint.
 */
const CODEX_USAGE_API_URL = "https://chatgpt.com/backend-api/wham/usage";
const CODEX_PROVIDER_ID = "openai-codex";
const DEFAULT_TIMEOUT_MS = 15_000;
/** Fetch OpenAI Codex subscription usage from the ChatGPT Codex usage endpoint. */
export async function getCodexUsage(ctx) {
    const headers = await resolveCodexAuthHeaders(ctx);
    const response = await fetchWithTimeout(CODEX_USAGE_API_URL, { headers }, DEFAULT_TIMEOUT_MS);
    const text = await response.text();
    if (!response.ok) {
        throw new Error(`Codex usage endpoint returned ${response.status} ${response.statusText}`);
    }
    const payload = parseJsonObject(text, "Codex usage endpoint response");
    const rateLimit = assertObject(payload.rate_limit, "Codex rate limit");
    const primary = normalizeWindow(rateLimit.primary_window, "5-hour Codex usage window");
    const secondary = normalizeWindow(rateLimit.secondary_window, "weekly Codex usage window");
    return {
        fiveHour: primary,
        weekly: secondary,
    };
}
async function resolveCodexAuthHeaders(ctx) {
    const models = codexAuthCandidateModels(ctx);
    const errors = [];
    for (const model of models) {
        const auth = await ctx.modelRegistry.getApiKeyAndHeaders(model);
        if (!auth.ok) {
            errors.push(auth.error ?? "unknown Codex auth error");
            continue;
        }
        const headers = { ...(auth.headers ?? {}) };
        if (!hasHeader(headers, "Authorization") && auth.apiKey) {
            headers.Authorization = `Bearer ${auth.apiKey}`;
        }
        if (!hasHeader(headers, "User-Agent")) {
            headers["User-Agent"] = "pi-codex-usage";
        }
        if (hasHeader(headers, "Authorization")) {
            return headers;
        }
    }
    if (errors.length > 0) {
        throw new Error(errors.join("; "));
    }
    throw new Error("No Pi OpenAI Codex subscription auth was available. Use a Pi OpenAI Codex model or run /login for OpenAI ChatGPT Plus/Pro (Codex).");
}
function codexAuthCandidateModels(ctx) {
    const candidates = [];
    const seen = new Set();
    const add = (model) => {
        if (!model || model.provider !== CODEX_PROVIDER_ID)
            return;
        const key = `${model.provider}/${model.id}`;
        if (seen.has(key))
            return;
        seen.add(key);
        candidates.push(model);
    };
    add(ctx.model);
    for (const model of ctx.modelRegistry.getAvailable())
        add(model);
    for (const model of ctx.modelRegistry.getAll())
        add(model);
    return candidates;
}
async function fetchWithTimeout(url, init, timeoutMs) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timeoutMs);
    try {
        return await fetch(url, { ...init, signal: controller.signal });
    }
    catch (error) {
        if (controller.signal.aborted) {
            throw new Error(`Timed out after ${Math.round(timeoutMs / 1000)}s while fetching Codex usage.`);
        }
        throw error;
    }
    finally {
        clearTimeout(timeout);
    }
}
function normalizeWindow(value, description) {
    const window = assertObject(value, description);
    const percentage = asNumber(window.used_percent);
    if (percentage === undefined) {
        throw new Error(`${description} did not include used_percent.`);
    }
    const resetAt = asNumber(window.reset_at);
    const result = { percentage };
    if (resetAt !== undefined) {
        result.resetTime = formatReset(resetAt);
    }
    return result;
}
function formatReset(epochSeconds) {
    const reset = new Date(epochSeconds * 1000);
    if (Number.isNaN(reset.getTime()))
        return "unknown";
    const time = `${reset.getHours().toString().padStart(2, "0")}:${reset
        .getMinutes()
        .toString()
        .padStart(2, "0")}`;
    const now = new Date();
    if (reset.toDateString() === now.toDateString())
        return time;
    const day = reset.getDate().toString();
    const month = reset.toLocaleDateString(undefined, { month: "short" });
    return `${time} on ${day} ${month}`;
}
function parseJsonObject(text, description) {
    let parsed;
    try {
        parsed = JSON.parse(text);
    }
    catch (error) {
        throw new Error(`${description} was not valid JSON: ${error instanceof Error ? error.message : String(error)}`);
    }
    return assertObject(parsed, description);
}
function assertObject(value, description) {
    if (!value || typeof value !== "object" || Array.isArray(value)) {
        throw new Error(`${description} was not an object.`);
    }
    return value;
}
function asNumber(value) {
    if (typeof value === "number" && Number.isFinite(value))
        return value;
    if (typeof value === "string" && value.trim()) {
        const parsed = Number(value);
        return Number.isFinite(parsed) ? parsed : undefined;
    }
    return undefined;
}
function hasHeader(headers, name) {
    return Object.keys(headers).some((key) => key.toLowerCase() === name.toLowerCase());
}
//# sourceMappingURL=codex-api.js.map