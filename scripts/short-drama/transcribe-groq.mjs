#!/usr/bin/env node

import { existsSync, mkdirSync, openAsBlob, readFileSync, statSync, writeFileSync } from "node:fs";
import { basename, join, resolve } from "node:path";

loadEnvFile(".env.local");
loadEnvFile(".env");

const args = parseArgs(process.argv.slice(2));

if (args.help || !args.case) {
  printHelp();
  process.exit(args.help ? 0 : 1);
}

const caseDir = resolve(String(args.case));
const manifestPath = args.manifest
  ? resolve(String(args.manifest))
  : join(caseDir, "audio_segments", "manifest.json");
const outDir = args.out ? resolve(String(args.out)) : join(caseDir, "asr", "groq");
const model = String(args.model ?? process.env.GROQ_ASR_MODEL ?? "whisper-large-v3-turbo");
const language = String(args.language ?? "zh");
const temperature = String(args.temperature ?? "0");
const endpoint = String(args.endpoint ?? "https://api.groq.com/openai/v1/audio/transcriptions");
const responseFormat = String(args.responseFormat ?? args["response-format"] ?? "verbose_json");
const apiKey = String(args.apiKey ?? args["api-key"] ?? process.env.GROQ_API_KEY ?? "");
const dryRun = Boolean(args.dryRun ?? args["dry-run"]);
const force = Boolean(args.force);
const maxBytes = Number(args.maxBytes ?? args["max-bytes"] ?? 20 * 1024 * 1024);
const onlySceneIds = parseSceneFilter(args.only);
const verboseErrors = Boolean(args.verboseErrors ?? args["verbose-errors"]);

if (!existsSync(caseDir)) {
  throw new Error(`Case folder does not exist: ${caseDir}`);
}

if (!existsSync(manifestPath)) {
  throw new Error(`Audio segment manifest does not exist: ${manifestPath}`);
}

const metadata = readOptionalJson(join(caseDir, "source_metadata.json"));
const manifest = readJson(manifestPath);
const allSegments = Array.isArray(manifest.segments) ? manifest.segments : [];
const selectedSegments = onlySceneIds
  ? allSegments.filter((segment) => onlySceneIds.has(segment.scene_id))
  : allSegments;

if (selectedSegments.length === 0) {
  throw new Error("No audio segments selected for transcription.");
}

mkdirSync(outDir, { recursive: true });

console.log(`Groq ASR plan: ${selectedSegments.length} segment(s), model=${model}, language=${language}`);

if (dryRun) {
  for (const segment of selectedSegments) {
    const audioPath = resolve(String(segment.audio_path));
    const size = existsSync(audioPath) ? statSync(audioPath).size : 0;
    console.log(`${segment.scene_id}: ${audioPath} (${formatBytes(size)})`);
  }
  process.exit(0);
}

if (!apiKey) {
  throw new Error("GROQ_API_KEY is not set. Create a Groq API key, then run: export GROQ_API_KEY='gsk_...'");
}

const transcriptSegments = [];

for (const segment of selectedSegments) {
  const audioPath = resolve(String(segment.audio_path));
  if (!existsSync(audioPath)) {
    throw new Error(`Audio segment missing: ${audioPath}`);
  }

  const fileSize = statSync(audioPath).size;
  if (fileSize > maxBytes) {
    throw new Error(
      `${segment.scene_id} is ${formatBytes(fileSize)}, above the configured max ${formatBytes(maxBytes)}. Split this segment before sending to Groq.`,
    );
  }

  const rawPath = join(outDir, `${segment.scene_id}.groq.json`);
  const textPath = join(outDir, `${segment.scene_id}.txt`);

  let groqResponse;
  if (existsSync(rawPath) && !force) {
    groqResponse = readJson(rawPath);
    console.log(`Reusing existing Groq output: ${rawPath}`);
  } else {
    console.log(`Transcribing ${segment.scene_id}: ${basename(audioPath)} (${formatBytes(fileSize)})`);
    groqResponse = await transcribeAudio(audioPath);
    writeFileSync(rawPath, `${JSON.stringify(groqResponse, null, 2)}\n`, "utf8");
    writeFileSync(textPath, `${String(groqResponse.text ?? "").trim()}\n`, "utf8");
  }

  transcriptSegments.push(...groqToTranscriptSegments(groqResponse, segment, transcriptSegments.length));
}

const transcriptFile = {
  series_title: manifest.series_title ?? metadata?.series_title ?? basename(caseDir),
  episode_number: manifest.episode_number ?? metadata?.episode_number ?? 1,
  language: metadata?.language ?? "zh-CN",
  provider: "groq",
  model,
  source_manifest_path: manifestPath,
  generated_at: new Date().toISOString(),
  segments: transcriptSegments,
};

writeFileSync(join(caseDir, "transcript_raw.json"), `${JSON.stringify(transcriptFile, null, 2)}\n`, "utf8");
writeFileSync(join(caseDir, "transcript_clean.md"), renderCleanTranscript(transcriptFile), "utf8");

console.log(`Wrote ${transcriptSegments.length} transcript segment(s) to ${join(caseDir, "transcript_raw.json")}`);
console.log(`Raw Groq outputs: ${outDir}`);

async function transcribeAudio(audioPath) {
  const form = new FormData();
  const fileBlob = await openAsBlob(audioPath);
  form.append("file", fileBlob, basename(audioPath));
  form.append("model", model);
  form.append("temperature", temperature);
  form.append("response_format", responseFormat);
  form.append("language", language);

  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
    },
    body: form,
  });

  const responseText = await response.text();
  let payload;
  try {
    payload = responseText ? JSON.parse(responseText) : {};
  } catch {
    payload = { text: responseText };
  }

  if (!response.ok) {
    const message = payload?.error?.message ?? payload?.message ?? responseText;
    if (verboseErrors) {
      console.error(JSON.stringify(redactErrorPayload(payload), null, 2));
    }
    throw new Error(`Groq transcription failed with ${response.status} ${response.statusText}: ${message}`);
  }

  return payload;
}

function groqToTranscriptSegments(groqResponse, sceneSegment, existingCount) {
  const sceneStartSeconds = timecodeToSeconds(sceneSegment.start_time);
  const sceneEndSeconds = timecodeToSeconds(sceneSegment.end_time);
  const segments = Array.isArray(groqResponse.segments) ? groqResponse.segments : [];

  if (segments.length === 0) {
    const text = String(groqResponse.text ?? "").trim();
    if (!text) {
      return [];
    }

    return [
      {
        segment_id: `seg_${String(existingCount + 1).padStart(4, "0")}`,
        scene_id: sceneSegment.scene_id,
        start_time: sceneSegment.start_time,
        end_time: sceneSegment.end_time,
        speaker_id: "speaker_unknown",
        speaker_label: null,
        text,
        source: "asr",
        provider: "groq",
        confidence: null,
      },
    ];
  }

  return segments
    .map((segment, index) => {
      const start = typeof segment.start === "number" ? sceneStartSeconds + segment.start : sceneStartSeconds;
      const end = typeof segment.end === "number" ? sceneStartSeconds + segment.end : sceneEndSeconds;
      return {
        segment_id: `seg_${String(existingCount + index + 1).padStart(4, "0")}`,
        scene_id: sceneSegment.scene_id,
        start_time: secondsToTimecode(start),
        end_time: secondsToTimecode(end),
        speaker_id: "speaker_unknown",
        speaker_label: null,
        text: String(segment.text ?? "").trim(),
        source: "asr",
        provider: "groq",
        confidence: typeof segment.avg_logprob === "number" ? Number(segment.avg_logprob.toFixed(4)) : null,
      };
    })
    .filter((segment) => segment.text.length > 0);
}

function renderCleanTranscript(transcriptFile) {
  const lines = [
    `# ${transcriptFile.series_title} Episode ${transcriptFile.episode_number} Clean Transcript`,
    "",
    `Provider: ${transcriptFile.provider} / ${transcriptFile.model}`,
    "",
    "| Time | Scene | Speaker | Dialogue |",
    "|---|---|---|---|",
  ];

  for (const segment of transcriptFile.segments) {
    const time =
      segment.start_time || segment.end_time ? `${segment.start_time || "?"} - ${segment.end_time || "?"}` : "";
    lines.push(
      `| ${escapeTable(time)} | ${escapeTable(segment.scene_id ?? "")} | ${escapeTable(segment.speaker_label ?? segment.speaker_id)} | ${escapeTable(segment.text)} |`,
    );
  }

  lines.push("");
  return lines.join("\n");
}

function parseSceneFilter(value) {
  if (!value) {
    return null;
  }

  return new Set(
    String(value)
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean),
  );
}

function timecodeToSeconds(value) {
  const [hours = "0", minutes = "0", seconds = "0"] = String(value).split(":");
  return Number(hours) * 3600 + Number(minutes) * 60 + Number(seconds);
}

function secondsToTimecode(value) {
  const totalMilliseconds = Math.max(0, Math.round(value * 1000));
  const hours = Math.floor(totalMilliseconds / 3_600_000);
  const minutes = Math.floor((totalMilliseconds % 3_600_000) / 60_000);
  const seconds = Math.floor((totalMilliseconds % 60_000) / 1000);
  const milliseconds = totalMilliseconds % 1000;
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}.${String(milliseconds).padStart(3, "0")}`;
}

function formatBytes(bytes) {
  if (bytes < 1024) {
    return `${bytes} B`;
  }
  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  }
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

function escapeTable(value) {
  return String(value).replace(/\|/g, "\\|").replace(/\n/g, " ");
}

function readJson(filePath) {
  return JSON.parse(readFileSync(filePath, "utf8"));
}

function readOptionalJson(filePath) {
  return existsSync(filePath) ? readJson(filePath) : null;
}

function redactErrorPayload(payload) {
  if (!payload || typeof payload !== "object") {
    return payload;
  }

  const text = JSON.stringify(payload)
    .replace(/gsk_[A-Za-z0-9_-]+/g, "gsk_[REDACTED]")
    .replace(/Bearer\s+[A-Za-z0-9._-]+/gi, "Bearer [REDACTED]");
  return JSON.parse(text);
}

function loadEnvFile(fileName) {
  const filePath = resolve(fileName);
  if (!existsSync(filePath)) {
    return;
  }

  const lines = readFileSync(filePath, "utf8").split(/\r?\n/);
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#") || !trimmed.includes("=")) {
      continue;
    }

    const [key, ...rest] = trimmed.split("=");
    if (process.env[key]) {
      continue;
    }

    const rawValue = rest.join("=").trim();
    process.env[key] = rawValue.replace(/^['"]|['"]$/g, "");
  }
}

function parseArgs(argv) {
  const result = {};

  for (let index = 0; index < argv.length; index += 1) {
    const token = argv[index];
    if (!token.startsWith("--")) {
      continue;
    }

    const key = token.slice(2);
    if (["help", "force", "dry-run", "dryRun", "verbose-errors", "verboseErrors"].includes(key)) {
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
  npm run short-drama:transcribe-groq -- --case ./short-drama-cases/demo/episode_001

Environment:
  GROQ_API_KEY  Required unless --api-key is passed. You can also place it in .env.local.

Options:
  --case             Required. Existing short-drama case folder.
  --manifest         Optional. Audio segment manifest. Defaults to audio_segments/manifest.json.
  --out              Optional. Raw ASR output folder. Defaults to asr/groq inside the case.
  --model            Optional. Defaults to whisper-large-v3-turbo.
  --language         Optional. Defaults to zh.
  --only             Optional. Comma-separated scene ids, for example vscene_002,vscene_004.
  --force            Optional. Re-transcribe existing segment outputs.
  --dry-run          Optional. Print the transcription plan without calling Groq.
  --verbose-errors   Optional. Print redacted provider error payloads.
  --max-bytes        Optional. Per-file size guard. Defaults to 20MB.
`);
}
