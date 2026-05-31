import dotenv from "dotenv";
dotenv.config();

export const config = {
  network: process.env.NETWORK || "devnet",

  rpc: {
    url: process.env.RPC_URL || "",
    websocketUrl: process.env.RPC_WEBSOCKET_URL || "",
  },

  grpc: {
    url: process.env.GRPC_URL || "",
    token: process.env.GRPC_TOKEN || "",
  },

  jito: {
    blockEngineUrl: process.env.JITO_BLOCK_ENGINE_URL || "",
    tipAccount: process.env.JITO_TIP_ACCOUNT || "",
  },

  openai: {
    apiKey: process.env.OPENAI_API_KEY || "",
    apiUrl: process.env.OPENAI_API_URL || "https://api.openai.com/v1/chat/completions",
    model: process.env.OPENAI_MODEL || "gpt-5.5",
  },

  wallet: {
    keypairPath: process.env.WALLET_KEYPAIR_PATH || "./keypair.json",
  },

  tip: {
    minLamports: parseInt(process.env.TIP_MIN_LAMPORTS || "1000"),
    maxLamports: parseInt(process.env.TIP_MAX_LAMPORTS || "1000000"),
  },

  retry: {
    maxRetries: parseInt(process.env.MAX_RETRIES || "3"),
    retryDelayMs: parseInt(process.env.RETRY_DELAY_MS || "1000"),
  },

  timeouts: {
    confirmationTimeoutMs: parseInt(process.env.CONFIRMATION_TIMEOUT_MS || "60000"),
    blockhashExpirySlots: parseInt(process.env.BLOCKHASH_EXPIRY_SLOTS || "150"),
  },
};

export type Config = typeof config;
