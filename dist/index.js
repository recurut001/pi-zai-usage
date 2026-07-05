/**
 * Z.ai Usage Checker - Pi Extension
 *
 * Renders Z.ai quota usage on the first footer line (path/branch line),
 * right-aligned. Uses a custom footer via ctx.ui.setFooter() to control
 * placement, while replicating the default footer's remaining lines.
 */
import { isAbsolute, relative, resolve, sep } from "node:path";
import { truncateToWidth, visibleWidth } from "@earendil-works/pi-tui";
import { getZaiUsage } from "./api";
import { getCodexUsage, } from "./codex-api";
import { getDeepSeekBalance } from "./deepseek-api";
import { colorForCredit, colorForPercentage } from "./usage-lib";
const COOLDOWN_MS = 30_000;
// --- helpers (mirrors footer.js) ---
/** Sanitize text for display in a single-line status. */
function sanitizeStatusText(text) {
    return text
        .replace(/[\r\n\t]/g, " ")
        .replace(/ +/g, " ")
        .trim();
}
/** Format token counts for compact display. */
function formatTokens(count) {
    if (count < 1000)
        return count.toString();
    if (count < 10000)
        return `${(count / 1000).toFixed(1)}k`;
    if (count < 1000000)
        return `${Math.round(count / 1000)}k`;
    if (count < 10000000)
        return `${(count / 1000000).toFixed(1)}M`;
    return `${Math.round(count / 1000000)}M`;
}
/** Replace home directory with ~ */
function formatCwdForFooter(cwd, home) {
    if (!home)
        return cwd;
    const resolvedCwd = resolve(cwd);
    const resolvedHome = resolve(home);
    const relativeToHome = relative(resolvedHome, resolvedCwd);
    const isInsideHome = relativeToHome === "" ||
        (relativeToHome !== ".." &&
            !relativeToHome.startsWith(`..${sep}`) &&
            !isAbsolute(relativeToHome));
    if (!isInsideHome)
        return cwd;
    return relativeToHome === "" ? "~" : `~${sep}${relativeToHome}`;
}
function usageProvider(ctx) {
    const provider = ctx.model?.provider?.toLowerCase();
    if (provider?.startsWith("zai"))
        return "zai";
    if (provider?.startsWith("deepseek"))
        return "deepseek";
    if (provider === "openai-codex")
        return "codex";
    return null;
}
function isUsageProvider(ctx) {
    return usageProvider(ctx) !== null;
}
function toCodexAuthModel(model) {
    if (!model)
        return undefined;
    const result = { id: model.id, provider: model.provider };
    if (model.name !== undefined) {
        result.name = model.name;
    }
    return result;
}
function codexUsageContext(ctx) {
    const model = toCodexAuthModel(ctx.model);
    const result = {
        modelRegistry: {
            getApiKeyAndHeaders: (authModel) => ctx.modelRegistry.getApiKeyAndHeaders(authModel),
            getAvailable: () => ctx.modelRegistry.getAvailable().flatMap((item) => {
                const authModel = toCodexAuthModel(item);
                return authModel ? [authModel] : [];
            }),
            getAll: () => ctx.modelRegistry.getAll().flatMap((item) => {
                const authModel = toCodexAuthModel(item);
                return authModel ? [authModel] : [];
            }),
        },
    };
    if (model) {
        result.model = model;
    }
    return result;
}
/** Render Z.ai usage data into a themed string showing 5h, weekly, and monthly quotas */
export function renderZaiStatus(data, theme) {
    const parts = [];
    // 5-hour quota
    {
        const pct = Math.round(data.fiveHour.percentage * 10) / 10;
        const reset = data.fiveHour.timeRemaining ?? "";
        parts.push(`${theme.fg("muted", "5h")} ${colorForPercentage(pct, theme)(`${pct}%`)} ${theme.fg("dim", `(${reset})`)}`);
    }
    // Weekly quota
    if (data.weekly) {
        const pct = Math.round(data.weekly.percentage * 10) / 10;
        const reset = data.weekly.timeRemaining ?? "";
        parts.push(`${theme.fg("muted", "W")} ${colorForPercentage(pct, theme)(`${pct}%`)} ${theme.fg("dim", `(${reset})`)}`);
    }
    // Monthly quota
    if (data.monthly) {
        const pct = Math.round(data.monthly.percentage * 10) / 10;
        const reset = data.monthly.timeRemaining ?? "";
        parts.push(`${theme.fg("muted", "M")} ${colorForPercentage(pct, theme)(`${pct}%`)} ${theme.fg("dim", `(${reset})`)}`);
    }
    return `${theme.fg("muted", "Z.ai:")} ${parts.join(` ${theme.fg("dim", "·")} `)}`;
}
function currencySymbol(currency) {
    if (currency === "USD")
        return "$";
    if (currency === "CNY")
        return "¥";
    return `${currency} `;
}
function formatMoney(amount, currency) {
    const symbol = currencySymbol(currency);
    const abs = Math.abs(amount).toFixed(2);
    return amount < 0 ? `-${symbol}${abs}` : `${symbol}${abs}`;
}
function balanceAmount(data, currency) {
    const balance = data.balances.find((entry) => entry.currency === currency);
    const parsed = Number.parseFloat(balance?.totalBalance ?? "0");
    return Number.isFinite(parsed) ? parsed : 0;
}
/** Render DeepSeek balance data into a themed string with USD/CNY selection rules. */
export function renderDeepSeekStatus(data, theme) {
    const currencies = ["USD", "CNY"];
    const positiveBalances = currencies
        .map((currency) => ({ currency, amount: balanceAmount(data, currency) }))
        .filter(({ amount }) => amount > 0);
    const renderedBalances = positiveBalances.length > 0
        ? positiveBalances.map(({ currency, amount }) => colorForCredit(amount, theme)(formatMoney(amount, currency)))
        : currencies.map((currency) => theme.fg("error", formatMoney(0, currency)));
    return `${theme.fg("muted", "DeepSeek:")} ${renderedBalances.join(" ")}`;
}
/** Render OpenAI Codex usage data using the same 5h/week shape as Z.ai. */
export function renderCodexStatus(data, theme) {
    const parts = [];
    {
        const pct = Math.round(data.fiveHour.percentage * 10) / 10;
        const reset = data.fiveHour.resetTime ?? "";
        parts.push(`${theme.fg("muted", "5h")} ${colorForPercentage(pct, theme)(`${pct}%`)} ${theme.fg("dim", `(${reset})`)}`);
    }
    {
        const pct = Math.round(data.weekly.percentage * 10) / 10;
        const reset = data.weekly.resetTime ?? "";
        parts.push(`${theme.fg("muted", "W")} ${colorForPercentage(pct, theme)(`${pct}%`)} ${theme.fg("dim", `(${reset})`)}`);
    }
    return `${theme.fg("muted", "Codex:")} ${parts.join(` ${theme.fg("dim", "·")} `)}`;
}
function nowEpochMilliseconds() {
    return Date.now();
}
export default function extension(pi) {
    let lastZaiData = null;
    let lastZaiFetchTime = 0;
    let lastDeepSeekData = null;
    let lastDeepSeekFetchTime = 0;
    let lastCodexData = null;
    let lastCodexFetchTime = 0;
    let activeProvider = null;
    let footerActive = false;
    /** The most recent context, updated on each event so the footer reads fresh state. */
    let ctxRef = null;
    const HOME = process.env.HOME || process.env.USERPROFILE || "";
    async function updateStatus(ctx) {
        ctxRef = ctx;
        activeProvider = usageProvider(ctx);
        try {
            const now = nowEpochMilliseconds();
            if (activeProvider === "zai") {
                if (!lastZaiData || now - lastZaiFetchTime >= COOLDOWN_MS) {
                    lastZaiData = await getZaiUsage(ctx.modelRegistry);
                    lastZaiFetchTime = now;
                }
            }
            else if (activeProvider === "deepseek") {
                if (!lastDeepSeekData || now - lastDeepSeekFetchTime >= COOLDOWN_MS) {
                    lastDeepSeekData = await getDeepSeekBalance(ctx.modelRegistry);
                    lastDeepSeekFetchTime = now;
                }
            }
            else if (activeProvider === "codex") {
                if (!lastCodexData || now - lastCodexFetchTime >= COOLDOWN_MS) {
                    lastCodexData = await getCodexUsage(codexUsageContext(ctx));
                    lastCodexFetchTime = now;
                }
            }
            installFooter();
        }
        catch {
            if (activeProvider === "zai") {
                lastZaiData = null;
            }
            else if (activeProvider === "deepseek") {
                lastDeepSeekData = null;
            }
            else if (activeProvider === "codex") {
                lastCodexData = null;
            }
            installFooter();
        }
    }
    function installFooter() {
        if (!footerActive) {
            footerActive = true;
            ctxRef?.ui.setFooter((tui, theme, footerData) => {
                const unsub = footerData.onBranchChange(() => tui.requestRender());
                return {
                    dispose: unsub,
                    invalidate() { },
                    render(width) {
                        const ctx = ctxRef;
                        if (!ctx)
                            return [theme.fg("dim", "…")];
                        const lines = [];
                        // ========================================================
                        // Line 1: pwd / branch / session name (left) + Z.ai (right)
                        // ========================================================
                        let pwd = formatCwdForFooter(ctx.sessionManager.getCwd(), HOME);
                        const branch = footerData.getGitBranch();
                        if (branch)
                            pwd = `${pwd} (${branch})`;
                        const sessionName = ctx.sessionManager.getSessionName();
                        if (sessionName)
                            pwd = `${pwd} • ${sessionName}`;
                        let usageText = "";
                        if (activeProvider === "zai" && lastZaiData) {
                            usageText = renderZaiStatus(lastZaiData, theme);
                        }
                        else if (activeProvider === "deepseek" && lastDeepSeekData) {
                            usageText = renderDeepSeekStatus(lastDeepSeekData, theme);
                        }
                        else if (activeProvider === "codex" && lastCodexData) {
                            usageText = renderCodexStatus(lastCodexData, theme);
                        }
                        const pwdStyled = theme.fg("dim", pwd);
                        if (usageText) {
                            const pwdW = visibleWidth(pwdStyled);
                            const usageW = visibleWidth(usageText);
                            const spacing = Math.max(1, width - pwdW - usageW);
                            lines.push(truncateToWidth(pwdStyled + " ".repeat(spacing) + usageText, width, theme.fg("dim", "...")));
                        }
                        else {
                            lines.push(truncateToWidth(pwdStyled, width, theme.fg("dim", "...")));
                        }
                        // ========================================================
                        // Line 2: Token stats + context % (left) / model (right)
                        // ========================================================
                        let totalInput = 0;
                        let totalOutput = 0;
                        let totalCacheRead = 0;
                        let totalCacheWrite = 0;
                        let totalCost = 0;
                        for (const entry of ctx.sessionManager.getEntries()) {
                            if (entry.type === "message" && entry.message.role === "assistant") {
                                totalInput += entry.message.usage.input;
                                totalOutput += entry.message.usage.output;
                                totalCacheRead += entry.message.usage.cacheRead;
                                totalCacheWrite += entry.message.usage.cacheWrite;
                                totalCost += entry.message.usage.cost.total;
                            }
                        }
                        const contextUsage = ctx.getContextUsage();
                        const contextWindow = contextUsage?.contextWindow ?? ctx.model?.contextWindow ?? 0;
                        const contextPercent = contextUsage?.percent !== null && contextUsage?.percent !== undefined
                            ? contextUsage.percent.toFixed(1)
                            : "?";
                        const statsParts = [];
                        if (totalInput)
                            statsParts.push(`↑${formatTokens(totalInput)}`);
                        if (totalOutput)
                            statsParts.push(`↓${formatTokens(totalOutput)}`);
                        if (totalCacheRead)
                            statsParts.push(`R${formatTokens(totalCacheRead)}`);
                        if (totalCacheWrite)
                            statsParts.push(`W${formatTokens(totalCacheWrite)}`);
                        const usingSubscription = ctx.model ? ctx.modelRegistry.isUsingOAuth(ctx.model) : false;
                        if (totalCost || usingSubscription) {
                            const costStr = `$${totalCost.toFixed(3)}${usingSubscription ? " (sub)" : ""}`;
                            statsParts.push(costStr);
                        }
                        const contextDisplay = contextPercent === "?"
                            ? `?/${formatTokens(contextWindow)}`
                            : `${contextPercent}%/${formatTokens(contextWindow)}`;
                        const contextPercentValue = contextUsage?.percent ?? 0;
                        let contextPercentStr;
                        if (contextPercentValue > 90) {
                            contextPercentStr = theme.fg("error", contextDisplay);
                        }
                        else if (contextPercentValue > 70) {
                            contextPercentStr = theme.fg("warning", contextDisplay);
                        }
                        else {
                            contextPercentStr = contextDisplay;
                        }
                        statsParts.push(contextPercentStr);
                        let statsLeft = statsParts.join(" ");
                        const modelName = ctx.model?.id || "no-model";
                        const statsLeftWidth = visibleWidth(statsLeft);
                        // Truncate stats if too wide
                        if (statsLeftWidth > width) {
                            statsLeft = truncateToWidth(statsLeft, width, "...");
                        }
                        const rightSide = modelName;
                        const totalNeeded = visibleWidth(statsLeft) + 2 + visibleWidth(rightSide);
                        let statsLine;
                        if (totalNeeded <= width) {
                            const padding = " ".repeat(width - visibleWidth(statsLeft) - visibleWidth(rightSide));
                            statsLine = theme.fg("dim", statsLeft) + theme.fg("dim", padding + rightSide);
                        }
                        else {
                            const availableForRight = width - visibleWidth(statsLeft) - 2;
                            if (availableForRight > 0) {
                                const truncatedRight = truncateToWidth(rightSide, availableForRight, "");
                                const padding = " ".repeat(width - visibleWidth(statsLeft) - visibleWidth(truncatedRight));
                                statsLine = theme.fg("dim", statsLeft) + theme.fg("dim", padding + truncatedRight);
                            }
                            else {
                                statsLine = theme.fg("dim", statsLeft);
                            }
                        }
                        lines.push(statsLine);
                        // ========================================================
                        // Line 3+: Other extension statuses (excluding zai-usage)
                        // ========================================================
                        const extensionStatuses = footerData.getExtensionStatuses();
                        if (extensionStatuses.size > 0) {
                            const sortedStatuses = Array.from(extensionStatuses.entries())
                                .sort(([a], [b]) => a.localeCompare(b))
                                .filter(([k]) => k !== "zai-usage" && k !== "deepseek-usage" && k !== "codex-usage")
                                .map(([, text]) => sanitizeStatusText(text));
                            if (sortedStatuses.length > 0) {
                                const statusLine = sortedStatuses.join(" ");
                                lines.push(truncateToWidth(statusLine, width, theme.fg("dim", "...")));
                            }
                        }
                        return lines;
                    },
                };
            });
        }
    }
    function clearStatus(ctx) {
        lastZaiData = null;
        lastZaiFetchTime = 0;
        lastDeepSeekData = null;
        lastDeepSeekFetchTime = 0;
        lastCodexData = null;
        lastCodexFetchTime = 0;
        activeProvider = null;
        ctxRef = null;
        if (footerActive) {
            footerActive = false;
            ctx.ui.setFooter(undefined);
        }
    }
    // --- Event handlers ---
    pi.on("session_start", async (_event, ctx) => {
        if (isUsageProvider(ctx))
            await updateStatus(ctx);
    });
    pi.on("model_select", async (event, ctx) => {
        const provider = event.model?.provider?.toLowerCase();
        if (provider?.startsWith("zai") ||
            provider?.startsWith("deepseek") ||
            provider === "openai-codex") {
            await updateStatus(ctx);
        }
        else {
            clearStatus(ctx);
        }
    });
    pi.on("turn_end", async (_event, ctx) => {
        if (isUsageProvider(ctx))
            await updateStatus(ctx);
    });
    pi.on("session_shutdown", async (_event, ctx) => {
        clearStatus(ctx);
    });
}
//# sourceMappingURL=index.js.map