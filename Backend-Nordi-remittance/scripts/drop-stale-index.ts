/**
 * One-time script to drop the stale `eventId_1` unique index
 * from the `securityevents` collection that causes E11000 errors.
 *
 * Run with: npx tsx scripts/drop-stale-index.ts
 */

import mongoose from "mongoose";
import { config } from "dotenv";

config(); // load .env

const MONGO_URI =
  process.env.MONGODB_URI ||
  process.env.MONGO_URI ||
  process.env.DB_URI ||
  "mongodb://localhost:27017/test";

async function main() {
  console.log(`Connecting to MongoDB: ${MONGO_URI.replace(/\/\/.*@/, "//***@")}…`);
  await mongoose.connect(MONGO_URI);
  console.log("Connected.\n");

  const db = mongoose.connection.db!;
  const collection = db.collection("securityevents");

  // List current indexes
  const indexes = await collection.indexes();
  console.log("Current indexes on 'securityevents':");
  for (const idx of indexes) {
    console.log(`  - ${idx.name}: ${JSON.stringify(idx.key)}${idx.unique ? " (unique)" : ""}${idx.sparse ? " (sparse)" : ""}`);
  }

  // Drop eventId_1 if it exists
  const target = indexes.find((i) => i.name === "eventId_1");
  if (target) {
    console.log(`\nDropping stale index 'eventId_1'…`);
    await collection.dropIndex("eventId_1");
    console.log("✅ Index dropped successfully.\n");

    // Show remaining indexes
    const remaining = await collection.indexes();
    console.log("Remaining indexes:");
    for (const idx of remaining) {
      console.log(`  - ${idx.name}: ${JSON.stringify(idx.key)}`);
    }
  } else {
    console.log("\n✅ Index 'eventId_1' does not exist — nothing to drop.");
  }

  await mongoose.disconnect();
  console.log("\nDone.");
}

main().catch((err) => {
  console.error("Error:", err);
  process.exit(1);
});
