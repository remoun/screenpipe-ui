# CLAUDE.md

## Project overview

screenpipe-ui is a community-built, open-source UI for [screenpipe](https://github.com/screenpipe/screenpipe) (AI screen & audio memory tool). Three interfaces share one TypeScript/Bun codebase: CLI commands, interactive TUI, and a web SPA.

## Architecture

```
packages/
  core/      Framework-agnostic: REST client, Zustand vanilla stores, formatters
  react/     React hooks bridging core stores via useSyncExternalStore
  cli/       Commander.js commands — no React, calls core directly
  tui/       Ink (React for terminals) interactive app
  web/       Vite + React + Tailwind SPA
```

Key design: Zustand vanilla stores (`createStore()`, not `create()`) are framework-agnostic. CLI uses `.getState()` imperatively. TUI and Web subscribe reactively via shared React hooks.

## Commands

```bash
bun install          # install all dependencies
bun run build        # build all packages (tsup + vite)
bun test --recursive # run all tests (60+ tests across 6 files)
bun cli <command>    # run CLI commands (search, health, activity)
bun tui              # launch interactive TUI
bun web              # start web dev server
```

## Code conventions

- **Runtime**: Bun for all commands (install, test, build, dev)
- **Module format**: ESM only (`"type": "module"` everywhere)
- **Imports**: Use `import type` for type-only imports
- **Stores**: Use `createStore()` from `zustand/vanilla`, not `create()` — stores must work without React
- **Store actions**: Take `client: ScreenpipeUIClient` as parameter, don't store it in state
- **Client**: Custom `ScreenpipeUIClient` with raw `fetch` (the published `@screenpipe/js` SDK is designed for pipes/plugins, not external apps)
- **Build tool**: tsup for libraries (core, react, cli, tui), Vite for web
- **Testing**: `bun test` with `bun:test` built-in runner; happy-dom for React hook tests
- **Web resolves workspace packages via Vite aliases** to source (not dist) for HMR

## Key types

- `ContentItem` — union type: OCR | Audio | UI (no "Input" type in published SDK)
- `ScreenpipeQueryParams` — search parameters from `@screenpipe/js`
- `ScreenpipeResponse` — search response with `data: ContentItem[]` and `pagination`
- `HealthCheckResponse` — health status with `status`, `frame_status`, `audio_status`

## Package dependencies

```
cli  → core
tui  → core, react
web  → core, react
react → core
```

## Publishing

Packages publish to npm under `@screenpipe-ui/*` org. Publish in dependency order: core → react → cli, tui. Web is `private: true` (not published).

Workspace dependencies (`workspace:*`) are resolved to actual versions at publish time.
