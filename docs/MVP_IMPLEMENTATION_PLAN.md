# TWLR MVP Implementation Plan

This document turns the current product thesis into an executable MVP build plan.

It should be read alongside:

- `README.md`
- `docs/MVP_ARCHITECTURE.md`
- `docs/STUDIO_COORDINATOR.md`
- `docs/DATA_MODEL.md`
- `docs/CLIENT_UI_DESIGN.md`
- `docs/UI_WIREFRAME_SPEC.md`

## MVP Objective

The MVP should validate whether web novel, script, and light novel authors treat TWLR as a long-term creative room.

The first version is not trying to prove that AI can write good fiction.

It is trying to prove that a local-first creative workspace can help authors maintain order across:

- manuscript chapters
- characters
- timelines
- unresolved threads
- state updates
- rewrite impact
- creative meetings
- meaningful snapshots

## P0 Product Promise

P0 should let an author:

```text
Create a local project
-> Write or edit chapters
-> Let TWLR detect or propose story-state updates
-> Review proposal cards
-> Accept / edit / reject updates
-> Preserve accepted state locally
-> See Studio Coordinator status
-> Save meaningful snapshots
```

If this loop feels trustworthy, TWLR has a real product foundation.

## P0 Must-Haves

### Local Project Workspace

- create project
- open existing project
- generate local project folder structure
- validate `twlr.project.json`
- initialize cache directory
- initialize Git repository for snapshots

### Manuscript Workspace

- chapter list
- chapter create / rename / reorder
- Markdown editor
- local autosave
- word count
- chapter metadata
- selected-text actions
- simple writing-first focus mode

### Studio Coordinator

- always-available project status
- low-emotion-density operational language
- pending proposal count
- unresolved thread count
- changed chapter count
- timeline conflict reminder
- snapshot reminder
- Writers' Room follow-up reminder
- suggested next operational action

The Studio Coordinator is not a creative agent and should not judge literary quality.

### State and Proposal Engine

- state schemas
- narrative event log
- current projected state files
- state proposal files
- proposal review cards
- accept / edit / reject flow
- accepted proposal becomes durable narrative event
- projected state updates after acceptance

### Production Skills

P0 skills:

- Character Sheet
- Timeline Compiler
- Foreshadow Tracker
- Outline Builder

Each skill should produce:

- human-readable result
- structured observations
- optional proposal cards

Skills must not mutate state directly.

### Writers' Room

- author asks a question
- author selects official perspectives
- context projection builds meeting packet
- selected perspectives return concise observations
- Studio Coordinator summarizes
- optional proposal cards are created
- author decides what becomes project state

P0 perspectives:

- Development Editor
- Reader Agent
- Character Editor
- Continuity Editor

### Snapshot and Rewrite Impact Lite

- manual Save Snapshot
- list snapshots
- compare working tree to last snapshot
- detect changed chapters
- show affected known elements
- show suggested review areas
- hide Git details outside developer/debug mode

## P0 Non-Goals

P0 should not include:

- local LLM setup
- custom user-created agents
- autonomous agent workflows
- market dashboards
- mobile companion app
- cloud sync
- real-time collaboration
- branch / merge Git UI
- full semantic Narrative Diff
- complex graph visualization
- AI autocomplete by default
- rich block editor
- automatic manuscript rewriting
- automatic state mutation
- emotional companion behavior

## First Vertical Slice

The first executable slice should be:

```text
Create project
-> Create chapter
-> Edit Markdown
-> Autosave local file
-> Create mock proposal card
-> Accept proposal
-> Append narrative event
-> Update projected state
-> Studio Coordinator shows updated status
```

This slice should use mock AI outputs first.

Remote LLM integration should come only after the state proposal pipeline works locally.

## Current Implementation Checkpoint

The first vertical slice is now partially executable with mock AI:

- project creation and reopening
- portable TWLR folder generation
- Markdown chapter editor
- local autosave
- chapter creation
- manual Save Snapshot
- snapshot status lite
- Character Sheet mock proposal
- OpenAI Character Sheet proposal path with mock fallback
- DeepSeek Character Sheet proposal path with mock fallback
- remote state-proposal skill request adapter
- pending proposal card persistence and reopen recovery
- proposal accept / reject
- accepted proposal to narrative events
- local project reopen reads narrative event log
- projected character state
- projected open-loop state
- projected timeline state
- local project reopen reads projected state files
- context projection packet for skills and Writers' Room
- Writers' Room mock meeting
- Writers' Room meeting log persistence
- Writers' Room to proposal-card handoff
- official agent registry
- production skill registry
- Timeline Compiler mock proposal
- Foreshadow Tracker mock proposal
- provider interface with mock provider

Remaining P0 work should focus on replacing hardcoded demo paths and mock outputs with real context projection, provider-backed structured outputs, and more complete production skills.

## Implementation Phases

### Phase 1: Repository and App Shell

Goal: create a runnable desktop app shell and package structure.

Tasks:

- create monorepo layout
- initialize `apps/desktop`
- set up React + TypeScript
- set up Tauri shell
- set up shared packages
- add basic lint/typecheck scripts
- add app shell layout
- implement top bar, rail, navigator, editor region, context panel

Acceptance criteria:

- app launches locally
- shell matches the basic Figma layout
- project can show a placeholder Manuscript Workspace
- packages build or typecheck

### Phase 2: Local Project System

Goal: create and open portable TWLR project folders.

Tasks:

- implement project creation
- generate project folder structure
- write `twlr.project.json`
- create initial empty state files
- create initial event/proposal/meeting logs
- initialize SQLite cache file
- initialize Git repository
- write project validation

Acceptance criteria:

- user can create a project folder
- generated project matches the documented structure
- app can reopen the project
- corrupted or missing required files produce recoverable errors

### Phase 3: Manuscript Workspace

Goal: make writing the primary usable workflow.

Tasks:

- implement chapter list
- create / rename / reorder chapters
- implement Markdown editor
- autosave chapter files
- track word count
- store chapter metadata
- index manuscript in SQLite
- add focus mode

Acceptance criteria:

- author can write and autosave chapters
- chapter list updates correctly
- editor remains visually dominant
- app does not expose raw project folders in normal UI

### Phase 4: State and Proposal Pipeline

Goal: make human-in-the-loop state updates real.

Tasks:

- implement schema validation
- implement proposal model
- implement proposal card UI
- implement accept / edit / reject
- append accepted proposal to `events/narrative_events.jsonl`
- rebuild or update projected `state/*.json`
- expose pending counts to Studio Coordinator

Acceptance criteria:

- mock proposal appears as a review card
- accepting it appends a narrative event
- rejecting it preserves no state mutation
- editing it writes the edited value
- current projected state changes only after confirmation

### Phase 5: Studio Coordinator MVP

Goal: make the product feel operationally stable.

Tasks:

- implement Coordinator status model
- compute pending proposal count
- compute unresolved open-loop count
- compute changed chapter count
- compute snapshot status
- surface meeting follow-ups
- render Coordinator panel and compact status

Acceptance criteria:

- Coordinator status is factual and specific
- language stays low-emotion-density
- no creative critique appears by default
- status updates after proposal acceptance and chapter edits

### Phase 6: Production Skills with Mock Then Remote AI

Goal: connect structured AI outputs to proposals.

Tasks:

- implement skill runner interface
- implement mock outputs for P0 skills
- implement structured output validation
- implement remote LLM provider interface
- move state-proposal prompt/request construction into `@twlr/ai`
- connect Character Sheet
- connect Timeline Compiler
- connect Foreshadow Tracker
- connect Outline Builder

Acceptance criteria:

- each skill can run on selected text or current chapter
- each skill returns structured output
- invalid output is rejected safely
- generated proposals enter review flow

### Phase 7: Writers' Room MVP

Goal: support professional meeting-style creative discussion.

Tasks:

- implement meeting creation
- implement perspective selector
- implement context packet preview
- implement structured perspective outputs
- implement Studio Coordinator summary
- save meeting to `meetings/room_meetings.jsonl`
- generate optional proposal cards

Acceptance criteria:

- meeting feels like a professional review, not roleplay
- author question remains visible
- author decision is explicit
- meeting can produce proposals without mutating state automatically

### Phase 8: Snapshot and Rewrite Impact Lite

Goal: add writer-facing version awareness.

Tasks:

- implement Save Snapshot
- list snapshots
- compare changed files since last snapshot
- detect changed chapters
- summarize affected known elements
- show suggested review areas
- hide raw Git details unless developer/debug mode is enabled

Acceptance criteria:

- autosave does not create snapshots
- manual snapshot creates a Git commit
- changed chapters are visible
- impact summary uses writer-facing language

## Engineering Order

Recommended order:

1. scaffold repo and app shell
2. local project creation
3. manuscript workspace
4. proposal pipeline with mock data
5. Studio Coordinator status
6. state projection
7. production skills with mock AI
8. remote LLM provider
9. Writers' Room
10. snapshot and rewrite impact lite

The proposal pipeline should come before real AI integration.

## Minimal Test Strategy

Prioritize tests around durable project behavior.

Core tests:

- project structure generation
- project validation
- chapter metadata parsing
- proposal accept / edit / reject
- event log append
- state projection
- Coordinator status calculation
- rewrite impact changed chapter detection

UI tests:

- app shell renders
- editor remains available after panel toggles
- proposal card actions work
- Coordinator status updates after state changes

Avoid over-testing visual details in P0.

## Implementation Risks

### Risk: Product Becomes A Chat App

Mitigation:

- editor remains default screen
- AI appears through skills, proposal cards, and meetings
- Studio Coordinator is an operations layer, not a chatbot

### Risk: State Becomes Untrustworthy

Mitigation:

- AI never mutates state directly
- all changes go through proposal cards
- accepted changes append narrative events
- current state is projected from durable files

### Risk: MVP Scope Expands Too Fast

Mitigation:

- custom agents are deferred
- local LLM setup is deferred
- semantic Narrative Diff is deferred
- mobile is deferred
- graph visualization is deferred

### Risk: UI Feels Like Legacy Writing Software

Mitigation:

- editor-first layout
- modern restrained visual language
- no file-tree-first UI
- no exposed Git concepts in normal mode

## Build Definition Of Done

P0 is done when a user can:

1. create a TWLR project
2. write chapters locally
3. run at least one mock skill
4. review a proposal card
5. accept the proposal into durable state
6. see Studio Coordinator status update
7. save a snapshot
8. reopen the project and see the same manuscript and state

Remote AI integration is valuable, but the MVP's foundation is the local state loop.
