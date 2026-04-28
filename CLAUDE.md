# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Copilot API — reverse-engineered proxy that exposes GitHub Copilot as OpenAI-compatible and Anthropic-compatible API server. Built with Bun + Hono + TypeScript.

## Commands

```bash
bun install              # Install dependencies
bun run dev              # Dev mode (watch)
bun run start            # Production mode
bun run build            # Build with tsdown → dist/
bun run lint             # ESLint (cached)
bun run lint:all         # ESLint all files
bun run typecheck        # tsc type checking
bun test                 # Run all tests (Bun test runner)
bun test tests/anthropic-request.test.ts  # Single test file
bun run knip             # Dead code detection
```

Pre-commit hook runs `lint-staged` (ESLint fix on staged files) via `simple-git-hooks`.

## Architecture

### Entry & CLI

`src/main.ts` — CLI entry using **citty**. Subcommands: `start`, `auth`, `check-usage`, `debug`.

`src/start.ts` — Orchestrates auth flow, token refresh, server startup via **srvx**.

### HTTP Server

`src/server.ts` — **Hono** app. Routes mounted with and without `/v1/` prefix for compatibility.

### Routes (`src/routes/`)

| Route | Purpose |
|-------|---------|
| `chat-completions/` | OpenAI `/v1/chat/completions` — proxies to Copilot |
| `messages/` | Anthropic `/v1/messages` — translates Anthropic format ↔ OpenAI format |
| `models/` | Lists available Copilot models |
| `embeddings/` | Proxies embedding requests |
| `usage/` | Copilot usage/quota stats |
| `token/` | Exposes current Copilot token |

### Anthropic Translation Layer (`src/routes/messages/`)

Key complexity lives here. Converts between Anthropic Messages API and OpenAI Chat Completions:
- `handler.ts` — Main request handler, converts Anthropic request → OpenAI, dispatches, converts response back
- `stream-translation.ts` — SSE stream translation (OpenAI chunks → Anthropic events)
- `non-stream-translation.ts` — Non-streaming response translation
- `anthropic-types.ts` — Anthropic API type definitions
- `count-tokens-handler.ts` — Token counting endpoint using `gpt-tokenizer`

### Services (`src/services/`)

- `copilot/` — Copilot API calls (chat completions, embeddings, models)
- `github/` — GitHub auth flow (device code, access token polling, Copilot token)
- `get-vscode-version.ts` — Fetches VS Code version for Copilot API headers

### Shared Lib (`src/lib/`)

- `state.ts` — Global mutable state (tokens, config, models). Singleton pattern.
- `token.ts` — Copilot token management and refresh
- `rate-limit.ts` — Request rate limiting
- `approval.ts` — Manual request approval via CLI prompt
- `proxy.ts` — HTTP proxy support from env vars
- `error.ts` — Custom error classes
- `api-config.ts` — Copilot API endpoint configuration by account type
- `paths.ts` — Data directory paths (token storage)

## Code Style

- **Imports**: Use `~/*` path alias for `src/*` (configured in tsconfig)
- **Modules**: ESM only (`verbatimModuleSyntax`). Use `import type` for type-only imports.
- **Strict TS**: `noUnusedLocals`, `noUnusedParameters`, `noFallthroughCasesInSwitch` all enabled
- **Lint config**: `@echristian/eslint-config` — includes Prettier, stylistic rules, unused import checks
- **Tests**: Place in `tests/`, name as `*.test.ts`, use Bun's built-in test runner
