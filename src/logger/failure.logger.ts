import fs from "fs";
import path from "path";
import { FailureRecord } from "../failure/types";

const CLASSIFIED_LOG = path.join("logs", "failures", "classified.json");

const readFailureLog = (): FailureRecord[] => {
  try {
    if (!fs.existsSync(CLASSIFIED_LOG)) return [];
    const content = fs.readFileSync(CLASSIFIED_LOG, "utf-8");
    return JSON.parse(content);
  } catch {
    return [];
  }
};

const writeFailureLog = (data: any[]): void => {
  fs.writeFileSync(CLASSIFIED_LOG, JSON.stringify(data, null, 2));
};

export const logFailureRecord = (record: FailureRecord): void => {
  const failures = readFailureLog();

  const entry = {
    ...record,
    raw: undefined,
    loggedAt: new Date().toISOString(),
  };

  failures.push(entry);
  writeFailureLog(failures);
  console.error(
    `Failure logged: [${record.failureType}] ${record.reason}`
  );
};

export const getFailureRecords = (): FailureRecord[] => {
  return readFailureLog();
};

export const getFailuresByType = (type: string): FailureRecord[] => {
  return readFailureLog().filter((r) => r.failureType === type);
};
