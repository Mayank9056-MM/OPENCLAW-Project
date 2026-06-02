# Getting Started

This guide walks through the fastest path to run OPENCLAW locally.

## 1. Install Bun

```bash
curl -fsSL https://bun.sh/install | bash
bun --version
```

## 2. Install dependencies

```bash
bun install
```

## 3. Configure environment variables

```bash
export OPENROUTER_API_KEY="your-openrouter-key"
export OPENROUTER_DEFAULT_MODEL="openai/gpt-4o-mini"
export FIRECRAWL_API_KEY="your-firecrawl-key"
export TELEGRAM_BOT_TOKEN="your-telegram-bot-token"
export TELEGRAM_OWNER_ID="123456789"
```

For CLI-only experiments, the current configuration still expects Firecrawl and
Telegram variables. Use real values for full functionality.

## 4. Run checks

```bash
bun run typecheck
bun run build
```

## 5. Start Mr.Jack

```bash
bun run dev wakeup
```

Choose **CLI** and then one of:

- **Ask Mode** for repository questions.
- **Plan Mode** for step-by-step implementation planning.
- **Agent Mode** for approval-gated code changes.

## 6. Try Ask Mode

Example question:

```text
What are the main modules in this project and how do they interact?
```

## 7. Try Plan Mode

Example goal:

```text
Add tests for the ToolExecutor path safety behavior.
```

Review the generated plan, select the steps you want, and approve any staged
changes before they are applied.

## 8. Try Agent Mode

Example task:

```text
Create a short docs note explaining how approval sessions work.
```

Before accepting, inspect the diff and reject anything unexpected.
