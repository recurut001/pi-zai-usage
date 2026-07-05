/**
 * OpenAI Codex Usage Checker - bundled API interaction.
 *
 * Uses Pi's openai-codex provider auth and the ChatGPT Codex usage endpoint.
 */
export interface CodexUsageData {
    fiveHour: CodexQuotaInfo;
    weekly: CodexQuotaInfo;
}
export interface CodexQuotaInfo {
    percentage: number;
    resetTime?: string;
}
export interface CodexAuthModel {
    id: string;
    name?: string;
    provider: string;
}
interface CodexAuthResult {
    ok: boolean;
    apiKey?: string;
    headers?: Record<string, string>;
    error?: string;
}
export interface CodexUsageContext {
    model?: CodexAuthModel;
    modelRegistry: {
        getApiKeyAndHeaders(model: CodexAuthModel): Promise<CodexAuthResult>;
        getAvailable(): CodexAuthModel[];
        getAll(): CodexAuthModel[];
    };
}
/** Fetch OpenAI Codex subscription usage from the ChatGPT Codex usage endpoint. */
export declare function getCodexUsage(ctx: CodexUsageContext): Promise<CodexUsageData>;
export {};
//# sourceMappingURL=codex-api.d.ts.map