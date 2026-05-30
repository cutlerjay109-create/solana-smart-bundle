import { subscribeToSlots, SlotInfo } from "../stream/slot.subscriber";
import { SlotState } from "../state/slot.state";
import { withReconnection } from "../stream/reconnection.handler";
import { createConnection } from "../config/rpc";

export class SlotWatcher {
  private static isWatching: boolean = false;
  private static unsubscribe: (() => void) | null = null;
  private static intervalId: NodeJS.Timeout | null = null;
  private static slotCallbacks: ((slot: SlotInfo) => void)[] = [];

  static onSlot(callback: (slot: SlotInfo) => void): void {
    this.slotCallbacks.push(callback);
  }

  static async start(): Promise<void> {
    if (this.isWatching) return;
    this.isWatching = true;

    console.log("Starting slot watcher via gRPC stream...");

    try {
      await withReconnection(async () => {
        this.unsubscribe = await subscribeToSlots(
          (slotInfo) => {
            SlotState.updateCurrentSlot(slotInfo.slot);
            this.slotCallbacks.forEach((cb) => cb(slotInfo));
          },
          (error) => {
            console.error("Slot stream error:", error);
            this.isWatching = false;
            this.startRpcFallback();
          }
        );
      });
    } catch (error) {
      console.warn("gRPC failed, falling back to RPC polling...");
      this.startRpcFallback();
    }
  }

  static startRpcFallback(): void {
    console.log("Starting slot watcher via RPC polling fallback...");
    const poll = async () => {
      try {
        const connection = createConnection("confirmed");
        const slot = await connection.getSlot("confirmed");
        SlotState.updateCurrentSlot(slot);
        const slotInfo: SlotInfo = {
          slot,
          parent: slot - 1,
          root: slot - 32,
          timestamp: Date.now(),
        };
        this.slotCallbacks.forEach((cb) => cb(slotInfo));
      } catch (error) {
        console.warn("Slot poll error:", error);
      }
    };

    poll();
    this.intervalId = setInterval(poll, 2000);
    this.isWatching = true;
  }

  static stop(): void {
    if (this.unsubscribe) {
      this.unsubscribe();
      this.unsubscribe = null;
    }
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this.isWatching = false;
    console.log("Slot watcher stopped");
  }

  static isRunning(): boolean {
    return this.isWatching;
  }
}
