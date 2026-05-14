# Development Notes

This document records the current local development entry points, verified checks, and known environment rules.

## Environment Rules

- Prefer `/opt/homebrew/bin` for Homebrew-managed tools on this machine.
- Do not upgrade Node casually. The Codex environment currently depends on the newer Node chain.
- Do not use the old `/usr/local` Homebrew Rust toolchain for this project.
- Use SSH for GitHub operations.
- The first real remote LLM provider is OpenAI.
- Development API key source is `OPENAI_API_KEY`.
- DeepSeek can be used during development by setting `TWLR_LLM_PROVIDER=deepseek` and `DEEPSEEK_API_KEY`.
- Optional DeepSeek model override: `DEEPSEEK_MODEL`. The default is `deepseek-v4-flash`.
- Remote provider failures are classified in `@twlr/ai` before being shown in the desktop UI.

## Frontend

Install dependencies:

```bash
npm install
```

Run type checks:

```bash
npm run typecheck
```

Build the desktop frontend:

```bash
npm run build -w @twlr/desktop
```

Run the Vite dev server:

```bash
npm run dev -w @twlr/desktop -- --host 127.0.0.1
```

Run the Tauri app with DeepSeek as the development provider:

```bash
export TWLR_LLM_PROVIDER=deepseek
export DEEPSEEK_API_KEY="..."
npm run tauri -w @twlr/desktop
```

OpenAI remains the default provider when `TWLR_LLM_PROVIDER` is not set.

Current verified frontend status:

- `npm run typecheck` passes.
- `npm run build -w @twlr/desktop` passes.
- Vite serves `http://127.0.0.1:1420/` successfully.

## Tauri / Rust

The `/opt/homebrew` toolchain has been installed and should be preferred:

```text
rustc 1.95.0
cargo 1.95.0
```

The previous `/usr/local` Homebrew toolchain had:

```text
rustc 1.74.0
cargo 1.74.0
```

That older toolchain is too old for the current Tauri dependency resolution. It blocked before compiling TWLR code because transitive crates now use Rust 2024 edition metadata. During verification, the blocker appeared at:

- `idna_adapter v1.2.2`
- `serde_spanned v1.1.1`
- `time-core v0.1.8`

Use the `/opt/homebrew` toolchain for Tauri checks:

```bash
cargo check
```

Current verified Tauri status:

- `cargo check` passes.
- `cargo test` passes.

Do not use the old `/usr/local` Homebrew Rust toolchain for this project.

## Current Implementation Checkpoint

The current P0 vertical slice includes:

- local project create / open
- generated TWLR folder structure
- Markdown chapter list and editor
- chapter create and autosave
- accepted proposal event logging
- pending proposal card persistence and reopen recovery
- local project reopen reads narrative event log
- projected character state
- projected open-loop state
- projected timeline state
- accepted proposals update projected character, open-loop, and timeline state files
- local project reopen reads projected state files
- context projection packet for skills and Writers' Room
- Writers' Room meeting JSONL persistence
- Writers' Room to proposal-card handoff
- official agent registry
- production skill registry
- Timeline Compiler mock proposal
- Foreshadow Tracker mock proposal
- OpenAI Character Sheet proposal path with mock fallback
- DeepSeek Character Sheet proposal path with mock fallback
- remote provider interface with mock provider
- remote state-proposal skill adapter for building structured LLM requests outside the desktop UI layer
- provider failure summaries for missing keys, invalid keys, insufficient quota, unavailable models, schema rejection, and network errors
- Save Snapshot command
- revision check lite
- minimal i18n key usage in high-frequency UI

## Browser Smoke Check

The Vite server returned HTTP 200 on `http://127.0.0.1:1420/`.

The in-app browser automation connection timed out during this pass, so no screenshot was captured. This was a browser automation issue, not a frontend build failure.

## Current OpenAI Test Status

The OpenAI Character Sheet path is wired through the Tauri desktop process and returns mock output only when the remote provider fails.

The latest live test reached OpenAI and failed with:

```text
429 insufficient_quota
```

This indicates the API key was accepted far enough to receive a provider quota response, but the account/key has no usable quota or billing credits. Retest with a key that has available API credits.
