# Short Drama Workflow Test Log

This log records local workflow tests without committing source videos, audio, extracted frames, or case folders.

## 2026-05-16: Visual-Only Pass, `xianzun` Episode 1

Local media:

- `xianzun.mp4`
- `xianzun.mp3`

These files are intentionally ignored by Git.

### Completed

- Created a case folder with `short-drama:create-case`.
- Confirmed the MP4 has no embedded subtitle stream.
- Extracted 84 keyframes with `short-drama:extract-keyframes`.
- Generated `visual_prompt.md`.
- Applied multimodal visual context returned from ChatGPT into `visual_context.json`.
- Built `visual_scene_map.json` with 4 provisional visual scene segments.
- Generated `visual-only-diagnosis_prompt.md`.
- Applied a visual-only observation report into `visual_only_observation_report.md`.
- Generated `human_correction_sheet.md`.
- Built `short-drama-cases/index.json`.
- Ran `short-drama:validate-case`.
- Ran `short-drama:lint-report -- --kind visual-only`.

### Current Case Status

- Transcript segments: 0
- Visual frames: 84
- Visual scene segments: 4
- Reconstructed scenes: 0
- Reconstructed characters: 0
- Visual-only report: present
- Formal diagnosis report: not generated

### Current Missing Steps

- Import transcript or ASR output.
- Reconstruct script after dialogue is available.
- Perform human correction on character names and scene boundaries.
- Generate formal director-side diagnosis report.

### Observed Value

The visual-only path can continue product testing while subtitles are blocked. It is useful for:

- visual arena segmentation
- visible conflict escalation
- power-relation hints
- identifying which time ranges need dialogue first

It is not sufficient for:

- character motivation
- exact conflict stakes
- misunderstanding logic
- dialogue function
- final episode diagnosis

