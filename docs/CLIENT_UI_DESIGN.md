# TWLR Client UI Design

This document defines the MVP client UI direction for The Writer's Living Room (TWLR).

TWLR is a user-facing writing product, not a developer tool, knowledge base, or file manager. The interface should feel modern, quiet, and focused on the manuscript.

For the first Figma pass, see `docs/UI_WIREFRAME_SPEC.md`.

## Design Position

The client should feel like:

- a modern writing workspace
- a calm production desk
- a structured creative room
- a professional tool for long-running narrative work

It should not feel like:

- Obsidian
- Scrivener
- a Win32 desktop app
- a developer IDE
- a markdown vault
- an agent console
- a database admin panel
- a file tree with an editor attached

The product should be visibly user-oriented. The manuscript is the center of gravity; all AI, state, and project intelligence should orbit around it.

## Primary Layout Principle

The editor owns the screen.

Default workspace hierarchy:

```text
┌────────────────────────────────────────────────────────────────────┐
│ Top Bar: project, chapter, status, snapshot, settings              │
├──────┬──────────────┬─────────────────────────────┬───────────────┤
│ Rail │ Navigator    │ Manuscript Editor           │ Context Panel │
│      │              │                             │               │
│      │              │                             │               │
│      │              │                             │               │
└──────┴──────────────┴─────────────────────────────┴───────────────┘
```

Recommended desktop proportions:

- App rail: 52-64px
- Project navigator: 220-280px, collapsible
- Manuscript editor: flexible, visually dominant, usually 55-70% of the width
- Context panel: 320-380px, collapsible
- Top bar: 44-52px

On smaller widths:

- collapse the navigator first
- collapse the context panel second
- preserve the editor as the primary surface

## Core Workspace

The default screen after opening a project should be the Manuscript Workspace.

It contains:

- chapter navigator
- manuscript editor
- lightweight chapter metadata
- word count and autosave status
- selected-text actions
- collapsible context panel

The product should not open into a dashboard unless no project is selected.

## Visual Style

The visual language should be modern and restrained.

Guidelines:

- use clean panels, not heavy desktop chrome
- use subtle borders instead of thick separators
- avoid dense tree widgets as the first visual impression
- avoid nested cards
- avoid decorative gradients and atmospheric backgrounds
- avoid old-style toolbar strips
- avoid noisy icon rows
- avoid skeuomorphic paper, corkboard, binder, or typewriter metaphors

Recommended visual direction:

- neutral app background
- clear white or near-white writing surface
- graphite text
- muted accent colors for state, review, warnings, and confirmations
- small-radius UI elements, 8px or less
- calm hover and focus states
- generous editor spacing

The app should feel contemporary without becoming a marketing page.

## Typography

Typography should distinguish between writing and application UI.

Application UI:

- modern sans-serif
- 13-14px base size
- compact but readable
- no negative letter spacing

Manuscript editor:

- author-selectable writing font
- 16-18px default size
- 1.65-1.85 line height
- comfortable paragraph rhythm
- max text column around 720-860px

The editor text should feel pleasant enough for long sessions.

## Color System

The MVP should avoid a one-note palette.

Recommended roles:

- Background: neutral off-white or soft gray
- Surface: white / near-white
- Primary text: graphite
- Secondary text: muted gray
- Accent: restrained blue or teal
- Warning: amber
- Conflict / risk: red
- Accepted / saved: green
- AI proposal: subtle violet or blue accent, used sparingly

Do not let the app become dominated by purple, dark slate, beige, or brown/orange tones.

## Navigation Model

TWLR should not be file-tree-first.

The navigator should be writer-first:

- Project
- Parts
- Chapters
- Scenes, optional in P0
- Notes
- State
- Snapshots

Avoid exposing raw folders such as `events`, `cache`, or `.git` in the normal UI.

Developer/debug mode may expose technical files, Git status, and raw logs.

## App Rail

The app rail is a compact mode switcher, not the main workspace.

Suggested rail items:

- Manuscript
- Studio Coordinator
- State
- Skills
- Writers' Room
- Snapshots
- Settings

Use icons with tooltips. Avoid text-heavy vertical navigation.

## Top Bar

The top bar should be minimal.

It should show:

- project name
- current chapter title
- autosave status
- snapshot action
- search / command action
- settings

It should not become a dense toolbar.

Formatting controls should appear only when relevant, such as on text selection or inside an editor command menu.

## Manuscript Editor

The editor should feel simple, direct, and calm.

MVP features:

- title field
- body editor
- word count
- autosave status
- chapter status, optional
- selected-text floating actions
- simple Markdown shortcuts

The user should not need to understand Markdown syntax to write normally.

The editor should avoid:

- complex block controls
- plugin-like side handles
- visible syntax noise for common writing
- always-on AI autocomplete
- large formatting ribbons
- developer-looking markdown preview splits by default

## Context Panel

The right context panel is where TWLR's intelligence appears.

It should be tabbed or segmented:

- Room
- State
- Impact
- Notes

The context panel should be useful but disposable. The user should be able to hide it and keep writing.

Panel behavior:

- default width around 340px
- collapsible
- remembers last selected tab
- never pushes the editor below comfortable width
- does not show infinite chat streams

## Studio Coordinator Console

The Studio Coordinator should look like a concise creative-operations panel, not a chatbot.

It is the stable operational presence of the product. It should give the author a sense that the creative room is being kept in order, without becoming an emotional companion AI or another creative personality.

It should show:

- unresolved open loops
- pending state proposals
- recent changed chapters
- possible continuity warnings
- snapshot reminder
- next useful actions
- project rhythm
- meeting follow-ups

Tone should be quiet, factual, and professional.

The Coordinator should not flood the user with suggestions or unsolicited creative judgment.

Good UI copy:

```text
Past 14 days: no main-plot chapter updates.
3 pending updates need review.
Chapter 18 payoff may be affected.
```

Avoid UI copy:

```text
You seem blocked.
Let me help you feel inspired again.
```

## State Panels

State panels should be inspectable and practical.

MVP state views:

- Characters
- Relationships
- Timeline
- Open Loops
- World Rules

Each state panel should support:

- search
- filters
- compact list
- detail drawer
- references to chapters

Avoid graph-heavy visuals in P0. Graphs can become impressive but hard to use. Lists and structured detail views are better for the MVP.

## Proposal Cards

AI-generated state changes must appear as simple review cards.

Each proposal card should show:

- change type
- affected chapters
- affected known elements
- proposed update
- reason / evidence
- Accept
- Edit
- Reject

The normal user-facing copy should stay simple:

```text
This update may affect:
3 chapters
2 characters
1 unresolved thread
```

Avoid exposing technical concepts like event sourcing, projection, schema validation, or graph mutation.

## Production Skills

Skills should feel like commands or tools, not agent personalities.

Recommended UI:

- command palette
- small tool drawer
- selected-text actions
- contextual buttons in the right panel

P0 skills:

- Outline Builder
- Character Sheet
- Timeline Compiler
- Foreshadow Tracker

Each skill should produce:

- a concise result
- optional proposal cards
- references to affected manuscript sections

## Writers' Room

Writers' Room should feel like a professional meeting workspace.

The better reference is closer to Zoom, an editorial review call, or a structured product review than a chatbot or roleplay room. It can contain conversational turns, but the interface should preserve meeting structure: agenda, participants, observations, summary, and author decisions.

MVP meeting flow:

```text
Question
→ Select perspectives
→ Review projected context
→ Generate observations
→ Studio Coordinator summary
→ Optional proposal cards
```

Recommended UI:

- meeting setup panel
- selected perspectives as compact chips
- visible author question / agenda
- meeting-style participant or perspective list
- agent observations as structured sections
- Studio Coordinator summary at the end
- author decision area
- proposal cards separated from observations

Avoid:

- endless chat transcript as the primary layout
- roleplay avatars
- animated agent presence
- casual agent banter
- uncontrolled back-and-forth without a meeting summary

Acceptable:

- turn-based discussion when the author asks a follow-up
- meeting notes
- clearly attributed speaker sections
- a transcript drawer if useful later
- Zoom-like meeting affordances such as participants, agenda, and follow-up actions

## Snapshot / Impact View

Snapshot and impact features should be writer-facing.

Use terms like:

- Save Snapshot
- Compare Changes
- Restore Snapshot
- Changed Chapters
- Affected Elements

Do not show Git terms in normal mode.

Developer/debug mode can show:

- commit hash
- branch
- raw diff
- Git status

## Empty States

Empty states should invite writing, not configuration.

Examples:

- No chapters yet: create first chapter
- No characters yet: extract characters from selected chapter
- No open loops yet: run Foreshadow Tracker
- No snapshots yet: save first snapshot

Avoid explanatory walls of text.

## Interaction Rules

Important interaction rules:

- Writing must remain one click away.
- Side panels must be collapsible.
- AI should never interrupt typing.
- State updates require explicit confirmation.
- Any destructive action needs confirmation.
- The UI should show scope before action: selected chapter, selected text, or whole project.
- Long-running AI actions should show progress and allow cancellation.

## Responsive Desktop Behavior

TWLR is desktop-first.

Minimum useful layouts:

- Wide desktop: navigator + editor + context panel
- Medium desktop: collapsed rail + editor + context panel
- Narrow desktop: editor first, panels as overlays

The editor should never become a cramped center column between two dominant sidebars.

## MVP Design Success Criteria

The MVP UI succeeds if:

- the user immediately knows where to write
- the editor visually dominates the workspace
- AI features feel available but not pushy
- state management feels understandable through cards and panels
- the product feels modern, not like a legacy desktop application
- Git, files, logs, and schemas stay hidden from normal users
- the user can hide every non-writing surface and continue drafting

## First UI Build Priority

Build the Manuscript Workspace first.

Required first screen:

```text
Project Navigator
→ Chapter List
→ Manuscript Editor
→ Collapsible Context Panel
→ Proposal Card Surface
```

Once this screen feels right, other screens should inherit its interaction grammar.
