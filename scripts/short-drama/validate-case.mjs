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
const results = [];

if (!existsSync(caseDir)) {
  throw new Error(`Case folder does not exist: ${caseDir}`);
}

const metadata = checkJson("source_metadata.json", ["series_title", "episode_number", "source_type"]);
const transcript = checkJson("transcript_raw.json", ["segments"]);
const visualContext = checkJson("visual_context.json", ["frames", "scene_level_notes"]);
const reconstructedScript = checkJson("reconstructed_script.json", ["characters", "scenes"]);
checkJson("human_corrections.json", ["character_name_map", "scene_boundary_edits"]);
const report = checkText("director_diagnosis_report.md");

if (metadata) {
  info(`Series: ${metadata.series_title || "(untitled)"}, episode ${metadata.episode_number ?? "?"}`);
}

if (transcript) {
  const count = Array.isArray(transcript.segments) ? transcript.segments.length : 0;
  count > 0 ? pass(`${count} transcript segment(s)`) : warn("No transcript segments yet.");
}

if (visualContext) {
  const count = Array.isArray(visualContext.frames) ? visualContext.frames.length : 0;
  count > 0 ? pass(`${count} visual frame placeholder(s)`) : warn("No visual frames yet.");
}

if (reconstructedScript) {
  const sceneCount = Array.isArray(reconstructedScript.scenes) ? reconstructedScript.scenes.length : 0;
  const characterCount = Array.isArray(reconstructedScript.characters) ? reconstructedScript.characters.length : 0;
  sceneCount > 0 ? pass(`${sceneCount} reconstructed scene(s)`) : warn("No reconstructed scenes yet.");
  characterCount > 0 ? pass(`${characterCount} reconstructed character(s)`) : warn("No reconstructed characters yet.");
}

if (report) {
  const requiredHeadings = [
    "## 1. 一句话判断",
    "## 4. 场景功能表",
    "## 6. 主要对白诊断",
    "## 9. 修订建议",
    "## 10. 评分",
  ];
  const missingHeadings = requiredHeadings.filter((heading) => !report.includes(heading));
  missingHeadings.length === 0
    ? pass("Diagnosis report template headings present.")
    : warn(`Diagnosis report missing heading(s): ${missingHeadings.join(", ")}`);
}

for (const result of results) {
  console.log(`${result.level.toUpperCase()}: ${result.message}`);
}

const hasFailure = results.some((result) => result.level === "fail");
const hasWarning = results.some((result) => result.level === "warn");

if (hasFailure || (strict && hasWarning)) {
  process.exit(1);
}

function checkJson(fileName, requiredKeys) {
  const filePath = join(caseDir, fileName);
  if (!existsSync(filePath)) {
    fail(`Missing ${fileName}.`);
    return null;
  }

  try {
    const value = JSON.parse(readFileSync(filePath, "utf8"));
    const missingKeys = requiredKeys.filter((key) => !(key in value));
    if (missingKeys.length > 0) {
      fail(`${fileName} missing key(s): ${missingKeys.join(", ")}.`);
    } else {
      pass(`${fileName} is valid JSON.`);
    }
    return value;
  } catch (error) {
    fail(`${fileName} is not valid JSON: ${error instanceof Error ? error.message : String(error)}`);
    return null;
  }
}

function checkText(fileName) {
  const filePath = join(caseDir, fileName);
  if (!existsSync(filePath)) {
    fail(`Missing ${fileName}.`);
    return null;
  }

  const value = readFileSync(filePath, "utf8");
  value.trim().length > 0 ? pass(`${fileName} exists.`) : warn(`${fileName} is empty.`);
  return value;
}

function pass(message) {
  results.push({ level: "pass", message });
}

function warn(message) {
  results.push({ level: "warn", message });
}

function fail(message) {
  results.push({ level: "fail", message });
}

function info(message) {
  results.push({ level: "info", message });
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
  npm run short-drama:validate-case -- --case ./short-drama-cases/demo/episode_001

Options:
  --case    Required. Existing short-drama case folder.
  --strict  Optional. Exit with failure when warnings are present.
`);
}
