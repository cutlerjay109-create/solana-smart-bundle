export interface LatencyMetrics {
  submittedToProcessed: number | null;
  processedToConfirmed: number | null;
  confirmedToFinalized: number | null;
  totalLatency: number | null;
}

export const calculateLatency = (
  submittedAt?: number,
  processedAt?: number,
  confirmedAt?: number,
  finalizedAt?: number
): LatencyMetrics => {
  return {
    submittedToProcessed:
      submittedAt && processedAt ? processedAt - submittedAt : null,
    processedToConfirmed:
      processedAt && confirmedAt ? confirmedAt - processedAt : null,
    confirmedToFinalized:
      confirmedAt && finalizedAt ? finalizedAt - confirmedAt : null,
    totalLatency:
      submittedAt && finalizedAt ? finalizedAt - submittedAt : null,
  };
};

export const formatLatency = (ms: number | null): string => {
  if (ms === null) return "N/A";
  if (ms < 1000) return `${ms}ms`;
  return `${(ms / 1000).toFixed(2)}s`;
};

export const analyzeNetworkHealth = (
  processedToConfirmedMs: number | null
): string => {
  if (processedToConfirmedMs === null) return "unknown";
  if (processedToConfirmedMs < 2000) return "healthy";
  if (processedToConfirmedMs < 5000) return "degraded";
  return "congested";
};
