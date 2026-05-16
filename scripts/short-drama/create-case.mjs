#!/usr/bin/env node

import { mkdirSync, writeFileSync, existsSync } from "node:fs";
import { resolve, join } from "node:path";

const args = parseArgs(process.argv.slice(2));

if (args.help || !args.title || !args.episode) {
  printHelp();
  process.exit(args.help ? 0 : 1);
}

const title = String(args.title);
const episodeNumber = Number(args.episode);

if (!Number.isInteger(episodeNumber) || episodeNumber < 1) {
  throw new Error("--episode must be a positive integer.");
}

const seriesSlug = args["series-slug"] ? String(args["series-slug"]) : slugify(title);
const outRoot = resolve(String(args.out ?? "short-drama-cases"));
const episodeSlug = `episode_${String(episodeNumber).padStart(3, "0")}`;
const caseDir = join(outRoot, seriesSlug, episodeSlug);
const now = new Date().toISOString();
const sourceUrl = args["source-url"] ? String(args["source-url"]) : null;
const localVideoPath = args.video ? String(args.video) : null;
const sourceType = localVideoPath ? "local_video" : sourceUrl ? "online_url" : "manual";
const language = String(args.language ?? "zh-CN");
const force = Boolean(args.force);

if (existsSync(caseDir) && !force) {
  throw new Error(`Case folder already exists: ${caseDir}. Re-run with --force to overwrite template files.`);
}

mkdirSync(join(caseDir, "keyframes"), { recursive: true });

writeJson(
  join(caseDir, "source_metadata.json"),
  {
    series_title: title,
    episode_number: episodeNumber,
    source_type: sourceType,
    source_url: sourceUrl,
    local_video_path: localVideoPath,
    duration_seconds: null,
    language,
    created_at: now,
  },
  force,
);

writeJson(
  join(caseDir, "transcript_raw.json"),
  {
    series_title: title,
    episode_number: episodeNumber,
    language,
    segments: [],
  },
  force,
);

writeText(
  join(caseDir, "transcript_clean.md"),
  `# ${title} Episode ${episodeNumber} Clean Transcript

Use this file for corrected dialogue after subtitle import or ASR.

| Time | Speaker | Dialogue |
|---|---|---|
`,
  force,
);

writeText(join(caseDir, "keyframes", ".gitkeep"), "", force);

writeJson(
  join(caseDir, "visual_context.json"),
  {
    series_title: title,
    episode_number: episodeNumber,
    frames: [],
    scene_level_notes: [],
  },
  force,
);

writeJson(
  join(caseDir, "reconstructed_script.json"),
  {
    series_title: title,
    episode_number: episodeNumber,
    genre_tags: [],
    target_audience: null,
    characters: [],
    scenes: [],
    episode_hook: null,
    episode_cliffhanger: null,
    open_questions: [],
  },
  force,
);

writeJson(
  join(caseDir, "human_corrections.json"),
  {
    character_name_map: {},
    scene_boundary_edits: [],
    wrong_judgments: [],
    confirmed_key_judgments: [],
    notes: "",
  },
  force,
);

writeText(
  join(caseDir, "visual_only_observation_report.md"),
  `# 《${title}》第 ${episodeNumber} 集 无对白视觉观察报告

## 1. 一句话判断

## 2. 视觉场景地图
| 段落 | 时间 | 视觉地点 | 可见人物/关系 | 可见动作 | 可能戏剧功能 | 需对白确认 |
|---|---|---|---|---|---|---|

## 3. 权力关系与冲突升级
- 可见权力差：
- 可见冲突升级：
- 可见反击 / 压制 / 震慑：
- 不确定项：

## 4. 场面调度与动作
- 动作是否替代对白：
- 是否存在站桩争吵风险：
- 道具 / 空间是否承担叙事功能：
- 可保留的画面信息：

## 5. 短剧商业信号
- 类型信号：
- 爽点/反转信号：
- 追看信号：
- 可剪辑传播片段：

## 6. 必须等待对白确认的问题
- 人物名：
- 人物目标：
- 冲突筹码：
- 信息释放：
- 集尾钩子真实含义：

## 7. 下一步建议
- 先补哪几段对白：
- 哪些视觉段落优先做剧本重建：
- 哪些判断暂不进入正式报告：
`,
  force,
);

writeText(
  join(caseDir, "director_diagnosis_report.md"),
  `# 《${title}》第 ${episodeNumber} 集 编导向剧本诊断报告

## 1. 一句话判断

## 2. 类型与目标观众判断
- 类型定位：
- 目标观众：
- 类型承诺：
- 当前完成度：

## 3. 故事概要

## 4. 场景功能表
| 场次 | 时间 | 地点 | 人物 | 戏剧功能 | 冲突 | 转折 | 问题 |
|---|---|---|---|---|---|---|---|

## 5. 人物卡与关系张力

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
`,
  force,
);

writeText(
  join(caseDir, "case_notes.md"),
  `# ${title} Episode ${episodeNumber} Case Notes

## Source Rights / Usage Notes

## Human Correction Log

## Open Questions
`,
  force,
);

console.log(`Created short-drama case folder: ${caseDir}`);
console.log("Next steps:");
console.log("1. Add subtitles or ASR output to transcript_raw.json.");
console.log("2. Add keyframes and visual descriptions to visual_context.json.");
console.log("3. Reconstruct scenes into reconstructed_script.json.");
console.log("4. Correct names, scene boundaries, and key judgments in human_corrections.json.");
console.log("5. Generate director_diagnosis_report.md.");

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

function slugify(value) {
  return value
    .trim()
    .toLowerCase()
    .replace(/['"]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    || "untitled-series";
}

function writeJson(filePath, value, overwrite) {
  writeText(`${filePath}`, `${JSON.stringify(value, null, 2)}\n`, overwrite);
}

function writeText(filePath, value, overwrite) {
  if (existsSync(filePath) && !overwrite) {
    return;
  }

  writeFileSync(filePath, value, "utf8");
}

function printHelp() {
  console.log(`Usage:
  npm run short-drama:create-case -- --title "Drama Title" --episode 1

Options:
  --title          Required. Series title.
  --episode        Required. Episode number.
  --series-slug    Optional. Folder slug. Defaults to a title slug.
  --out            Optional. Output root. Defaults to short-drama-cases.
  --source-url     Optional. Online source URL.
  --video          Optional. Local video path.
  --language       Optional. Defaults to zh-CN.
  --force          Optional. Overwrite template files in an existing folder.
`);
}
