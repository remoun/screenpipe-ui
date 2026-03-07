# @screenpipe-ui/web

Browser-based SPA for [screenpipe](https://github.com/screenpipe/screenpipe), built with Vite + React + Tailwind CSS.

## Quick start

```bash
git clone https://github.com/remoun/screenpipe-ui
cd screenpipe-ui
bun install
bun web
```

Opens at `http://localhost:5173`.

## Pages

- **Search** — full-text search across screen captures and audio transcriptions
- **Timeline** — browse recent activity chronologically
- **Meetings** — view detected meetings and transcripts

## Development

```bash
# Dev server with hot reload
bun web

# Production build
bun run --cwd packages/web build
```

## Configuration

Connects to `http://localhost:3030` by default. Override with:

- `?url=<url>` — query param when loading the app (e.g. `http://localhost:5173/?url=http://custom:3030`)
- `SCREENPIPE_BASE_URL` — environment variable when starting the dev server or building

## License

MIT
