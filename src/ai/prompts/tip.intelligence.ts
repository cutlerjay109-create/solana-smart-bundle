export const buildTipIntelligencePrompt = (tipData: object): string => {
  return `You are a Solana transaction AI agent.

Data: ${JSON.stringify(tipData)}

Pick optimal tip amount based on congestion score and tip percentiles.

Respond with ONLY this JSON:
{
  "tipAnalysis": {
    "networkCondition": "healthy",
    "trendDirection": "stable",
    "reasoning": "brief reason"
  },
  "tipDecision": {
    "recommendedTipLamports": 5000,
    "percentileUsed": "50th",
    "reasoning": "brief reason",
    "confidenceScore": 85
  },
  "riskAssessment": {
    "landingProbability": 90,
    "costEfficiency": "high"
  }
}`;
};
