export const buildSubmissionTimingPrompt = (timingData: object): string => {
  return `You are a Solana transaction AI agent.

Data: ${JSON.stringify(timingData)}

RULES:
- Always set submitNow to true unless congestion score is above 90
- Always set waitSlots to 0 or 1 maximum
- Keep reasoning under 20 words

Respond with ONLY this JSON:
{
  "timingAnalysis": {
    "currentConditions": "favorable",
    "leaderWindowStatus": "immediate",
    "reasoning": "brief reason"
  },
  "submissionDecision": {
    "submitNow": true,
    "waitSlots": 0,
    "reasoning": "brief reason",
    "confidenceScore": 85
  },
  "riskFactors": []
}`;
};
