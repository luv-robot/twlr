# Short Drama Testing Playbook

This playbook is for terminal-first testing of the short-drama reverse breakdown workflow.

## 1. Create A Case

```bash
CASE="./short-drama-cases/xianzun/episode_001"

npm run short-drama:create-case -- --title "仙尊" --episode 1 --series-slug xianzun --video "xianzun.mp4" --force
```

## 2. Extract Visual Frames

```bash
npm run short-drama:extract-keyframes -- --case "$CASE" --video "xianzun.mp4" --interval 10 --force
```

## 3. Build Visual Prompt

```bash
npm run short-drama:build-prompt -- --case "$CASE" --kind visual
```

Open:

```bash
open "$CASE/prompts/visual_prompt.md"
open "$CASE/keyframes"
```

Send the prompt and keyframes to a multimodal model. Save its JSON response as:

```text
$CASE/visual_context_from_model.json
```

Apply it:

```bash
npm run short-drama:apply-output -- --case "$CASE" --kind visual-context --input "$CASE/visual_context_from_model.json" --force
```

## 4. Build Visual Scene Map

```bash
npm run short-drama:build-scene-map -- --case "$CASE"
```

## 5. Build Visual-Only Observation Prompt

```bash
npm run short-drama:build-prompt -- --case "$CASE" --kind visual-only-diagnosis
```

Open:

```bash
open "$CASE/prompts/visual-only-diagnosis_prompt.md"
```

Send this prompt to a text model. Save the Markdown response as:

```text
$CASE/visual_only_report_from_model.md
```

Apply it:

```bash
npm run short-drama:apply-output -- --case "$CASE" --kind visual-only-report --input "$CASE/visual_only_report_from_model.md" --force
```

Lint it:

```bash
npm run short-drama:lint-report -- --case "$CASE" --kind visual-only
```

## 6. Generate Human Correction Sheet

```bash
npm run short-drama:build-correction-sheet -- --case "$CASE"
open "$CASE/human_correction_sheet.md"
```

## 7. Optional: Extract Priority Audio Segments

If full SRT is blocked, cut audio by the visual scene map and transcribe the highest-value segments first:

```bash
npm run short-drama:extract-audio-segments -- --case "$CASE" --force
open "$CASE/audio_segments"
```

For the current visual-only workflow, the priority segments are usually:

- the main confrontation segment
- the hidden-command or antagonist segment
- the final hierarchy / cliffhanger segment

## 8. Validate And Index

```bash
npm run short-drama:validate-case -- --case "$CASE"
npm run short-drama:index-cases -- --root ./short-drama-cases
```

## 9. When Transcript Is Available

Import subtitle or rough transcript:

```bash
npm run short-drama:import-transcript -- --case "$CASE" --input "xianzun.srt"
```

Build reconstruction prompt:

```bash
npm run short-drama:build-prompt -- --case "$CASE" --kind reconstruction
```

Apply inspected JSON:

```bash
npm run short-drama:apply-output -- --case "$CASE" --kind reconstructed-script --input "$CASE/reconstructed_script_from_model.json" --force
```

Build formal diagnosis prompt:

```bash
npm run short-drama:build-prompt -- --case "$CASE" --kind diagnosis
```

Apply and lint:

```bash
npm run short-drama:apply-output -- --case "$CASE" --kind diagnosis-report --input "$CASE/director_diagnosis_from_model.md" --force
npm run short-drama:lint-report -- --case "$CASE" --kind diagnosis
```

## Things To Confirm Later

- Whether local cases should remain ignored by Git permanently.
- Whether visual-only observation should be exposed to users or kept internal.
- Which ASR path to use first: MacWhisper, external manual tool, OpenAI-compatible API, or another provider.
- Whether the first formal test should use full episode audio or only 2-3 priority segments.
- Whether the report language should default to Chinese for Chinese short dramas.
