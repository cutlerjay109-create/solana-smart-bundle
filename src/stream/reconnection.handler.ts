import { resetClient } from "./yellowstone.client";

export interface ReconnectionConfig {
  maxAttempts: number;
  delayMs: number;
  backoffMultiplier: number;
}

const defaultConfig: ReconnectionConfig = {
  maxAttempts: 10,
  delayMs: 1000,
  backoffMultiplier: 2,
};

export const withReconnection = async <T>(
  fn: () => Promise<T>,
  config: ReconnectionConfig = defaultConfig
): Promise<T> => {
  let attempts = 0;
  let delay = config.delayMs;

  while (attempts < config.maxAttempts) {
    try {
      return await fn();
    } catch (error) {
      attempts++;
      console.error(
        `Connection attempt ${attempts} failed:`,
        error
      );

      if (attempts >= config.maxAttempts) {
        throw new Error(
          `Max reconnection attempts (${config.maxAttempts}) reached`
        );
      }

      console.log(`Reconnecting in ${delay}ms...`);
      await new Promise((resolve) => setTimeout(resolve, delay));
      delay *= config.backoffMultiplier;
      resetClient();
    }
  }

  throw new Error("Reconnection failed");
};
