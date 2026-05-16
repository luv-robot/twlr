# Short Drama Testing Playbook

This playbook is for terminal-first testing of the short-drama reverse breakdown workflow.

## Automation Rule For This Phase

The current test phase prioritizes workflow automation over manual precision cleanup.

Quality gates should check:

- required files and schema shape
- prompt / report template completeness
- broken evidence references
- impossible timecodes
- obvious process leakage or severe hallucination risk

Do not spend time manually correcting character names, scene boundaries, or ASR wording unless the pipeline is blocked.

## Fast Path: Advance A Case

After a model output file is saved into the case folder, run:

```bash
npm run short-drama:run-case-review -- --case "$CASE"
```

This command does not call an LLM. It automatically:

- applies saved model outputs when their expected filenames exist
- rebuilds prompts for the next stage
- validates the case
- lints the diagnosis report
- audits structure and severe-hallucination risks
- updates `short-drama-cases/index.json`

Expected model-output filenames:

```text
visual_context_from_model.json
visual_context_from_chatgpt.json
visual_context_form_chatgpt.json
visual_only_report_from_model.md
groq_playground_transcript.txt
transcript_segmented_from_model.json
reconstructed_script_from_model.json
director_diagnosis_from_model.md
```

Run a preview without changing files:

```bash
npm run short-drama:run-case-review -- --case "$CASE" --dry-run
```

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

## 6. Optional: Generate Human Correction Sheet

```bash
npm run short-drama:build-correction-sheet -- --case "$CASE"
open "$CASE/human_correction_sheet.md"
```

For the current automation-first phase, this sheet is optional and should not block report generation.

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

## 8. Optional: Transcribe Audio Segments With Groq

Use Groq when embedded subtitles are missing and ASR is the fastest path.

Create a local ignored key file:

```bash
cp .env.example .env.local
```

Then replace `gsk_your_key_here` in `.env.local` with the real Groq key.

Preview the transcription plan:

```bash
npm run short-drama:transcribe-groq -- --case "$CASE" --dry-run
```

Check API key and model visibility before uploading audio:

```bash
npm run short-drama:check-groq
```

Transcribe all visual scene audio segments:

```bash
npm run short-drama:transcribe-groq -- --case "$CASE"
```

Or transcribe only the current priority conflict scenes:

```bash
npm run short-drama:transcribe-groq -- --case "$CASE" --only vscene_002,vscene_004
```

The command writes:

- `$CASE/asr/groq/*.groq.json`
- `$CASE/asr/groq/*.txt`
- `$CASE/transcript_raw.json`
- `$CASE/transcript_clean.md`

If `short-drama:check-groq` returns `403 Forbidden`, the request has reached Groq but is being rejected before transcription. Check:

- the key was created under the same Groq project currently selected in the console
- the project has access to `whisper-large-v3-turbo`
- the terminal is using the same network / proxy route that can access Groq
- a newly generated API key works better than the previous key

## 9. Validate And Index

```bash
npm run short-drama:validate-case -- --case "$CASE"
npm run short-drama:index-cases -- --root ./short-drama-cases
```

## 10. When Transcript Is Available

Import subtitle or rough transcript:

```bash
npm run short-drama:import-transcript -- --case "$CASE" --input "xianzun.srt"
```

If the transcript is a full unsegmented ASR text block from Groq Playground, import it first:

```bash
npm run short-drama:import-transcript -- --case "$CASE" --input "$CASE/groq_playground_transcript.txt" --source asr
```

Then ask a model to clean and roughly segment it:

```bash
npm run short-drama:build-prompt -- --case "$CASE" --kind transcript-cleanup
open "$CASE/prompts/transcript-cleanup_prompt.md"
```

Save the model JSON as:

```text
$CASE/transcript_segmented_from_model.json
```

Apply it:

```bash
npm run short-drama:apply-output -- --case "$CASE" --kind transcript-raw --input "$CASE/transcript_segmented_from_model.json" --force
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
npm run short-drama:audit-case -- --case "$CASE"
```

## Things To Confirm Later

- Whether local cases should remain ignored by Git permanently.
- Whether visual-only observation should be exposed to users or kept internal.
- Which ASR path to use first: MacWhisper, external manual tool, OpenAI-compatible API, or another provider.
- Whether the first formal test should use full episode audio or only 2-3 priority segments.
- Whether the report language should default to Chinese for Chinese short dramas.
