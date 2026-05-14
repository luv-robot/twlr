# TWLR MVP Architecture

This document describes the MVP architecture for The Writer's Living Room (TWLR).

It is based on the project thesis in `README.md` and the following product decisions:

- The MVP focuses on web novel, script, and light novel authors first.
- The MVP does not target serious literary long-form writers yet.
- Local-first means the author's creative assets are local-first.
- The MVP may use remote LLM APIs; users should not be expected to configure local LLMs.
- Markdown editing should stay simpler than a Feishu-style rich text editor.
- AI state changes must be shown as reviewable change cards.
- The Studio Coordinator is an always-present operations layer, not a creative agent or emotional companion.
- Writers' Room is a professional multi-perspective meeting workspace, not an autonomous agent group chat.
- Git details are only visible in developer/debug mode.

## MVP Product Positioning

TWLR MVP is a local-first creative workspace for high-volume narrative authors who need continuity, structure, and revision control.

The first target users are:

- web novel writers
- scriptwriters
- light novel writers
- worldbuilding-heavy genre writers
- IP developers working with long-running story material

The MVP should validate whether these users treat TWLR as a long-term creative room, not whether AI can generate publishable fiction by itself.

## Core MVP Thesis

The central product loop is:

```text
Manuscript
→ Context Projection
→ AI Structured Proposal
→ Human Confirmation
→ Narrative Event Log
→ Projected Story State
→ Rewrite / Snapshot Awareness
```

This loop is the main difference between TWLR and a normal chat-based writing assistant.

TWLR should help the author answer:

- What has already happened?
- What is currently true?
- What changed after this rewrite?
- What operational risks need attention before I continue?
- Which characters, chapters, open loops, and known story elements are affected?
- Which AI suggestions should become durable project state?

## MVP Non-Goals

The MVP should not include:

- custom user-created agents
- autonomous agent workflows
- one-click novel generation
- market dashboards
- cloud collaboration
- mobile companion app
- local LLM setup flows
- branch / merge Git UI
- complex semantic diff
- real-time multi-user editing
- advanced rich text editing

These are intentionally deferred to protect the core product shape.

## Architecture Overview

```text
TWLR Desktop App
├── React UI
│   ├── Manuscript Workspace
│   ├── Project Navigator
│   ├── Studio Coordinator Console
│   ├── State Panels
│   ├── Production Skills
│   ├── Writers' Room
│   └── Snapshot / Impact Views
├── TypeScript Application Services
│   ├── Project Service
│   ├── Manuscript Service
│   ├── Studio Coordinator Service
│   ├── State Service
│   ├── Proposal Service
│   ├── Context Projection Service
│   ├── Skill Service
│   ├── Writers' Room Service
│   └── Snapshot Service
├── TWLR Core Engine
│   ├── Project Model
│   ├── Narrative Event Log
│   ├── State Projection
│   ├── Rewrite Impact Lite
│   └── Schema Validation
├── AI Layer
│   ├── Remote LLM Provider Adapter
│   ├── Official Agent Definitions
│   ├── Production Skill Prompts
│   └── Structured Output Parser
├── Tauri Runtime
│   ├── Filesystem Commands
│   ├── SQLite Index Commands
│   └── Git Snapshot Commands
└── Local Project Folder
```

## Recommended Repository Layout

```text
twlr/
├── apps/
│   └── desktop/
│       ├── src/
│       ├── src-tauri/
│       └── package.json
├── packages/
│   ├── core/
│   │   ├── project/
│   │   ├── manuscript/
│   │   ├── events/
│   │   ├── state/
│   │   ├── proposals/
│   │   ├── context/
│   │   ├── impact/
│   │   └── snapshot/
│   ├── ai/
│   │   ├── providers/
│   │   ├── agents/
│   │   ├── skills/
│   │   ├── prompts/
│   │   └── parsers/
│   ├── schema/
│   └── ui/
├── docs/
├── examples/
│   └── demo-project/
└── README.md
```

## Local Project Layout

Each author project should remain a normal local folder.

```text
my-story/
├── manuscript/
│   ├── chapter-001.md
│   ├── chapter-002.md
│   └── chapter-003.md
├── state/
│   ├── work.json
│   ├── characters.json
│   ├── relationships.json
│   ├── timeline.json
│   ├── open_loops.json
│   ├── themes.json
│   └── world_rules.json
├── events/
│   └── narrative_events.jsonl
├── proposals/
│   └── state_proposals.jsonl
├── meetings/
│   └── room_meetings.jsonl
├── notes/
│   ├── ideas.md
│   └── research.md
├── assets/
│   └── .gitkeep
├── cache/
│   ├── twlr.sqlite
│   └── .gitkeep
├── .gitignore
└── twlr.project.json
```

### Source of Truth

The source of truth is:

1. `manuscript/*.md` for manuscript text
2. `events/narrative_events.jsonl` for durable story-state changes
3. `state/*.json` for current projected state
4. `twlr.project.json` for project metadata

SQLite is not the source of truth. It is only an index and cache.

## State Architecture

TWLR should separate durable state from AI suggestions.

```text
AI Observation
→ State Proposal
→ User Review
→ Accepted Narrative Event
→ Projected State Update
```

### Narrative Events

Narrative events are append-only records of story-state changes.

Example:

```json
{
  "event_id": "evt_00042",
  "type": "character_state_changed",
  "source": {
    "kind": "user_confirmed_ai_proposal",
    "proposal_id": "prop_00018"
  },
  "references": {
    "chapters": ["chapter-012"],
    "characters": ["char_shen_yao"],
    "open_loops": ["loop_hidden_identity"]
  },
  "payload": {
    "character_id": "char_shen_yao",
    "field": "current_status",
    "old_value": "hiding his real identity",
    "new_value": "female lead has partial suspicion but no proof"
  },
  "created_at": "2026-05-14T00:00:00.000Z"
}
```

### Projected State

Projected state is the current readable state used by the UI and context projection.

MVP state types:

- Work
- Chapter
- Scene, optional in P0
- Character
- Relationship
- Timeline Event
- Open Loop
- Theme
- World Rule

For MVP, projected state can be rebuilt from event logs and manuscript metadata when needed.

## Proposal Review Flow

The user should see AI-generated changes as simple cards.

Each card should answer:

- What changed?
- Why does TWLR think this changed?
- Which chapters are involved?
- Which known elements are affected?
- What will be updated if accepted?

Example card:

```text
Character State Update

Character: Shen Yao
Detected in: Chapter 12
Affected known elements: 1 character, 2 chapters, 1 open loop

Proposed change:
The female lead now suspects Shen Yao's hidden identity, but has no proof.

Actions:
Accept / Edit / Reject
```

The MVP should avoid exposing terms like event sourcing, projection, or graph mutation to normal users.

## Rewrite Impact Lite

Narrative Diff v1 is deferred to P1, but P0 should include Rewrite Impact Lite.

Rewrite Impact Lite should show:

- changed chapters since the last snapshot
- affected character count
- affected open loop count
- affected timeline item count
- affected known element list
- suggested review areas

It should not attempt deep semantic truth reconciliation in P0.

Example:

```text
This rewrite may affect:

- 2 chapters
- 3 known characters
- 1 unresolved open loop
- 2 timeline entries

Suggested review:
- Character motivation for Shen Yao
- Hidden identity open loop
- Chapter 18 misunderstanding setup
```

## Context Projection

TWLR should never dump the full manuscript into the LLM by default.

For each task, the Context Projection Service builds a small task-specific packet:

```text
Task Request
→ Selected manuscript range
→ Related state records
→ Related narrative events
→ Recent changes
→ Relevant open loops
→ Output schema
→ LLM request
```

MVP retrieval can use:

- explicit user selection
- current chapter
- chapter metadata
- known entity references
- SQLite FTS search
- simple relationship references

Vector retrieval can wait.

## AI Architecture

The MVP can rely on remote LLM APIs.

The local-first guarantee is about author data ownership and project portability:

- manuscript files are local
- state files are local
- event logs are local
- proposals are local
- snapshots are local

The AI layer should be provider-based:

```text
LLMProvider
├── generateStructured()
├── generateText()
└── estimateCost()
```

MVP provider strategy:

1. Implement one remote provider first.
2. Keep provider interface stable.
3. Add local model adapters later only if needed.

All AI outputs that may affect state must pass schema validation.

## Production Skills MVP

Skills are tools, not personalities.

P0 skills:

- Outline Builder
- Character Sheet
- Timeline Compiler
- Foreshadow Tracker

Each skill should produce:

- a human-readable result
- structured observations
- optional state proposals

Skill output should not mutate state directly.

## Studio Coordinator MVP

The Studio Coordinator is the always-present operational layer of TWLR.

It is not a normal creative agent. It should not behave like the Development Editor, Reader Agent, Character Editor, or Continuity Editor.

It is also not an emotional companion AI. Its companionship comes from stable operational presence: it helps the author recover context, maintain order, and keep the project moving without taking over creative judgment.

Responsibilities:

- project rhythm
- TODO and inbox management
- pending proposal reminders
- unresolved open-loop reminders
- timeline conflict reminders
- snapshot reminders
- Writers' Room follow-up reminders
- rewrite impact reminders

Boundaries:

- does not judge literary quality
- does not critique character psychology unless asked through a creative agent
- does not provide market advice
- does not rewrite manuscript text autonomously
- does not mutate story state without confirmation
- does not use emotional coaching as its default mode

Logic-layer inputs:

- manuscript edit history
- changed chapters
- pending proposal cards
- unresolved open loops
- TODOs and notes
- timeline conflicts
- Writers' Room outputs
- snapshot history
- current projected state

Logic-layer outputs:

- concise project status
- next useful operational actions
- review reminders
- meeting suggestions
- snapshot prompts
- state update prompts

Example:

```text
Past 14 days: no main-plot chapter updates.
3 pending state updates remain unreviewed.
Chapter 18 payoff may be affected by today's edits.
```

## Writers' Room MVP

The Writers' Room is a professional meeting interface for the author and selected official perspectives.

It may support conversational turns, but the primary structure should be closer to a chaired editorial meeting than a live agent chat. The author owns the question and the decision.

MVP flow:

```text
Author asks question
→ Author selects official perspectives
→ Context Projection builds meeting packet
→ Each selected perspective returns concise observations
→ Studio Coordinator summarizes
→ Optional state proposal cards are created
→ Author accepts / edits / rejects proposals
```

P0 official perspectives:

- Development Editor
- Reader Agent
- Character Editor
- Continuity Editor

Theme Analyst can be added if the early users need it, but it is less critical for web novel / light novel workflows than continuity and pacing.

## Manuscript Editor

The MVP editor should be Markdown-based but hide unnecessary complexity.

Principles:

- simpler than Feishu for normal writing
- chapter-first navigation
- no complex block editor in P0
- no collaborative editing
- no heavy formatting system
- no AI autocomplete by default

MVP editor features:

- chapter list
- Markdown editing
- autosave
- word count
- chapter title
- chapter order
- basic metadata
- selected-text actions for skills and Writers' Room

Suggested implementation:

- CodeMirror 6 for the editor
- Markdown files as the durable format
- frontmatter for chapter metadata if needed

## Studio Coordinator Console

The Studio Coordinator is the default always-available operational presence.

It should act like a production desk for the creative studio, not a creative persona.

MVP console should show:

- current project status
- unresolved open loops
- pending proposal cards
- recent changed chapters
- snapshot reminder
- possible timeline or continuity warnings

The Coordinator should be quiet by default, use low-emotion-density language, and should not generate unsolicited creative ideas.

## Snapshot Architecture

Git is the underlying snapshot engine, but normal users should not see Git concepts.

Normal UI terms:

| Git Concept | User-Facing Term |
| --- | --- |
| commit | Save Snapshot |
| diff | Compare Changes |
| revert | Restore Snapshot |

MVP behavior:

- autosave writes files only
- manual snapshot creates Git commit
- cache files are ignored
- large assets are ignored or explicitly managed
- Git internals are visible only in developer/debug mode

P0 Git commands:

- initialize project repository
- create snapshot
- list snapshots
- compare working tree to last snapshot
- restore snapshot, optional and guarded

## SQLite Role

SQLite should support speed, not ownership.

MVP tables:

- `chapter_index`
- `entity_index`
- `mention_index`
- `proposal_index`
- `meeting_index`
- `snapshot_index`
- `fts_manuscript`

The app should be able to rebuild SQLite from local project files.

## Tauri Boundary

TypeScript should own product logic in the MVP.

Rust/Tauri commands should provide safe local capabilities:

- read project files
- write project files
- watch files
- manage SQLite
- run Git snapshot commands
- open file dialogs

Avoid moving narrative state logic into Rust too early.

## MVP Screens

P0 should include these primary screens:

1. Project Home
2. Manuscript Workspace
3. Studio Coordinator Console
4. State Panels
5. Production Skills
6. Writers' Room
7. Snapshot / Impact View
8. Settings

Settings should include:

- remote API provider configuration
- project location
- developer/debug mode toggle
- snapshot behavior

Detailed client UI principles are defined in `docs/CLIENT_UI_DESIGN.md`.

## MVP Milestones

### Milestone 1: Local Project Shell

- create/open project
- generate project folder structure
- initialize local Git repository
- initialize SQLite cache
- basic project settings

### Milestone 2: Manuscript Workspace

- chapter list
- Markdown editor
- autosave
- chapter metadata
- SQLite indexing

### Milestone 3: State and Proposal Engine

- state schemas
- narrative event log
- state proposal file
- proposal review cards
- accept / edit / reject flow
- projected state rebuild

### Milestone 4: Production Skills

- Outline Builder
- Character Sheet
- Timeline Compiler
- Foreshadow Tracker
- structured outputs
- proposal generation

### Milestone 5: Writers' Room

- official perspectives
- meeting creation
- structured observations
- Studio Coordinator summary
- optional proposal cards

### Milestone 6: Snapshot and Rewrite Impact Lite

- manual snapshot
- changed chapter detection
- affected known element summary
- user-facing impact view
- developer/debug Git view

## First Engineering Priority

The first engineering priority should be the state proposal pipeline:

```text
Selected chapter text
→ Skill or Writers' Room request
→ Structured AI output
→ Validated proposal
→ Review card
→ Accepted event
→ Updated projected state
```

If this pipeline feels trustworthy, TWLR has a real product foundation.

If this pipeline is weak, the app risks becoming another writing chatbot with a nicer shell.
