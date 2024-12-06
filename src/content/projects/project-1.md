---
title: 'JiraCraft: Git Branch Management CLI'
description: JiraCraft is a command-line tool that automates Git branch creation from JIRA tickets, improving developer workflow and maintaining consistent branch naming conventions.
publishDate: 'Jan 02 2024'
seo:
  image:
    src: '/project-1.jpg'
    alt: Project preview
---

**Project Overview:**
JiraCraft is a developer productivity tool that bridges the gap between JIRA and Git workflows. By automating branch creation and enforcing naming conventions, it reduces manual effort and potential errors in development workflows.

## Objectives

1. Automate Git branch creation from JIRA ticket information
2. Enforce consistent branch naming conventions across teams
3. Streamline the development workflow initialization process
4. Reduce manual errors in branch naming and ticket tracking

## Features

1. **Automated Branch Creation:**

- Fetches ticket details directly from JIRA
- Creates properly formatted branch names automatically
- Supports custom branch naming patterns

2. **Interactive CLI Interface:**

- Simple command-line interface with guided prompts
- Quick access to ticket information
- Configurable settings for JIRA credentials and preferences

3. **Smart Defaults:**

- Automatically determines branch type based on ticket type
- Uses standardized prefixes (feature/, bugfix/, hotfix/)
- Sanitizes branch names for Git compatibility

4. **Configuration Management:**

- Secure credential storage
- Customizable branch naming patterns
- Team-wide configuration sharing options

## Technology Stack

- Node.js for cross-platform compatibility
- TypeScript for type safety and developer experience
- Commander.js for CLI interface
- Inquirer for interactive prompts

## Installation

```bash
# Using npm
npm install -g jiracraft

# Using yarn
yarn global add jiracraft

# Using pnpm
pnpm add -g jiracraft
```

# Start work on a ticket

jc start-work DC-1234

# Configure settings

jc config

# View options

jc display
