#!/usr/bin/env node

import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

loadEnvFile(".env.local");
loadEnvFile(".env");

const args = parseArgs(process.argv.slice(2));

if (args.help) {
  printHelp();
  process.exit(0);
}

const apiKey = String(args.apiKey ?? args["api-key"] ?? process.env.GROQ_API_KEY ?? "");
const baseUrl = String(args.baseUrl ?? args["base-url"] ?? "https://api.groq.com/openai/v1");
const targetModel = String(args.model ?? process.env.GROQ_ASR_MODEL ?? "whisper-large-v3-turbo");

if (!apiKey) {
  throw new Error("GROQ_API_KEY is not set. Put it in .env.local or pass --api-key.");
}

console.log(`Checking Groq API access for model=${targetModel}`);

const response = await fetch(`${baseUrl}/models`, {
  headers: {
    Authorization: `Bearer ${apiKey}`,
  },
});

const responseText = await response.text();
let payload;
try {
  payload = responseText ? JSON.parse(responseText) : {};
} catch {
  payload = { raw: responseText };
}

if (!response.ok) {
  const message = payload?.error?.message ?? payload?.message ?? responseText;
  console.log(`Groq /models check failed: ${response.status} ${response.statusText}`);
  console.log(`Reason: ${message}`);
  if (response.status === 403) {
    console.log("");
    console.log("403 troubleshooting:");
    console.log("1. Confirm the API key was created under the same Groq project currently selected in the console.");
    console.log("2. Check Project Settings / Limits / Model Permissions and enable the target Whisper model if needed.");
    console.log("3. If you are behind a regional or corporate network, test again through a terminal proxy.");
    console.log("4. If the Playground works but API still fails, regenerate the key in API Keys and replace GROQ_API_KEY in .env.local.");
  }
  process.exit(1);
}

const models = Array.isArray(payload.data) ? payload.data : [];
const modelIds = models.map((model) => model.id).filter(Boolean).sort();
const whisperModels = modelIds.filter((id) => id.includes("whisper"));

console.log(`Groq /models check succeeded. Available model count: ${modelIds.length}`);
console.log(`Whisper models visible to this key: ${whisperModels.length > 0 ? whisperModels.join(", ") : "(none)"}`);

if (modelIds.includes(targetModel)) {
  console.log(`Target model is visible: ${targetModel}`);
} else {
  console.log(`Target model is not visible to this key: ${targetModel}`);
  process.exit(2);
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
  npm run short-drama:check-groq

Environment:
  GROQ_API_KEY  Required. Read from .env.local by default.

Options:
  --model     Optional. Defaults to GROQ_ASR_MODEL or whisper-large-v3-turbo.
  --base-url  Optional. Defaults to https://api.groq.com/openai/v1.
`);
}
