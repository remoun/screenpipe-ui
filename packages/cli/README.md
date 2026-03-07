# @screenpipe-ui/cli

Command-line interface for querying [screenpipe](https://github.com/screenpipe/screenpipe) from your terminal.

## Quick start

```bash
# No install needed
npx @screenpipe-ui/cli search "meeting notes"
npx @screenpipe-ui/cli health

# Or with bun
bunx @screenpipe-ui/cli search "meeting notes"
```

## Commands

### search

Search screen captures (OCR) and audio transcriptions.

```bash
screenpipe-ui search "query"
screenpipe-ui search "github" --type ocr --limit 20
screenpipe-ui search "slack" --app Chrome
```

Options:
- `--type <type>` — filter by `ocr`, `audio`, or `all` (default: `all`)
- `--limit <n>` — max results (default: 20)
- `--app <name>` — filter by application name

### health

Check screenpipe server status.

```bash
screenpipe-ui health
```

Shows status (healthy/degraded/unhealthy), frame and audio capture status, and last capture timestamps.

### activity

Show activity summary grouped by application.

```bash
screenpipe-ui activity --today
screenpipe-ui activity --app "VS Code"
```

Options:
- `--today` — show today's activity only
- `--app <name>` — filter by application name

## Configuration

Connects to `http://localhost:3030` by default. Set `SCREENPIPE_BASE_URL` to override.

## License

MIT
