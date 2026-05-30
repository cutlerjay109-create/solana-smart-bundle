import fs from "fs";
import path from "path";
import axios from "axios";
import dotenv from "dotenv";
dotenv.config();

const verifySubmissions = async (): Promise<void> => {
  console.log("=== Verifying Bundle Submissions ===");

  const submissionsPath = path.join("logs", "lifecycle", "submissions.json");

  if (!fs.existsSync(submissionsPath)) {
    console.error("No submissions log found");
    process.exit(1);
  }

  const submissions = JSON.parse(fs.readFileSync(submissionsPath, "utf-8"));
  console.log(`Found ${submissions.length} submissions to verify`);

  for (const submission of submissions) {
    console.log(`\nVerifying bundle: ${submission.bundleId}`);
    console.log(`Signature: ${submission.signature}`);
    console.log(`Tip: ${submission.tipLamports} lamports`);
    console.log(`Stage: ${submission.currentStage}`);

    if (submission.stages?.submitted) {
      console.log(`Submitted at slot: ${submission.stages.submitted.slot}`);
    }

    if (submission.stages?.finalized) {
      console.log(`Finalized at slot: ${submission.stages.finalized.slot}`);
    }

    console.log(
      `Explorer: https://explorer.solana.com/tx/${submission.signature}?cluster=devnet`
    );
  }

  console.log("\nVerification complete");
  console.log("Cross-reference slot numbers at https://explorer.solana.com");
};

verifySubmissions();
