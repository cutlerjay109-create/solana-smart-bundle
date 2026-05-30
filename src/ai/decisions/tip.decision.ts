export interface TipDecision {
  tipAnalysis: {
    networkCondition: string;
    trendDirection: string;
    reasoning: string;
  };
  tipDecision: {
    recommendedTipLamports: number;
    percentileUsed: string;
    reasoning: string;
    confidenceScore: number;
  };
  riskAssessment: {
    landingProbability: number;
    costEfficiency: string;
  };
}

export const parseTipDecision = (raw: string): TipDecision => {
  try {
    const clean = raw.replace(/```json|```/g, "").trim();
    return JSON.parse(clean) as TipDecision;
  } catch (error) {
    throw new Error(`Failed to parse tip decision: ${error}`);
  }
};
