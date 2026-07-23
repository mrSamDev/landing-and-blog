---
title: agentic-kanban
description: Coordination protocol for AI agents. SQLite-backed. Agent-agnostic. No server, no daemon, no queues.
publishDate: 'Jun 01 2026'
isFeatured: true
tags:
  - AI
  - DevTool
seo:
  image:
    src: https://res.cloudinary.com/dnmuyrcd7/image/upload/v1733839719/Blog/canvas.png
    alt: agentic-kanban project cover
---

![Go Version](https://img.shields.io/badge/go-1.25%2B-00ADD8?logo=go&logoColor=white)
![License](https://img.shields.io/badge/license-MIT-blue)
![GitHub](https://img.shields.io/badge/github-agentic--kanban-181717?logo=github)

**Project Overview**

`agentic-kanban` is a coordination protocol for AI agents. It uses a shared SQLite file as the single source of truth. No server, no daemon, no message queues. Just a database file that agents use to claim, track, review, and finish work.

## Why

It started with a markdown file. Sprint 1, task 1.1, task 1.2. Agents kept overwriting each other's updates, forgetting to mark things done, or picking up work already claimed. The file became noise fast.

The answer was a database. Every state change is a transaction, so two agents cannot claim the same task. If one crashes, its lease expires and another picks it up. Same as Rust's ownership model: one owner at a time, released when the owner disappears. The `.db` file is the only coordination point.

## When It Fits

Use this when multiple AI agents on the same machine or a shared filesystem need durable coordination without Redis, Postgres, or message queues. You also want crash recovery and task ownership. Tested with 3 to 10 concurrent agents, and up to 50.

Skip it when agents run across untrusted networks, you need real-time push notifications, or you need thousands of concurrent workers. Those cases want something like Temporal, Celery, or Kafka.

## Key Features

- Crash recovery with 15-minute leases. If an agent dies, its task goes back in the pool. No orphans.
- Role-based workflow. Managers dispatch. Workers claim and complete. Reviewers approve or reject.
- Agent-agnostic. Same protocol works for Claude Code, PI, Codex, Gemini. The agents change. The protocol stays.
- Batch operations. Claim, complete, or update priority and project for multiple tasks atomically.
- Dependency modeling. Tasks depend on other tasks. Claim-next skips blocked work automatically.
- Review gate. Optional human or agent review step before marking tasks done.
- Hooks system. Shell scripts fire on task events. Create, claim, complete, block, approve, reject. All hookable.
- WAL mode. Safe to copy the DB while agents run. Auto-checkpoints every 1000 pages.

## Quick Start

```sh
curl -sfL https://raw.githubusercontent.com/mrSamDev/agentic-kanban/main/install.sh | sh
kanban init --harness pi
```

## Architecture

```
Manager                    Workers                    Reviewers
  │                           │                           │
  ├── dispatch tasks ────────>│                           │
  │                           ├── claim-next              │
  │                           ├── log-progress            │
  │                           ├── complete --review ─────>│
  │                           │              ├── approve  │
  │                           │              ├── reject  │
  │<── search --status BLOCKED│                           │
  └── unblock or reassign ───>│                           │
```

## Workflow

```
TODO ── claim-next ──> IN_PROGRESS ── complete --review ──> IN_REVIEW ── approve ──> DONE
                            │                                       │
                            │ block                                 │ reject
                            ▼                                       ▼
                         BLOCKED                                  TODO
```

## Production Notes

3 to 10 concurrent agents works fine. Past 50 you will see contention on claim-next. The retry loop handles it, but measure latency. Past 1000, SQLite itself becomes the bottleneck. Switch to Postgres or a distributed queue.

Back up the `.db` file like any database. WAL mode lets you safely copy the main file while the system runs. Schema changes happen automatically on open. Events expire after 3 days by default. Run `kanban prune --before 30d` to clean up, then `VACUUM` to reclaim space.

## How It Works

One `.db` file per project, shared by all agents. No server. Two agents calling claim-next at the same time get different tasks because SQLite serializes writes. A claimed task has a 15-minute lease. The log-progress command renews it. If an agent crashes, the lease expires and the next claim-next reclaims the task.

```
Worker-A claims TASK-1. Worker-A crashes.
15 minutes later the lease expires.
Worker-B calls claim-next and gets TASK-1.
```

Every command prints stable JSON to stdout. Empty work returns `{}`. Errors go to stderr as `{"error":"..."}` with exit code 2. Skill files embedded in the binary (written by `kanban init`) teach agents the protocol. No tool-calling framework needed.

## Built With

- Go 1.25
- SQLite via modernc.org/sqlite (pure Go, no CGo)
- Cobra for CLI

## Links

- GitHub: https://github.com/mrSamDev/agentic-kanban

## License

MIT
