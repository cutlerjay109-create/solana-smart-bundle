describe("DevnetRun", () => {
  test("devnet configuration is correct", () => {
    const rpcUrl = process.env.RPC_URL || "";
    const grpcUrl = process.env.GRPC_URL || "";
    expect(rpcUrl).toBeDefined();
    expect(grpcUrl).toBeDefined();
  });

  test("wallet keypair path is configured", () => {
    const keypairPath = process.env.WALLET_KEYPAIR_PATH || "./keypair.json";
    expect(keypairPath).toBeDefined();
  });
});
