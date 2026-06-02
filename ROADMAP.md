# Roadmap

This roadmap communicates likely project direction. It is not a commitment to
specific release dates.

## Near term

- Make Firecrawl and Telegram configuration optional for CLI-only usage.
- Add automated tests for `ToolExecutor`, `ActionTracker`, approval decisions,
  and Telegram session state.
- Improve Plan Mode multi-step execution reliability and reporting.
- Add per-action approval in Telegram, not only accept-all/reject-all.
- Add persistent audit logs for tool calls and approval decisions.
- Add a `LICENSE` file and release metadata for open-source publication.
- Add a project-owned Dockerfile and deployment guide.

## Mid term

- Add a configuration file for tool policy, excluded paths, model selection, and
  mode defaults.
- Add richer shell command policy controls, such as deny lists, allow lists, and
  dry-run metadata.
- Support resumable agent sessions and long-running task status updates.
- Add structured telemetry hooks that avoid collecting secrets.
- Expand skill support with validation, metadata, and clearer selection rules.
- Add file patch tools to avoid full-file rewrites where possible.
- Add integration tests for Telegram callbacks with mocked Telegraf contexts.

## Long term

- Support additional chat integrations beyond Telegram.
- Add multi-agent or delegated workflow support.
- Provide a web dashboard for approvals and audit history.
- Add policy profiles for personal, team, and enterprise deployments.
- Support repository-aware context indexing.
- Publish release artifacts and versioned documentation.

## Community priorities

Contributors are especially encouraged to help with:

- Test coverage for safety-critical execution paths.
- Documentation examples for new users.
- Security hardening around secrets, shell execution, and prompt injection.
- Developer experience improvements for local setup.
