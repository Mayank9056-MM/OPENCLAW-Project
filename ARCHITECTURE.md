# Architecture

OPENCLAW Project is organized around mode-specific AI orchestration, shared tool
execution, and approval-gated mutation application. The design separates user
interfaces from agent behavior so the same core workflows can run in the local
CLI or through Telegram.

## High-level architecture

```mermaid
flowchart TB
  subgraph UI[User Interfaces]
    CLI[index.ts + tui/wakeup.ts + modes/cli.ts]
    TG[telegram/index.ts + handlers.ts]
  end

  subgraph Modes[Mode Orchestrators]
    Agent[modes/agent/orchestrator.ts]
    Plan[modes/plan/orchestator.ts + planner.ts]
    Ask[modes/ask/orchestrator.ts]
  end

  subgraph AI[AI Layer]
    Model[ai/ai.config.ts]
    SDK[AI SDK ToolLoopAgent / generateText]
  end

  subgraph Tools[Tool Layer]
    Workspace[agent-tools.ts / read-only tools]
    Web[plan/web-tools.ts]
    Skills[list_skills / read_skill]
  end

  subgraph Execution[Execution Layer]
    Tracker[ActionTracker]
    Executor[ToolExecutor]
    Approval[CLI Approval / Telegram ApprovalSession]
  end

  CLI --> Agent
  CLI --> Plan
  CLI --> Ask
  TG --> Agent
  TG --> Plan
  TG --> Ask
  Agent --> SDK
  Plan --> SDK
  Ask --> SDK
  SDK --> Model
  SDK --> Workspace
  SDK --> Web
  SDK --> Skills
  Workspace --> Executor
  Web --> Tracker
  Skills --> Executor
  Executor --> Tracker
  Tracker --> Approval
  Approval --> Executor
```

## Component responsibilities

### Entrypoints and routing

- `index.ts` defines the executable command `Mr.Jack` and registers the
  `wakeup` command.
- `tui/wakeup.ts` renders the banner, asks whether to run CLI or Telegram mode,
  and dispatches to the selected interface.
- `modes/cli.ts` loops over CLI sub-modes: Agent, Plan, and Ask.
- `telegram/index.ts` creates the Telegraf bot, registers handlers, sends the
  owner welcome message, and handles shutdown signals.

### Configuration and AI model

- `config/conf.ts` validates environment configuration with Zod.
- `ai/ai.config.ts` creates an OpenRouter provider and returns the configured
  model.
- `ai/index.ts` re-exports the model factory.

### Agent Mode

- `modes/agent/orchestrator.ts` prompts for a goal, creates the tracker,
  executor, tools, and `ToolLoopAgent`, then runs approval and application.
- `modes/agent/agent-tools.ts` exposes read, file mutation, folder creation,
  shell queueing, search, analysis, and skill tools.
- `modes/agent/tool-executor.ts` implements all workspace operations,
  in-memory staging, path safety checks, excluded path policy, and application
  of approved changes.
- `modes/agent/action-tracker.ts` stores audit entries for tool activity.
- `modes/agent/approval.ts` handles interactive CLI approval.
- `modes/agent/diff-view.ts` builds unified diffs for staged file changes.
- `modes/agent/types.ts` defines action and configuration types.

### Plan Mode

- `modes/plan/planner.ts` uses read-only tools and optional web tools to produce
  structured JSON matching the plan schema.
- `modes/plan/selection.ts` prints generated plans and lets users choose steps.
- `modes/plan/orchestator.ts` executes selected steps through agent tools and
  routes staged changes through approval.
- `modes/plan/web-tools.ts` provides Firecrawl search/crawl and generic fetch
  tools.
- `modes/plan/types.ts` defines `Plan` and `PlanStep`.

### Ask Mode

- `modes/ask/orchestrator.ts` creates a read-oriented agent for codebase
  questions, renders the answer, and optionally stages a Markdown answer file
  for approval.

### Telegram integration

- `telegram/handlers.ts` registers commands and callback actions.
- `telegram/auth.ts` allows only the configured owner ID.
- `telegram/agent-run.ts` adapts ask, agent, and plan execution to Telegram
  replies.
- `telegram/plan-session.ts` stores plan selections and renders inline
  keyboards.
- `telegram/approval-session.ts` stores pending approvals and renders accept,
  reject, and diff actions.
- `telegram/text.ts` clips long responses and formats Markdown replies.
- `telegram/constant.ts` contains the welcome text.

## Agent execution lifecycle

```mermaid
sequenceDiagram
  actor User
  participant CLI as CLI/TUI
  participant Agent as Agent Orchestrator
  participant SDK as AI SDK ToolLoopAgent
  participant Tools as Agent Tools
  participant Exec as ToolExecutor
  participant Tracker as ActionTracker
  participant Approval as Approval Flow
  participant FS as Workspace/Shell

  User->>CLI: choose Agent Mode
  CLI->>Agent: provide goal
  Agent->>Exec: create executor
  Agent->>Tracker: create tracker
  Agent->>SDK: generate(prompt, tools)
  SDK->>Tools: call read/search/mutation tools
  Tools->>Exec: execute tool operation
  Exec->>Tracker: log executed or pending action
  SDK-->>Agent: final response
  Agent->>Approval: review pending mutations
  Approval->>Tracker: mark approved/rejected
  Agent->>Exec: applyApprovedFromTracker()
  Exec->>FS: write files, delete files, mkdir, run shell
  Exec-->>Agent: errors[]
```

## Planning flow

```mermaid
sequenceDiagram
  actor User
  participant Planner as generatePlan
  participant Model as Wrapped Model
  participant ROTools as Read-only/Web Tools
  participant Selector as Step Selector
  participant Runner as Plan Runner
  participant Approval as Approval Flow

  User->>Planner: goal
  Planner->>Model: JSON-schema constrained prompt
  Model->>ROTools: inspect codebase / optional web research
  ROTools-->>Model: observations
  Model-->>Planner: structured plan JSON
  Planner-->>Selector: Plan
  User->>Selector: choose steps
  Selector-->>Runner: selected steps
  Runner->>Runner: execute each selected step with agent tools
  Runner->>Approval: review staged mutations
```

## Approval workflow

Approvals are intentionally centralized around `ActionTracker` status updates.
Mutating tool calls create `pending` actions. Approval code changes those actions
to `approved` or `rejected`. The executor only applies approved mutations.

```mermaid
flowchart LR
  Pending[Pending ActionLog entries] --> Group[Group by file or shell]
  Group --> Diff[Render diff when available]
  Diff --> Decision{User decision}
  Decision -->|Accept| Approved[status=approved]
  Decision -->|Reject| Rejected[status=rejected]
  Approved --> Apply[applyApprovedFromTracker]
  Rejected --> Clear[clearStaging]
  Apply --> Clear
```

## Tool execution workflow

```mermaid
flowchart TD
  ToolCall[AI tool call] --> Validate[Zod input validation]
  Validate --> Policy[Tool enabled? Path excluded? Path safe?]
  Policy -->|Read/analysis| Read[Read/search/analyze]
  Read --> LogExecuted[Log code_analysis executed]
  Policy -->|Mutation| Stage[Update overlay/deleted set]
  Stage --> LogPending[Log pending mutation]
  Policy -->|Shell| Queue[Log pending shell command]
  LogPending --> Approval[Approval required]
  Queue --> Approval
  Approval --> Apply[Apply approved actions]
```

## Telegram integration flow

```mermaid
sequenceDiagram
  actor Owner
  participant Bot as Telegraf Bot
  participant Auth as isOwner
  participant Handler as Command Handler
  participant Runner as Telegram Runner
  participant Session as Plan/Approval Session
  participant Exec as ToolExecutor

  Owner->>Bot: /agent, /ask, or /plan
  Bot->>Auth: verify chat id
  Auth-->>Bot: authorized
  Bot->>Handler: route command
  Handler->>Runner: execute workflow
  Runner->>Exec: run tools and stage mutations
  Runner->>Session: store pending state if approval needed
  Bot-->>Owner: inline keyboard
  Owner->>Bot: callback action
  Bot->>Session: load state
  Session->>Exec: apply or clear staging
```

## Design decisions

### Approval-gated mutations

The project stages file and shell mutations rather than applying them directly.
This makes agent behavior inspectable and gives users a clear decision point
before destructive operations.

### Shared executor and tracker

`ToolExecutor` owns filesystem behavior while `ActionTracker` owns audit state.
This split keeps tools thin and allows CLI and Telegram approval workflows to
share the same execution semantics.

### Workspace-relative paths

Tool APIs accept relative paths. The executor resolves them against the current
workspace and rejects paths that escape the root. This reduces accidental writes
outside the intended project.

### Mode-specific tool capability

Agent Mode exposes mutating tools. Ask and planner flows use read-oriented tools
unless a user explicitly chooses to save an answer. This reduces risk in
question-answering and planning contexts.

### Structured planning output

Plan generation uses an output schema and JSON extraction middleware. This gives
Plan Mode stable `PlanStep` objects that can be selected in CLI and Telegram UI.

### Owner-only Telegram access

Telegram handlers check `TELEGRAM_OWNER_ID` before executing commands or
callbacks. This is a simple access-control model suitable for personal agent
usage.

## Known implementation considerations

- The plan orchestrator file is named `orchestator.ts` in the current codebase.
- Environment parsing currently requires all configured integration secrets at
  startup, even if a mode does not use every integration.
- Shell execution is supported by default in Agent Mode; production deployments
  should carefully review this policy.
