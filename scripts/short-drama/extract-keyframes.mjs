#!/usr/bin/env node

import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { spawnSync } from "node:child_process";

const args = parseArgs(process.argv.slice(2));

if (args.help || !args.case || !args.video) {
  printHelp();
  process.exit(args.help ? 0 : 1);
}

const caseDir = resolve(String(args.case));
const videoPath = resolve(String(args.video));
const intervalSeconds = Number(args.interval ?? 15);
const force = Boolean(args.force);

if (!existsSync(caseDir)) {
  throw new Error(`Case folder does not exist: ${caseDir}`);
}

if (!existsSync(videoPath)) {
  throw new Error(`Video file does not exist: ${videoPath}`);
}

if (!Number.isFinite(intervalSeconds) || intervalSeconds <= 0) {
  throw new Error("--interval must be a positive number of seconds.");
}

const keyframesDir = join(caseDir, "keyframes");
const visualContextPath = join(caseDir, "visual_context.json");
const existingVisualContext = existsSync(visualContextPath)
  ? JSON.parse(readFileSync(visualContextPath, "utf8"))
  : { frames: [], scene_level_notes: [] };

if (existingVisualContext.frames?.length > 0 && !force) {
  throw new Error("visual_context.json already has frames. Re-run with --force to replace them.");
}

mkdirSync(keyframesDir, { recursive: true });

const outputPattern = join(keyframesDir, "frame_%04d.jpg");
run("ffmpeg", [
  "-hide_banner",
  "-loglevel",
  "error",
  "-y",
  "-i",
  videoPath,
  "-vf",
  `fps=1/${intervalSeconds}`,
  outputPattern,
]);

const frameFiles = readdirSync(keyframesDir)
  .filter((fileName) => /^frame_\d+\.jpg$/.test(fileName))
  .sort();

if (frameFiles.length === 0) {
  throw new Error("No keyframes were extracted.");
}

const frames = frameFiles.map((fileName, index) => ({
  frame_id: `frame_${String(index + 1).padStart(4, "0")}`,
  timecode: secondsToTimecode(index * intervalSeconds),
  image_path: `keyframes/${fileName}`,
  location: null,
  characters_visible: [],
  body_position: null,
  obvious_action: null,
  action_tags: [],
  props: [],
  emotional_state: null,
  shot_type: null,
  power_relation: null,
  scene_function_hint: null,
  confidence: null,
}));

const metadataPath = join(caseDir, "source_metadata.json");
const metadata = existsSync(metadataPath) ? JSON.parse(readFileSync(metadataPath, "utf8")) : null;
const duration = probeDuration(videoPath);

if (metadata) {
  writeFileSync(
    metadataPath,
    `${JSON.stringify(
      {
        ...metadata,
        source_type: "local_video",
        local_video_path: videoPath,
        duration_seconds: duration ?? metadata.duration_seconds ?? null,
      },
      null,
      2,
    )}\n`,
    "utf8",
  );
}

writeFileSync(
  visualContextPath,
  `${JSON.stringify(
    {
      ...existingVisualContext,
      frames,
    },
    null,
    2,
  )}\n`,
  "utf8",
);

console.log(`Extracted ${frames.length} keyframe(s) into ${keyframesDir}`);
console.log(`Updated ${visualContextPath}`);

function run(command, commandArgs) {
  const result = spawnSync(command, commandArgs, { encoding: "utf8" });

  if (result.error) {
    throw result.error;
  }

  if (result.status !== 0) {
    throw new Error(`${command} failed: ${result.stderr || result.stdout}`);
  }

  return result.stdout;
}

function probeDuration(filePath) {
  const result = spawnSync(
    "ffprobe",
    ["-v", "error", "-show_entries", "format=duration", "-of", "default=noprint_wrappers=1:nokey=1", filePath],
    { encoding: "utf8" },
  );

  if (result.status !== 0) {
    return null;
  }

  const duration = Number(result.stdout.trim());
  return Number.isFinite(duration) ? Number(duration.toFixed(3)) : null;
}

function secondsToTimecode(seconds) {
  const totalSeconds = Math.floor(seconds);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const remainingSeconds = totalSeconds % 60;

  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(remainingSeconds).padStart(2, "0")}`;
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
  npm run short-drama:extract-keyframes -- --case ./short-drama-cases/demo/episode_001 --video ./episode_001.mp4

Options:
  --case      Required. Existing short-drama case folder.
  --video     Required. Local video file.
  --interval  Optional. Seconds between frames. Defaults to 15.
  --force     Optional. Replace existing visual_context frames.
`);
}
