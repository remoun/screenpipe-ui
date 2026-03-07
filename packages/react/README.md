# @screenpipe-ui/react

React hooks for [screenpipe](https://github.com/screenpipe/screenpipe), bridging `@screenpipe-ui/core` stores to React via `useSyncExternalStore`. Used by both the TUI (Ink) and Web (React DOM) packages.

## Install

```bash
bun add @screenpipe-ui/react @screenpipe-ui/core
```

## Usage

```tsx
import { createClient } from "@screenpipe-ui/core";
import { useSearch, useHealth, useTimeline } from "@screenpipe-ui/react";

const client = createClient();

function SearchPage() {
  const { query, results, loading, setQuery, executeSearch } = useSearch(client);

  return (
    <div>
      <input value={query} onChange={(e) => setQuery(e.target.value)} />
      <button onClick={executeSearch} disabled={loading}>Search</button>
      {results.map((item, i) => <div key={i}>{item.type}</div>)}
    </div>
  );
}
```

## Hooks

### `useSearch(client)`

Returns search state and actions: `query`, `contentType`, `results`, `loading`, `error`, `pagination`, `setQuery`, `setContentType`, `executeSearch`, `nextPage`, `prevPage`, `reset`.

### `useHealth(client)`

Returns health state and actions: `status`, `loading`, `error`, `checkHealth`.

### `useTimeline(client)`

Returns timeline state and actions: `results`, `loading`, `error`, `load`.

## Peer dependencies

- `react` ^18.0.0 || ^19.0.0

## License

MIT
