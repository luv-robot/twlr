# Short Drama Reverse Breakdown Workflow

Version: v0.1

This document defines the first product workflow for training high-level short-drama expert agents through reverse breakdown of completed works.

The goal is not to build a film-review bot.

The goal is to build an industry peer-review workflow that can read a finished short-drama episode like a writer, director, editor, or producer: what each scene does, whether the conflict escalates, whether character motivation is sufficient, whether the hook supports the next episode, and what should be revised.

## 1. Product Position

This workflow is the reverse side of TWLR.

TWLR's forward workflow helps writers build and maintain their own creative projects.

The short-drama reverse workflow analyzes completed works and converts them into structured craft knowledge:

```text
Finished work
-> Script reconstruction
-> Scene / conflict / character / hook breakdown
-> Industry peer diagnosis
-> Human correction
-> Reusable expert knowledge
-> Better domain agents
```

The commercial starting point is short drama because it has:

- strong genre formulas
- high commercial value
- clear retention and payment pressure
- repeatable scene and episode structures
- obvious need for professional peer diagnosis

## 2. Core Principle

```text
Industry Peer Review, not Film Criticism
```

The agent must avoid critic-style output such as:

- "the theme is not deep enough"
- "the image language is poetic"
- "the emotional atmosphere is subtle"
- "the work lacks artistic expression"

The agent should instead speak like a working writer, director, editor, or producer:

- What narrative function does this scene carry?
- Does the conflict escalate?
- Is the character motivation enough?
- Is the payoff properly planted?
- Is the misunderstanding too mechanical?
- Can scenes be merged?
- Is dialogue repeating information?
- Is the cliffhanger strong enough to support the next episode?
- What should be kept, cut, moved earlier, delayed, merged, or strengthened?

Every useful judgment should point toward revision, production, retention, payment conversion, or craft learning.

## 3. P0 Workflow

The simplest useful workflow is:

```text
Online video URL / local video
-> Get video or subtitles
-> Transcribe dialogue
-> Extract keyframes / visual scene information
-> LLM reconstructs script material
-> LLM performs director-side peer analysis
-> Human corrects character names, scene boundaries, key judgments
-> Generate standardized diagnosis report
```

P0 should process one episode at a time.

P0 should not attempt full automation where the underlying task is still unreliable. Use existing tools and a small amount of glue code first.

## 4. P0 Non-Goals

Do not build these in P0:

- automatic full-series knowledge graph
- fully automatic actor / role identification
- fully automatic scene segmentation
- open-ended action recognition
- fine-tuned model training
- all-in-one video platform
- real-time collaborative review
- market-data prediction engine
- film-critic style scoring

The P0 goal is a repeatable pipeline that turns one episode into a correctable, reusable, director-side diagnosis report.

## 5. Recommended Tooling

Use mature tools wherever possible.

| Task | P0 Tool Choice |
|---|---|
| Video download | `yt-dlp` when legally and technically allowed |
| Video/audio processing | `ffmpeg` |
| Subtitle extraction | embedded subtitles / platform subtitles when available |
| ASR | Whisper, OpenAI transcription, Deepgram, or equivalent |
| Keyframe extraction | `ffmpeg` fixed interval and scene-change extraction |
| Video understanding | Gemini video input when available |
| Image understanding | Gemini / ChatGPT / Claude multimodal input |
| LLM analysis | remote LLM API |
| Human correction | Markdown / JSON files first |
| Report generation | Markdown template |

The implementation principle:

```text
Use tools for hard media tasks.
Use glue code for orchestration.
Use humans for correction.
Use LLMs for reconstruction and analysis.
```

## 6. Visual Context Layer

The report must not become a dialogue summary.

Short drama depends heavily on staging, props, posture, visual power relation, emotional display, and action beats. P0 needs a low-cost visual context layer.

### Path A: Keyframes + Multimodal Model

Extract frames:

- every 10-20 seconds
- plus obvious shot-change moments if feasible
- with timestamp attached to every frame

Then ask a multimodal model to output structured visual information:

```text
timecode
location
characters_visible
body_position
obvious_action
props
emotional_state
shot_type
power_relation
scene_function_hint
```

Visual analysis should provide evidence, not final interpretation.

Good:

```text
00:42. Male lead stands near the door while female lead sits. The door position gives him spatial control.
```

Bad:

```text
The scene feels oppressive and artistic.
```

### Path B: Direct Video Input

When video length, file size, and provider support allow it, upload the clip or episode segment directly to Gemini or another video-capable model.

Ask it to output:

- timestamped scene descriptions
- visible character relationship changes
- obvious action beats
- emotional shifts
- props and staging notes
- possible scene-function hints

The output should still be normalized into the same `visual_context.json` format.

## 7. Core Data Artifacts

Each processed episode should produce a local case folder.

Example:

```text
short-drama-cases/
└── series_slug/
    └── episode_001/
        ├── source_metadata.json
        ├── transcript_raw.json
        ├── transcript_clean.md
        ├── keyframes/
        │   ├── 00-00-10.jpg
        │   └── 00-00-20.jpg
        ├── visual_context.json
        ├── reconstructed_script.json
        ├── human_corrections.json
        ├── director_diagnosis_report.md
        └── case_notes.md
```

### `source_metadata.json`

```json
{
  "series_title": "",
  "episode_number": 1,
  "source_type": "online_url",
  "source_url": "",
  "local_video_path": "",
  "duration_seconds": 0,
  "language": "zh-CN",
  "created_at": ""
}
```

### `reconstructed_script.json`

```json
{
  "series_title": "",
  "episode_number": 1,
  "characters": [],
  "scenes": [
    {
      "scene_id": "s001",
      "start_time": "00:00",
      "end_time": "00:45",
      "location": "",
      "characters": [],
      "dramatic_function": "",
      "conflict": {
        "who_wants_what": "",
        "who_blocks": "",
        "stakes": "",
        "escalation": "",
        "result_changes_situation": true
      },
      "dialogue": [],
      "action_beats": [],
      "visual_evidence": [],
      "turning_point": "",
      "issues": []
    }
  ],
  "episode_hook": "",
  "episode_cliffhanger": "",
  "open_questions": []
}
```

### `human_corrections.json`

Human correction is required before final report generation.

```json
{
  "character_name_map": {
    "speaker_1": "角色名"
  },
  "scene_boundary_edits": [],
  "wrong_judgments": [],
  "confirmed_key_judgments": [],
  "notes": ""
}
```

## 8. Ten-Dimension Peer Review Framework

The analysis framework has 10 dimensions.

### 1. Genre Positioning

Examples:

- sweet romance
- revenge
- CEO romance
- underdog reversal
- suspense
- family ethics
- historical power struggle
- campus
- urban workplace

Judgments:

- Is the genre promise clear?
- Does the opening enter the genre quickly?
- Does the core payoff match the target audience?

### 2. Narrative Drive

Drivers may include:

- external goal
- misunderstanding
- secret
- revenge
- desire
- crisis
- countdown
- identity gap

Judgments:

- Why does the audience continue watching?
- Where does the next-scene drive come from?

### 3. Conflict Structure

Each scene should identify:

- who wants what
- who blocks it
- what the stakes are
- whether conflict escalates
- whether the result changes the situation

### 4. Character Relationship Tension

Focus on:

- power gap
- emotional debt
- secret
- misunderstanding
- interest binding
- betrayal
- dependence
- humiliation and counterattack

### 5. Information Release

Judgments:

- Is a secret exposed too early?
- Does the audience know more than the character?
- Is the misunderstanding maintained by forced silence?
- Does the reversal have setup?

### 6. Rhythm

Timeline checks:

- how many seconds before core conflict starts
- how often a turn occurs
- whether dialogue sections are too long
- whether scenes repeat the same emotion
- whether hook distance is too long

Short-drama-specific checks:

- first 5-second hook
- first 30-second conflict
- emotional peak every 60-90 seconds
- episode-ending cliffhanger

### 7. Dialogue Function

Classify dialogue into:

- plot advancement
- character revelation
- conflict generation
- repeated explanation

Peer diagnosis should identify:

- which lines only explain information
- which lines lack subtext
- which lines should become action
- which lines carry too much exposition

### 8. Staging and Action

Analyze:

- whether spatial relation serves power relation
- whether action replaces dialogue
- whether props carry narrative function
- whether conflict is only static arguing

### 9. Commercial Completion

This is not artistic judgment.

Analyze:

- whether target users are clear
- whether emotional reward is sufficient
- whether payoff density is enough
- whether payment / follow-up motivation is strong
- whether there are enough cuttable viral moments

### 10. Revision Suggestions

Output must include:

- what to keep
- what to cut
- what to move earlier
- what to delay
- what to merge
- what to strengthen

## 9. Standard Report Template

Every final report should follow this template.

```markdown
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
```

## 10. Known Implementation Difficulties

### Difficulty 1: Character Name Recognition

ASR knows speakers, not character names.

P0 solution:

- extract names from subtitles and forms of address
- use title intro / synopsis / cast list when available
- use face clustering only if cheap and available
- let LLM infer relationship names from dialogue
- require human confirmation once, then reuse across the series

### Difficulty 2: Scene Segmentation

Shot segmentation is too fine. Coarse story chunks are too broad.

P0 solution:

- combine shot changes
- dialogue topic shifts
- location recognition
- character-combination changes
- emotional and conflict turns

Do not rely on visuals alone.

### Difficulty 3: Action Recognition

Open-ended action recognition is unreliable.

P0 solution:

- describe keyframes first
- classify into a limited dramatic action tag set
- avoid infinite free-form action recognition

Example action tags:

```text
enter
exit
block_path
reveal_object
hide_object
grab
push_away
kneel
slap
turn_away
watch_silently
threaten
protect
humiliate
counterattack
```

### Difficulty 4: LLM Drifts Into Film Criticism

P0 solution:

- fixed review dimensions
- scene-level evidence required
- no theme impressions unless tied to genre or commercial effect
- required revision suggestions
- required `dramatic_function` field

Invalid output:

```text
The scene has a tense atmosphere.
```

Valid output:

```text
00:34-01:02. The scene repeats the same accusation without adding new stakes. Merge this exchange with the later confrontation, or add a concrete threat before the male lead exits.
```

### Difficulty 5: Long Context

Do not put the entire episode into one prompt.

P0 solution:

```text
shot / subtitle segment
-> scene
-> act / episode section
-> whole episode
```

Use hierarchical summarization:

- segment summary
- scene reconstruction
- scene diagnosis
- episode diagnosis
- final report

## 11. Agent Training Implication

In P0, do not fine-tune first.

Build expert knowledge assets first:

```text
diagnosed cases
corrected reconstructed scripts
scene-function labels
conflict labels
dialogue-function labels
revision suggestions
scored reports
human corrections
```

These assets later support:

- retrieval-augmented short-drama agents
- evaluation datasets
- supervised fine-tuning if enough rights-cleared data exists
- preference data for "good peer diagnosis" vs "film-critic drift"

The first training target is not "write a short drama."

The first training target is:

```text
Read a short-drama episode like an experienced peer.
Diagnose it with evidence.
Recommend revisions.
```

## 12. First Expert Agents

The first agent set should be official and restrained.

### Short Drama Development Editor

Focus:

- episode structure
- scene function
- conflict escalation
- payoff placement
- scene merge / delete suggestions

### Hook and Retention Analyst

Focus:

- first 5 seconds
- first 30 seconds
- turn frequency
- cliffhanger
- payment / follow-up motivation

### Character Relationship Analyst

Focus:

- motivation
- power gap
- dependency
- humiliation and counterattack
- relationship reversal

### Dialogue Efficiency Editor

Focus:

- repeated information
- exposition overload
- lack of subtext
- lines that should become actions

### Commercial Completion Analyst

Focus:

- target audience fit
- payoff density
- shareable moments
- genre promise
- platform risk when relevant

## 13. Human Correction Gate

Human correction is not optional.

Before a report becomes a reusable training asset, a human should confirm:

- character names
- important relationship labels
- scene boundaries
- major scene functions
- major conflict diagnosis
- obviously wrong visual interpretation
- final revision priorities

The product should make correction lightweight.

P0 correction can be a simple JSON or Markdown review file. UI can come later.

## 14. Quality Bar

A report is considered useful only if it has:

- scene-level evidence
- timecodes where possible
- concrete conflict analysis
- character motivation checks
- dialogue function diagnosis
- hook and rhythm analysis
- revision suggestions
- no free-floating film criticism

Minimum acceptable report:

```text
At least 5 scene rows.
At least 3 dialogue diagnosis rows.
At least 3 revision suggestions.
At least one hook or cliffhanger judgment.
At least one human correction pass.
```

## 15. P0 Implementation Plan

### Step 1: Case Folder Generator

Create a script that initializes:

```text
source_metadata.json
transcript_raw.json
visual_context.json
reconstructed_script.json
human_corrections.json
director_diagnosis_report.md
```

### Step 2: Media Ingestion

Support:

- local video path
- online URL if legally and technically allowed

Output:

- normalized local video
- extracted audio
- source metadata

### Step 3: Transcript Layer

Support:

- imported subtitle file
- ASR-generated transcript

Output:

- raw transcript with timestamps
- cleaned dialogue transcript

### Step 4: Visual Context Layer

Support:

- fixed-interval keyframes
- optional scene-change keyframes
- multimodal frame descriptions

Output:

- `visual_context.json`

### Step 5: Script Reconstruction

LLM combines:

- transcript
- visual context
- metadata
- optional synopsis / cast info

Output:

- `reconstructed_script.json`

### Step 6: Human Correction

User corrects:

- character names
- scene boundaries
- wrong assumptions
- key diagnosis notes

Output:

- `human_corrections.json`

### Step 7: Peer Diagnosis Report

LLM generates:

- standardized Markdown report
- fixed 10-dimension framework
- evidence-based revision suggestions

Output:

- `director_diagnosis_report.md`

### Step 8: Case Indexing

Store the processed case as expert knowledge material.

Output:

- searchable metadata
- genre labels
- scene-function labels
- diagnosis labels
- quality status

## 16. Open Questions

- Which video sources are legally acceptable for internal analysis?
- Should the first P0 support only local video to reduce platform risk?
- Which multimodal provider should be used first for keyframe interpretation?
- Should correction happen in plain files first, or inside a small web UI?
- What is the minimum number of diagnosed episodes needed before agents become visibly stronger than general models?
- Should reports be in Chinese first, bilingual later, or language-matched to source content?

