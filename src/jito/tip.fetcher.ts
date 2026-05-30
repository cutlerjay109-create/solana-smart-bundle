import axios from "axios";

export interface TipAccountData {
  time: string;
  landed_tips_25th_percentile: number;
  landed_tips_50th_percentile: number;
  landed_tips_75th_percentile: number;
  landed_tips_95th_percentile: number;
  landed_tips_99th_percentile: number;
  ema_landed_tips_50th_percentile: number;
}

const DEVNET_BLOCK_ENGINE = "https://dallas.testnet.block-engine.jito.wtf";

let cachedTipAccounts: string[] = [];

export const fetchRealTipAccounts = async (): Promise<string[]> => {
  if (cachedTipAccounts.length > 0) return cachedTipAccounts;

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
    const accounts = response.data.result || [];
    console.log("Fetched real tip accounts:", accounts);
    cachedTipAccounts = accounts;
    return accounts;
  } catch (error: any) {
    console.warn("Failed to fetch tip accounts:", error.message);
    return [
      "96gYZGLnJYVFmbjzopPSU6QiEV5fGqZNyN9nmNhvrZU5",
      "HFqU5x63VTqvQss8hp11i4wVV8bD44PvwucfZ2bU7gRe",
      "Cw8CFyM9FkoMi7K7Crf6HNQqf4uEMzpKw6QNghXLvLkY",
    ];
  }
};

export const getRandomTipAccount = async (): Promise<string> => {
  const accounts = await fetchRealTipAccounts();
  return accounts[Math.floor(Math.random() * accounts.length)];
};

export const getRandomTipAccountSync = (): string => {
  if (cachedTipAccounts.length > 0) {
    return cachedTipAccounts[
      Math.floor(Math.random() * cachedTipAccounts.length)
    ];
  }
  const fallback = [
    "96gYZGLnJYVFmbjzopPSU6QiEV5fGqZNyN9nmNhvrZU5",
    "HFqU5x63VTqvQss8hp11i4wVV8bD44PvwucfZ2bU7gRe",
    "Cw8CFyM9FkoMi7K7Crf6HNQqf4uEMzpKw6QNghXLvLkY",
  ];
  return fallback[Math.floor(Math.random() * fallback.length)];
};

export const fetchTipAccountData = async (): Promise<TipAccountData[]> => {
  try {
    const response = await axios.get(
      "https://bundles.jito.wtf/api/v1/bundles/tip_floor",
      { timeout: 5000 }
    );
    return response.data;
  } catch (error) {
    console.warn("Failed to fetch tip data, using defaults");
    return [
      {
        time: new Date().toISOString(),
        landed_tips_25th_percentile: 1000,
        landed_tips_50th_percentile: 5000,
        landed_tips_75th_percentile: 10000,
        landed_tips_95th_percentile: 50000,
        landed_tips_99th_percentile: 100000,
        ema_landed_tips_50th_percentile: 5000,
      },
    ];
  }
};

export const getLatestTipData = async (): Promise<TipAccountData> => {
  const data = await fetchTipAccountData();
  return data[data.length - 1];
};
