export const buildRetryDecisionPrompt = (retryData: object): string => {
  return `You are an expert Solana transaction infrastructure AI agent.

Analyze this failed transaction and make a complete autonomous retry decision.

Retry Context:
${JSON.stringify(retryData, null, 2)}

You must respond with ONLY a valid JSON object in this exact format:
{
  "failureAnalysis": {
    "primaryCause": "detailed root cause analysis",
    "contributing_factors": [],
    "reasoning": "step by step reasoning about what went wrong"
  },
  "retryPlan": {
    "shouldRetry": true or false,
    "refreshBlockhash": true or false,
    "newTipLamports": number,
    "waitBeforeRetryMs": number,
    "adjustComputeUnits": true or false,
    "newComputeUnits": number or null,
    "reasoning": "detailed explanation of retry strategy"
  },
  "expectedOutcome": {
    "successProbability": number between 0 and 100,
    "reasoning": "why this retry strategy should work"
  }
}`;
};
