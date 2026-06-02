# Ask Mode

Ask Mode is optimized for codebase question answering. It uses a read-oriented
toolset, renders the answer in the terminal, and optionally stages a Markdown
file containing the answer.

## Core module

`modes/ask/orchestrator.ts` owns the Ask Mode CLI workflow.

## Tool set

Ask Mode exposes:

- `read_file`
- `list_files`
- `search_files`
- `analyze_codebase`
- `list_skills`
- `read_skill`
- Web tools from `createWebTools()`

The Ask Mode configuration disables file modification, folder creation, and
shell execution. Saving an answer is handled explicitly by the orchestrator and
routed through the approval flow.

## Flow

```mermaid
sequenceDiagram
  actor User
  participant Ask as Ask Orchestrator
  participant Agent as ToolLoopAgent
  participant Tools as Read/Web Tools
  participant Approval
  participant Executor

  User->>Ask: question
  Ask->>Agent: generate answer
  Agent->>Tools: inspect repository or web
  Tools-->>Agent: observations
  Agent-->>Ask: answer text
  Ask-->>User: rendered Markdown
  User->>Ask: optional save request
  Ask->>Executor: stage Markdown file
  Ask->>Approval: approve saved answer file
```

## Saved answer format

When a user saves an answer, Ask Mode writes a Markdown document with:

- `# Ask Mode`
- `## Question`
- `## Answer`

The file name must end in `.md` and cannot include path separators or `..`.
