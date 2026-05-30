export interface TimingDecision {
  timingAnalysis: {
    currentConditions: string;
    leaderWindowStatus: string;
    reasoning: string;
  };
  submissionDecision: {
    submitNow: boolean;
    waitSlots: number;
    reasoning: string;
    confidenceScore: number;
  };
  riskFactors: string[];
}

export const parseTimingDecision = (raw: string): TimingDecision => {
  try {
    const clean = raw.replace(/```json|```/g, "").trim();
    return JSON.parse(clean) as TimingDecision;
  } catch (error) {
    throw new Error(`Failed to parse timing decision: ${error}`);
  }
};
