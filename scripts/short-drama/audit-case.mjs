#!/usr/bin/env node

import { existsSync, readFileSync } from "node:fs";
import { join, resolve } from "node:path";

const args = parseArgs(process.argv.slice(2));

if (args.help || !args.case) {
  printHelp();
  process.exit(args.help ? 0 : 1);
}

const caseDir = resolve(String(args.case));
const strict = Boolean(args.strict);
const findings = [];

if (!existsSync(caseDir)) {
  throw new Error(`Case folder does not exist: ${caseDir}`);
}

const metadata = readOptionalJson("source_metadata.json");
const transcript = readOptionalJson("transcript_raw.json");
const visualContext = readOptionalJson("visual_context.json");
const visualSceneMap = readOptionalJson("visual_scene_map.json");
const reconstructedScript = readOptionalJson("reconstructed_script.json");
const diagnosisReport = readOptionalText("director_diagnosis_report.md");

checkTranscript();
checkReconstructedScript();
checkDiagnosisReport();

for (const finding of findings) {
  console.log(`${finding.level.toUpperCase()}: ${finding.message}`);
}

if (findings.length === 0) {
  console.log("PASS: Case audit found no structural or severe-hallucination risks.");
}

const hasFailure = findings.some((finding) => finding.level === "fail");
const hasWarning = findings.some((finding) => finding.level === "warn");

if (hasFailure || (strict && hasWarning)) {
  process.exit(1);
}

function checkTranscript() {
  if (!transcript) {
    fail("Missing transcript_raw.json.");
    return;
  }

  const segments = Array.isArray(transcript.segments) ? transcript.segments : [];
  const segmentIds = new Set();
  const visualSceneIds = new Set((visualSceneMap?.scenes ?? []).map((scene) => scene.scene_id));
  let missingTextCount = 0;
  let badSceneRefCount = 0;

  for (const segment of segments) {
    if (!segment.segment_id) {
      fail("Transcript segment missing segment_id.");
      continue;
    }
    if (segmentIds.has(segment.segment_id)) {
      fail(`Duplicate transcript segment_id: ${segment.segment_id}.`);
    }
    segmentIds.add(segment.segment_id);

    if (!String(segment.text ?? "").trim()) {
      missingTextCount += 1;
    }

    if (segment.scene_id && visualSceneIds.size > 0 && !visualSceneIds.has(segment.scene_id)) {
      badSceneRefCount += 1;
    }
  }

  if (segments.length === 0) {
    warn("Transcript has no segments yet.");
  }
  if (missingTextCount > 0) {
    fail(`${missingTextCount} transcript segment(s) have empty text.`);
  }
  if (badSceneRefCount > 0) {
    warn(`${badSceneRefCount} transcript segment(s) reference scene_id values not found in visual_scene_map.json.`);
  }
}

function checkReconstructedScript() {
  if (!reconstructedScript) {
    fail("Missing reconstructed_script.json.");
    return;
  }

  const scenes = Array.isArray(reconstructedScript.scenes) ? reconstructedScript.scenes : [];
  const characters = Array.isArray(reconstructedScript.characters) ? reconstructedScript.characters : [];
  const segmentIds = new Set((transcript?.segments ?? []).map((segment) => segment.segment_id));
  const frameIds = new Set((visualContext?.frames ?? []).map((frame) => frame.frame_id));
  const sceneIds = new Set();
  const characterRefs = new Set();
  for (const character of characters) {
    if (character.character_id) {
      characterRefs.add(character.character_id);
    }
    if (character.name) {
      characterRefs.add(character.name);
    }
    for (const alias of character.aliases ?? []) {
      characterRefs.add(alias);
    }
  }
  const durationSeconds = Number(metadata?.duration_seconds ?? 0);

  for (const scene of scenes) {
    if (!scene.scene_id) {
      fail("Reconstructed scene missing scene_id.");
      continue;
    }
    if (sceneIds.has(scene.scene_id)) {
      fail(`Duplicate reconstructed scene_id: ${scene.scene_id}.`);
    }
    sceneIds.add(scene.scene_id);

    checkSceneTimeRange(scene, durationSeconds);

    for (const dialogueId of scene.dialogue_segment_ids ?? []) {
      if (!segmentIds.has(dialogueId)) {
        fail(`Scene ${scene.scene_id} references missing dialogue segment: ${dialogueId}.`);
      }
    }

    for (const frameId of scene.visual_evidence_frame_ids ?? []) {
      if (!frameIds.has(frameId)) {
        fail(`Scene ${scene.scene_id} references missing visual frame: ${frameId}.`);
      }
    }

    for (const characterName of scene.characters ?? []) {
      if (characterRefs.size > 0 && !characterRefs.has(characterName)) {
        warn(`Scene ${scene.scene_id} references character not listed in character cards: ${characterName}.`);
      }
    }
  }

  if (characters.length === 0) {
    warn("Reconstructed script has no characters.");
  }
  if (scenes.length === 0) {
    warn("Reconstructed script has no scenes.");
  }
}

function checkSceneTimeRange(scene, durationSeconds) {
  const start = timecodeToSeconds(scene.start_time);
  const end = timecodeToSeconds(scene.end_time);

  if (start === null || end === null) {
    warn(`Scene ${scene.scene_id} has non-standard time range: ${scene.start_time || "?"} - ${scene.end_time || "?"}.`);
    return;
  }

  if (end < start) {
    fail(`Scene ${scene.scene_id} ends before it starts.`);
  }

  if (durationSeconds > 0 && (start > durationSeconds + 5 || end > durationSeconds + 5)) {
    fail(`Scene ${scene.scene_id} time range exceeds source duration.`);
  }
}

function checkDiagnosisReport() {
  if (!diagnosisReport) {
    fail("Missing director_diagnosis_report.md.");
    return;
  }

  const requiredHeadings = [
    "## 1. 一句话判断",
    "## 4. 场景功能表",
    "## 6. 主要对白诊断",
    "## 9. 修订建议",
    "## 10. 评分",
  ];
  const missingHeadings = requiredHeadings.filter((heading) => !diagnosisReport.includes(heading));

  if (missingHeadings.length > 0) {
    fail(`Diagnosis report missing required heading(s): ${missingHeadings.join(", ")}.`);
  }

  const sourceDuration = Number(metadata?.duration_seconds ?? 0);
  const timecodes = diagnosisReport.match(/\b\d{2}:\d{2}(?::\d{2})?\b/g) ?? [];
  for (const timecode of timecodes) {
    const seconds = timecodeToSeconds(timecode);
    if (seconds !== null && sourceDuration > 0 && seconds > sourceDuration + 5) {
      fail(`Diagnosis report contains timecode outside source duration: ${timecode}.`);
    }
  }

  const processLeakTerms = ["提示文件", "用户上传", "本模型", "作为AI", "我无法", "ChatGPT", "Claude", "Gemini"];
  const leakedTerms = processLeakTerms.filter((term) => diagnosisReport.includes(term));
  if (leakedTerms.length > 0) {
    warn(`Report contains process/tool leakage term(s): ${leakedTerms.join(", ")}.`);
  }

  const reconstructedNames = new Set((reconstructedScript?.characters ?? []).map((character) => character.name).filter(Boolean));
  const knownNamesInReport = [...reconstructedNames].filter((name) => diagnosisReport.includes(name));
  if (reconstructedNames.size > 0 && knownNamesInReport.length === 0) {
    warn("Diagnosis report does not mention any reconstructed character names.");
  }
}

function timecodeToSeconds(value) {
  if (!value || typeof value !== "string") {
    return null;
  }

  const normalized = value.split(".")[0];
  const parts = normalized.split(":").map((part) => Number(part));

  if (parts.some((part) => Number.isNaN(part))) {
    return null;
  }

  if (parts.length === 2) {
    return parts[0] * 60 + parts[1];
  }

  if (parts.length === 3) {
    return parts[0] * 3600 + parts[1] * 60 + parts[2];
  }

  return null;
}

function readOptionalJson(fileName) {
  const filePath = join(caseDir, fileName);
  if (!existsSync(filePath)) {
    return null;
  }

  return JSON.parse(readFileSync(filePath, "utf8"));
}

function readOptionalText(fileName) {
  const filePath = join(caseDir, fileName);
  if (!existsSync(filePath)) {
    return null;
  }

  return readFileSync(filePath, "utf8");
}

function warn(message) {
  findings.push({ level: "warn", message });
}

function fail(message) {
  findings.push({ level: "fail", message });
}

function parseArgs(argv) {
  const result = {};

  for (let index = 0; index < argv.length; index += 1) {
    const token = argv[index];
    if (!token.startsWith("--")) {
      continue;
    }

    const key = token.slice(2);
    if (key === "help" || key === "strict") {
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
  npm run short-drama:audit-case -- --case ./short-drama-cases/demo/episode_001

Options:
  --case    Required. Existing short-drama case folder.
  --strict  Optional. Exit with failure when warnings are present.
`);
}
