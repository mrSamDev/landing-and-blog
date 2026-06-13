---
title: agentic-kanban
description: Coordination protocol for AI agents. SQLite-backed. Agent-agnostic. No server, no daemon, no queues.
publishDate: 'Jun 01 2026'
isFeatured: true
seo:
  image:
    src: https://res.cloudinary.com/dnmuyrcd7/image/upload/v1733839719/Blog/canvas.png
    alt: agentic-kanban project cover
---

# agentic-kanban

> **Alpha.** Things may break. You've been warned.

Coordination protocol for AI agents. SQLite-backed. Agent-agnostic.

No server, no daemon, no queues. Just a shared database file agents use to claim, track, review, and finish work. Single Go binary plus SQLite.

## Why

Started with a markdown file. Sprint 1, task 1.1, task 1.2. Agents kept overwriting each other's updates, forgetting to mark things done, or picking up work already claimed. The file became noise fast.

The answer was a database. Every state change is a transaction, so two agents can't claim the same task. If one crashes, its lease expires and another picks it up, same as Rust's ownership model: one owner at a time, released when the owner disappears.

The `.db` file is the only coordination point.

## When it fits

**Use this when:** multiple AI agents on the same machine or a shared filesystem need durable coordination without Redis or Postgres or message queues. You also want crash recovery and task ownership. Tested with 3 to 10 concurrent agents, and up to 50.

**Skip it when:** agents run across untrusted networks, you need real-time push notifications, or you need thousands of concurrent workers. Those cases want something like Temporal, Celery, or Kafka.

## Key features

- **Crash recovery.** 15-minute lease. If an agent dies, its task goes back in the pool. No orphans.
- **Role-based workflow.** Managers dispatch. Workers claim and complete. Reviewers approve or reject.
- **Agent-agnostic.** Same protocol works for Claude Code, PI, Codex, Gemini. The agents change. The protocol stays.
- **Batch operations.** Claim, complete, or update priority and project for multiple tasks atomically.
- **Dependency modeling.** Tasks depend on other tasks. Claim-next skips blocked work automatically.
- **Review gate.** Optional human or agent review step before marking tasks done.
- **Hooks system.** Shell scripts fire on task events. Create, claim, complete, block, approve, reject — all hookable.
- **WAL mode.** Safe to copy the DB while agents run. Auto-checkpoints every 1000 pages.

## Quick start

```bash
curl -sfL https://raw.githubusercontent.com/mrSamDev/agentic-kanban/main/install.sh | sh
kanban init --harness pi
go build -o kanban ./cmd/kanban/
```

## Built With

- Go 1.25
- SQLite via modernc.org/sqlite — pure Go, no CGo
- Cobra for CLI
- UUIDs

## Architecture

```
Manager                    Workers                    Reviewers
  │                           │                           │
  ├── dispatch tasks ────────>│                           │
  │                           ├── claim-next              │
  │                           ├── log-progress            │
  │                           ├── complete --review ─────>│
  │                           │              ├── approve  │
  │                           │              ├── reject   │
  │<── search --status BLOCKED│                           │
  └── unblock or reassign ───>│                           │
```

## Workflow

```text
TODO ── claim-next ──> IN_PROGRESS ── complete --review ──> IN_REVIEW ── approve ──> DONE
                            │                                       │
                            │ block                                 │ reject
                            ▼                                       ▼
                         BLOCKED                                  TODO
```

## Production notes

3 to 10 concurrent agents works fine. Past 50 you'll see contention on claim-next. The retry loop (100ms, 200ms, 400ms backoff) handles it, but measure latency. Past 1000, SQLite itself becomes the bottleneck. Switch to Postgres or a distributed queue.

Back up the `.db` file like any database. WAL mode lets you safely copy the main file while the system runs. Schema changes happen automatically on open. Events expire after 3 days by default; set `ttl_seconds` to NULL for permanent events. Run `kanban prune --before 30d` to clean up, then `VACUUM` to reclaim space.

## How it works

One `.db` file per project, shared by all agents. No server. Two agents calling claim-next at the same time get different tasks because SQLite serializes writes. A claimed task has a 15-minute lease. The log-progress command renews it. If an agent crashes, the lease expires and the next claim-next reclaims the task. The WAL file checkpoints itself every 1000 pages so it doesn't eat your disk.

```text
Worker-A claims TASK-1. Worker-A crashes.
15 minutes later the lease expires.
Worker-B calls claim-next and gets TASK-1.
```

Every command prints stable JSON to stdout. Empty work returns `{}`. Errors go to stderr as `{"error":"..."}` with exit code 2. Skill files (embedded in the binary, written by `kanban init`) teach agents the protocol. No tool-calling framework needed.

## Links

- GitHub: https://github.com/mrSamDev/agentic-kanban
- NPM (pi extension): https://www.npmjs.com/package/@mr-samdev/kanban

## License

MIT
