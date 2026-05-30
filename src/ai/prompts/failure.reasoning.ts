export const buildFailureReasoningPrompt = (failureData: object): string => {
  return `You are a Solana transaction AI agent.

Failure: ${JSON.stringify(failureData)}

Analyze and decide retry strategy.

Respond with ONLY this JSON:
{
  "failureAnalysis": {
    "rootCause": "brief cause",
    "severity": "medium",
    "isRetryable": true
  },
  "retryDecision": {
    "shouldRetry": true,
    "reasoning": "brief reason",
    "changes": {
      "refreshBlockhash": true,
      "newTipLamports": 10000,
      "waitSlots": 1,
      "adjustComputeBudget": false
    }
  },
  "confidenceScore": 85
}`;
};
