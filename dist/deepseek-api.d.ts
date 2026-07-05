/**
 * DeepSeek Usage Checker - bundled API interaction.
 */
import type { ModelRegistry } from "@earendil-works/pi-coding-agent";
export interface DeepSeekBalanceResponse {
    is_available: boolean;
    balance_infos: Array<{
        currency: string;
        total_balance: string;
        granted_balance: string;
        topped_up_balance: string;
    }>;
}
export interface DeepSeekBalanceData {
    isAvailable: boolean;
    balances: Array<{
        currency: string;
        totalBalance: string;
        grantedBalance: string;
        toppedUpBalance: string;
    }>;
}
/** Fetch DeepSeek balance from the API. */
export declare function getDeepSeekBalance(modelRegistry: Pick<ModelRegistry, "getApiKeyForProvider">): Promise<DeepSeekBalanceData>;
//# sourceMappingURL=deepseek-api.d.ts.map