# Graph Report - .  (2026-05-20)

## Corpus Check
- Corpus is ~20,415 words - fits in a single context window. You may not need a graph.

## Summary
- 226 nodes · 433 edges · 25 communities (12 shown, 13 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS · INFERRED: 1 edges (avg confidence: 0.9)
- Token cost: 57,932 input · 2,013 output

## Community Hubs (Navigation)
- [[_COMMUNITY_API Routes & Handlers|API Routes & Handlers]]
- [[_COMMUNITY_Cron Runner & Core App|Cron Runner & Core App]]
- [[_COMMUNITY_Gemini API Helpers|Gemini API Helpers]]
- [[_COMMUNITY_Database Config|Database Config]]
- [[_COMMUNITY_Package Dependencies|Package Dependencies]]
- [[_COMMUNITY_WordPress Integration|WordPress Integration]]
- [[_COMMUNITY_App Layout Components|App Layout Components]]
- [[_COMMUNITY_Dashboard View|Dashboard View]]
- [[_COMMUNITY_Briefs Page Components|Briefs Page Components]]
- [[_COMMUNITY_Drafts Page Components|Drafts Page Components]]
- [[_COMMUNITY_Marketing Hub Home|Marketing Hub Home]]
- [[_COMMUNITY_Scheduler Page Components|Scheduler Page Components]]
- [[_COMMUNITY_Topic Planner Page|Topic Planner Page]]
- [[_COMMUNITY_Scratch Database Reset|Scratch Database Reset]]
- [[_COMMUNITY_Topic Generation Task|Topic Generation Task]]
- [[_COMMUNITY_Brief Generation Task|Brief Generation Task]]
- [[_COMMUNITY_Draft Creation Task|Draft Creation Task]]
- [[_COMMUNITY_Auth Create Session|Auth Create Session]]
- [[_COMMUNITY_Auth Get Session|Auth Get Session]]
- [[_COMMUNITY_Hourly Sync Task|Hourly Sync Task]]
- [[_COMMUNITY_Post Live Sync Task|Post Live Sync Task]]
- [[_COMMUNITY_Monthly SEO Report|Monthly SEO Report]]

## God Nodes (most connected - your core abstractions)
1. `connectToDatabase()` - 33 edges
2. `getSession()` - 32 edges
3. `compilerOptions` - 15 edges
4. `runApproveBriefAndWriteDraft()` - 13 edges
5. `runWeeklyTopicGeneration()` - 11 edges
6. `runHourlyWPSchedulingSync()` - 11 edges
7. `runMonthlySEOReport()` - 11 edges
8. `runApproveTopicAndGenerateBrief()` - 10 edges
9. `runPostLiveSyncCheck()` - 10 edges
10. `sendSlackMessage()` - 9 edges

## Surprising Connections (you probably didn't know these)
- `run` --calls--> `connectToDatabase`  [INFERRED]
  scratch_reset_db.js → src/lib/db.ts
- `POST()` --calls--> `getSession()`  [EXTRACTED]
  src/app/api/live-check/route.ts → src/lib/auth.ts
- `GET()` --calls--> `getSession()`  [EXTRACTED]
  src/app/api/auth/user/route.ts → src/lib/auth.ts
- `POST()` --calls--> `runApproveBriefAndWriteDraft()`  [EXTRACTED]
  src/app/api/drafts/regenerate/route.ts → src/lib/cronRunner.ts
- `GET()` --calls--> `connectToDatabase()`  [EXTRACTED]
  src/app/api/reset/route.ts → src/lib/db.ts

## Communities (25 total, 13 thin omitted)

### Community 0 - "API Routes & Handlers"
Cohesion: 0.11
Nodes (26): GET(), checkAuth(), createSession(), decrypt(), destroySession(), encrypt(), ENCRYPTION_KEY, getSession() (+18 more)

### Community 1 - "Cron Runner & Core App"
Cohesion: 0.14
Nodes (31): POST(), POST(), logEvent(), runApproveBriefAndWriteDraft(), runApproveTopicAndGenerateBrief(), runMonthlySEOReport(), runRejectAndRegenerateBrief(), toIdQuery() (+23 more)

### Community 2 - "Gemini API Helpers"
Cohesion: 0.15
Nodes (20): GET(), runPostLiveSyncCheck(), runWeeklyTopicGeneration(), addPublishedPost(), appendTopicIdeas(), ContentPipelineRow, deletePipelineRow(), getMonthlyStrategy() (+12 more)

### Community 3 - "Database Config"
Cohesion: 0.10
Nodes (20): dependencies, lucide-react, mongodb, next, pg, react, react-dom, react-hot-toast (+12 more)

### Community 4 - "Package Dependencies"
Cohesion: 0.11
Nodes (18): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+10 more)

### Community 5 - "WordPress Integration"
Cohesion: 0.26
Nodes (17): runHourlyWPSchedulingSync(), createWPDraft(), executeLocalMockDraft(), executeLocalMockLive(), executeLocalMockPending(), executeLocalMockSchedule(), fetchWPLivePosts(), fetchWPPendingPosts() (+9 more)

### Community 6 - "App Layout Components"
Cohesion: 0.18
Nodes (3): metadata, LoginViewProps, SidebarProps

### Community 14 - "Topic Generation Task"
Cohesion: 0.50
Nodes (4): runWeeklyTopicGeneration, generateTopics, getTopicIdeas, notifyTopicIdeas

### Community 17 - "Brief Generation Task"
Cohesion: 0.67
Nodes (3): runApproveTopicAndGenerateBrief, connectToDatabase, run

## Knowledge Gaps
- **69 isolated node(s):** `{ MongoClient }`, `client`, `name`, `version`, `private` (+64 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **13 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `connectToDatabase()` connect `API Routes & Handlers` to `Cron Runner & Core App`, `Gemini API Helpers`, `WordPress Integration`?**
  _High betweenness centrality (0.044) - this node is a cross-community bridge._
- **Why does `getSession()` connect `API Routes & Handlers` to `Cron Runner & Core App`, `Gemini API Helpers`, `WordPress Integration`?**
  _High betweenness centrality (0.032) - this node is a cross-community bridge._
- **Why does `runApproveBriefAndWriteDraft()` connect `Cron Runner & Core App` to `API Routes & Handlers`, `WordPress Integration`?**
  _High betweenness centrality (0.006) - this node is a cross-community bridge._
- **What connects `{ MongoClient }`, `client`, `name` to the rest of the system?**
  _69 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `API Routes & Handlers` be split into smaller, more focused modules?**
  _Cohesion score 0.1111111111111111 - nodes in this community are weakly interconnected._
- **Should `Cron Runner & Core App` be split into smaller, more focused modules?**
  _Cohesion score 0.13513513513513514 - nodes in this community are weakly interconnected._
- **Should `Database Config` be split into smaller, more focused modules?**
  _Cohesion score 0.09523809523809523 - nodes in this community are weakly interconnected._