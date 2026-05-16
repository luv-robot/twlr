#!/usr/bin/env node

import { existsSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";

const args = parseArgs(process.argv.slice(2));

if (args.help) {
  printHelp();
  process.exit(0);
}

const rootDir = resolve(String(args.root ?? "short-drama-cases"));
const outPath = args.out ? resolve(String(args.out)) : join(rootDir, "index.json");

if (!existsSync(rootDir)) {
  throw new Error(`Cases root does not exist: ${rootDir}`);
}

const cases = findCaseDirs(rootDir).map((caseDir) => summarizeCase(caseDir, rootDir));
const index = {
  generated_at: new Date().toISOString(),
  root: rootDir,
  case_count: cases.length,
  cases,
};

writeFileSync(outPath, `${JSON.stringify(index, null, 2)}\n`, "utf8");
console.log(`Indexed ${cases.length} case(s): ${outPath}`);

function findCaseDirs(root) {
  const caseDirs = [];
  const seriesDirs = readdirSync(root, { withFileTypes: true }).filter((entry) => entry.isDirectory());

  for (const seriesDir of seriesDirs) {
    const seriesPath = join(root, seriesDir.name);
    const episodeDirs = readdirSync(seriesPath, { withFileTypes: true }).filter(
      (entry) => entry.isDirectory() && entry.name.startsWith("episode_"),
    );

    for (const episodeDir of episodeDirs) {
      const caseDir = join(seriesPath, episodeDir.name);
      if (existsSync(join(caseDir, "source_metadata.json"))) {
        caseDirs.push(caseDir);
      }
    }
  }

  return caseDirs.sort();
}

function summarizeCase(caseDir, root) {
  const metadata = readOptionalJson(join(caseDir, "source_metadata.json")) ?? {};
  const transcript = readOptionalJson(join(caseDir, "transcript_raw.json"));
  const visualContext = readOptionalJson(join(caseDir, "visual_context.json"));
  const sceneMap = readOptionalJson(join(caseDir, "visual_scene_map.json"));
  const reconstructedScript = readOptionalJson(join(caseDir, "reconstructed_script.json"));
  const visualOnlyReport = readOptionalText(join(caseDir, "visual_only_observation_report.md"));
  const diagnosisReport = readOptionalText(join(caseDir, "director_diagnosis_report.md"));

  const transcriptSegments = transcript?.segments?.length ?? 0;
  const visualFrames = visualContext?.frames?.length ?? 0;
  const visualScenes = sceneMap?.scenes?.length ?? 0;
  const reconstructedScenes = reconstructedScript?.scenes?.length ?? 0;
  const reconstructedCharacters = reconstructedScript?.characters?.length ?? 0;
  const hasVisualOnlyReport = Boolean(visualOnlyReport && !isTemplateVisualOnlyReport(visualOnlyReport));
  const hasDiagnosisReport = Boolean(diagnosisReport && !isTemplateDiagnosisReport(diagnosisReport));

  return {
    case_dir: caseDir.replace(`${root}/`, ""),
    series_title: metadata.series_title ?? "",
    episode_number: metadata.episode_number ?? null,
    source_type: metadata.source_type ?? null,
    duration_seconds: metadata.duration_seconds ?? null,
    progress: {
      transcript_segments: transcriptSegments,
      visual_frames: visualFrames,
      visual_scene_segments: visualScenes,
      reconstructed_scenes: reconstructedScenes,
      reconstructed_characters: reconstructedCharacters,
      has_visual_only_report: hasVisualOnlyReport,
      has_diagnosis_report: hasDiagnosisReport,
    },
    missing_next_steps: missingNextSteps({
      transcriptSegments,
      visualFrames,
      visualScenes,
      reconstructedScenes,
      reconstructedCharacters,
      hasVisualOnlyReport,
      hasDiagnosisReport,
    }),
  };
}

function missingNextSteps(progress) {
  const steps = [];

  if (progress.visualFrames === 0) {
    steps.push("extract_keyframes");
  }

  if (progress.visualScenes === 0 && progress.visualFrames > 0) {
    steps.push("build_visual_scene_map");
  }

  if (!progress.hasVisualOnlyReport && progress.visualScenes > 0) {
    steps.push("generate_visual_only_report");
  }

  if (progress.transcriptSegments === 0) {
    steps.push("import_transcript_or_asr");
  }

  if (progress.reconstructedScenes === 0 || progress.reconstructedCharacters === 0) {
    steps.push("reconstruct_script");
  }

  if (!progress.hasDiagnosisReport) {
    steps.push("generate_director_diagnosis");
  }

  return steps;
}

function isTemplateVisualOnlyReport(content) {
  return content.includes("## 1. 一句话判断\n\n## 2. 视觉场景地图");
}

function isTemplateDiagnosisReport(content) {
  return content.includes("## 1. 一句话判断\n\n## 2. 类型与目标观众判断");
}

function readOptionalJson(filePath) {
  if (!existsSync(filePath)) {
    return null;
  }

  return JSON.parse(readFileSync(filePath, "utf8"));
}

function readOptionalText(filePath) {
  if (!existsSync(filePath)) {
    return null;
  }

  return readFileSync(filePath, "utf8");
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
  npm run short-drama:index-cases -- --root ./short-drama-cases

Options:
  --root  Optional. Cases root. Defaults to ./short-drama-cases.
  --out   Optional. Output JSON path. Defaults to ./short-drama-cases/index.json.
`);
}
