# @screenpipe-ui/tui

Interactive terminal UI for [screenpipe](https://github.com/screenpipe/screenpipe), built with Ink (React for terminals).

Part of [screenpipe-ui](https://github.com/remoun/screenpipe-ui). Also available: **CLI** (`bunx @screenpipe-ui/cli`) and **Web** (run `bun web` from the [repo](https://github.com/remoun/screenpipe-ui)).

## Quick start

```bash
# No install needed
npx @screenpipe-ui/tui
bunx @screenpipe-ui/tui
```

## Keyboard shortcuts

| Key | Action |
|-----|--------|
| `Tab` | Switch between Search / Timeline / Meetings |
| `j` / `k` or ↑ / ↓ | Navigate down / up |
| `n` / `p` or → / ← | Next / prev (page in Search; item in detail view) |
| `/` | Focus search input |
| `Enter` | Expand / select item |
| `t` | Cycle content type (Search: all / ocr / audio / ui) |
| `d` | Cycle date range preset |
| `r` | Reload (Timeline, Meetings) |
| `q` | Quit |

## Views

- **Search** — full-text search across screen captures and audio transcriptions
- **Timeline** — browse recent activity chronologically
- **Meetings** — view detected meetings and transcripts

## Configuration

Connects to `http://localhost:3030` by default. Override with:

- `--url <url>` — e.g. `bunx @screenpipe-ui/tui --url http://custom:3030`
- `SCREENPIPE_BASE_URL` — environment variable

## License

MIT
