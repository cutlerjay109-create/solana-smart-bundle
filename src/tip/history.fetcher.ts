import { fetchTipAccountData, TipAccountData } from "../jito/tip.fetcher";

export interface TipHistory {
  data: TipAccountData[];
  fetchedAt: number;
  count: number;
}

let cachedHistory: TipHistory | null = null;
const CACHE_TTL_MS = 30000;

export const fetchTipHistory = async (): Promise<TipHistory> => {
  if (
    cachedHistory &&
    Date.now() - cachedHistory.fetchedAt < CACHE_TTL_MS
  ) {
    return cachedHistory;
  }

  const data = await fetchTipAccountData();

  cachedHistory = {
    data,
    fetchedAt: Date.now(),
    count: data.length,
  };

  return cachedHistory;
};

export const getRecentTipHistory = async (
  count: number = 10
): Promise<TipAccountData[]> => {
  const history = await fetchTipHistory();
  return history.data.slice(-count);
};

export const clearTipHistoryCache = (): void => {
  cachedHistory = null;
};
