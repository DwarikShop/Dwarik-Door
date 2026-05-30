# Graph Report - .  (2026-05-30)

## Corpus Check
- cluster-only mode — file stats not available

## Summary
- 25 nodes · 18 edges · 9 communities (3 shown, 6 thin omitted)
- Extraction: 56% EXTRACTED · 44% INFERRED · 0% AMBIGUOUS · INFERRED: 8 edges (avg confidence: 0.89)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `30dbeb65`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- [[_COMMUNITY_Community 0|Community 0]]
- [[_COMMUNITY_Community 1|Community 1]]
- [[_COMMUNITY_Community 2|Community 2]]
- [[_COMMUNITY_Community 3|Community 3]]
- [[_COMMUNITY_Community 4|Community 4]]
- [[_COMMUNITY_Community 5|Community 5]]
- [[_COMMUNITY_Community 6|Community 6]]
- [[_COMMUNITY_Community 7|Community 7]]
- [[_COMMUNITY_Community 8|Community 8]]

## God Nodes (most connected - your core abstractions)
1. `Dwarik Door — Premium Door Manufacturing PWA` - 9 edges
2. `Mongoose` - 6 edges
3. `MongoDB Atlas` - 2 edges
4. `AI Usage Guide` - 2 edges
5. `Next.js 15` - 1 edges
6. `jose (JWT)` - 1 edges
7. `Framer Motion` - 1 edges
8. `Tailwind CSS v4` - 1 edges
9. `shadcn/ui` - 1 edges
10. `Sonner` - 1 edges

## Surprising Connections (you probably didn't know these)
- `Employee Model` --implements--> `Mongoose`  [INFERRED]
  src/app/models/Employee.ts → README.md
- `InventoryLog Model` --implements--> `Mongoose`  [INFERRED]
  src/app/models/InventoryLog.ts → README.md
- `Order Model` --implements--> `Mongoose`  [INFERRED]
  src/app/models/Order.ts → README.md
- `Product Model` --implements--> `Mongoose`  [INFERRED]
  src/app/models/Product.ts → README.md
- `StatusHistory Model` --implements--> `Mongoose`  [INFERRED]
  src/app/models/StatusHistory.ts → README.md

## Communities (9 total, 6 thin omitted)

### Community 0 - "Community 0"
Cohesion: 0.25
Nodes (8): Dwarik Door — Premium Door Manufacturing PWA, Framer Motion, jose (JWT), Lucide React, Next.js 15, shadcn/ui, Sonner, Tailwind CSS v4

### Community 1 - "Community 1"
Cohesion: 0.33
Nodes (6): Employee Model, InventoryLog Model, Order Model, Product Model, StatusHistory Model, Mongoose

### Community 2 - "Community 2"
Cohesion: 0.67
Nodes (3): AI Usage Guide, Antigravity Rules, Graphify Workflow

## Knowledge Gaps
- **19 isolated node(s):** `Next.js 15`, `jose (JWT)`, `Framer Motion`, `Tailwind CSS v4`, `shadcn/ui` (+14 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **6 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `Dwarik Door — Premium Door Manufacturing PWA` connect `Community 0` to `Community 1`, `Community 4`?**
  _High betweenness centrality (0.322) - this node is a cross-community bridge._
- **Why does `Mongoose` connect `Community 1` to `Community 0`?**
  _High betweenness centrality (0.217) - this node is a cross-community bridge._
- **Why does `MongoDB Atlas` connect `Community 4` to `Community 0`?**
  _High betweenness centrality (0.051) - this node is a cross-community bridge._
- **Are the 5 inferred relationships involving `Mongoose` (e.g. with `Employee Model` and `InventoryLog Model`) actually correct?**
  _`Mongoose` has 5 INFERRED edges - model-reasoned connections that need verification._
- **What connects `Next.js 15`, `jose (JWT)`, `Framer Motion` to the rest of the system?**
  _21 weakly-connected nodes found - possible documentation gaps or missing edges._