import { withTimeout } from "../../src/confirmation/timeout.handler";

describe("StreamConfirmation", () => {
  test("should timeout correctly", async () => {
    const slowPromise = new Promise((resolve) =>
      setTimeout(resolve, 5000)
    );
    await expect(
      withTimeout(slowPromise, 100, "Test timeout")
    ).rejects.toThrow("Test timeout");
  });

  test("should resolve before timeout", async () => {
    const fastPromise = Promise.resolve("done");
    const result = await withTimeout(fastPromise, 1000, "Should not timeout");
    expect(result).toBe("done");
  });
});
