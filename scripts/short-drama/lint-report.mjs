#!/usr/bin/env node

import { existsSync, readFileSync } from "node:fs";
import { join, resolve } from "node:path";

const args = parseArgs(process.argv.slice(2));

if (args.help || !args.case) {
  printHelp();
  process.exit(args.help ? 0 : 1);
}

const caseDir = resolve(String(args.case));
const kind = String(args.kind ?? "diagnosis");
const strict = Boolean(args.strict);
const reportFileName = kind === "visual-only" ? "visual_only_observation_report.md" : "director_diagnosis_report.md";
const reportPath = join(caseDir, reportFileName);
const findings = [];

if (!existsSync(reportPath)) {
  throw new Error(`Report does not exist: ${reportPath}`);
}

const report = readFileSync(reportPath, "utf8");

checkRequiredHeadings();
checkFilmCriticDrift();
checkEvidenceDensity();
checkRevisionLanguage();
checkUncertaintyForVisualOnly();

for (const finding of findings) {
  console.log(`${finding.level.toUpperCase()}: ${finding.message}`);
}

if (findings.length === 0) {
  console.log("PASS: Report lint found no issues.");
}

const hasFailure = findings.some((finding) => finding.level === "fail");
const hasWarning = findings.some((finding) => finding.level === "warn");

if (hasFailure || (strict && hasWarning)) {
  process.exit(1);
}

function checkRequiredHeadings() {
  const requiredHeadings =
    kind === "visual-only"
      ? ["## 1. 一句话判断", "## 2. 视觉场景地图", "## 6. 必须等待对白确认的问题", "## 7. 下一步建议"]
      : ["## 1. 一句话判断", "## 4. 场景功能表", "## 6. 主要对白诊断", "## 9. 修订建议", "## 10. 评分"];
  const missing = requiredHeadings.filter((heading) => !report.includes(heading));

  if (missing.length > 0) {
    fail(`Missing required heading(s): ${missing.join(", ")}`);
  }
}

function checkFilmCriticDrift() {
  const driftTerms = [
    "镜头语言",
    "影像风格",
    "美学",
    "诗意",
    "艺术表达",
    "主题深度",
    "氛围感",
    "电影感",
    "高级感",
    "审美",
  ];
  const foundTerms = driftTerms.filter((term) => report.includes(term));

  if (foundTerms.length > 0) {
    warn(`Possible film-critic drift term(s): ${foundTerms.join(", ")}`);
  }
}

function checkEvidenceDensity() {
  const timecodeMatches = report.match(/\b\d{2}:\d{2}(?::\d{2})?\b/g) ?? [];
  const tableRows = report.split("\n").filter((line) => line.trim().startsWith("|") && !line.includes("---")).length;

  if (timecodeMatches.length < 2 && tableRows < 4) {
    warn("Low scene/time evidence density. Add time ranges or scene table rows.");
  }
}

function checkRevisionLanguage() {
  const revisionTerms = ["保留", "删", "提前", "延后", "合并", "强化", "修改", "补", "确认", "不进入正式报告"];
  const found = revisionTerms.filter((term) => report.includes(term));

  if (found.length < 2) {
    warn("Report has weak revision language. Add keep/cut/move/merge/strengthen/confirm suggestions.");
  }
}

function checkUncertaintyForVisualOnly() {
  if (kind !== "visual-only") {
    return;
  }

  const uncertaintyTerms = ["待确认", "需对白确认", "必须等待对白", "不确定", "暂不进入正式报告"];
  const found = uncertaintyTerms.filter((term) => report.includes(term));

  if (found.length < 2) {
    warn("Visual-only report should explicitly mark uncertainty and dialogue-confirmation needs.");
  }
}

function warn(message) {
  findings.push({ level: "warn", message });
}

function fail(message) {
  findings.push({ level: "fail", message });
}

function parseArgs(argv) {
  const result = {};

  for (let index = 0; index < argv.length; index += 1) {
    const token = argv[index];
    if (!token.startsWith("--")) {
      continue;
    }

    const key = token.slice(2);
    if (key === "help" || key === "strict") {
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
  npm run short-drama:lint-report -- --case ./short-drama-cases/demo/episode_001 --kind visual-only
  npm run short-drama:lint-report -- --case ./short-drama-cases/demo/episode_001 --kind diagnosis

Options:
  --case    Required. Existing short-drama case folder.
  --kind    Optional. visual-only or diagnosis. Defaults to diagnosis.
  --strict  Optional. Exit with failure when warnings are present.
`);
}
