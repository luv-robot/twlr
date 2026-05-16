#!/usr/bin/env node

import { copyFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { basename, join, resolve } from "node:path";

const args = parseArgs(process.argv.slice(2));

if (args.help || !args.case || !args.input || !args.kind) {
  printHelp();
  process.exit(args.help ? 0 : 1);
}

const caseDir = resolve(String(args.case));
const inputPath = resolve(String(args.input));
const kind = String(args.kind);
const force = Boolean(args.force);

const targets = {
  "visual-context": {
    fileName: "visual_context.json",
    type: "json",
    requiredKeys: ["series_title", "episode_number", "frames", "scene_level_notes"],
  },
  "reconstructed-script": {
    fileName: "reconstructed_script.json",
    type: "json",
    requiredKeys: ["series_title", "episode_number", "characters", "scenes"],
  },
  "visual-only-report": {
    fileName: "visual_only_observation_report.md",
    type: "markdown",
    requiredHeadings: ["## 1. 一句话判断", "## 2. 视觉场景地图", "## 7. 下一步建议"],
  },
  "diagnosis-report": {
    fileName: "director_diagnosis_report.md",
    type: "markdown",
    requiredHeadings: ["## 1. 一句话判断", "## 4. 场景功能表", "## 9. 修订建议", "## 10. 评分"],
  },
};

if (!existsSync(caseDir)) {
  throw new Error(`Case folder does not exist: ${caseDir}`);
}

if (!existsSync(inputPath)) {
  throw new Error(`Input file does not exist: ${inputPath}`);
}

const target = targets[kind];
if (!target) {
  throw new Error(`Unsupported --kind: ${kind}. Use one of: ${Object.keys(targets).join(", ")}.`);
}

const rawInput = readFileSync(inputPath, "utf8");
const normalizedContent =
  target.type === "json" ? `${JSON.stringify(parseJsonOutput(rawInput, target.requiredKeys), null, 2)}\n` : parseMarkdownOutput(rawInput, target.requiredHeadings);

const targetPath = join(caseDir, target.fileName);
const backupPath = join(caseDir, "backups", `${target.fileName}.${new Date().toISOString().replace(/[:.]/g, "-")}.bak`);

if (existsSync(targetPath)) {
  mkdirSync(join(caseDir, "backups"), { recursive: true });
  copyFileSync(targetPath, backupPath);
}

if (existsSync(targetPath) && !force && isNonTemplateFile(targetPath, target.type)) {
  throw new Error(`${target.fileName} already has content. Re-run with --force to replace it. Backup prepared at: ${backupPath}`);
}

writeFileSync(targetPath, normalizedContent, "utf8");

console.log(`Applied ${kind} output from ${basename(inputPath)}.`);
console.log(`Updated ${targetPath}`);
if (existsSync(backupPath)) {
  console.log(`Backup: ${backupPath}`);
}

function parseJsonOutput(raw, requiredKeys) {
  const jsonText = extractJson(raw);
  const value = JSON.parse(jsonText);
  const missingKeys = requiredKeys.filter((key) => !(key in value));

  if (missingKeys.length > 0) {
    throw new Error(`JSON output missing required key(s): ${missingKeys.join(", ")}.`);
  }

  return value;
}

function parseMarkdownOutput(raw, requiredHeadings) {
  const markdown = stripMarkdownFence(raw).trim();
  const missingHeadings = requiredHeadings.filter((heading) => !markdown.includes(heading));

  if (missingHeadings.length > 0) {
    throw new Error(`Markdown output missing required heading(s): ${missingHeadings.join(", ")}.`);
  }

  return `${markdown}\n`;
}

function extractJson(raw) {
  const fenced = raw.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fenced) {
    return fenced[1].trim();
  }

  return raw.trim();
}

function stripMarkdownFence(raw) {
  const fenced = raw.match(/```(?:markdown|md)?\s*([\s\S]*?)```/i);
  if (fenced) {
    return fenced[1];
  }

  return raw;
}

function isNonTemplateFile(filePath, type) {
  const content = readFileSync(filePath, "utf8").trim();

  if (type === "json") {
    try {
      const parsed = JSON.parse(content);
      if (Array.isArray(parsed.frames) && parsed.frames.length === 0) {
        return false;
      }
      if (Array.isArray(parsed.scenes) && parsed.scenes.length === 0) {
        return false;
      }
    } catch {
      return true;
    }
    return content.length > 0;
  }

  return content.length > 0 && !content.includes("## 1. 一句话判断\n\n##");
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
  npm run short-drama:apply-output -- --case ./short-drama-cases/demo/episode_001 --kind visual-context --input ./visual_context_from_model.json --force

Kinds:
  visual-context
  reconstructed-script
  visual-only-report
  diagnosis-report

Options:
  --case   Required. Existing short-drama case folder.
  --kind   Required. Output kind.
  --input  Required. JSON or Markdown file returned by a model.
  --force  Optional. Replace an existing populated target file.
`);
}
