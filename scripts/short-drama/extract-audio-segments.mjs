#!/usr/bin/env node

import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { spawnSync } from "node:child_process";

const args = parseArgs(process.argv.slice(2));

if (args.help || !args.case) {
  printHelp();
  process.exit(args.help ? 0 : 1);
}

const caseDir = resolve(String(args.case));
const metadata = readJson(join(caseDir, "source_metadata.json"));
const sceneMap = readJson(join(caseDir, "visual_scene_map.json"));
const videoPath = args.video ? resolve(String(args.video)) : metadata.local_video_path;
const outDir = args.out ? resolve(String(args.out)) : join(caseDir, "audio_segments");
const force = Boolean(args.force);

if (!videoPath || !existsSync(videoPath)) {
  throw new Error("Video/audio source not found. Pass --video or set local_video_path in source_metadata.json.");
}

mkdirSync(outDir, { recursive: true });

const segments = [];

for (const scene of sceneMap.scenes ?? []) {
  const outputFileName = `${scene.scene_id}_${safeTime(scene.start_time)}_${safeTime(scene.end_time)}.mp3`;
  const outputPath = join(outDir, outputFileName);

  if (existsSync(outputPath) && !force) {
    segments.push(segmentManifestEntry(scene, outputPath, "existing"));
    continue;
  }

  run("ffmpeg", [
    "-hide_banner",
    "-loglevel",
    "error",
    "-y",
    "-ss",
    scene.start_time,
    "-to",
    scene.end_time,
    "-i",
    videoPath,
    "-vn",
    "-acodec",
    "mp3",
    outputPath,
  ]);

  segments.push(segmentManifestEntry(scene, outputPath, "created"));
}

const manifestPath = join(outDir, "manifest.json");
writeFileSync(
  manifestPath,
  `${JSON.stringify(
    {
      series_title: metadata.series_title,
      episode_number: metadata.episode_number,
      source_path: videoPath,
      created_at: new Date().toISOString(),
      segments,
    },
    null,
    2,
  )}\n`,
  "utf8",
);

console.log(`Extracted ${segments.length} audio segment(s) into ${outDir}`);
console.log(`Manifest: ${manifestPath}`);

function segmentManifestEntry(scene, outputPath, status) {
  return {
    scene_id: scene.scene_id,
    start_time: scene.start_time,
    end_time: scene.end_time,
    possible_dramatic_function: scene.possible_dramatic_function ?? null,
    audio_path: outputPath,
    status,
  };
}

function safeTime(timecode) {
  return String(timecode).replace(/:/g, "-");
}

function run(command, commandArgs) {
  const result = spawnSync(command, commandArgs, { encoding: "utf8" });

  if (result.error) {
    throw result.error;
  }

  if (result.status !== 0) {
    throw new Error(`${command} failed: ${result.stderr || result.stdout}`);
  }
}

function readJson(filePath) {
  if (!existsSync(filePath)) {
    throw new Error(`Required file missing: ${filePath}`);
  }

  return JSON.parse(readFileSync(filePath, "utf8"));
}

function parseArgs(argv) {
  const result = {};

  for (let index = 0; index < argv.length; index += 1) {
    const token = argv[index];
    if (!token.startsWith("--")) {
      continue;
    }

    const key = token.slice(2);
    if (key === "help" || key === "force") {
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
  npm run short-drama:extract-audio-segments -- --case ./short-drama-cases/demo/episode_001

Options:
  --case   Required. Existing short-drama case folder with visual_scene_map.json.
  --video  Optional. Local video/audio file. Defaults to source_metadata.local_video_path.
  --out    Optional. Output folder. Defaults to audio_segments inside the case.
  --force  Optional. Replace existing segment files.
`);
}
