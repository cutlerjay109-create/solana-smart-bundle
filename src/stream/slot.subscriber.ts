import { createSubscribeStream } from "./yellowstone.client";
import { SlotState } from "../state/slot.state";

export interface SlotInfo {
  slot: number;
  parent: number;
  root: number;
  timestamp: number;
}

export const subscribeToSlots = async (
  onSlot: (slotInfo: SlotInfo) => void,
  onError: (error: Error) => void
): Promise<() => void> => {
  const stream = createSubscribeStream();

  stream.on("data", (data: any) => {
    if (data.slot) {
      const slotInfo: SlotInfo = {
        slot: parseInt(data.slot.slot || "0"),
        parent: parseInt(data.slot.parent || "0"),
        root: parseInt(data.slot.root || "0"),
        timestamp: Date.now(),
      };
      SlotState.updateCurrentSlot(slotInfo.slot);
      onSlot(slotInfo);
    }
  });

  stream.on("error", (error: Error) => {
    onError(error);
  });

  const request = {
    slots: { "": {} },
    accounts: {},
    transactions: {},
    blocks: {},
    blocksMeta: {},
    accountsDataSlice: [],
    commitment: 1,
  };

  stream.write(request);

  return () => stream.destroy();
};
