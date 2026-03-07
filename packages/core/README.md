# @screenpipe-ui/core

Framework-agnostic core library for [screenpipe](https://github.com/screenpipe/screenpipe) UIs. Provides a REST client, Zustand vanilla stores, and formatting utilities — no React dependency.

## Install

```bash
bun add @screenpipe-ui/core
```

## Usage

### Client

```ts
import { createClient } from "@screenpipe-ui/core";

const client = createClient(); // defaults to localhost:3030

const results = await client.search({ q: "meeting notes", content_type: "audio" });
const health = await client.health();
```

### Stores

Zustand vanilla stores that work anywhere — call `.getState()` in scripts, or subscribe reactively in UI frameworks.

```ts
import { createSearchStore, createClient } from "@screenpipe-ui/core";

const client = createClient();
const store = createSearchStore();

// Imperative usage (CLI, scripts)
await store.getState().executeSearch(client);
console.log(store.getState().results);

// Reactive usage (subscribe to changes)
store.subscribe((state) => console.log(state.results));
```

Available stores: `createSearchStore`, `createTimelineStore`, `createHealthStore`.

### Formatters

```ts
import { timeAgo, truncate, contentPreview, formatTable } from "@screenpipe-ui/core";

timeAgo("2024-01-01T12:00:00Z"); // "3 months ago"
truncate("long text...", 10);      // "long te..."
contentPreview(contentItem);       // formatted preview string
```

### Content helpers

```ts
import { getContentText, getContentTimestamp, getContentAppName } from "@screenpipe-ui/core";

// Extract fields from ContentItem regardless of type (OCR, Audio, UI)
const text = getContentText(item);
const time = getContentTimestamp(item);
const app = getContentAppName(item);
```

## API

### Client

- `createClient(config?)` — create a `ScreenpipeUIClient`
- `client.search(params)` — search screen captures and audio transcriptions
- `client.health()` — check screenpipe server status
- `client.getFrameUrl(frameId)` — get URL for a captured frame

### Stores

- `createSearchStore()` — search state with `executeSearch`, `nextPage`, `prevPage`, `reset`
- `createTimelineStore()` — timeline state with `loadTimeline`
- `createHealthStore()` — health state with `checkHealth`

### Formatters

- `timeAgo`, `formatDuration`, `formatTime`, `formatDate`, `formatDateTime`, `todayRange`
- `truncate`, `contentTypeLabel`, `highlightMatch`, `stripAnsi`, `contentPreview`
- `formatTable(rows, columns)` — aligned text table

## License

MIT
