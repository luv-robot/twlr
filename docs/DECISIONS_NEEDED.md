# Decisions Needed

This document tracks product and implementation decisions that should wait for author confirmation.

## Resolved Decisions

1. First remote LLM provider

   Decision: implement OpenAI first, while keeping the provider interface generic enough for Anthropic, Gemini, and custom providers.

2. API key storage

   Decision: use environment variables first. P0 expects `OPENAI_API_KEY`.

3. Project opening interaction

   Decision: keep the current path input during development. Move to a Tauri folder picker for trial operations.

4. Writers' Room meeting UI

   Decision: do not change the current Writers' Room UI yet. Next design pass should explore multiple meeting-room variants.

5. Default product language

   Decision: design for multiple languages instead of hard-coding English or Chinese as the product assumption.

6. GitHub branch handling

   Decision: merge `codex/p0-vertical-slice` into `main`.

7. Snapshot / impact visibility

   Decision: ordinary user UI should minimize snapshot and impact detail. Keep Git and deep impact diagnostics out of the normal writing surface.

8. Figma next pass

   Decision: prioritize the Writers' Room page, with several style options.

## Open Decisions

1. Proposal persistence semantics

   Decide whether pending proposal cards should be written to `proposals/state_proposals.jsonl` immediately or only after accept / reject.

2. P0 official agent scope

   Analyze the cost of including Theme Analyst in P0 before making the final call.

3. Snapshot / impact information architecture

   Define the exact boundary between normal writing UI, lightweight impact prompts, and developer/debug mode.

4. Figma Writers' Room variants

   Produce multiple Writers' Room page options before selecting the implementation direction.

## Current Assumptions

- OpenAI is the first concrete remote provider.
- Provider code must remain multi-provider by design.
- API keys use environment variables first.
- Git remains hidden behind writer-facing snapshot language.
- Studio Coordinator remains operational and low-emotion-density.
- Writers' Room can generate proposal cards only through explicit author action.
