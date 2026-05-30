export interface FailureDecision {
  failureAnalysis: {
    rootCause: string;
    severity: "low" | "medium" | "high" | "critical";
    isRetryable: boolean;
  };
  retryDecision: {
    shouldRetry: boolean;
    reasoning: string;
    changes: {
      refreshBlockhash: boolean;
      newTipLamports: number | null;
      waitSlots: number;
      adjustComputeBudget: boolean;
    };
  };
  confidenceScore: number;
}

export const parseFailureDecision = (raw: string): FailureDecision => {
  try {
    const clean = raw.replace(/```json|```/g, "").trim();
    return JSON.parse(clean) as FailureDecision;
  } catch (error) {
    throw new Error(`Failed to parse failure decision: ${error}`);
  }
};
