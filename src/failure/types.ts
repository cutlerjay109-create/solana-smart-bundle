export enum FailureType {
  EXPIRED_BLOCKHASH = "EXPIRED_BLOCKHASH",
  FEE_TOO_LOW = "FEE_TOO_LOW",
  COMPUTE_EXCEEDED = "COMPUTE_EXCEEDED",
  BUNDLE_FAILURE = "BUNDLE_FAILURE",
  SLOT_SKIP = "SLOT_SKIP",
  NETWORK_TIMEOUT = "NETWORK_TIMEOUT",
  INSUFFICIENT_FUNDS = "INSUFFICIENT_FUNDS",
  INVALID_TRANSACTION = "INVALID_TRANSACTION",
  UNKNOWN = "UNKNOWN",
}

export interface FailureRecord {
  bundleId: string;
  signature?: string;
  failureType: FailureType;
  reason: string;
  slot: number;
  timestamp: number;
  raw?: any;
}

export interface FailureAnalysis {
  failureType: FailureType;
  reason: string;
  shouldRetry: boolean;
  suggestedAction: string;
}
