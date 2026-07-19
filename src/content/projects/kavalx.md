---
title: Kavalx
description: AI PR Review Agent for Bitbucket & Self-Hosted Teams. Controllable, self-hostable code review with retrieval, memory, and architecture-aware agent orchestration.
publishDate: 'May 22 2026'
isFeatured: true
seo:
  image:
    src: https://res.cloudinary.com/dnmuyrcd7/image/upload/v1733839719/Blog/canvas.png
    alt: Kavalx project cover
---

![TypeScript](https://img.shields.io/badge/typescript-ready-3178C6?logo=typescript&logoColor=white)
![Status](https://img.shields.io/badge/status-closed%20beta-orange)
![Bitbucket](https://img.shields.io/badge/bitbucket-native-0052CC?logo=bitbucket&logoColor=white)

**Project Overview**

`Kavalx` is an AI-native pull request review system built for teams running Bitbucket Server, Bitbucket Data Center, or self-hosted Git instances. It is closed-source today, in beta with a small group of enterprise users, and will open once the core engine is stable enough to self-host without hand-holding.

## Why

AI code review tooling is almost entirely GitHub-centric. That leaves enterprise teams on Bitbucket, GitLab self-hosted, or internal Git frontends with two bad choices: pipe code into SaaS black boxes they do not control, or build review automation from scratch.

Kavalx exists to fill that gap. It is built for environments where data residency, audit trails, and policy control matter.

- Existing tools assume GitHub primitives (checks API, GraphQL, Actions)
- Self-hosted teams need transparent, auditable review workflows
- Tool access to source code must be controllable and offline-capable
- Enterprise review policies are not one-size-fits-all

## Key Features

- Architecture-aware review flows that understand repo structure, not just file diffs
- Semantic memory across review sessions for incremental, context-accelerated feedback
- PR chunking and context compression for large changesets without truncation
- Retrieval-augmented generation grounded in codebase embeddings and style guides
- Extensible agent orchestration for custom review policies and team-specific rules
- Hallucination control through constrained generation and multi-stage verification
- Telemetry and eval hooks for monitoring review quality and drift

## Built With

- TypeScript
- Bitbucket Server / Data Center APIs
- Vector DB (for semantic retrieval)
- Ollama / OpenAI / Anthropic (provider-agnostic model layer)

## Current Status

- **Closed source.** The core engine is not public yet.
- **Beta users.** First enterprise teams are running it against real PR volumes.
- **Contributor help.** A small group of engineers are contributing time; no paid development at this stage.
- **Open source plan.** Will go OSS once the agent orchestration, memory system, and eval pipeline are stable enough that external contributors can run it without debugging our assumptions.

## Bitbucket-First, General Later

The current integration is Bitbucket-native. That includes webhook ingestion, PR comment threading, user mentions, and permissions mapping against Bitbucket Server and Data Center APIs.

When the project opens, the core review engine will be provider-agnostic. A general webhook-based open-source version will ship alongside the Bitbucket integration, making it straightforward to adapt to GitLab, Gitea, Azure DevOps, or internal Git frontends.

## Use Cases

- Enforcing architectural review policies in large monorepos
- Incremental AI review that remembers prior decisions and project conventions
- Reducing reviewer load on boilerplate, style, and safety checks
- Self-hosted deployment in air-gapped or regulated environments
- Custom agent pipelines for security, performance, or compliance review

## Design Goals

- Self-hostable without managed dependencies
- Observable: every review decision is traceable to inputs, prompts, and retrieved context
- Incremental: reviews improve as memory accumulates, not stateless repetition
- Controllable: teams define policies, not vendors

## Links

- GitHub: TBD — will be published at stable release
- NPM: TBD
