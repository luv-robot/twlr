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

9. Proposal persistence semantics

   Decision: persist pending proposal cards to `proposals/state_proposals.jsonl` so a reopened local project can recover the author's review queue. Persist reviewed proposals again after accept / reject.

10. Theme Analyst P0 scope

   Decision: do not include Theme Analyst as a default P0 participant. Keep it available for later advanced/debug usage after the core state loop is stable.

## Open Decisions

1. Snapshot / impact information architecture

   Define the exact boundary between normal writing UI, lightweight impact prompts, and developer/debug mode.

2. Figma Writers' Room variants

   Produce multiple Writers' Room page options before selecting the implementation direction.

3. Short-drama ASR path

   Decide whether P0 transcription should use a local tool such as MacWhisper, a remote API, or external manual subtitle import only.

4. Short-drama case storage boundary

   Decide whether local analysis cases should remain outside Git by default, and whether a redacted/exported case package format is needed.

5. Visual-only report status

   Decide whether visual-only observation reports should be shown to users as a formal feature or kept as an internal diagnostic stage before transcript-backed reports.

## Current Assumptions

- OpenAI is the first concrete remote provider.
- Provider code must remain multi-provider by design.
- API keys use environment variables first.
- Git remains hidden behind writer-facing snapshot language.
- Studio Coordinator remains operational and low-emotion-density.
- Writers' Room can generate proposal cards only through explicit author action.
- Short-drama video/audio/case folders are local analysis artifacts and should not be committed to Git by default.
- Visual-only observations are provisional and must not be treated as final director-side diagnosis.
