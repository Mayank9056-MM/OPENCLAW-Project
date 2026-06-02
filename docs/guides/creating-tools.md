# Creating Tools

Tools are the bridge between AI model decisions and project capabilities. In
OPENCLAW, tools should be small, typed, auditable, and safe by default.

## Tool design principles

- Validate inputs with Zod.
- Prefer workspace-relative paths.
- Route filesystem behavior through `ToolExecutor`.
- Route audit behavior through `ActionTracker`.
- Stage mutations instead of applying them immediately.
- Keep read-only tools separate from mutating tools where possible.
- Document new tools in this guide and in architecture docs.

## Adding an Agent Mode tool

1. Add a method to `ToolExecutor` if the tool needs workspace behavior.
2. Log the action with `ActionTracker`.
3. If the tool mutates state, create a `pending` mutation action.
4. Add the AI SDK tool definition in `modes/agent/agent-tools.ts`.
5. Add tests for path safety, excluded paths, and approval behavior.
6. Update documentation.

Example pattern:

```ts
new_tool: tool({
  description: "Describe what the tool does and its safety model.",
  inputSchema: z.object({
    path: z.string().describe("Workspace-relative path."),
  }),
  execute: async ({ path }) => executor.someMethod(path),
})
```

## Read-only tools

Read-only tools should log `code_analysis` actions with `status: "executed"`.
They should not change files, folders, external services, or shell state.

Examples:

- `read_file`
- `list_files`
- `search_files`
- `analyze_codebase`
- `list_skills`
- `read_skill`

## Mutating tools

Mutating tools must log `pending` actions and rely on approval before applying.
Examples include:

- `create_file`
- `modify_file`
- `delete_file`
- `create_folder`
- `execute_shell`

## Web tools

Web tools live in `modes/plan/web-tools.ts`. They are useful for planning and
research but should be treated as untrusted-input tools because fetched pages can
contain prompt injections.

When adding web tools:

- Clip long results.
- Log the URL or query.
- Include HTTP status or provider metadata where useful.
- Avoid returning secrets or request headers.

## Approval integration checklist

- [ ] Does the tool mutate local or external state?
- [ ] If yes, does it create a pending `ActionLog`?
- [ ] Can the user understand the pending action from the approval summary?
- [ ] Is there a useful diff or preview?
- [ ] Does `applyApprovedFromTracker()` know how to apply the action?
- [ ] Are rejected actions safely ignored?
