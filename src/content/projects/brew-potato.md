---
title: Brew Potato
description: A simple terminal UI for Homebrew that shows only user-installed packages and lets you uninstall them interactively.
publishDate: 'Mar 01 2026'
tags:
  - Go
  - Homebrew
  - TUI
  - Bubble Tea
seo:
  image:
    src: https://res.cloudinary.com/dnmuyrcd7/image/upload/UI_ofnace.png
    alt: brew-potato UI screenshot
---

![Go Version](https://img.shields.io/badge/go-1.21%2B-00ADD8?logo=go&logoColor=white) ![License](https://img.shields.io/badge/license-do%20what%20you%20want-875fff)
![GitHub](https://img.shields.io/badge/github-brew--potato-181717?logo=github)

**Project Overview**

Brew Potato is a full-screen terminal UI for Homebrew built with Go and Bubble Tea. It focuses on the packages you explicitly installed, filtering out dependencies so you can browse, inspect install dates, and uninstall without leaving the UI.

## Why

`brew list` mixes your packages with all their dependencies. Brew Potato keeps the view clean by showing only user-installed formulae and handling missing `brew` gracefully instead of crashing.

## Key Features

- Filtered list of user-installed Homebrew formulae with install dates
- Interactive uninstall with async spinner and in-place row updates
- Styled header/footer and rounded table borders via Lip Gloss
- Clear messaging if Homebrew is not available

## Built With

- Bubble Tea (TUI framework)
- Bubbles (table + spinner components)
- Lip Gloss (styling and layout)

## Requirements

- Go 1.21+
- Homebrew installed and on PATH

## Run

```sh
go mod tidy
go run .
```

## Build

```sh
go build -o brew-potato .
./brew-potato
```

## Keybindings

| Key       | Action             |
| --------- | ------------------ |
| `↑` / `↓` | Navigate packages  |
| `d`       | Uninstall selected |
| `?`       | Show credits       |
| `q`       | Quit               |

## Next Steps

Integrate GoReleaser to publish Brew Potato as a Homebrew formula so users can install it with `brew install`.

## Links

- GitHub: https://github.com/mrSamDev/brew-potato
