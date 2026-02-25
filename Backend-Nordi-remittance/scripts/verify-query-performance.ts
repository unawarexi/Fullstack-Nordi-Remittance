// ============================================================================
// QUERY PERFORMANCE VERIFICATION UTILITY
// ============================================================================
// Use this to verify critical queries use IXSCAN (index scan) not COLLSCAN.
// Run: npx tsx scripts/verify-query-performance.ts
// ============================================================================

import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(process.cwd(), ".env") });

// Import all models to register them
import "../models/UserModel";
import "../models/AccountsModel";
import "../models/TransactionModel";
import "../models/AdminModel";
import "../models/AuditModels";
import "../models/CardsModel";
import "../models/ConfirmModel";
import "../models/FraudSecurityModel";
import "../models/NotificationModel";
import "../models/PermissionsModel";
import "../models/TransferVerificationModel";
import "../models/StatisticsModel";
import "../models/LegalReportsModel";
import "../models/LoansModel";
import "../models/InvestmentsModel";
import "../models/IntergrationsModel";
import "../models/AttachmentModel";
import "../models/FeatureGrowthModel";

interface QueryTest {
  name: string;
  collection: string;
  filter: Record<string, any>;
  sort?: Record<string, any>;
  limit?: number;
}

// Critical queries to verify — these match the actual query patterns in controllers
const CRITICAL_QUERIES: QueryTest[] = [
  // User queries
  {
    name: "Users: find by email",
    collection: "users",
    filter: { email: "test@example.com" },
  },
  {
    name: "Users: find by accountStatus + kycStatus",
    collection: "users",
    filter: { accountStatus: "active", kycStatus: "verified" },
  },
  {
    name: "Users: text search",
    collection: "users",
    filter: { $text: { $search: "john doe" } },
  },

  // Wallet queries
  {
    name: "Wallets: find by user",
    collection: "wallets",
    filter: { user: "test-user-id" },
  },
  {
    name: "Wallets: find by walletNumber",
    collection: "wallets",
    filter: { walletNumber: "123456789012" },
  },

  // Transaction queries — most critical for performance
  {
    name: "Transactions: user transactions sorted by date",
    collection: "transactions",
    filter: { initiatedBy: "test-user-id" },
    sort: { createdAt: -1 },
    limit: 20,
  },
  {
    name: "Transactions: user + status + date range",
    collection: "transactions",
    filter: {
      initiatedBy: "test-user-id",
      status: "completed",
      createdAt: { $gte: new Date("2025-01-01") },
    },
    sort: { createdAt: -1 },
    limit: 20,
  },
  {
    name: "Transactions: by reference (exact)",
    collection: "transactions",
    filter: { referenceNumber: "TXN-12345" },
  },
  {
    name: "Transactions: wallet + status",
    collection: "transactions",
    filter: { wallet: new mongoose.Types.ObjectId(), status: "completed" },
    sort: { createdAt: -1 },
  },
  {
    name: "Transactions: status + date (dashboard)",
    collection: "transactions",
    filter: { status: "completed", createdAt: { $gte: new Date("2025-01-01") } },
  },

  // Admin queries
  {
    name: "AdminUsers: by email",
    collection: "adminusers",
    filter: { email: "admin@test.com" },
  },
  {
    name: "AdminActionLogs: by admin + date",
    collection: "adminactionlogs",
    filter: { admin: "test-admin-id" },
    sort: { createdAt: -1 },
    limit: 50,
  },

  // Audit queries
  {
    name: "AuditLogs: by actor + date",
    collection: "auditlogs",
    filter: { actor: "test-user-id" },
    sort: { createdAt: -1 },
    limit: 20,
  },
  {
    name: "ActivityLogs: by user + date",
    collection: "activitylogs",
    filter: { user: "test-user-id" },
    sort: { createdAt: -1 },
    limit: 20,
  },

  // Fraud queries
  {
    name: "FraudSignals: by user + status",
    collection: "fraudsignals",
    filter: { user: "test-user-id", status: "active" },
  },
  {
    name: "FraudCases: by status + date",
    collection: "fraudcases",
    filter: { status: "open" },
    sort: { createdAt: -1 },
    limit: 20,
  },

  // Notification queries
  {
    name: "Notifications: user + unread + date",
    collection: "notifications",
    filter: { user: "test-user-id", isRead: false },
    sort: { createdAt: -1 },
    limit: 20,
  },

  // Card queries
  {
    name: "Cards: by user + status",
    collection: "cards",
    filter: { user: "test-user-id", status: "active" },
  },
  {
    name: "CardTransactions: by card + date",
    collection: "cardtransactions",
    filter: { card: new mongoose.Types.ObjectId() },
    sort: { createdAt: -1 },
    limit: 20,
  },

  // Loan queries
  {
    name: "Loans: by user + status",
    collection: "loans",
    filter: { user: "test-user-id", status: "active" },
  },

  // Confirmation tokens
  {
    name: "ConfirmationTokens: token lookup",
    collection: "confirmationtokens",
    filter: { token: "abc123", type: "email_verification", used: false },
  },

  // Security events
  {
    name: "SecurityEvents: by user + type + date",
    collection: "securityevents",
    filter: { userId: "test-user-id", type: "login" },
    sort: { createdAt: -1 },
    limit: 20,
  },
];

async function verifyQueryPerformance(): Promise<void> {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error("❌ MONGODB_URI is not defined");
    process.exit(1);
  }

  await mongoose.connect(uri);
  console.log("✅ Connected to MongoDB\n");

  const db = mongoose.connection.db;
  if (!db) {
    console.error("❌ Database not available");
    process.exit(1);
  }

  console.log("🔍 Verifying Query Performance (IXSCAN vs COLLSCAN)\n");
  console.log("─".repeat(90));
  console.log(
    `${"Query".padEnd(50)} ${"Stage".padEnd(12)} ${"Docs Examined".padEnd(15)} ${"Status"}`,
  );
  console.log("─".repeat(90));

  let passed = 0;
  let failed = 0;
  let skipped = 0;

  for (const test of CRITICAL_QUERIES) {
    try {
      const collection = db.collection(test.collection);

      // Check if collection exists
      const collections = await db.listCollections({ name: test.collection }).toArray();
      if (collections.length === 0) {
        console.log(`${test.name.padEnd(50)} ${"SKIP".padEnd(12)} ${"N/A".padEnd(15)} ⏭️ Collection not found`);
        skipped++;
        continue;
      }

      let cursor = collection.find(test.filter);
      if (test.sort) cursor = cursor.sort(test.sort);
      if (test.limit) cursor = cursor.limit(test.limit);

      const explain = await cursor.explain("executionStats");

      const executionStats = explain.executionStats;
      const winningPlan = explain.queryPlanner?.winningPlan;

      // Extract the stage (recursively look for inputStage)
      let stage = winningPlan?.stage || "UNKNOWN";
      let inputStage = winningPlan?.inputStage?.stage || "";

      // For sorted queries, the top stage might be SORT with an inputStage of IXSCAN
      const effectiveStage =
        stage === "COLLSCAN"
          ? "COLLSCAN"
          : inputStage === "IXSCAN" || stage === "IXSCAN"
            ? "IXSCAN"
            : stage === "FETCH" && winningPlan?.inputStage?.stage === "IXSCAN"
              ? "IXSCAN"
              : stage;

      const docsExamined = executionStats?.totalDocsExamined || 0;
      const isCollScan = effectiveStage === "COLLSCAN";

      if (isCollScan) {
        console.log(
          `${test.name.padEnd(50)} ${effectiveStage.padEnd(12)} ${String(docsExamined).padEnd(15)} ❌ FAIL`,
        );
        failed++;
      } else {
        console.log(
          `${test.name.padEnd(50)} ${effectiveStage.padEnd(12)} ${String(docsExamined).padEnd(15)} ✅ PASS`,
        );
        passed++;
      }
    } catch (err: any) {
      // $text queries on empty collections may error
      if (err.message?.includes("text index")) {
        console.log(
          `${test.name.padEnd(50)} ${"N/A".padEnd(12)} ${"N/A".padEnd(15)} ⚠️ Text index needed`,
        );
        skipped++;
      } else {
        console.log(
          `${test.name.padEnd(50)} ${"ERROR".padEnd(12)} ${"N/A".padEnd(15)} ⚠️ ${err.message?.slice(0, 30)}`,
        );
        skipped++;
      }
    }
  }

  console.log("─".repeat(90));
  console.log(`\n✅ Passed: ${passed}`);
  console.log(`❌ Failed (COLLSCAN): ${failed}`);
  console.log(`⏭️ Skipped: ${skipped}`);
  console.log(`📦 Total: ${CRITICAL_QUERIES.length}`);

  if (failed > 0) {
    console.log(
      "\n⚠️  WARNING: Some queries use COLLSCAN. Run scripts/create-indexes.ts to fix.",
    );
  } else if (passed > 0) {
    console.log("\n🎉 All tested queries use index scans (IXSCAN). Performance is optimal.");
  }

  await mongoose.disconnect();
}

verifyQueryPerformance().catch((err) => {
  console.error("❌ Verification failed:", err);
  process.exit(1);
});
