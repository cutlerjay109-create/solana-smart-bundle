export interface BackoffConfig {
  initialDelayMs: number;
  maxDelayMs: number;
  multiplier: number;
  jitter: boolean;
}

const defaultConfig: BackoffConfig = {
  initialDelayMs: 1000,
  maxDelayMs: 30000,
  multiplier: 2,
  jitter: true,
};

export const calculateBackoff = (
  attempt: number,
  config: BackoffConfig = defaultConfig
): number => {
  let delay = config.initialDelayMs * Math.pow(config.multiplier, attempt);
  delay = Math.min(delay, config.maxDelayMs);

  if (config.jitter) {
    delay = delay * (0.5 + Math.random() * 0.5);
  }

  return Math.floor(delay);
};

export const sleep = (ms: number): Promise<void> => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

export const sleepWithBackoff = async (
  attempt: number,
  config?: BackoffConfig
): Promise<void> => {
  const delay = calculateBackoff(attempt, config);
  console.log(`Backing off for ${delay}ms before retry attempt ${attempt + 1}`);
  await sleep(delay);
};
