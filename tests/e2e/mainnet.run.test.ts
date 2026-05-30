describe("MainnetRun", () => {
  test("mainnet configuration is correct", () => {
    const blockEngineUrl = process.env.JITO_BLOCK_ENGINE_URL || "";
    expect(blockEngineUrl).toContain("block-engine.jito.wtf");
  });

  test("tip bounds are configured", () => {
    const minTip = parseInt(process.env.TIP_MIN_LAMPORTS || "1000");
    const maxTip = parseInt(process.env.TIP_MAX_LAMPORTS || "1000000");
    expect(minTip).toBeGreaterThan(0);
    expect(maxTip).toBeGreaterThan(minTip);
  });
});
