#!/usr/bin/env node

import { existsSync, readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const args = parseArgs(process.argv.slice(2));

if (args.help || !args.case) {
  printHelp();
  process.exit(args.help ? 0 : 1);
}

const scriptDir = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(scriptDir, "..", "..");
const caseDir = resolve(String(args.case));
const force = Boolean(args.force);
const dryRun = Boolean(args.dryRun ?? args["dry-run"]);
const skipIndex = Boolean(args.skipIndex ?? args["skip-index"]);
const indexRoot = args.indexRoot ? resolve(String(args.indexRoot)) : resolve(repoRoot, "short-drama-cases");
const steps = [];

if (!existsSync(caseDir)) {
  throw new Error(`Case folder does not exist: ${caseDir}`);
}

advanceVisualContext();
advanceSceneMap();
advanceVisualOnlyReport();
advanceTranscript();
advanceReconstruction();
advanceDiagnosis();
runQualityGate();

if (!skipIndex && existsSync(indexRoot)) {
  runScript("index-cases.mjs", ["--root", indexRoot]);
}

console.log("");
console.log(`Automated review pass complete. ${steps.length} command(s) ${dryRun ? "planned" : "executed"}.`);

function advanceVisualContext() {
  const candidate = firstExisting([
    "visual_context_from_model.json",
    "visual_context_from_chatgpt.json",
    "visual_context_form_chatgpt.json",
  ]);
  const visualContext = readOptionalJson("visual_context.json");
  const hasVisualContext = Array.isArray(visualContext?.frames) && visualContext.frames.length > 0;

  if (candidate && (force || !hasVisualContext)) {
    runScript("apply-output.mjs", ["--case", caseDir, "--kind", "visual-context", "--input", candidate, "--force"]);
  }
}

function advanceSceneMap() {
  const visualContext = readOptionalJson("visual_context.json");
  const visualSceneMap = readOptionalJson("visual_scene_map.json");
  const hasVisualContext = Array.isArray(visualContext?.frames) && visualContext.frames.length > 0;
  const hasSceneMap = Array.isArray(visualSceneMap?.scenes) && visualSceneMap.scenes.length > 0;

  if (hasVisualContext && (force || !hasSceneMap)) {
    runScript("build-scene-map.mjs", ["--case", caseDir]);
  }
}

function advanceVisualOnlyReport() {
  const sceneMap = readOptionalJson("visual_scene_map.json");
  const hasSceneMap = Array.isArray(sceneMap?.scenes) && sceneMap.scenes.length > 0;

  if (hasSceneMap) {
    runScript("build-prompt.mjs", ["--case", caseDir, "--kind", "visual-only-diagnosis"]);
  }

  const candidate = firstExisting(["visual_only_report_from_model.md", "visual_only_observation_from_model.md"]);
  const existingReport = readOptionalText("visual_only_observation_report.md");
  const hasReport = existingReport && !existingReport.includes("## 1. 一句话判断\n\n##");

  if (candidate && (force || !hasReport)) {
    runScript("apply-output.mjs", ["--case", caseDir, "--kind", "visual-only-report", "--input", candidate, "--force"]);
    runScript("lint-report.mjs", ["--case", caseDir, "--kind", "visual-only"]);
  }
}

function advanceTranscript() {
  const transcript = readOptionalJson("transcript_raw.json");
  const transcriptSegments = Array.isArray(transcript?.segments) ? transcript.segments : [];
  const segmentedCandidate = firstExisting(["transcript_segmented_from_model.json", "transcript_cleaned_from_model.json"]);

  if (segmentedCandidate && (force || transcriptSegments.length <= 1)) {
    runScript("apply-output.mjs", ["--case", caseDir, "--kind", "transcript-raw", "--input", segmentedCandidate, "--force"]);
  } else if (transcriptSegments.length === 0) {
    const rawTranscript = firstExisting(["groq_playground_transcript.txt", "transcript_from_model.txt", "transcript.txt"]);
    if (rawTranscript) {
      runScript("import-transcript.mjs", ["--case", caseDir, "--input", rawTranscript, "--source", "asr"]);
    }
  }

  const updatedTranscript = readOptionalJson("transcript_raw.json");
  const updatedSegments = Array.isArray(updatedTranscript?.segments) ? updatedTranscript.segments : [];

  if (updatedSegments.length > 0) {
    runScript("build-prompt.mjs", ["--case", caseDir, "--kind", "transcript-cleanup"]);
  }
}

function advanceReconstruction() {
  const transcript = readOptionalJson("transcript_raw.json");
  const transcriptSegments = Array.isArray(transcript?.segments) ? transcript.segments : [];
  const reconstructed = readOptionalJson("reconstructed_script.json");
  const hasReconstruction =
    Array.isArray(reconstructed?.scenes) &&
    reconstructed.scenes.length > 0 &&
    Array.isArray(reconstructed?.characters) &&
    reconstructed.characters.length > 0;

  if (transcriptSegments.length > 0) {
    runScript("build-prompt.mjs", ["--case", caseDir, "--kind", "reconstruction"]);
  }

  const candidate = firstExisting(["reconstructed_script_from_model.json"]);
  if (candidate && (force || !hasReconstruction)) {
    runScript("apply-output.mjs", ["--case", caseDir, "--kind", "reconstructed-script", "--input", candidate, "--force"]);
  }
}

function advanceDiagnosis() {
  const reconstructed = readOptionalJson("reconstructed_script.json");
  const hasReconstruction =
    Array.isArray(reconstructed?.scenes) &&
    reconstructed.scenes.length > 0 &&
    Array.isArray(reconstructed?.characters) &&
    reconstructed.characters.length > 0;

  if (hasReconstruction) {
    runScript("build-prompt.mjs", ["--case", caseDir, "--kind", "diagnosis"]);
  }

  const candidate = firstExisting(["director_diagnosis_from_model.md"]);
  const existingReport = readOptionalText("director_diagnosis_report.md");
  const hasReport = existingReport && !existingReport.includes("## 1. 一句话判断\n\n##");

  if (candidate && (force || !hasReport)) {
    runScript("apply-output.mjs", ["--case", caseDir, "--kind", "diagnosis-report", "--input", candidate, "--force"]);
  }
}

function runQualityGate() {
  runScript("validate-case.mjs", ["--case", caseDir]);
  runScript("lint-report.mjs", ["--case", caseDir, "--kind", "diagnosis"]);
  runScript("audit-case.mjs", ["--case", caseDir]);
}

function runScript(fileName, commandArgs) {
  const command = "node";
  const commandArgsWithScript = [join(scriptDir, fileName), ...commandArgs];
  steps.push(`${command} ${commandArgsWithScript.map(quoteArg).join(" ")}`);

  if (dryRun) {
    console.log(`DRY-RUN: ${command} ${commandArgsWithScript.map(quoteArg).join(" ")}`);
    return;
  }

  const result = spawnSync(command, commandArgsWithScript, {
    cwd: repoRoot,
    encoding: "utf8",
    stdio: "inherit",
  });

  if (result.error) {
    throw result.error;
  }

  if (result.status !== 0) {
    throw new Error(`${fileName} failed with exit code ${result.status}.`);
  }
}

function firstExisting(fileNames) {
  for (const fileName of fileNames) {
    const filePath = join(caseDir, fileName);
    if (existsSync(filePath)) {
      return filePath;
    }
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

function quoteArg(value) {
  return String(value).includes(" ") ? JSON.stringify(String(value)) : String(value);
}

function parseArgs(argv) {
  const result = {};

  for (let index = 0; index < argv.length; index += 1) {
    const token = argv[index];
    if (!token.startsWith("--")) {
      continue;
    }

    const key = token.slice(2);
    if (["help", "force", "dry-run", "dryRun", "skip-index", "skipIndex"].includes(key)) {
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
  npm run short-drama:run-case-review -- --case ./short-drama-cases/demo/episode_001

Options:
  --case        Required. Existing short-drama case folder.
  --force       Optional. Reapply existing model outputs and rebuild generated artifacts.
  --dry-run     Optional. Print commands without executing them.
  --skip-index  Optional. Skip short-drama-cases/index.json update.
  --index-root  Optional. Cases root for indexing. Defaults to ./short-drama-cases.

This command does not call an LLM. It automates local orchestration around already-saved model outputs.
`);
}
