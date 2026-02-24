AI Agent Prompt — Optimize Search for High-Performance Express + MongoDB Backend (Fintech Grade)

Project stack:

Express.js

MongoDB

Mongoose ODM

Production fintech-grade requirements

Large collections (millions+ documents)

Objective:
Achieve low-latency search queries (<20ms target under normal load) without full collection scans.

Do NOT refactor unrelated business logic.
Do NOT change API contracts.
Focus strictly on search performance architecture.

1️⃣ Audit Existing Queries

Locate all .find(), .aggregate(), .countDocuments() queries.

For each:

Identify filter fields

Identify sort fields

Identify projection usage

Flag any query that:

Lacks an index on filter fields

Uses regex without prefix anchor

Uses $where

Uses unbounded queries without .limit()

Return a list of problematic queries.

2️⃣ Enforce Proper Indexing Strategy

For each searchable collection:

A. Exact Match Fields (High Selectivity)

Create indexes:

collection.createIndex({ email: 1 })
collection.createIndex({ accountNumber: 1 })
collection.createIndex({ userId: 1 })
B. Compound Indexes for Sorted Queries

If query:

.find({ userId })
.sort({ createdAt: -1 })
.limit(20)

Create:

collection.createIndex({ userId: 1, createdAt: -1 })

Ensure index matches filter order exactly.

3️⃣ Remove Full Collection Scans

Reject any usage of:

.find({})

without filter and limit.

Enforce:

Mandatory .limit()

Proper pagination

Prefer cursor-based pagination using \_id

Example:

.find({ userId, \_id: { $lt: cursor } })
.sort({ \_id: -1 })
.limit(20)
4️⃣ Full-Text Search (If Required)

If text search exists:

Add text index:

collection.createIndex({ description: "text" })

Replace regex search with:

.find({ $text: { $search: query } })
.project({ score: { $meta: "textScore" } })
.sort({ score: { $meta: "textScore" } })
.limit(20)

Do NOT allow:

{ description: { $regex: query } }

unless anchored and indexed.

5️⃣ Projection Optimization

Ensure all queries use .select() to return only required fields.

Example:

.find({ userId })
.select("amount status createdAt")
.limit(20)

Never return full documents unnecessarily.

6️⃣ Aggregation Pipeline Optimization

For .aggregate():

Ensure $match is first stage.

Ensure $match fields are indexed.

Avoid $lookup on large collections without index.

Avoid $group before $match.

7️⃣ Add Query Performance Verification

For critical queries:

Use:

Model.find(...).explain("executionStats")

Verify:

stage is IXSCAN

NOT COLLSCAN

Fail implementation if COLLSCAN appears.

8️⃣ Enable Production-Grade Mongo Config

Ensure:

Proper connection pooling in Mongoose

Use keepAlive

Disable autoIndex in production

Ensure indexes are created via migration script, not at runtime

9️⃣ Optional: Redis Caching Layer

If endpoints are high-frequency:

Add Redis:

Cache read-heavy queries

TTL 30–60 seconds

Invalidate on write

Do NOT cache sensitive financial data without validation.

10️⃣ Deliverables

List of created indexes

Refactored optimized queries

Removed inefficient queries

Explain plan validation results

No API breaking changes

No new security risks

Constraints:

Maintain financial-grade correctness

Maintain consistency

Do not weaken validation

Do not bypass Mongoose schema rules
