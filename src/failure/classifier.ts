import { FailureType, FailureAnalysis } from "./types";

export const classifyFailure = (error: any): FailureAnalysis => {
  const errorStr = JSON.stringify(error).toLowerCase();
  const errorMsg = error?.message?.toLowerCase() || "";

  if (
    errorStr.includes("blockhash not found") ||
    errorStr.includes("blockhash expired") ||
    errorStr.includes("blockhashinvalid") ||
    errorMsg.includes("blockhash")
  ) {
    return {
      failureType: FailureType.EXPIRED_BLOCKHASH,
      reason: "Blockhash expired before transaction landed",
      shouldRetry: true,
      suggestedAction: "Refresh blockhash and resubmit",
    };
  }

  if (
    errorStr.includes("insufficient funds") ||
    errorStr.includes("insufficient lamports") ||
    errorStr.includes("0x1")
  ) {
    return {
      failureType: FailureType.INSUFFICIENT_FUNDS,
      reason: "Wallet has insufficient funds",
      shouldRetry: false,
      suggestedAction: "Add more SOL to wallet",
    };
  }

  if (
    errorStr.includes("compute budget exceeded") ||
    errorStr.includes("computationalbudgetexceeded") ||
    errorStr.includes("0x3") ||
    errorStr.includes("compute units")
  ) {
    return {
      failureType: FailureType.COMPUTE_EXCEEDED,
      reason: "Transaction exceeded compute budget",
      shouldRetry: true,
      suggestedAction: "Increase compute unit limit",
    };
  }

  if (
    errorStr.includes("fee too low") ||
    errorStr.includes("prioritization fee") ||
    errorStr.includes("0x5")
  ) {
    return {
      failureType: FailureType.FEE_TOO_LOW,
      reason: "Transaction fee too low for current network conditions",
      shouldRetry: true,
      suggestedAction: "Increase tip and fee",
    };
  }

  if (
    errorStr.includes("bundle") ||
    errorStr.includes("jito") ||
    errorStr.includes("block engine")
  ) {
    return {
      failureType: FailureType.BUNDLE_FAILURE,
      reason: "Jito bundle submission failed",
      shouldRetry: true,
      suggestedAction: "Resubmit bundle with higher tip",
    };
  }

  if (
    errorStr.includes("timeout") ||
    errorStr.includes("timed out") ||
    errorStr.includes("econnreset")
  ) {
    return {
      failureType: FailureType.NETWORK_TIMEOUT,
      reason: "Network timeout during submission",
      shouldRetry: true,
      suggestedAction: "Wait and retry submission",
    };
  }

  if (
    errorStr.includes("slot skip") ||
    errorStr.includes("leader skip")
  ) {
    return {
      failureType: FailureType.SLOT_SKIP,
      reason: "Jito leader skipped their slot",
      shouldRetry: true,
      suggestedAction: "Wait for next leader window and resubmit",
    };
  }

  return {
    failureType: FailureType.UNKNOWN,
    reason: errorMsg || "Unknown failure",
    shouldRetry: true,
    suggestedAction: "Analyze error and retry",
  };
};
