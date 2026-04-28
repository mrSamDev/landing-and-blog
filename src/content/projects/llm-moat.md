---
title: llm-moat
description: An open-source TypeScript toolkit for defending LLM applications against prompt injection, tool misuse, and unsafe input flows.
publishDate: 'Apr 01 2026'
isFeatured: true
seo:
  image:
    src: https://res.cloudinary.com/dnmuyrcd7/image/upload/v1733839719/Blog/canvas.png
    alt: llm-moat project cover
---

![npm version](https://img.shields.io/npm/v/llm-moat.svg)
![TypeScript](https://img.shields.io/badge/typescript-ready-3178C6?logo=typescript&logoColor=white)
![GitHub](https://img.shields.io/badge/github-llm--moat-181717?logo=github)

**Project Overview**

`llm-moat` is an open-source security toolkit for production LLM systems. It is built to help developers detect prompt injection attempts, protect tool execution paths, and enforce safer trust boundaries around model input and output.

## Why

LLM applications often connect models to tools, memory, retrieval systems, and sensitive business workflows. That creates a new security surface:

- Prompt injection can override system instructions
- Untrusted input can manipulate downstream tools
- Tool chains can expose data or execute unintended actions
- Teams need security controls that fit real-time, streaming applications

`llm-moat` exists to make those defenses practical in application code.

## Key Features

- Prompt injection detection for production-facing LLM workflows
- Hybrid analysis using rule-based checks and semantic classification
- Trust-boundary enforcement before tool execution
- Input sanitization to reduce prompt poisoning and unsafe tool calls
- Streaming-aware inspection for large or real-time model inputs
- Adapter-friendly design for multiple model providers
- Telemetry hooks for logging, monitoring, and incident review

## Built With

- TypeScript
- OpenAI
- Anthropic
- Ollama

## Installation

```bash
npm install llm-moat
```

## Use Cases

- Protecting AI copilots with tool access
- Securing retrieval-augmented generation pipelines
- Blocking unsafe prompt patterns before model execution
- Reducing risk of data exfiltration and privilege escalation

## Design Goals

- Lightweight enough to integrate into existing app stacks
- Flexible enough to support different providers and policies
- Practical enough for real product teams, not only demos

## Links

- NPM: https://www.npmjs.com/package/llm-moat
- GitHub: https://github.com/mrSamDev/llm-moat
