# Installation

This guide covers local development and production-oriented setup for OPENCLAW
Project.

## Bun setup

Install Bun from the official installer or your package manager:

```bash
curl -fsSL https://bun.sh/install | bash
```

Confirm the installation:

```bash
bun --version
```

The repository was created with Bun and uses Bun scripts for development,
building, and type checking.

## Local development

Clone and install dependencies:

```bash
git clone <repository-url>
cd OPENCLAW-Project
bun install
```

Configure environment variables:

```bash
export OPENROUTER_API_KEY="your-openrouter-key"
export OPENROUTER_DEFAULT_MODEL="openai/gpt-4o-mini"
export FIRECRAWL_API_KEY="your-firecrawl-key"
export TELEGRAM_BOT_TOKEN="your-telegram-bot-token"
export TELEGRAM_OWNER_ID="123456789"
```

Run checks:

```bash
bun run typecheck
bun run build
```

Start the launcher:

```bash
bun run dev wakeup
```

## Production deployment

OPENCLAW is currently best deployed as a trusted developer tool in a controlled
workspace.

Recommended production steps:

1. Create a dedicated Unix user for the agent.
2. Clone the repository into the workspace the agent may inspect and modify.
3. Install dependencies with `bun install --production` if development tooling is
   not needed.
4. Store secrets in a process manager, environment file, or secret manager.
5. Run `bun run build` to ensure the project can bundle.
6. Start the desired interface:

   ```bash
   bun run start wakeup
   ```

7. For Telegram-only deployments, choose Telegram mode from the launcher or add
   a dedicated command wrapper that calls `runTelegramMode()`.

## Docker deployment

The repository does not currently include a `Dockerfile`. If you need Docker,
use a minimal Bun image and mount the workspace that the agent is allowed to
operate on.

Example Dockerfile:

```Dockerfile
FROM oven/bun:1.3
WORKDIR /app
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile
COPY . .
CMD ["bun", "run", "start", "wakeup"]
```

Example run command:

```bash
docker build -t openclaw-project .
docker run --rm -it \
  -e OPENROUTER_API_KEY \
  -e OPENROUTER_DEFAULT_MODEL \
  -e FIRECRAWL_API_KEY \
  -e TELEGRAM_BOT_TOKEN \
  -e TELEGRAM_OWNER_ID \
  -v "$PWD:/app/workspace" \
  openclaw-project
```

Security notes for Docker:

- Mount only the workspace the agent should access.
- Avoid mounting host credential directories.
- Consider running the container as a non-root user.
- Disable or restrict shell execution in custom configurations if the container
  has access to sensitive systems.

## Environment setup

| Variable | Purpose |
| --- | --- |
| `OPENROUTER_API_KEY` | Required OpenRouter key for model calls. |
| `OPENROUTER_DEFAULT_MODEL` | Optional model ID; defaults to `openrouter/free`. |
| `FIRECRAWL_API_KEY` | Required by current config; used by web tools. |
| `TELEGRAM_BOT_TOKEN` | Required by current config; used by Telegram mode. |
| `TELEGRAM_OWNER_ID` | Required owner chat ID for Telegram authorization. |
| `SKILLS_DIRS` | Optional semicolon-separated skill roots. |

## Verification steps

Run these commands after installation:

```bash
bun install
bun run typecheck
bun run build
bun run dev wakeup
```

Manual verification checklist:

- The wakeup banner renders.
- CLI mode opens Agent, Plan, and Ask choices.
- Ask Mode can answer a simple repository question.
- Plan Mode can generate selectable steps.
- Agent Mode stages changes and asks for approval before applying them.
- Telegram mode sends the welcome message to `TELEGRAM_OWNER_ID`.
