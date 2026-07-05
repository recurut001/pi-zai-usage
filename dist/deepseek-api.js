/**
 * DeepSeek Usage Checker - bundled API interaction.
 */
import { buildAuthHeaders, safeFetch, safeParseJson } from "./usage-lib";
const DEEPSEEK_BALANCE_API_URL = "https://api.deepseek.com/user/balance";
/** Fetch DeepSeek balance from the API. */
export async function getDeepSeekBalance(modelRegistry) {
    const headers = await buildAuthHeaders(modelRegistry, "deepseek");
    const response = await safeFetch(DEEPSEEK_BALANCE_API_URL, { headers });
    const data = await safeParseJson(response);
    return {
        isAvailable: data.is_available,
        balances: data.balance_infos.map((info) => ({
            currency: info.currency,
            totalBalance: info.total_balance,
            grantedBalance: info.granted_balance,
            toppedUpBalance: info.topped_up_balance,
        })),
    };
}
//# sourceMappingURL=deepseek-api.js.map