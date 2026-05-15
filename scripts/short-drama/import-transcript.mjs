#!/usr/bin/env node

import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { basename, extname, join, resolve } from "node:path";

const args = parseArgs(process.argv.slice(2));

if (args.help || !args.case || !args.input) {
  printHelp();
  process.exit(args.help ? 0 : 1);
}

const caseDir = resolve(String(args.case));
const inputPath = resolve(String(args.input));
const source = String(args.source ?? "subtitle");

if (!existsSync(caseDir)) {
  throw new Error(`Case folder does not exist: ${caseDir}`);
}

if (!existsSync(inputPath)) {
  throw new Error(`Transcript input does not exist: ${inputPath}`);
}

if (!["subtitle", "asr", "manual"].includes(source)) {
  throw new Error("--source must be subtitle, asr, or manual.");
}

const metadataPath = join(caseDir, "source_metadata.json");
const metadata = existsSync(metadataPath)
  ? JSON.parse(readFileSync(metadataPath, "utf8"))
  : {
      series_title: basename(caseDir),
      episode_number: 1,
      language: "zh-CN",
    };

const input = readFileSync(inputPath, "utf8");
const extension = extname(inputPath).toLowerCase();
const segments =
  extension === ".srt"
    ? parseSubtitleBlocks(input, source)
    : extension === ".vtt"
      ? parseSubtitleBlocks(stripWebVttHeader(input), source)
      : parsePlainText(input, source);

const transcriptFile = {
  series_title: metadata.series_title,
  episode_number: metadata.episode_number,
  language: metadata.language ?? "zh-CN",
  segments,
};

writeFileSync(join(caseDir, "transcript_raw.json"), `${JSON.stringify(transcriptFile, null, 2)}\n`, "utf8");
writeFileSync(join(caseDir, "transcript_clean.md"), renderCleanTranscript(transcriptFile), "utf8");

console.log(`Imported ${segments.length} transcript segment(s) into ${caseDir}`);

function parseSubtitleBlocks(inputText, segmentSource) {
  const blocks = inputText
    .replace(/\r/g, "")
    .split(/\n{2,}/)
    .map((block) => block.trim())
    .filter(Boolean);

  const speakerMap = new Map();
  const segments = [];

  for (const block of blocks) {
    const lines = block.split("\n").map((line) => line.trim()).filter(Boolean);
    const timeLineIndex = lines.findIndex((line) => line.includes("-->"));

    if (timeLineIndex === -1) {
      continue;
    }

    const [startTime, endTime] = parseSubtitleTimeLine(lines[timeLineIndex]);
    const textLines = lines.slice(timeLineIndex + 1);
    const rawText = textLines.join(" ").replace(/<[^>]+>/g, "").trim();
    const { speakerId, speakerLabel, text } = normalizeSpeaker(rawText, speakerMap);

    segments.push({
      segment_id: `seg_${String(segments.length + 1).padStart(4, "0")}`,
      start_time: startTime,
      end_time: endTime,
      speaker_id: speakerId,
      speaker_label: speakerLabel,
      text,
      source: segmentSource,
      confidence: null,
    });
  }

  return segments;
}

function parsePlainText(inputText, segmentSource) {
  const speakerMap = new Map();
  return inputText
    .replace(/\r/g, "")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line, index) => {
      const timeMatch = line.match(/^(\[?\d{1,2}:\d{2}(?::\d{2})?\]?)(?:\s*[-–]\s*(\[?\d{1,2}:\d{2}(?::\d{2})?\]?))?\s*(.*)$/);
      const startTime = timeMatch ? normalizeLooseTime(timeMatch[1]) : "";
      const endTime = timeMatch?.[2] ? normalizeLooseTime(timeMatch[2]) : "";
      const rawText = timeMatch ? timeMatch[3] : line;
      const { speakerId, speakerLabel, text } = normalizeSpeaker(rawText, speakerMap);

      return {
        segment_id: `seg_${String(index + 1).padStart(4, "0")}`,
        start_time: startTime,
        end_time: endTime,
        speaker_id: speakerId,
        speaker_label: speakerLabel,
        text,
        source: segmentSource,
        confidence: null,
      };
    });
}

function parseSubtitleTimeLine(line) {
  const [start, rest] = line.split("-->");
  const end = rest?.split(/\s+/)[1] ?? rest ?? "";
  return [normalizeSubtitleTime(start), normalizeSubtitleTime(end)];
}

function normalizeSubtitleTime(value) {
  return value.trim().replace(",", ".").replace(/^(\d):/, "0$1:");
}

function normalizeLooseTime(value) {
  const trimmed = value.replace(/^\[/, "").replace(/\]$/, "").trim();
  const parts = trimmed.split(":");

  if (parts.length === 2) {
    return `00:${parts[0].padStart(2, "0")}:${parts[1].padStart(2, "0")}`;
  }

  if (parts.length === 3) {
    return `${parts[0].padStart(2, "0")}:${parts[1].padStart(2, "0")}:${parts[2].padStart(2, "0")}`;
  }

  return trimmed;
}

function normalizeSpeaker(rawText, speakerMap) {
  const speakerMatch = rawText.match(/^([^:：]{1,20})[:：]\s*(.+)$/);
  const speakerLabel = speakerMatch ? speakerMatch[1].trim() : null;
  const text = speakerMatch ? speakerMatch[2].trim() : rawText.trim();

  if (!speakerLabel) {
    return {
      speakerId: "speaker_unknown",
      speakerLabel: null,
      text,
    };
  }

  if (!speakerMap.has(speakerLabel)) {
    speakerMap.set(speakerLabel, `speaker_${String(speakerMap.size + 1).padStart(3, "0")}`);
  }

  return {
    speakerId: speakerMap.get(speakerLabel),
    speakerLabel,
    text,
  };
}

function stripWebVttHeader(inputText) {
  return inputText
    .replace(/^\uFEFF?WEBVTT[^\n]*\n+/i, "")
    .replace(/^NOTE[\s\S]*?\n\n/gm, "");
}

function renderCleanTranscript(transcriptFile) {
  const lines = [
    `# ${transcriptFile.series_title} Episode ${transcriptFile.episode_number} Clean Transcript`,
    "",
    "| Time | Speaker | Dialogue |",
    "|---|---|---|",
  ];

  for (const segment of transcriptFile.segments) {
    const time =
      segment.start_time || segment.end_time ? `${segment.start_time || "?"} - ${segment.end_time || "?"}` : "";
    lines.push(`| ${escapeTable(time)} | ${escapeTable(segment.speaker_label ?? segment.speaker_id)} | ${escapeTable(segment.text)} |`);
  }

  lines.push("");
  return lines.join("\n");
}

function escapeTable(value) {
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
  npm run short-drama:import-transcript -- --case ./short-drama-cases/demo/episode_001 --input ./episode_001.srt

Options:
  --case     Required. Existing short-drama case folder.
  --input    Required. .srt, .vtt, or plain .txt transcript file.
  --source   Optional. subtitle, asr, or manual. Defaults to subtitle.
`);
}
