import { config } from "./index";

export const aiConfig = {
  apiKey: config.openai.apiKey,
  apiUrl: config.openai.apiUrl,
  model: config.openai.model,
  maxTokens: 300,
  temperature: 0.1,
  systemPrompt: `You are a Solana transaction AI agent. Always respond with valid JSON only. Be concise.`,
};
