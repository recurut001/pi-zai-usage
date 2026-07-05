/**
 * Z.ai Usage Checker - Pi Extension
 *
 * Renders Z.ai quota usage on the first footer line (path/branch line),
 * right-aligned. Uses a custom footer via ctx.ui.setFooter() to control
 * placement, while replicating the default footer's remaining lines.
 */
import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
import { type ZaiUsageData } from "./api";
import { type CodexUsageData } from "./codex-api";
import { type DeepSeekBalanceData } from "./deepseek-api";
import { type Theme } from "./usage-lib";
/** Render Z.ai usage data into a themed string showing 5h, weekly, and monthly quotas */
export declare function renderZaiStatus(data: ZaiUsageData, theme: Theme): string;
/** Render DeepSeek balance data into a themed string with USD/CNY selection rules. */
export declare function renderDeepSeekStatus(data: DeepSeekBalanceData, theme: Theme): string;
/** Render OpenAI Codex usage data using the same 5h/week shape as Z.ai. */
export declare function renderCodexStatus(data: CodexUsageData, theme: Theme): string;
export default function extension(pi: ExtensionAPI): void;
//# sourceMappingURL=index.d.ts.map