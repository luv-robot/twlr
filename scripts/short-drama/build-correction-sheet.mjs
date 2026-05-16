#!/usr/bin/env node

import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";

const args = parseArgs(process.argv.slice(2));

if (args.help || !args.case) {
  printHelp();
  process.exit(args.help ? 0 : 1);
}

const caseDir = resolve(String(args.case));
const outPath = args.out ? resolve(String(args.out)) : join(caseDir, "human_correction_sheet.md");

if (!existsSync(caseDir)) {
  throw new Error(`Case folder does not exist: ${caseDir}`);
}

const metadata = readOptionalJson(join(caseDir, "source_metadata.json")) ?? {};
const transcript = readOptionalJson(join(caseDir, "transcript_raw.json"));
const sceneMap = readOptionalJson(join(caseDir, "visual_scene_map.json"));
const reconstructedScript = readOptionalJson(join(caseDir, "reconstructed_script.json"));
const speakerIds = unique((transcript?.segments ?? []).map((segment) => segment.speaker_id).filter(Boolean));
const visualScenes = sceneMap?.scenes ?? [];
const reconstructedScenes = reconstructedScript?.scenes ?? [];
const characters = reconstructedScript?.characters ?? [];

writeFileSync(outPath, buildSheet(), "utf8");
console.log(`Wrote human correction sheet: ${outPath}`);

function buildSheet() {
  return `# ${metadata.series_title ?? "Untitled"} Episode ${metadata.episode_number ?? "?"} Human Correction Sheet

This sheet is for fast human correction before the case becomes reusable expert material.

Do not polish language here. Correct names, boundaries, and wrong judgments.

## 1. Character / Speaker Map

| Provisional ID | Confirmed Character Name | Role Function | Notes |
|---|---|---|---|
${speakerRows()}

## 2. Visual Scene Boundary Check

| Scene | Current Time | Visual Summary | Keep / Split / Merge | Corrected Time | Notes |
|---|---|---|---|---|---|
${visualSceneRows()}

## 3. Reconstructed Scene Check

| Scene | Current Time | Dramatic Function | Conflict | Correct / Wrong / Needs Work | Notes |
|---|---|---|---|---|---|
${reconstructedSceneRows()}

## 4. Character Card Check

| Character | Episode Goal | Obstacle | Relationship Tension | Correction |
|---|---|---|---|---|
${characterRows()}

## 5. Key Judgment Check

Mark the judgments that should be allowed into the formal report.

| Judgment | Evidence | Keep / Revise / Reject | Notes |
|---|---|---|---|
|  |  |  |  |

## 6. Dialogue Gaps To Fill

| Time Range | Why This Segment Matters | Need Full Dialogue? | Notes |
|---|---|---|---|
${dialogueGapRows()}

## 7. Corrections To Apply Back To JSON

\`\`\`json
{
  "character_name_map": {},
  "scene_boundary_edits": [],
  "wrong_judgments": [],
  "confirmed_key_judgments": [],
  "notes": ""
}
\`\`\`
`;
}

function speakerRows() {
  if (speakerIds.length === 0) {
    return "| speaker_unknown |  |  | Transcript not imported yet. |";
  }

  return speakerIds.map((speakerId) => `| ${speakerId} |  |  |  |`).join("\n");
}

function visualSceneRows() {
  if (visualScenes.length === 0) {
    return "|  |  | No visual scene map yet. |  |  |  |";
  }

  return visualScenes
    .map((scene) => {
      const time = `${scene.start_time ?? "?"}-${scene.end_time ?? "?"}`;
      return `| ${scene.scene_id} | ${time} | ${escapeCell(scene.visual_summary ?? "")} |  |  |  |`;
    })
    .join("\n");
}

function reconstructedSceneRows() {
  if (reconstructedScenes.length === 0) {
    return "|  |  | No reconstructed scenes yet. |  |  |  |";
  }

  return reconstructedScenes
    .map((scene) => {
      const time = `${scene.start_time ?? "?"}-${scene.end_time ?? "?"}`;
      const conflict = scene.conflict
        ? [scene.conflict.who_wants_what, scene.conflict.who_blocks, scene.conflict.stakes].filter(Boolean).join(" / ")
        : "";
      return `| ${scene.scene_id} | ${time} | ${escapeCell(scene.dramatic_function ?? "")} | ${escapeCell(conflict)} |  |  |`;
    })
    .join("\n");
}

function characterRows() {
  if (characters.length === 0) {
    return "|  |  |  |  | No reconstructed characters yet. |";
  }

  return characters
    .map(
      (character) =>
        `| ${escapeCell(character.name ?? character.character_id)} | ${escapeCell(character.episode_goal ?? "")} | ${escapeCell(character.obstacle ?? "")} | ${escapeCell(character.relationship_tension ?? "")} |  |`,
    )
    .join("\n");
}

function dialogueGapRows() {
  if (visualScenes.length === 0) {
    return "|  |  |  |  |";
  }

  return visualScenes
    .map((scene) => {
      const time = `${scene.start_time ?? "?"}-${scene.end_time ?? "?"}`;
      return `| ${time} | ${escapeCell(scene.possible_dramatic_function ?? "Confirm visible function with dialogue.")} | yes |  |`;
    })
    .join("\n");
}

function readOptionalJson(filePath) {
  if (!existsSync(filePath)) {
    return null;
  }

  return JSON.parse(readFileSync(filePath, "utf8"));
}

function unique(values) {
  return [...new Set(values)];
}

function escapeCell(value) {
  return String(value).replace(/\|/g, "\\|").replace(/\n/g, " ");
}

function parseArgs(argv) {
  const result = {};

  for (let index = 0; index < argv.length; index += 1) {
    const token = argv[index];
    if (!token.startsWith("--")) {
      continue;
    }

    const key = token.slice(2);
    if (key === "help") {
      result[key] = true;
      continue;
    }

    const value = argv[index + 1];
    if (!value || value.startsWith("--")) {
      throw new Error(`Missing value for --${key}.`);
    }

    result[key] = value;
    index += 1;
  }

  return result;
}

function printHelp() {
  console.log(`Usage:
  npm run short-drama:build-correction-sheet -- --case ./short-drama-cases/demo/episode_001

Options:
  --case  Required. Existing short-drama case folder.
  --out   Optional. Output Markdown path. Defaults to human_correction_sheet.md inside the case.
`);
}
