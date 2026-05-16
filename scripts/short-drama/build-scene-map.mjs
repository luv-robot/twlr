#!/usr/bin/env node

import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";

const args = parseArgs(process.argv.slice(2));

if (args.help || !args.case) {
  printHelp();
  process.exit(args.help ? 0 : 1);
}

const caseDir = resolve(String(args.case));
const outPath = args.out ? resolve(String(args.out)) : join(caseDir, "visual_scene_map.json");

if (!existsSync(caseDir)) {
  throw new Error(`Case folder does not exist: ${caseDir}`);
}

const metadata = readJson(join(caseDir, "source_metadata.json"));
const visualContext = readJson(join(caseDir, "visual_context.json"));
const frames = Array.isArray(visualContext.frames) ? visualContext.frames : [];
const notes = Array.isArray(visualContext.scene_level_notes) ? visualContext.scene_level_notes : [];
const scenes = notes.length > 0 ? notes.map((note, index) => sceneFromNote(note, index, frames)) : scenesFromFrames(frames);

const sceneMap = {
  series_title: metadata.series_title,
  episode_number: metadata.episode_number,
  scenes,
  open_questions: [
    "Dialogue transcript is required to confirm character names, scene goals, and conflict stakes.",
    "Visual-only scene functions are provisional and should not be treated as final diagnosis.",
  ],
};

writeFileSync(outPath, `${JSON.stringify(sceneMap, null, 2)}\n`, "utf8");
console.log(`Wrote visual scene map: ${outPath}`);
console.log(`Scene count: ${scenes.length}`);

function sceneFromNote(note, index, allFrames) {
  const { startTime, endTime } = parseNoteTimeRange(note);
  const evidenceFrames = allFrames.filter((frame) => isFrameInRange(frame.timecode, startTime, endTime));

  return {
    scene_id: `vscene_${String(index + 1).padStart(3, "0")}`,
    start_time: startTime,
    end_time: endTime,
    location: mostCommon(evidenceFrames.map((frame) => frame.location).filter(Boolean)) ?? null,
    visual_summary: note.summary ?? note.visual_pattern ?? "",
    possible_dramatic_function: note.possible_function ?? null,
    visible_conflict: inferVisibleConflict(evidenceFrames),
    power_relation: mostCommon(evidenceFrames.map((frame) => frame.power_relation).filter(Boolean)) ?? null,
    action_tags: unique(evidenceFrames.flatMap((frame) => frame.action_tags ?? [])),
    evidence_frame_ids: evidenceFrames.map((frame) => frame.frame_id),
    needs_dialogue_confirmation: [
      "character names",
      "spoken conflict",
      "specific stakes",
      "whether the visual turn matches dialogue meaning",
    ],
  };
}

function scenesFromFrames(allFrames) {
  if (allFrames.length === 0) {
    return [];
  }

  const groupSize = 12;
  const scenes = [];

  for (let index = 0; index < allFrames.length; index += groupSize) {
    const group = allFrames.slice(index, index + groupSize);
    scenes.push({
      scene_id: `vscene_${String(scenes.length + 1).padStart(3, "0")}`,
      start_time: group[0]?.timecode ?? "00:00:00",
      end_time: group[group.length - 1]?.timecode ?? group[0]?.timecode ?? "00:00:00",
      location: mostCommon(group.map((frame) => frame.location).filter(Boolean)) ?? null,
      visual_summary: summarizeFrames(group),
      possible_dramatic_function: mostCommon(group.map((frame) => frame.scene_function_hint).filter(Boolean)) ?? null,
      visible_conflict: inferVisibleConflict(group),
      power_relation: mostCommon(group.map((frame) => frame.power_relation).filter(Boolean)) ?? null,
      action_tags: unique(group.flatMap((frame) => frame.action_tags ?? [])),
      evidence_frame_ids: group.map((frame) => frame.frame_id),
      needs_dialogue_confirmation: ["character names", "spoken conflict", "specific stakes"],
    });
  }

  return scenes;
}

function parseNoteTimeRange(note) {
  if (note.start_time || note.end_time) {
    return {
      startTime: note.start_time ?? "00:00:00",
      endTime: note.end_time ?? note.start_time ?? "00:00:00",
    };
  }

  if (typeof note.time_range === "string") {
    const [startTime, endTime] = note.time_range.split("-").map((value) => normalizeTime(value));
    return {
      startTime: startTime || "00:00:00",
      endTime: endTime || startTime || "00:00:00",
    };
  }

  return {
    startTime: "00:00:00",
    endTime: "00:00:00",
  };
}

function normalizeTime(value = "") {
  const trimmed = value.trim();
  const parts = trimmed.split(":");

  if (parts.length === 2) {
    return `00:${parts[0].padStart(2, "0")}:${parts[1].padStart(2, "0")}`;
  }

  if (parts.length === 3) {
    return `${parts[0].padStart(2, "0")}:${parts[1].padStart(2, "0")}:${parts[2].padStart(2, "0")}`;
  }

  return trimmed;
}

function isFrameInRange(timecode, startTime, endTime) {
  const frameSeconds = timeToSeconds(timecode);
  return frameSeconds >= timeToSeconds(startTime) && frameSeconds <= timeToSeconds(endTime);
}

function timeToSeconds(timecode = "00:00:00") {
  const [hours = "0", minutes = "0", seconds = "0"] = timecode.split(":");
  return Number(hours) * 3600 + Number(minutes) * 60 + Number(seconds);
}

function summarizeFrames(group) {
  const locations = unique(group.map((frame) => frame.location).filter(Boolean)).slice(0, 3);
  const actions = unique(group.map((frame) => frame.obvious_action).filter(Boolean)).slice(0, 3);
  return [
    locations.length > 0 ? `Locations: ${locations.join(", ")}` : "",
    actions.length > 0 ? `Visible actions: ${actions.join("; ")}` : "",
  ]
    .filter(Boolean)
    .join(" ");
}

function inferVisibleConflict(group) {
  const conflictFrames = group.filter((frame) => {
    const tags = frame.action_tags ?? [];
    const action = `${frame.obvious_action ?? ""} ${frame.power_relation ?? ""}`.toLowerCase();
    return (
      tags.some((tag) => ["block_path", "grab", "push_away", "slap", "threaten", "protect", "humiliate", "counterattack"].includes(tag)) ||
      action.includes("confront") ||
      action.includes("threat") ||
      action.includes("aggressive") ||
      action.includes("power")
    );
  });

  if (conflictFrames.length === 0) {
    return null;
  }

  return conflictFrames
    .slice(0, 3)
    .map((frame) => `${frame.timecode}: ${frame.obvious_action ?? frame.power_relation ?? "visible conflict"}`)
    .join(" | ");
}

function mostCommon(values) {
  const counts = new Map();

  for (const value of values) {
    counts.set(value, (counts.get(value) ?? 0) + 1);
  }

  return [...counts.entries()].sort((left, right) => right[1] - left[1])[0]?.[0] ?? null;
}

function unique(values) {
  return [...new Set(values.filter(Boolean))];
}

function readJson(filePath) {
  if (!existsSync(filePath)) {
    throw new Error(`Required case file missing: ${filePath}`);
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
  npm run short-drama:build-scene-map -- --case ./short-drama-cases/demo/episode_001

Options:
  --case  Required. Existing short-drama case folder.
  --out   Optional. Output JSON path. Defaults to visual_scene_map.json inside the case.
`);
}
