export interface RetryDecision {
  failureAnalysis: {
    primaryCause: string;
    contributing_factors: string[];
    reasoning: string;
  };
  retryPlan: {
    shouldRetry: boolean;
    refreshBlockhash: boolean;
    newTipLamports: number;
    waitBeforeRetryMs: number;
    adjustComputeUnits: boolean;
    newComputeUnits: number | null;
    reasoning: string;
  };
  expectedOutcome: {
    successProbability: number;
    reasoning: string;
  };
}

export const parseRetryDecision = (raw: string): RetryDecision => {
  try {
    const clean = raw.replace(/```json|```/g, "").trim();
    return JSON.parse(clean) as RetryDecision;
  } catch (error) {
    throw new Error(`Failed to parse retry decision: ${error}`);
  }
};
