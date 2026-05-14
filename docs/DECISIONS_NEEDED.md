# Decisions Needed

This document tracks product and implementation decisions that should wait for author confirmation.

## Open Decisions

1. First remote LLM provider

   Decide whether the first concrete provider should be OpenAI, Anthropic, Gemini, or a custom OpenAI-compatible endpoint.

2. API key storage

   Decide whether MVP API keys should use environment variables first, desktop keychain first, or both.

3. Project opening interaction

   Decide whether the first desktop build should keep the current path input or move immediately to the Tauri folder picker.

4. Writers' Room meeting UI

   Decide the next visual direction for Writers' Room: meeting minutes, Zoom-like professional meeting, or a hybrid with agenda / perspectives / decisions.

5. Default product language

   Decide whether MVP UI copy and templates should default to English, Chinese, or bilingual project templates.

6. Proposal persistence semantics

   Decide whether pending proposal cards should be written to `proposals/state_proposals.jsonl` immediately or only after accept / reject.

7. P0 official agent scope

   Decide whether P0 includes Theme Analyst or keeps only Development Editor, Reader Agent, Character Editor, and Continuity Editor.

8. Snapshot visibility

   Confirm how much snapshot status is shown in normal UI versus developer/debug mode.

9. Figma next pass

   Decide whether the next Figma pass should focus on the Manuscript Workspace, Writers' Room, or proposal card review flow.

## Current Assumptions

- No concrete remote provider is selected yet.
- The repository keeps a mock provider until the proposal and state pipeline is stable.
- Git remains hidden behind writer-facing snapshot language.
- Studio Coordinator remains operational and low-emotion-density.
- Writers' Room can generate proposal cards only through explicit author action.
