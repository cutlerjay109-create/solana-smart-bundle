import { v4 as uuidv4 } from "uuid";
import { logAIReasoning } from "../logger/ai.reasoning.logger";

export const logReasoning = (
  bundleId: string,
  decisionType: string,
  input: object,
  reasoning: string,
  decision: object
): void => {
  logAIReasoning({
    id: uuidv4(),
    bundleId,
    decisionType,
    input,
    reasoning,
    decision,
    timestamp: new Date().toISOString(),
  });
};
