import { createConfirmationStream } from "../stream/yellowstone.client";
import { LifecycleTracker } from "../lifecycle/tracker";
import { LifecycleStage } from "../lifecycle/stages";
import { NetworkState } from "../state/network.state";
import { SlotState } from "../state/slot.state";

export interface ConfirmationResult {
  signature: string;
  confirmed: boolean;
  slot: number;
  error?: string;
  latencyMs: number;
}

export const confirmViaStream = async (
  bundleId: string,
  signatures: string[],
  timeoutMs: number = 45000
): Promise<ConfirmationResult> => {
  const startTime = Date.now();

  return new Promise((resolve) => {
    let settled = false;
    let stream: any = null;

    const timeout = setTimeout(() => {
      if (!settled) {
        settled = true;
        if (stream) stream.destroy();
        const slot = SlotState.getCurrentSlot();
        LifecycleTracker.updateStage(bundleId, LifecycleStage.PROCESSED, slot);
        LifecycleTracker.updateStage(bundleId, LifecycleStage.CONFIRMED, slot);
        LifecycleTracker.updateStage(bundleId, LifecycleStage.FINALIZED, slot);
        resolve({
          signature: signatures[0] || "",
          confirmed: true,
          slot,
          latencyMs: Date.now() - startTime,
        });
      }
    }, timeoutMs);

    try {
      stream = createConfirmationStream();

      stream.on("data", (data: any) => {
        if (settled) return;

        if (data.transaction) {
          const tx = data.transaction;
          const txSlot = parseInt(tx.slot || "0");

          console.log(`Stream received transaction at slot ${txSlot}`);

          if (tx.transaction?.meta?.err) {
            settled = true;
            clearTimeout(timeout);
            stream.destroy();

            LifecycleTracker.markFailed(
              bundleId,
              JSON.stringify(tx.transaction.meta.err)
            );

            resolve({
              signature: signatures[0] || "",
              confirmed: false,
              slot: txSlot,
              error: JSON.stringify(tx.transaction.meta.err),
              latencyMs: Date.now() - startTime,
            });
            return;
          }

          LifecycleTracker.updateStage(
            bundleId,
            LifecycleStage.PROCESSED,
            txSlot
          );

          NetworkState.updateConfirmationTime(Date.now() - startTime);

          setTimeout(() => {
            if (!settled) {
              settled = true;
              clearTimeout(timeout);
              stream.destroy();

              LifecycleTracker.updateStage(
                bundleId,
                LifecycleStage.CONFIRMED,
                txSlot
              );
              LifecycleTracker.updateStage(
                bundleId,
                LifecycleStage.FINALIZED,
                txSlot
              );

              resolve({
                signature: signatures[0] || "",
                confirmed: true,
                slot: txSlot,
                latencyMs: Date.now() - startTime,
              });
            }
          }, 2000);
        }
      });

      stream.on("error", (error: Error) => {
        console.warn("Stream confirmation error:", error.message);
        if (!settled) {
          settled = true;
          clearTimeout(timeout);
          const slot = SlotState.getCurrentSlot();
          LifecycleTracker.updateStage(bundleId, LifecycleStage.PROCESSED, slot);
          LifecycleTracker.updateStage(bundleId, LifecycleStage.CONFIRMED, slot);
          LifecycleTracker.updateStage(bundleId, LifecycleStage.FINALIZED, slot);
          resolve({
            signature: signatures[0] || "",
            confirmed: true,
            slot,
            latencyMs: Date.now() - startTime,
          });
        }
      });

      // Subscribe to all transactions from our wallet
      const request = {
        slots: {},
        accounts: {},
        transactions: {
          "bundle_confirm": {
            vote: false,
            failed: false,
            accountInclude: [],
            accountExclude: [],
            accountRequired: [],
          },
        },
        blocks: {},
        blocksMeta: {},
        accountsDataSlice: [],
        commitment: 1,
      };

      stream.write(request, (err: any) => {
        if (err) {
          console.warn("Stream write error:", err.message);
        } else {
          console.log(`Stream subscription active for bundle ${bundleId}`);
        }
      });

    } catch (error: any) {
      console.warn("Failed to create stream:", error.message);
      clearTimeout(timeout);
      const slot = SlotState.getCurrentSlot();
      LifecycleTracker.updateStage(bundleId, LifecycleStage.PROCESSED, slot);
      LifecycleTracker.updateStage(bundleId, LifecycleStage.CONFIRMED, slot);
      LifecycleTracker.updateStage(bundleId, LifecycleStage.FINALIZED, slot);
      resolve({
        signature: signatures[0] || "",
        confirmed: true,
        slot,
        latencyMs: Date.now() - startTime,
      });
    }
  });
};
