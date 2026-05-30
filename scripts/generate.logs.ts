import fs from "fs";
import path from "path";

const generateSampleLogs = (): void => {
  console.log("Generating sample lifecycle logs...");

  const submissions = [];
  const failures = [];

  for (let i = 1; i <= 8; i++) {
    submissions.push({
      id: `bundle-${i}`,
      bundleId: `bundle-${i}`,
      signature: `sig${i}xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`,
      tipLamports: 5000 + i * 100,
      currentStage: "finalized",
      stages: {
        submitted: { slot: 465670000 + i * 10, timestamp: Date.now() - 60000 },
        processed: { slot: 465670002 + i * 10, timestamp: Date.now() - 58000 },
        confirmed: { slot: 465670004 + i * 10, timestamp: Date.now() - 55000 },
        finalized: { slot: 465670032 + i * 10, timestamp: Date.now() - 40000 },
      },
      latency: {
        submittedToProcessed: "800ms",
        processedToConfirmed: "3000ms",
        confirmedToFinalized: "15000ms",
        total: "18800ms",
      },
      failureReason: null,
      createdAt: new Date().toISOString(),
    });
  }

  for (let i = 1; i <= 2; i++) {
    failures.push({
      id: `failure-${i}`,
      bundleId: `failure-bundle-${i}`,
      signature: null,
      tipLamports: 1000,
      failureReason: i === 1 ? "EXPIRED_BLOCKHASH" : "BUNDLE_FAILURE",
      failedAtStage: "submitted",
      stages: {
        submitted: { slot: 465675000 + i * 10, timestamp: Date.now() - 30000 },
        failed: { slot: 465675002 + i * 10, timestamp: Date.now() - 29000 },
      },
      createdAt: new Date().toISOString(),
    });
  }

  fs.writeFileSync(
    path.join("logs", "lifecycle", "submissions.json"),
    JSON.stringify(submissions, null, 2)
  );

  fs.writeFileSync(
    path.join("logs", "lifecycle", "failures.json"),
    JSON.stringify(failures, null, 2)
  );

  console.log(`Generated ${submissions.length} submissions and ${failures.length} failures`);
};

generateSampleLogs();
