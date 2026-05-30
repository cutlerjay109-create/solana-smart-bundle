import axios from "axios";
import { Bundle } from "./bundle.builder";
import bs58 from "bs58";
import { v4 as uuidv4 } from "uuid";

export interface BundleSubmissionResult {
  bundleId: string;
  submittedAt: number;
  success: boolean;
  error?: string;
}

const DEVNET_BLOCK_ENGINE = "https://dallas.testnet.block-engine.jito.wtf";

export const getTipAccounts = async (): Promise<string[]> => {
  try {
    const response = await axios.post(
      `${DEVNET_BLOCK_ENGINE}/api/v1/bundles`,
      {
        jsonrpc: "2.0",
        id: 1,
        method: "getTipAccounts",
        params: [],
      },
      {
        headers: { "Content-Type": "application/json" },
        timeout: 10000,
      }
    );
    console.log("Tip accounts from API:", response.data.result);
    return response.data.result || [];
  } catch (error: any) {
    console.warn("Failed to get tip accounts:", error.message);
    return [];
  }
};

const serializeTx = (tx: any): string => {
  const serialized = tx.serialize({
    requireAllSignatures: true,
    verifySignatures: false,
  });
  return bs58.encode(serialized);
};

export const submitBundleDevnet = async (
  bundle: Bundle
): Promise<BundleSubmissionResult> => {
  try {
    const serializedTxs = bundle.transactions.map((tx) => serializeTx(tx));

    console.log(`Submitting ${serializedTxs.length} transactions to Jito devnet`);
    console.log(`Tip account: ${bundle.tipAccount}`);
    console.log(`Tip amount: ${bundle.tipLamports} lamports`);

    const payload = {
      jsonrpc: "2.0",
      id: uuidv4(),
      method: "sendBundle",
      params: [serializedTxs],
    };

    const response = await axios.post(
      `${DEVNET_BLOCK_ENGINE}/api/v1/bundles`,
      payload,
      {
        headers: { "Content-Type": "application/json" },
        timeout: 30000,
      }
    );

    console.log("Jito response:", JSON.stringify(response.data));

    if (response.data.error) {
      return {
        bundleId: "",
        submittedAt: Date.now(),
        success: false,
        error: response.data.error.message,
      };
    }

    return {
      bundleId: response.data.result,
      submittedAt: Date.now(),
      success: true,
    };
  } catch (error: any) {
    const errorDetail = error.response?.data
      ? JSON.stringify(error.response.data)
      : error.message;
    console.error("Bundle submission error details:", errorDetail);
    return {
      bundleId: "",
      submittedAt: Date.now(),
      success: false,
      error: errorDetail,
    };
  }
};

export const submitBundle = submitBundleDevnet;
