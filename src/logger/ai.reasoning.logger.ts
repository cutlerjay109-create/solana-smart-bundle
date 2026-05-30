import fs from "fs";
import path from "path";

const AI_REASONING_LOG = path.join("logs", "ai", "reasoning.json");

export interface ReasoningEntry {
  id: string;
  bundleId: string;
  decisionType: string;
  input: object;
  reasoning: string;
  decision: object;
  timestamp: string;
}

const readReasoningLog = (): ReasoningEntry[] => {
  try {
    if (!fs.existsSync(AI_REASONING_LOG)) return [];
    const content = fs.readFileSync(AI_REASONING_LOG, "utf-8");
    return JSON.parse(content);
  } catch {
    return [];
  }
};

const writeReasoningLog = (data: ReasoningEntry[]): void => {
  fs.writeFileSync(AI_REASONING_LOG, JSON.stringify(data, null, 2));
};

export const logAIReasoning = (entry: ReasoningEntry): void => {
  const entries = readReasoningLog();
  entries.push(entry);
  writeReasoningLog(entries);
  console.log(`AI Reasoning logged for bundle ${entry.bundleId}`);
};

export const getReasoningEntries = (): ReasoningEntry[] => {
  return readReasoningLog();
};

export const getReasoningCount = (): number => {
  return readReasoningLog().length;
};
