import { createSubscribeStream } from "./yellowstone.client";

export interface TransactionUpdate {
  signature: string;
  slot: number;
  err: any | null;
  timestamp: number;
}

export const subscribeToTransaction = async (
  signature: string,
  onUpdate: (update: TransactionUpdate) => void,
  onError: (error: Error) => void
): Promise<() => void> => {
  const stream = createSubscribeStream();

  stream.on("data", (data: any) => {
    if (data.transaction) {
      const tx = data.transaction;
      const update: TransactionUpdate = {
        signature,
        slot: parseInt(tx.slot || "0"),
        err: tx.transaction?.meta?.err || null,
        timestamp: Date.now(),
      };
      onUpdate(update);
    }
  });

  stream.on("error", (error: Error) => {
    onError(error);
  });

  const request = {
    slots: {},
    accounts: {},
    transactions: {
      "": {
        vote: false,
        failed: false,
        signature,
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

  stream.write(request);

  return () => stream.destroy();
};
