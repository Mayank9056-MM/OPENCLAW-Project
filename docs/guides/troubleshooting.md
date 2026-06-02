# Troubleshooting

## Environment validation fails

The configuration schema requires several environment variables at startup.
Ensure these are set:

```bash
OPENROUTER_API_KEY=...
OPENROUTER_DEFAULT_MODEL=...
FIRECRAWL_API_KEY=...
TELEGRAM_BOT_TOKEN=...
TELEGRAM_OWNER_ID=...
```

`OPENROUTER_DEFAULT_MODEL` has a default, but setting it explicitly is
recommended.

## The wakeup command does not run

Use the registered command:

```bash
bun run dev wakeup
```

Running `bun run index.ts` without `wakeup` parses the CLI but does not launch a
mode.

## Telegram bot does not respond

Check the following:

- `TELEGRAM_BOT_TOKEN` is correct.
- The bot is running and has network access.
- `TELEGRAM_OWNER_ID` exactly matches your chat ID.
- You are using supported commands such as `/ask`, `/agent`, or `/plan`.

Unauthorized chat IDs are ignored by design.

## Web search or crawl fails

- Verify `FIRECRAWL_API_KEY`.
- Check provider limits and network access.
- Try `fetch_url` for simple URL retrieval if Firecrawl search is unavailable.

## File tools reject a path

The executor rejects paths that escape the workspace root and blocks excluded
patterns. Avoid absolute paths and use repository-relative paths.

Examples of rejected or risky paths:

```text
../outside-file
.env
node_modules/package/index.js
.git/config
```

## Shell command fails after approval

Shell commands run from the workspace root with a fixed output buffer. If a
command fails:

- Re-run it manually in the terminal for full output.
- Check whether required dependencies are installed.
- Split long-running or verbose commands into smaller commands.
- Avoid commands that require interactive input.

## Markdown rendering looks odd

Terminal Markdown rendering depends on terminal width and `marked-terminal`.
Resize the terminal or capture raw output if formatting is hard to read.
