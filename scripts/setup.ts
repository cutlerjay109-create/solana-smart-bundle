import { loadKeypair, getBalanceInSol } from "../src/wallet";
import { fetchLatestBlockhash } from "../src/blockhash";
import { config } from "../src/config";

const setup = async (): Promise<void> => {
  console.log("=== Solana Smart Bundle Setup ===");
  console.log(`Network: ${config.network}`);
  console.log(`RPC URL: ${config.rpc.url}`);
  console.log(`gRPC URL: ${config.grpc.url}`);
  console.log(`Jito Block Engine: ${config.jito.blockEngineUrl}`);

  try {
    const keypair = loadKeypair();
    console.log(`Wallet: ${keypair.publicKey.toBase58()}`);

    const balance = await getBalanceInSol();
    console.log(`Balance: ${balance} SOL`);

    const blockhash = await fetchLatestBlockhash();
    console.log(`Latest Blockhash: ${blockhash.blockhash}`);
    console.log(`Fetched at slot: ${blockhash.fetchedSlot}`);

    console.log("Setup complete. System is ready.");
  } catch (error: any) {
    console.error("Setup failed:", error.message);
    process.exit(1);
  }
};

setup();
