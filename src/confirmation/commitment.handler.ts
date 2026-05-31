import { LifecycleTracker } from "../lifecycle/tracker";
import { LifecycleStage } from "../lifecycle/stages";
import { SlotState } from "../state/slot.state";
import { confirmViaStream } from "./stream.confirmation";

export const pollForCommitment = async (
  bundleId: string,
  bundleResultId: string,
  timeoutMs: number = 30000
): Promise<boolean> => {
  console.log(`Confirming bundle ${bundleResultId} via stream...`);

  const result = await confirmViaStream(
    bundleId,
    [bundleResultId],
    timeoutMs
  );

  return result.confirmed;
};
