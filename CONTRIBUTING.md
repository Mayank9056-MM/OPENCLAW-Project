# Contributing to OPENCLAW Project

Thank you for your interest in contributing to OPENCLAW Project. This document
explains how to work on the repository, propose changes, and keep contributions
safe for an AI agent that can read code, stage mutations, and execute commands.

## Development workflow

1. Fork or clone the repository.
2. Install dependencies:

   ```bash
   bun install
   ```

3. Configure the required environment variables described in
   [INSTALLATION.md](INSTALLATION.md).
4. Run checks before editing:

   ```bash
   bun run typecheck
   bun run build
   ```

5. Make a focused change.
6. Re-run checks and manually test the relevant mode.
7. Open a pull request with a clear summary, testing notes, and screenshots for
   visible UI changes.

## Branch strategy

Use short, descriptive branch names:

- `feature/<short-description>` for new capabilities
- `fix/<short-description>` for bug fixes
- `docs/<short-description>` for documentation-only changes
- `refactor/<short-description>` for behavior-preserving refactors
- `security/<short-description>` for security improvements

Keep branches scoped to one logical change. Avoid mixing documentation,
refactors, and feature work unless they are required by the same change.

## Commit conventions

Use Conventional Commit-style messages:

```text
<type>(optional-scope): <summary>
```

Common types:

- `feat`: new user-facing behavior
- `fix`: bug fix
- `docs`: documentation changes
- `refactor`: structure changes without intended behavior changes
- `test`: tests or test infrastructure
- `chore`: maintenance tasks
- `security`: security hardening

Examples:

```text
feat(agent): add per-tool approval metadata
fix(telegram): clear approval session after rejection
docs: add architecture guide
```

## Pull request process

A strong pull request includes:

- A concise title that describes the change.
- A summary of what changed and why.
- Testing performed, including exact commands.
- Risk notes for approval, shell execution, or Telegram changes.
- Screenshots for TUI or Telegram UI changes when practical.
- Linked issues or design notes when relevant.

Before opening a PR, confirm that:

- The project installs with `bun install`.
- TypeScript checks pass with `bun run typecheck`.
- The project builds with `bun run build`.
- New or changed workflows are documented.
- Mutating tools still require approval before applying changes.

## Coding standards

- Write TypeScript with explicit types for exported functions and data shapes.
- Validate AI tool inputs with Zod schemas.
- Keep tool functions deterministic and side-effect aware.
- Do not bypass `ActionTracker` for reads, analysis, or mutations.
- Do not apply file or shell mutations without an approval workflow.
- Do not add `try`/`catch` blocks around imports.
- Prefer small modules with clear responsibilities.
- Keep paths workspace-relative unless a function explicitly requires absolute
  paths.
- Avoid reading secrets or excluded files unless a user explicitly configures a
  safe policy for that use case.

## Documentation standards

- Update `README.md` for user-facing behavior.
- Update `ARCHITECTURE.md` and `docs/architecture/` for system changes.
- Update `docs/guides/creating-tools.md` when adding tools.
- Update `SECURITY.md` for approval, command execution, authentication, or
  secret-handling changes.
- Use Mermaid diagrams for workflows where sequence or data flow matters.

## Review checklist

Reviewers should verify:

- [ ] The change is scoped and understandable.
- [ ] Tool schemas are typed and validated.
- [ ] Mutating operations are staged and reviewed.
- [ ] Path handling prevents traversal outside the workspace.
- [ ] Telegram handlers enforce owner authorization.
- [ ] Secrets are not logged, committed, or sent unnecessarily to models.
- [ ] Error messages are useful without leaking sensitive data.
- [ ] Documentation matches implementation.
- [ ] `bun run typecheck` and `bun run build` pass, or failures are explained.

## Security-sensitive changes

Changes to shell execution, approvals, Telegram authorization, environment
configuration, or path resolution require extra scrutiny. Include a threat-model
note in the PR and request review from a maintainer familiar with agent safety.
