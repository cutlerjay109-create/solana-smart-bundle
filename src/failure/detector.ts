import { FailureType, FailureRecord } from "./types";
import { classifyFailure } from "./classifier";
import { SlotState } from "../state/slot.state";
import { FailureEmitter } from "./emitter";

export const detectAndClassifyFailure = (
  bundleId: string,
  error: any,
  signature?: string
): FailureRecord => {
  const analysis = classifyFailure(error);
  const currentSlot = SlotState.getCurrentSlot();

  const record: FailureRecord = {
    bundleId,
    signature,
    failureType: analysis.failureType,
    reason: analysis.reason,
    slot: currentSlot,
    timestamp: Date.now(),
    raw: error,
  };

  FailureEmitter.emitFailure(record);
  return record;
};

export const isRetryableFailure = (failureType: FailureType): boolean => {
  const retryable = [
    FailureType.EXPIRED_BLOCKHASH,
    FailureType.FEE_TOO_LOW,
    FailureType.COMPUTE_EXCEEDED,
    FailureType.BUNDLE_FAILURE,
    FailureType.NETWORK_TIMEOUT,
    FailureType.SLOT_SKIP,
  ];
  return retryable.includes(failureType);
};
