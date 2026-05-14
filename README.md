# The Writer's Living Room (TWLR)

TWLR is a local-first AI-native creative workspace for high-volume narrative writers.

It is not an AI ghostwriter.

It is a quiet, structured, long-term creative studio that helps writers manage complex story worlds, characters, timelines, outlines, open loops, rewrites, and creative discussions.

## Product Thesis

Long-running narrative writers do not primarily need a semi-automatic keyboard.

They need something closer to:

- a librarian
- an editorial assistant
- a continuity keeper
- a writers' room
- a structured creative archive
- a long-term state engine for their work
- a studio coordinator that keeps the creative room orderly

TWLR helps writers turn chaotic creative material into a stable, inspectable, revisable creative system.

## Core Principle

```text
State-first, LLM-second
```

LLMs are used as local reasoning engines.

They do not own the project memory.

The core product value lives in:

- Studio Coordinator
- Narrative State Engine
- Story Graph
- Event Sourcing
- Context Projection
- Narrative Diff
- Rewrite Intelligence
- Human-in-the-loop state updates

## What TWLR Is Not

TWLR is not:

- ChatGPT for writers
- an AI novel generator
- an emotional companion AI
- a prompt workflow platform
- an AI roleplay product
- an Agent marketplace
- a UGC persona platform
- a real-time Google Docs / Overleaf clone
- a one-click bestselling novel machine

The product avoids AI spam, uncontrolled agent personalities, and market-data-driven creative anxiety.

## MVP Goal

The MVP should validate one core question:

Will high-volume narrative writers treat TWLR as their long-term creative room?

Not:

Can AI write a good novel by itself?

The MVP should help writers:

- import or create a writing project
- structure their work
- build character sheets, outlines, timelines, and open-loop trackers
- summon a small set of official creative agents
- update story state through human confirmation
- save snapshots
- understand rewrite impact

## Target Users

Initial users:

- web novel writers
- scriptwriters
- light novel writers
- fantasy / sci-fi writers
- romance writers
- worldbuilding-heavy genre writers
- Kindle authors
- worldbuilding-heavy creators
- IP developers

Later possible vertical:

- academic writers
- researchers
- thesis writers
- research teams

## Product Architecture

```text
TWLR Desktop App
├── Local Project Workspace
├── Manuscript Editor
├── Studio Coordinator Console
├── Production Skills
├── Writers' Room
├── Narrative State Engine
├── Narrative Diff Engine
├── Git Snapshot Layer
└── Optional Cloud Services
```

See also:

- [MVP Implementation Plan](docs/MVP_IMPLEMENTATION_PLAN.md)
- [MVP Architecture](docs/MVP_ARCHITECTURE.md)
- [Data Model](docs/DATA_MODEL.md)
- [Studio Coordinator](docs/STUDIO_COORDINATOR.md)
- [Client UI Design](docs/CLIENT_UI_DESIGN.md)
- [UI Wireframe Spec](docs/UI_WIREFRAME_SPEC.md)

## Recommended Tech Stack

### Desktop Client

- Tauri
- React
- TypeScript

Reason:

- local-first product feel
- smaller package size than Electron
- better fit for privacy-sensitive creators
- suitable for long-running desktop creative work

### Local Storage

- Markdown for manuscript
- JSON / JSONL for structured story state
- SQLite for local indexes and caches
- Git for snapshots and version history

### Runtime

MVP can start with:

- TypeScript application logic
- Tauri Rust commands for filesystem / Git integration
- Python scripts only if useful for early AI pipeline experiments

Long-term:

- Rust local runtime
- pluggable LLM adapters
- optional cloud AI services

## Project Folder Structure

Each TWLR project should be a normal local folder.

Example:

```text
my-novel/
├── manuscript/
│   ├── chapter-001.md
│   ├── chapter-002.md
│   └── chapter-003.md
├── state/
│   ├── characters.json
│   ├── relationships.json
│   ├── timeline.json
│   ├── open_loops.json
│   └── themes.json
├── notes/
│   ├── ideas.md
│   └── research.md
├── events/
│   └── narrative_events.jsonl
├── agents/
│   └── observations.jsonl
├── assets/
│   └── .gitkeep
├── cache/
│   └── .gitkeep
├── .gitignore
└── twlr.project.json
```

## Git Strategy

Git should be used as the version backbone, but hidden behind writer-friendly language.

| Git Concept | TWLR UI Term |
| --- | --- |
| commit | Save Snapshot |
| branch | Experiment Version |
| diff | Compare Changes |
| merge | Merge Draft |
| revert | Restore Previous Version |
| remote | Cloud Backup / Team Repository |

Important:

- Do not commit every autosave.
- Autosave writes to local files / SQLite.
- Git commits should represent meaningful creative snapshots.
- Large assets, embeddings, temporary LLM outputs, and caches should not be tracked.

## MVP Feature Scope

### P0

Core MVP features:

- Tauri desktop shell
- project creation / open local project
- Markdown chapter editor
- chapter list
- local autosave
- manual snapshot
- basic project file structure
- Studio Coordinator Console
- Outline Builder
- Character Sheet Skill
- Timeline Compiler
- Foreshadow Tracker
- basic Narrative State Commit flow
- basic Writers' Room meeting
- official built-in agents only

### P1

Professional production layer:

- Narrative Diff v1
- Rewrite Impact Analyzer v1
- Relationship Mapper
- Continuity Agent
- Git integration
- Review Package export/import
- LLM Provider Adapter
- local event log improvements

### P2

Later expansion:

- Market Analyst with credits
- mobile companion app
- optional cloud sync
- research writing prototype
- advanced semantic diff
- async team workflow
- advanced agent memory

## Core Modules

### 1. Studio Coordinator

The Studio Coordinator is the default always-available operational presence in TWLR.

It is not an AI secretary, emotional companion AI, or creative co-author.

It is the stable process layer of the creative studio: a quiet production desk that helps the author maintain order across chapters, TODOs, state updates, meetings, snapshots, and continuity risks.

Its role is to manage process, not to judge the work's literary quality.

Role:

- project order
- inbox
- todo
- pending state updates
- unresolved open loops
- timeline conflicts
- version snapshot reminders
- project rhythm
- meeting organization
- rewrite impact reminders

Non-role:

- literary judgment
- market advice
- emotional coaching
- plot taste
- character psychology critique
- autonomous rewriting

Tone:

- quiet
- low-emotion-density
- professional
- non-judgmental
- non-creative unless asked
- factual and specific
- stable across the whole project

Example:

```text
Project status:
- Main plot is paused before the second-act turn.
- 7 unresolved open loops.
- 3 active character conflicts.
- 1 possible timeline conflict.
- Recent edits may affect chapters 12, 18, and 31.
```

Example after a late-night rewrite:

```text
Today's edits changed:
- protagonist motivation
- Chapter 18 payoff setup
- relationship state with the female lead

3 state updates may need review.
Save Snapshot is available when you are ready.
```

### 2. Production Skills

Skills are tools, not personalities.

Initial skills:

- Outline Builder
- Character Sheet
- Timeline Compiler
- Relationship Mapper
- Foreshadow Tracker
- Arc Analyzer
- Lore Indexer
- Rewrite Impact Analyzer

Skills should output structured state, not just prose.

### 3. Official Agents

Agents are official platform-maintained creative perspectives.

Users should not create custom agents.

Initial agents:

#### Development Editor

Focus:

- plot structure
- main conflict
- payoff
- pacing
- arc integrity

#### Reader Agent

Focus:

- emotional reading experience
- boredom
- suspense
- confusion
- expectation

#### Character Editor

Focus:

- motivation
- consistency
- character arc
- psychological plausibility

#### Theme Analyst

Focus:

- theme
- motif
- author intent
- repeated emotional patterns

#### Continuity Editor

Focus:

- world consistency
- timeline
- setting conflicts
- foreshadowing

### 4. Market Analyst

Market Analyst is an external consultant.

Rules:

- not always present
- not proactive
- user must summon it
- consumes credits / virtual currency
- gives observations, not commands

It should protect the creative space from constant market pressure.

## Narrative State Engine

The Narrative State Engine maintains the current creative state of the project.

Core state types:

- Work
- Chapter / Scene
- Character
- Event
- Relationship
- Theme
- Open Loop
- Payoff
- World Rule

Example character state:

```json
{
  "character_id": "c001",
  "name": "Shen Yao",
  "role": "male_lead",
  "desire": "to prove his worth again",
  "fear": "being abandoned again",
  "current_status": "misunderstood by his family and hiding his real identity",
  "arc_stage": "suppression",
  "secrets": ["true heir"],
  "open_loops": ["has not explained the past to the female lead"],
  "reader_function": "compensatory reversal fantasy"
}
```

## Event Sourcing

TWLR should not only store the current state.

It should store how the state evolved.

Example:

- Chapter 3: male lead is humiliated
- Chapter 8: female lead begins to suspect the truth
- Chapter 12: first clue to hidden identity appears
- Chapter 18: relationship breaks
- Chapter 24: first trust recovery

Current state should be derived from this event history.

## Context Projection

The app should not dump the entire manuscript into the LLM context.

Instead, for each task, TWLR projects only relevant state.

Example user question:

Is the female lead's reaction in Chapter 28 reasonable?

The system should retrieve:

- Chapter 28 text
- female lead current state
- key prior events
- relationship changes
- unresolved secrets
- relevant open loops
- recent emotional trajectory

Then the LLM reasons over this projected context.

## Narrative Diff

Normal diff shows text changes.

Narrative Diff shows story-state impact.

Example:

```text
This edit affects:
1. The male lead's secret identity is revealed earlier.
2. The misunderstanding arc in Chapter 18 weakens.
3. The Chapter 31 reveal loses emotional force.
4. The female lead's trust arc needs recalculation.
5. Foreshadowing item F-004 is now paid off early.
```

This is a core professional differentiator.

## Human-in-the-loop Commit

AI should not automatically mutate project state.

Flow:

```text
AI proposes state update
↓
User confirms / edits / rejects
↓
State is committed
```

This prevents hallucinated state pollution.

## Writers' Room

The Writers' Room is not an autonomous agent group chat.

It is a professional meeting interface where the author asks a question, selected official perspectives respond, the Studio Coordinator summarizes, and the author decides what becomes project state.

Flow:

```text
Author asks a question
↓
Author selects agents
↓
Agents provide concise observations
↓
Studio Coordinator summarizes
↓
Author decides what to update
```

Meeting types:

- Idea Review
- Chapter Review
- Character Review
- Plot Problem Meeting
- Rewrite Impact Meeting
- Continuity Check Meeting

## UI Principles

TWLR should feel like:

- quiet
- serious
- structured
- trustworthy
- writer-centered
- long-term

Avoid:

- AI message spam
- infinite chat streams
- roleplay aesthetics
- meme-like agent personalities
- overactive suggestions
- market KPI dashboards

Primary UI areas:

- Manuscript
- Project Navigator
- Studio Coordinator Console
- State Panels
- Production Skills
- Writers' Room
- Snapshot / Diff

## Mobile Strategy

Mobile is not a full TWLR client.

It should be a companion app.

Possible name:

- TWLR Pocket
- Field Notebook

Mobile functions:

- idea cards
- dialogue snippets
- plot twist capture
- light outline editing
- character state lookup
- Quick Room agent consultation
- inbox sync

Mobile principle:

```text
capture → classify → process later on desktop
```

## Academic Writing Expansion

TWLR can later expand into research writing.

Do not make an AI paper generator.

Possible positioning:

```text
Research Argument OS
```

Map fiction concepts to research concepts:

| Fiction TWLR | Research TWLR |
| --- | --- |
| Story Graph | Argument Graph |
| Character State | Claim / Evidence State |
| Narrative Diff | Revision Impact |
| Open Loops | Unresolved Research Gaps |
| Writers' Room | Reviewer Simulation |

Possible features:

- Argument Builder
- Literature Matrix
- Claim-Evidence Tracker
- Reviewer Risk Map
- Response-to-Review Workspace
- Revision Impact Analyzer

Do not directly compete with:

- Overleaf for LaTeX editing
- Zotero for reference management
- Elicit for literature search
- Paperpal for polishing

Instead:

- Overleaf manages formatting.
- Zotero manages references.
- Elicit helps with literature.
- TWLR manages argument state.

## Development Principles

- Build local-first.
- Keep user assets portable.
- Do not over-index on chat.
- Build state models before fancy agents.
- Do not open custom agent creation.
- Keep Market Analyst isolated and paid.
- Avoid real-time collaboration in MVP.
- Use Git for snapshots, not every autosave.
- Make Production Layer stronger than prompt engineering.
- Prioritize rewrite and long-form control over generation.

## Suggested MVP Milestones

### Milestone 1: Local Project Shell

- Tauri app
- create/open project
- file structure generation
- Markdown chapter editor
- autosave
- basic navigation

### Milestone 2: State Models

- character state JSON
- timeline JSON
- open loops JSON
- narrative events JSONL
- state commit UI

### Milestone 3: Production Skills v1

- Outline Builder
- Character Sheet
- Timeline Compiler
- Foreshadow Tracker

### Milestone 4: Writers' Room v1

- official agent definitions
- meeting creation
- structured agent responses
- Studio Coordinator summary
- optional state update candidates

### Milestone 5: Snapshot & Diff

- manual save snapshot
- Git integration
- text diff
- Narrative Diff v1

### Milestone 6: Rewrite Intelligence v1

- changed chapters detection
- affected character detection
- affected open loop detection
- impact report

## Repository Structure Proposal

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
│   │   ├── state/
│   │   ├── events/
│   │   ├── context/
│   │   └── diff/
│   ├── ai/
│   │   ├── providers/
│   │   ├── agents/
│   │   ├── skills/
│   │   └── prompts/
│   ├── schema/
│   │   ├── character.schema.json
│   │   ├── timeline.schema.json
│   │   ├── open_loop.schema.json
│   │   └── event.schema.json
│   └── ui/
├── docs/
│   ├── PRD.md
│   ├── ARCHITECTURE.md
│   ├── MVP_IMPLEMENTATION_PLAN.md
│   ├── DATA_MODEL.md
│   ├── STUDIO_COORDINATOR.md
│   ├── AGENTS.md
│   ├── SKILLS.md
│   └── ROADMAP.md
├── examples/
│   └── demo-novel/
└── README.md
```

## Initial Docs to Create

Recommended first docs:

- docs/PRD.md
- docs/ARCHITECTURE.md
- docs/MVP_IMPLEMENTATION_PLAN.md
- docs/DATA_MODEL.md
- docs/AGENTS.md
- docs/STUDIO_COORDINATOR.md
- docs/SKILLS.md
- docs/ROADMAP.md
- docs/LOCAL_FIRST.md
- docs/GIT_SNAPSHOT.md

## Success Metrics

### Attachment

- users return to the same project repeatedly
- users maintain project state
- users form stable agent preferences
- users describe TWLR as their creative room, not just an AI tool

### Production Value

- users repeatedly use skills
- users accept or edit state update candidates
- users rely on Narrative Diff
- users use rewrite impact analysis during revisions

### Operational Stability

- users review Studio Coordinator status regularly
- users rely on reminders for unresolved threads and pending updates
- users use TWLR to recover project context after time away
- users describe TWLR as helping keep the project orderly

### Trust

- users import real existing work
- users keep project assets in TWLR
- users value local-first storage
- users export / backup successfully

## Long-Term Vision

TWLR should become the digital infrastructure for serious long-form creation.

It should not try to prove that AI can write better novels than humans.

Its value exists because AI cannot fully replace serious creation.

TWLR helps human creators do what is hard:

- maintain a complex world
- preserve creative order
- preserve long-term structure
- think clearly under uncertainty
- revise without losing control
- summon meaningful perspectives
- continue working through loneliness and confusion

Final product promise:

```text
TWLR does not write for you.
It helps you keep your creative world alive, coherent, and clear.
```
