import { classifyFailure } from "../../src/failure/classifier";
import { FailureType } from "../../src/failure/types";

describe("FailureClassifier", () => {
  test("should classify expired blockhash", () => {
    const error = new Error("blockhash not found");
    const result = classifyFailure(error);
    expect(result.failureType).toBe(FailureType.EXPIRED_BLOCKHASH);
    expect(result.shouldRetry).toBe(true);
  });

  test("should classify insufficient funds", () => {
    const error = new Error("insufficient funds");
    const result = classifyFailure(error);
    expect(result.failureType).toBe(FailureType.INSUFFICIENT_FUNDS);
    expect(result.shouldRetry).toBe(false);
  });

  test("should classify compute exceeded", () => {
    const error = new Error("compute budget exceeded 0x3");
    const result = classifyFailure(error);
    expect(result.failureType).toBe(FailureType.COMPUTE_EXCEEDED);
    expect(result.shouldRetry).toBe(true);
  });

  test("should classify bundle failure", () => {
    const error = new Error("jito bundle rejected");
    const result = classifyFailure(error);
    expect(result.failureType).toBe(FailureType.BUNDLE_FAILURE);
    expect(result.shouldRetry).toBe(true);
  });

  test("should classify network timeout", () => {
    const error = new Error("connection timed out");
    const result = classifyFailure(error);
    expect(result.failureType).toBe(FailureType.NETWORK_TIMEOUT);
    expect(result.shouldRetry).toBe(true);
  });

  test("should classify unknown errors", () => {
    const error = new Error("something went wrong");
    const result = classifyFailure(error);
    expect(result.failureType).toBe(FailureType.UNKNOWN);
  });
});
