# Internal Components API

This document summarizes important internal modules and their public functions
or classes. It is intended for contributors extending the project.

## `ai/ai.config.ts`

### `getAgentModel()`

Creates an OpenRouter provider with `OPENROUTER_API_KEY` and returns the model
identified by `OPENROUTER_DEFAULT_MODEL`.

## `config/conf.ts`

### `config`

Zod-validated runtime configuration parsed from `process.env`.

### `Config`

Inferred TypeScript type for the runtime configuration.

## `modes/agent/action-tracker.ts`

### `ActionTracker`

Tracks tool activity.

Methods:

- `log(entry)`: appends an action and assigns an ID/timestamp when omitted.
- `getActions()`: returns all actions.
- `getPendingMutations()`: returns pending mutating actions.
- `updateStatus(id, status, userApproved?)`: updates action status.

## `modes/agent/tool-executor.ts`

### `ToolExecutor`

Executes read operations, stages mutations, discovers skills, and applies
approved actions.

Important methods:

- `readFile(rel)`
- `createFile(rel, content)`
- `modifyFile(rel, content)`
- `deleteFile(rel)`
- `createFolder(rel)`
- `listFiles(rel, recursive)`
- `searchFiles(rootRel, globPattern, contentQuery?)`
- `analyzeCodebase(rootRel)`
- `queueShell(command)`
- `listSkills()`
- `readSkill(skillPath)`
- `applyApprovedFromTracker()`
- `clearStaging()`

## `modes/agent/agent-tools.ts`

### `createAgentTool(executor)`

Returns AI SDK tool definitions backed by a `ToolExecutor`.

## `modes/agent/approval.ts`

### `runApprovalFlow(tracker)`

Runs interactive CLI approval for pending mutations and returns whether any
actions were approved.

## `modes/agent/diff-view.ts`

### `formatPatch(filePath, before, after)`

Creates a unified patch for display.

### `composeBeforeAfter(sortedActions)`

Composes before/after text for a sorted list of actions affecting one file.

## `modes/plan/planner.ts`

### `generatePlan(goal)`

Uses read-only tools, optional web tools, and schema-constrained generation to
return a `Plan`.

## `modes/plan/web-tools.ts`

### `createWebTools(tracker)`

Returns AI SDK tools:

- `web_search`
- `web_crawl`
- `fetch_url`

## `telegram/agent-run.ts`

### `runAsk(ctx, question)`

Runs read-only Ask workflow and replies in Telegram.

### `runAgent(ctx, chatId, goal)`

Runs Agent workflow and opens an approval session if mutations are pending.

### `runPlanSteps(ctx, chatId, plan, steps)`

Executes selected plan steps and opens an approval session if needed.

## `telegram/approval-session.ts`

### `finishOrApprove(ctx, chatId, tracker, executor, noChangesMsg)`

Sends a no-change message or creates an inline Telegram approval session.

### `approvalSummary(pending)`

Builds a human-readable summary of pending changes.

### `approvalDiff(pending)`

Builds clipped diffs for pending file changes and summaries for shell commands.

## `telegram/plan-session.ts`

### `planMessage(session)`

Formats a plan and current selection state as Telegram Markdown.

### `planKeyboard(session)`

Builds an inline keyboard for plan selection.

### `refreshPlanUi(ctx, session)`

Updates the Telegram plan message after selection changes.
