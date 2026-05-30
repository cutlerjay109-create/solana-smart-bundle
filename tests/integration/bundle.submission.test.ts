import { buildBundle } from "../../src/jito/bundle.builder";
import { fetchLatestBlockhash } from "../../src/blockhash/fetcher";
import { buildTransferTransaction } from "../../src/transaction/builder";
import { loadKeypair } from "../../src/wallet/keypair.loader";

describe("BundleSubmission", () => {
  test("should build a valid bundle", async () => {
    const blockhashInfo = await fetchLatestBlockhash();
    const keypair = loadKeypair();
    const tx = buildTransferTransaction(
      keypair.publicKey.toBase58(),
      1000,
      blockhashInfo
    );
    const bundle = buildBundle([tx], 5000, blockhashInfo);
    expect(bundle.transactions.length).toBeGreaterThan(0);
    expect(bundle.tipLamports).toBe(5000);
    expect(bundle.tipAccount).toBeDefined();
  });
});
