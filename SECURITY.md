# Security Policy

OPENCLAW Project is an AI-assisted developer tool with access to local files,
optional web tools, Telegram commands, and approval-gated shell execution. This
security policy describes the threat model, safe operating practices, and
responsible disclosure process.

## Supported versions

The project is early-stage and does not yet publish versioned releases. Security
fixes should target the main development branch unless maintainers define a
release policy.

## Threat model

Primary assets:

- Source code and repository metadata.
- Environment variables and API keys.
- Local skill files and documentation.
- Files in the workspace where the agent runs.
- Telegram bot token and authorized owner chat.
- Shell access available to the Bun process.

Primary trust boundaries:

- User prompt to AI model.
- AI model output to tool calls.
- Tool calls to local filesystem and shell.
- Telegram users to bot handlers.
- Web content fetched through Firecrawl or `fetch_url`.

Primary risks:

- Prompt injection from repository files or fetched web pages.
- Accidental or malicious file modification.
- Shell command execution with developer privileges.
- Exfiltration of secrets through prompts, logs, or Telegram messages.
- Unauthorized Telegram users triggering workflows.
- Path traversal outside the intended workspace.

## Approval system security

The approval model is the central control for mutations:

- File creation, modification, deletion, folder creation, and shell commands are
  logged as pending actions.
- Pending actions are grouped and shown to the user before application.
- File changes can be rendered as unified diffs.
- Rejected actions are not applied.
- The executor applies only actions whose tracker status is `approved`.

Security expectations for contributors:

- Do not add mutating tools that bypass `ActionTracker`.
- Do not call filesystem write/delete APIs directly from orchestrators.
- Do not run shell commands immediately from AI tool execution.
- Preserve approval checks in CLI and Telegram workflows.
- Include shell command text in approval summaries.
- Treat generated diffs as a review aid, not as a complete security guarantee.

## Secret management

- Never commit `.env` files, API keys, Telegram tokens, private keys, or service
  credentials.
- Prefer process-manager secrets or dedicated secret stores for production.
- Avoid sending secrets to the model in prompts or tool outputs.
- Keep excluded path policies up to date for credential-bearing files.
- Rotate `TELEGRAM_BOT_TOKEN`, `OPENROUTER_API_KEY`, and `FIRECRAWL_API_KEY` if
  they are exposed.
- Use least-privilege API keys where providers support it.

## Telegram security

Telegram mode is owner-only. Every command and callback should verify the chat
ID with `isOwner` before doing work.

Recommended practices:

- Keep `TELEGRAM_OWNER_ID` exact and private.
- Do not share the bot token.
- Stop the bot immediately if unauthorized activity is suspected.
- Be careful when sending diffs over Telegram because they may include sensitive
  source code.

## Shell execution security

Shell execution is powerful and risky. The current Agent Mode configuration
allows shell commands by default, but commands are queued for approval.

Recommendations:

- Review every queued command before approval.
- Prefer running the agent in a disposable branch or container.
- Avoid running as root.
- Disable shell execution in custom configurations for low-trust environments.
- Do not mount host credential directories into agent containers.

## Web content security

Web tools can introduce prompt-injection content. Treat crawled pages and fetched
URLs as untrusted input.

- Use web tools only when necessary.
- Ask the model to summarize evidence rather than blindly execute instructions
  from a web page.
- Do not let web content override system, developer, or user instructions.
- Keep Firecrawl credentials private.

## Responsible disclosure policy

If you discover a vulnerability:

1. Do not publicly disclose the issue until maintainers have reviewed it.
2. Contact the maintainers through the repository's preferred private security
   channel. If no private channel exists, open a minimal public issue requesting
   a security contact without including exploit details.
3. Include reproduction steps, affected files, expected impact, and suggested
   remediation if available.
4. Allow a reasonable remediation window before public disclosure.

Maintainers should acknowledge reports, assess severity, prepare a fix, and
publish remediation guidance once the issue is resolved.
