import dotenv from "dotenv";
dotenv.config();

import { config } from "./config";
import { loadKeypair, getBalanceInSol, checkMinimumBalance } from "./wallet";
import { fetchLatestBlockhash, BlockhashTracker, startBlockhashRefresher } from "./blockhash";
import { SlotWatcher } from "./timing/slot.watcher";
import { buildTransferTransaction } from "./transaction/builder";
import { createComputeBudgetInstructions } from "./transaction/compute.budget";
import { buildBundle } from "./jito/bundle.builder";
import { submitBundleDevnet } from "./jito/bundle.submitter";
import { LifecycleTracker } from "./lifecycle/tracker";
import { LifecycleStage } from "./lifecycle/stages";
import { detectAndClassifyFailure } from "./failure/detector";
import { FailureEmitter } from "./failure/emitter";
import { FailureRecord, FailureType } from "./failure/types";
import { analyzeFailure, decideTip, decideRetry, decideSubmissionTiming } from "./ai/agent";
import { logLifecycleEntry, logFailureEntry, logInfo, logError } from "./logger";
import { logFailureRecord } from "./logger/failure.logger";
import { QueueManager } from "./timing/queue.manager";
import { BundleState } from "./state/bundle.state";
import { SlotState } from "./state/slot.state";
import { simulateBlockhashExpiry } from "./fault-injection/blockhash.expiry.sim";
import { refreshBlockhash } from "./blockhash/refresher";
import { calculateOptimalTip } from "./tip/optimal.calculator";
import { pollForCommitment } from "./confirmation/commitment.handler";
import { v4 as uuidv4 } from "uuid";

let isRunning = false;

const initializeSystem = async (): Promise<void> => {
  logInfo("Initializing Solana Smart Bundle system...");

  const keypair = loadKeypair();
  logInfo(`Wallet: ${keypair.publicKey.toBase58()}`);

  const balance = await getBalanceInSol();
  logInfo(`Balance: ${balance} SOL`);

  const hasMinBalance = await checkMinimumBalance(10000000);
  if (!hasMinBalance) {
    throw new Error("Insufficient balance to run");
  }

  logInfo("Fetching initial blockhash...");
  const blockhashInfo = await fetchLatestBlockhash();
  BlockhashTracker.setBlockhash(blockhashInfo);
  logInfo(`Blockhash: ${blockhashInfo.blockhash}`);

  logInfo("Starting slot watcher...");
  await SlotWatcher.start();
  await new Promise((resolve) => setTimeout(resolve, 3000));
  logInfo(`Current slot: ${SlotState.getCurrentSlot()}`);

  startBlockhashRefresher(30000);
  logInfo("Blockhash refresher started");

  setupFailureHandlers();
  logInfo("System initialized successfully");
};

const setupFailureHandlers = (): void => {
  FailureEmitter.onFailure(async (record: FailureRecord) => {
    logFailureRecord(record);
    logError(`Failure detected: [${record.failureType}] ${record.reason}`);
  });
};

const submitSingleBundle = async (
  toAddress: string,
  lamports: number,
  simulateFailure: boolean = false
): Promise<string> => {
  const bundleId = uuidv4();
  const keypair = loadKeypair();

  logInfo(`Starting bundle submission ${bundleId}`);

  let tipLamportsUsed = 0;
  const lifecycleEntry = LifecycleTracker.createEntry(
    bundleId,
    "",
    0
  );

  try {
    if (simulateFailure) {
      logInfo("Simulating blockhash expiry fault injection...");
      simulateBlockhashExpiry();
    }

    logInfo("AI Agent deciding submission timing...");
    const timingDecision = await decideSubmissionTiming(bundleId);

    if (!timingDecision.submissionDecision.submitNow) {
      logInfo(
        `AI says wait ${timingDecision.submissionDecision.waitSlots} slots: ${timingDecision.submissionDecision.reasoning}`
      );
      await new Promise((resolve) =>
        setTimeout(
          resolve,
          Math.min(timingDecision.submissionDecision.waitSlots, 2) * 400
        )
      );
    }

    logInfo("AI Agent deciding tip amount...");
    const tipDecision = await decideTip(bundleId);
    const tipLamports = tipDecision.tipDecision.recommendedTipLamports;

    logInfo(`AI recommended tip: ${tipLamports} lamports`);

    let blockhashInfo = await fetchLatestBlockhash();

    if (BlockhashTracker.isExpired()) {
      logInfo("Blockhash expired, refreshing...");
      blockhashInfo = await refreshBlockhash();
    }

    const computeInstructions = createComputeBudgetInstructions({
      unitLimit: 200000,
      unitPrice: 1000,
    });

    const transferTx = buildTransferTransaction(
      toAddress,
      lamports,
      blockhashInfo
    );

    computeInstructions.forEach((ix) => transferTx.add(ix));

    const bundle = await buildBundle([transferTx], tipLamports, blockhashInfo);

    LifecycleTracker.updateStage(
      bundleId,
      LifecycleStage.SUBMITTED,
      SlotState.getCurrentSlot()
    );

    logInfo(`Submitting bundle to Jito devnet block engine...`);
    const result = await submitBundleDevnet(bundle);

    if (!result.success) {
      throw new Error(result.error || "Bundle submission failed");
    }

    logInfo(`Bundle submitted successfully: ${result.bundleId}`);

    // Update lifecycle entry with real signature and tip
    const currentEntry = LifecycleTracker.getEntry(bundleId);
    if (currentEntry) {
      currentEntry.signature = result.bundleId;
      currentEntry.tipLamports = tipLamports;
    }

    BundleState.addBundle({
      id: bundleId,
      signature: result.bundleId,
      status: "submitted",
      submittedAt: result.submittedAt,
      submittedSlot: SlotState.getCurrentSlot(),
      tipLamports,
      retryCount: 0,
    });

    logInfo("Confirming via gRPC stream...");
    const confirmed = await pollForCommitment(
      bundleId,
      result.bundleId,
      30000
    );

    if (confirmed) {
      LifecycleTracker.updateStage(
        bundleId,
        LifecycleStage.FINALIZED,
        SlotState.getCurrentSlot()
      );
      logInfo(`Bundle finalized: ${result.bundleId}`);
    }

    const entry = LifecycleTracker.getEntry(bundleId);
    if (entry) {
      logLifecycleEntry(entry);
    }

    return result.bundleId;
  } catch (error: any) {
    logError(`Bundle ${bundleId} failed: ${error.message}`);

    const failureRecord = detectAndClassifyFailure(
      bundleId,
      error
    );

    logInfo("AI Agent analyzing failure...");
    const aiDecision = await analyzeFailure(bundleId, failureRecord);

    logInfo(`AI Analysis: ${aiDecision.retryDecision.reasoning}`);

    if (aiDecision.retryDecision.shouldRetry) {
      logInfo("AI recommends retry, executing retry plan...");

      if (aiDecision.retryDecision.changes.refreshBlockhash) {
        await refreshBlockhash();
      }

      const retryTip =
        aiDecision.retryDecision.changes.newTipLamports || 10000;

      await new Promise((resolve) =>
        setTimeout(
          resolve,
          aiDecision.retryDecision.changes.waitSlots * 400
        )
      );

      return await submitSingleBundle(toAddress, lamports, false);
    }

    const entry = LifecycleTracker.getEntry(bundleId);
    if (entry) {
      logFailureEntry(entry);
    }

    throw error;
  }
};

const runBountyDemo = async (): Promise<void> => {
  logInfo("Starting bounty demo run...");
  logInfo("Target: 10 bundle submissions with 2 failure cases");

  const keypair = loadKeypair();
  const toAddress = keypair.publicKey.toBase58();
  const lamports = 1000;

  logInfo("=== PHASE 1: Normal Submissions (8 bundles) ===");
  for (let i = 1; i <= 8; i++) {
    logInfo(`Submitting bundle ${i}/8...`);
    try {
      const bundleId = await submitSingleBundle(toAddress, lamports, false);
      logInfo(`Bundle ${i} complete: ${bundleId}`);
    } catch (error: any) {
      logError(`Bundle ${i} failed: ${error.message}`);
    }
    await new Promise((resolve) => setTimeout(resolve, 3000));
  }

  logInfo("=== PHASE 2: Fault Injection (2 failure cases) ===");

  logInfo("Failure case 1: Simulating blockhash expiry...");
  try {
    await submitSingleBundle(toAddress, lamports, true);
  } catch (error: any) {
    logError(`Expected failure 1: ${error.message}`);
  }

  await new Promise((resolve) => setTimeout(resolve, 3000));

  logInfo("Failure case 2: Simulating blockhash expiry again...");
  try {
    await submitSingleBundle(toAddress, lamports, true);
  } catch (error: any) {
    logError(`Expected failure 2: ${error.message}`);
  }

  logInfo("=== DEMO COMPLETE ===");
  logInfo(`Check logs/lifecycle/submissions.json for lifecycle logs`);
  logInfo(`Check logs/ai/reasoning.json for AI reasoning logs`);
  logInfo(`Check logs/failures/classified.json for failure logs`);
};

const main = async (): Promise<void> => {
  try {
    await initializeSystem();
    await runBountyDemo();
    process.exit(0);
  } catch (error: any) {
    logError(`Fatal error: ${error.message}`);
    process.exit(1);
  }
};

main();
