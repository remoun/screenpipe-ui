# screenpipe-ui

A community-built, open-source UI for [screenpipe](https://github.com/screenpipe/screenpipe) — the AI screen & audio memory tool.

Three interfaces, one codebase:

- **CLI** — quick terminal commands (`screenpipe-ui search "meeting notes"`)
- **TUI** — interactive terminal app with keyboard navigation
- **Web** — browser-based SPA

## Quick start

### bunx (no install needed)

```bash
# CLI — search, health, activity
bunx @screenpipe-ui/cli search "your query"
bunx @screenpipe-ui/cli health

# TUI — interactive terminal app
bunx @screenpipe-ui/tui
```

Also works with `npx` if you prefer.

### From source

```bash
git clone https://github.com/remoun/screenpipe-ui
cd screenpipe-ui
bun install

# CLI
bun cli search "your query"
bun cli health
bun cli activity --today

# TUI
bun tui

# Web UI
bun web
```

Requires [screenpipe](https://github.com/screenpipe/screenpipe) running locally on port 3030.

## Packages

| Package | npm | Description |
|---------|-----|-------------|
| `@screenpipe-ui/core` | [![npm](https://img.shields.io/npm/v/@screenpipe-ui/core)](https://npmjs.com/package/@screenpipe-ui/core) | Framework-agnostic business logic, state stores, formatters |
| `@screenpipe-ui/react` | [![npm](https://img.shields.io/npm/v/@screenpipe-ui/react)](https://npmjs.com/package/@screenpipe-ui/react) | React hooks bridging core stores (shared by TUI + Web) |
| `@screenpipe-ui/cli` | [![npm](https://img.shields.io/npm/v/@screenpipe-ui/cli)](https://npmjs.com/package/@screenpipe-ui/cli) | CLI commands — `bunx @screenpipe-ui/cli` |
| `@screenpipe-ui/tui` | [![npm](https://img.shields.io/npm/v/@screenpipe-ui/tui)](https://npmjs.com/package/@screenpipe-ui/tui) | Interactive terminal app — `bunx @screenpipe-ui/tui` |
| `@screenpipe-ui/web` | — | Vite + React + Tailwind SPA (run from source) |

## Architecture

```
packages/
  core/      Framework-agnostic business logic, state stores, formatters
  react/     React hooks bridging core stores (shared by TUI + Web)
  cli/       Commander.js commands — no React, instant startup
  tui/       Ink-based interactive terminal app
  web/       Vite + React + Tailwind SPA
```

All packages share `core` for data fetching, state management, and formatting. The CLI calls core functions directly for speed. The TUI and Web both use React (Ink is a React renderer for terminals) and share hooks via `react`.

## Features

- **Search** — full-text search across screen captures (OCR) and audio transcriptions
- **Timeline** — browse activity chronologically, filter by app
- **Meetings** — view detected meetings and transcripts
- **Health** — check screenpipe server status

## CLI usage

```bash
screenpipe-ui search "meeting notes" --type audio --limit 10
screenpipe-ui search "github" --app Chrome
screenpipe-ui health
screenpipe-ui activity --today
screenpipe-ui activity --app "VS Code"

# Custom server: --url or SCREENPIPE_BASE_URL
screenpipe-ui search "query" --url http://custom:3030
SCREENPIPE_BASE_URL=http://custom:3030 screenpipe-ui health
```

## TUI keyboard shortcuts

| Key | Action |
|-----|--------|
| `Tab` | Switch between Search / Timeline / Meetings |
| `j` / `k` | Navigate up / down |
| `/` | Focus search input |
| `Enter` | Expand / select item |
| `q` | Quit |

## Development

```bash
# Run all tests (60 tests across 6 files)
bun test --recursive

# Run tests for a specific package
bun test packages/core/

# Dev server for web UI
bun web
```

**PRs must include tests** for new behavior, bug fixes, or refactors. Run `bun test --recursive` and ensure all tests pass before submitting.

## Publishing

Publishing is automated via GitHub Actions: push to `main` with updated `packages/*/package.json` versions, or run the workflow manually. **When bumping versions, run `bun update` and commit the updated `bun.lock`** so workspace dependencies resolve correctly in published packages.

**Setup**: (1) Use [npm Trusted Publishing](https://docs.npmjs.com/trusted-publishers) (OIDC). No tokens needed. On npmjs.com, go to each package’s Settings → Trusted publishing, add a GitHub Actions publisher, and set workflow filename to `publish.yml`. Configure for: `@screenpipe-ui/core`, `@screenpipe-ui/react`, `@screenpipe-ui/cli`, `@screenpipe-ui/tui`. (2) In GitHub repo Settings → Environments, create an `npm` environment and add required reviewers if desired.

Manual publish:
```bash
bun run build && \
cd packages/core && bun publish && \
cd ../react && bun publish && \
cd ../cli && bun publish && \
cd ../tui && bun publish
```

## License

MIT
