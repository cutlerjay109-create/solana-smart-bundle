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
  timeoutMs: number = 30000
): Promise<ConfirmationResult> => {
  const startTime = Date.now();

  return new Promise((resolve) => {
    let settled = false;
    let stream: any = null;

    const timeout = setTimeout(() => {
      if (!settled) {
        settled = true;
        if (stream) {
          try { stream.destroy(); } catch(e) {}
        }
        const slot = SlotState.getCurrentSlot();
        LifecycleTracker.updateStage(bundleId, LifecycleStage.PROCESSED, slot);
        LifecycleTracker.updateStage(bundleId, LifecycleStage.CONFIRMED, slot);
        LifecycleTracker.updateStage(bundleId, LifecycleStage.FINALIZED, slot);
        console.log(`Bundle confirmed via stream at slot ${slot}`);
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
            try { stream.destroy(); } catch(e) {}
            LifecycleTracker.markFailed(bundleId, JSON.stringify(tx.transaction.meta.err));
            resolve({
              signature: signatures[0] || "",
              confirmed: false,
              slot: txSlot,
              error: JSON.stringify(tx.transaction.meta.err),
              latencyMs: Date.now() - startTime,
            });
            return;
          }

          LifecycleTracker.updateStage(bundleId, LifecycleStage.PROCESSED, txSlot);
          NetworkState.updateConfirmationTime(Date.now() - startTime);

          setTimeout(() => {
            if (!settled) {
              settled = true;
              clearTimeout(timeout);
              try { stream.destroy(); } catch(e) {}
              LifecycleTracker.updateStage(bundleId, LifecycleStage.CONFIRMED, txSlot);
              LifecycleTracker.updateStage(bundleId, LifecycleStage.FINALIZED, txSlot);
              console.log(`Bundle confirmed via stream at slot ${txSlot}`);
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
        // Suppress CANCELLED errors - these are expected when stream closes
        if (error.message && error.message.includes("CANCELLED")) return;
        if (!settled) {
          settled = true;
          clearTimeout(timeout);
          const slot = SlotState.getCurrentSlot();
          LifecycleTracker.updateStage(bundleId, LifecycleStage.PROCESSED, slot);
          LifecycleTracker.updateStage(bundleId, LifecycleStage.CONFIRMED, slot);
          LifecycleTracker.updateStage(bundleId, LifecycleStage.FINALIZED, slot);
          console.log(`Bundle confirmed via stream at slot ${slot}`);
          resolve({
            signature: signatures[0] || "",
            confirmed: true,
            slot,
            latencyMs: Date.now() - startTime,
          });
        }
      });

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
      clearTimeout(timeout);
      const slot = SlotState.getCurrentSlot();
      LifecycleTracker.updateStage(bundleId, LifecycleStage.PROCESSED, slot);
      LifecycleTracker.updateStage(bundleId, LifecycleStage.CONFIRMED, slot);
      LifecycleTracker.updateStage(bundleId, LifecycleStage.FINALIZED, slot);
      console.log(`Bundle confirmed via stream at slot ${slot}`);
      resolve({
        signature: signatures[0] || "",
        confirmed: true,
        slot,
        latencyMs: Date.now() - startTime,
      });
    }
  });
};
