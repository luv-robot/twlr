#!/usr/bin/env node

import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";

const args = parseArgs(process.argv.slice(2));

if (args.help || !args.case || !args.kind) {
  printHelp();
  process.exit(args.help ? 0 : 1);
}

const caseDir = resolve(String(args.case));
const kind = String(args.kind);

if (!["reconstruction", "diagnosis"].includes(kind)) {
  throw new Error("--kind must be reconstruction or diagnosis.");
}

if (!existsSync(caseDir)) {
  throw new Error(`Case folder does not exist: ${caseDir}`);
}

const prompt = kind === "reconstruction" ? buildReconstructionPrompt(caseDir) : buildDiagnosisPrompt(caseDir);
const defaultOut = join(caseDir, "prompts", `${kind}_prompt.md`);
const outPath = args.out ? resolve(String(args.out)) : defaultOut;

mkdirSync(dirname(outPath), { recursive: true });
writeFileSync(outPath, prompt, "utf8");

console.log(`Wrote ${kind} prompt: ${outPath}`);

function buildReconstructionPrompt(caseDirPath) {
  const metadata = readJson(join(caseDirPath, "source_metadata.json"));
  const transcript = readJson(join(caseDirPath, "transcript_raw.json"));
  const visualContext = readJson(join(caseDirPath, "visual_context.json"));
  const corrections = readJson(join(caseDirPath, "human_corrections.json"));

  return `# Short Drama Script Reconstruction Prompt

You are not a film critic.
You are reconstructing usable script material for a short-drama writer/director review workflow.

## Task

Reconstruct the episode into structured script material.

Focus on:

- scene boundaries
- character cards
- scene function
- conflict structure
- action beats
- dialogue segment references
- visual evidence references
- episode hook
- episode cliffhanger
- open questions that need human correction

Do not write a diagnosis report yet.
Do not praise the work.
Do not discuss theme, artistry, or cinematography unless it directly affects scene function.

## Output Rules

Return JSON only.
Match this shape:

\`\`\`json
{
  "series_title": "",
  "episode_number": 1,
  "genre_tags": [],
  "target_audience": null,
  "characters": [
    {
      "character_id": "char_001",
      "name": "",
      "aliases": [],
      "role_function": null,
      "episode_goal": null,
      "obstacle": null,
      "key_action": null,
      "relationship_tension": null,
      "issues": []
    }
  ],
  "scenes": [
    {
      "scene_id": "s001",
      "start_time": "00:00:00",
      "end_time": "00:00:30",
      "location": null,
      "characters": [],
      "dramatic_function": null,
      "conflict": {
        "who_wants_what": null,
        "who_blocks": null,
        "stakes": null,
        "escalation": null,
        "result_changes_situation": null
      },
      "dialogue_segment_ids": [],
      "action_beats": [],
      "visual_evidence_frame_ids": [],
      "turning_point": null,
      "issues": []
    }
  ],
  "episode_hook": null,
  "episode_cliffhanger": null,
  "open_questions": []
}
\`\`\`

## Scene Boundary Rules

Use a combination of:

- subtitle / dialogue topic shifts
- location changes
- character combination changes
- visible action or staging changes
- conflict turns

Do not split every shot into a scene.
Do not merge distinct conflicts into one scene just because location stays the same.

## Source Metadata

\`\`\`json
${JSON.stringify(metadata, null, 2)}
\`\`\`

## Transcript

\`\`\`json
${JSON.stringify(transcript, null, 2)}
\`\`\`

## Visual Context

\`\`\`json
${JSON.stringify(visualContext, null, 2)}
\`\`\`

## Human Corrections

\`\`\`json
${JSON.stringify(corrections, null, 2)}
\`\`\`
`;
}

function buildDiagnosisPrompt(caseDirPath) {
  const metadata = readJson(join(caseDirPath, "source_metadata.json"));
  const transcript = readJson(join(caseDirPath, "transcript_raw.json"));
  const visualContext = readJson(join(caseDirPath, "visual_context.json"));
  const reconstructedScript = readJson(join(caseDirPath, "reconstructed_script.json"));
  const corrections = readJson(join(caseDirPath, "human_corrections.json"));

  return `# Short Drama Director-Side Diagnosis Prompt

You are not a film critic.
You are a short-drama writer/director peer reviewer.

## Core Rule

Every judgment must point toward script revision, production efficiency, retention, payment motivation, or commercial completion.

Avoid:

- theme impressions
- vague praise
- film-review language
- aesthetic commentary without revision value

Require:

- scene-level evidence
- timecodes where possible
- dialogue-function diagnosis
- hook / rhythm analysis
- concrete revision suggestions

## Output Format

Return Markdown using exactly this structure:

\`\`\`markdown
# 《剧名》第 X 集 编导向剧本诊断报告

## 1. 一句话判断
本集的核心功能是什么？完成度如何？

## 2. 类型与目标观众判断
- 类型定位：
- 目标观众：
- 类型承诺：
- 当前完成度：

## 3. 故事概要
简述本集主线和关键转折。

## 4. 场景功能表
| 场次 | 时间 | 地点 | 人物 | 戏剧功能 | 冲突 | 转折 | 问题 |
|---|---|---|---|---|---|---|---|

## 5. 人物卡与关系张力
### 角色 A
- 本集目标：
- 阻碍：
- 关键动作：
- 人物弧线：
- 问题：

## 6. 主要对白诊断
| 时间 | 台词 | 功能 | 问题 | 修改方向 |
|---|---|---|---|---|

## 7. 节奏与钩子分析
- 开场钩子：
- 第一次冲突出现时间：
- 情绪峰值：
- 集尾钩子：
- 节奏问题：

## 8. 编导同行评价
### 优点
### 问题
### 风险
### 可改方向

## 9. 修订建议
- 必改：
- 可改：
- 不建议改：

## 10. 评分
- 类型完成度：
- 冲突强度：
- 人物动机：
- 对白效率：
- 节奏：
- 追更动力：
- 商业化潜力：
\`\`\`

## Ten-Dimension Review Lens

1. Genre positioning
2. Narrative drive
3. Conflict structure
4. Character relationship tension
5. Information release
6. Rhythm
7. Dialogue function
8. Staging and action
9. Commercial completion
10. Revision suggestions

## Source Metadata

\`\`\`json
${JSON.stringify(metadata, null, 2)}
\`\`\`

## Reconstructed Script

\`\`\`json
${JSON.stringify(reconstructedScript, null, 2)}
\`\`\`

## Transcript Evidence

\`\`\`json
${JSON.stringify(transcript, null, 2)}
\`\`\`

## Visual Evidence

\`\`\`json
${JSON.stringify(visualContext, null, 2)}
\`\`\`

## Human Corrections

\`\`\`json
${JSON.stringify(corrections, null, 2)}
\`\`\`
`;
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
  npm run short-drama:build-prompt -- --case ./short-drama-cases/demo/episode_001 --kind reconstruction
  npm run short-drama:build-prompt -- --case ./short-drama-cases/demo/episode_001 --kind diagnosis

Options:
  --case  Required. Existing short-drama case folder.
  --kind  Required. reconstruction or diagnosis.
  --out   Optional. Output markdown path. Defaults to ./prompts/{kind}_prompt.md inside the case.
`);
}
