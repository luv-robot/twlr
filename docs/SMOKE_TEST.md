# TWLR Smoke Test

This checklist verifies the current P0 vertical slice without requiring a production API key.

Use it before larger UI, state, or provider changes.

## Automated Checks

Run from the repository root:

```bash
npm run typecheck
npm run build
```

Run Tauri checks from the desktop Rust crate:

```bash
cd apps/desktop/src-tauri
cargo check
cargo test
```

Expected result:

- TypeScript typecheck passes.
- Workspace build passes for desktop and shared packages.
- Rust crate check passes with the `/opt/homebrew` toolchain.
- Rust command smoke tests pass.

## Provider Smoke Check

DeepSeek development mode:

```bash
export TWLR_LLM_PROVIDER=deepseek
export DEEPSEEK_API_KEY="..."
npm run tauri -w @twlr/desktop
```

OpenAI development mode:

```bash
export OPENAI_API_KEY="..."
npm run tauri -w @twlr/desktop
```

Expected result:

- Provider status reports ready when the matching key is present.
- Missing, invalid, quota-limited, or schema-rejected provider calls fall back to mock output.
- The fallback message is visible in the Coordinator panel without blocking local writing.

## Manual P0 Flow

1. Open the Tauri app.
2. Create a local project at a temporary path such as `/private/tmp/twlr-smoke`.
3. Confirm the project opens with one markdown chapter.
4. Type in the manuscript editor and wait for autosave.
5. Run each production skill:
   - Character Sheet
   - Outline Builder
   - Timeline Compiler
   - Foreshadow Tracker
6. Confirm each skill creates or updates a proposal card.
7. Edit one proposal card summary and evidence.
8. Accept the edited proposal.
9. Confirm Projected State updates after acceptance.
10. Reject another proposal.
11. Open Writers' Room.
12. Create proposal cards from the meeting.
13. Save Snapshot.
14. Close and reopen the same local project path.

Expected result:

- Autosave writes to local chapter files.
- Running skill buttons disable while a skill is in progress.
- AI never mutates state before author acceptance.
- Accepted proposals append narrative events.
- Character, open-loop, and timeline projected state can be rebuilt from accepted events.
- Pending proposal cards survive project reopen.
- Reviewed proposal cards do not return as pending cards.
- Writers' Room meeting records persist locally.
- Save Snapshot is enabled when project files changed.
- Git terminology stays hidden in normal UI.

## Rewrite Impact Lite Check

1. Edit a chapter after saving a snapshot.
2. Run Check affected chapters.

Expected result:

- The UI reports changed chapters and changed state areas in writer-facing language.
- The UI suggests affected areas such as Manuscript, Characters, Timeline, Review cards, or Writers' Room when those areas changed.
- Raw Git details are not shown in the normal writing surface.
- The result suggests review work without implying that AI has changed the manuscript.

## Known Test Gaps

- Browser screenshot automation currently times out in this environment.
- No full E2E test suite exists yet.
- Remote provider checks require user-provided API keys and available credits.
- Multi-language UI coverage is partial.
