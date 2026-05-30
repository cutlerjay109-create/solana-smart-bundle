import fs from "fs";
import path from "path";
import { LifecycleEntry } from "../lifecycle/tracker";
import { formatLatency } from "../lifecycle/latency.calculator";

const SUBMISSIONS_LOG = path.join("logs", "lifecycle", "submissions.json");
const FAILURES_LOG = path.join("logs", "lifecycle", "failures.json");

const readJsonFile = (filePath: string): any[] => {
  try {
    if (!fs.existsSync(filePath)) return [];
    const content = fs.readFileSync(filePath, "utf-8");
    return JSON.parse(content);
  } catch {
    return [];
  }
};

const writeJsonFile = (filePath: string, data: any[]): void => {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
};

export const logLifecycleEntry = (entry: LifecycleEntry): void => {
  const submissions = readJsonFile(SUBMISSIONS_LOG);

  const logEntry = {
    id: entry.id,
    bundleId: entry.bundleId,
    signature: entry.signature,
    tipLamports: entry.tipLamports,
    currentStage: entry.currentStage,
    stages: entry.stages,
    latency: {
      submittedToProcessed: formatLatency(
        entry.latency?.submittedToProcessed || null
      ),
      processedToConfirmed: formatLatency(
        entry.latency?.processedToConfirmed || null
      ),
      confirmedToFinalized: formatLatency(
        entry.latency?.confirmedToFinalized || null
      ),
      total: formatLatency(entry.latency?.totalLatency || null),
    },
    failureReason: entry.failureReason || null,
    createdAt: new Date(entry.createdAt).toISOString(),
    loggedAt: new Date().toISOString(),
  };

  submissions.push(logEntry);
  writeJsonFile(SUBMISSIONS_LOG, submissions);
};

export const logFailureEntry = (entry: LifecycleEntry): void => {
  const failures = readJsonFile(FAILURES_LOG);

  const failureEntry = {
    id: entry.id,
    bundleId: entry.bundleId,
    signature: entry.signature,
    tipLamports: entry.tipLamports,
    failureReason: entry.failureReason,
    failedAtStage: entry.currentStage,
    stages: entry.stages,
    createdAt: new Date(entry.createdAt).toISOString(),
    loggedAt: new Date().toISOString(),
  };

  failures.push(failureEntry);
  writeJsonFile(FAILURES_LOG, failures);
};

export const getSubmissionCount = (): number => {
  return readJsonFile(SUBMISSIONS_LOG).length;
};

export const getFailureCount = (): number => {
  return readJsonFile(FAILURES_LOG).length;
};
