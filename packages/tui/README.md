# @screenpipe-ui/tui

Interactive terminal UI for [screenpipe](https://github.com/screenpipe/screenpipe), built with Ink (React for terminals).

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
| `j` / `k` | Navigate down / up |
| `/` | Focus search input |
| `Enter` | Expand / select item |
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
