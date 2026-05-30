import axios from "axios";

export type BundleStatusType =
  | "Invalid"
  | "Pending"
  | "Failed"
  | "Landed"
  | "Unknown";

export interface BundleStatusResult {
  bundleId: string;
  status: BundleStatusType;
  landedSlot?: number;
  error?: string;
}

export const getBundleStatus = async (
  bundleId: string
): Promise<BundleStatusResult> => {
  try {
    const response = await axios.post(
      "https://mainnet.block-engine.jito.wtf/api/v1/bundles",
      {
        jsonrpc: "2.0",
        id: 1,
        method: "getBundleStatuses",
        params: [[bundleId]],
      },
      {
        headers: { "Content-Type": "application/json" },
        timeout: 10000,
      }
    );

    const result = response.data.result?.value?.[0];

    if (!result) {
      return { bundleId, status: "Unknown" };
    }

    return {
      bundleId,
      status: result.confirmation_status || "Unknown",
      landedSlot: result.slot,
    };
  } catch (error: any) {
    return {
      bundleId,
      status: "Unknown",
      error: error.message,
    };
  }
};

export const waitForBundleLanding = async (
  bundleId: string,
  timeoutMs: number = 60000
): Promise<BundleStatusResult> => {
  const startTime = Date.now();

  while (Date.now() - startTime < timeoutMs) {
    const status = await getBundleStatus(bundleId);

    if (status.status === "Landed") {
      return status;
    }

    if (status.status === "Failed" || status.status === "Invalid") {
      return status;
    }

    await new Promise((resolve) => setTimeout(resolve, 2000));
  }

  return { bundleId, status: "Unknown", error: "Timeout waiting for bundle" };
};
