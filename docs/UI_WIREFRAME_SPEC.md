# TWLR UI Wireframe Spec

This document defines the first Figma wireframe pass for the TWLR MVP client.

The goal is to validate layout, hierarchy, and interaction rhythm before building high-fidelity UI or a full design system.

## Figma File

Initial wireframes have been created in Figma:

- File: [TWLR MVP Wireframes](https://www.figma.com/design/hHSpuD9JSBQdeoxjRFnhxL)
- Page: `TWLR Wireframes`

Generated frames:

| Frame | Figma Node ID |
| --- | --- |
| F01 - Manuscript Workspace - Default | `3:2` |
| F02 - Manuscript Workspace - Focus | `3:98` |
| F03 - Proposal Review | `3:136` |
| F04 - Writers' Room Meeting | `3:245` |
| F05 - State Panel - Characters | `3:347` |
| F06 - Snapshot Impact | `3:419` |
| F07 - Compact Desktop | `3:516` |

Validation note:

- F01 and F03 screenshots were generated successfully for visual inspection.
- F04 screenshot validation was blocked by the Figma Starter MCP call limit, but the frame was created.

## Wireframe Goal

The first Figma pass should answer six questions:

1. Does the manuscript editor clearly own the screen?
2. Do the navigator and context panel support writing without making the app feel like a file manager?
3. Do AI proposal cards feel lightweight and understandable?
4. Does the Studio Coordinator feel like a stable operational presence, not a chat persona?
5. Does Writers' Room feel like a professional meeting workspace rather than an unstructured chat stream?
6. Does the app avoid Obsidian, Scrivener, Win32, IDE, and markdown-vault visual cues?

## Figma Deliverables

Create these frames first:

| Frame | Name | Size | Purpose |
| --- | --- | --- | --- |
| F01 | Manuscript Workspace - Default | 1440 x 960 | Primary writing screen |
| F02 | Manuscript Workspace - Focus | 1440 x 960 | Writing-first mode with panels collapsed |
| F03 | Proposal Review | 1440 x 960 | AI state change card review flow |
| F04 | Writers' Room Meeting | 1440 x 960 | Structured multi-perspective meeting |
| F05 | State Panel - Characters | 1440 x 960 | Inspectable story state |
| F06 | Snapshot Impact | 1440 x 960 | Changed chapters and affected elements |
| F07 | Compact Desktop | 1280 x 800 | Medium-width layout behavior |

Do not start with a mobile frame. TWLR MVP is desktop-first.

## Global Layout

Base desktop frame: `1440 x 960`.

```text
┌──────────────────────────────────────────────────────────────┐
│ Top Bar: 52px                                                │
├──────┬────────────┬───────────────────────────┬──────────────┤
│ Rail │ Navigator  │ Manuscript Editor         │ Context      │
│ 56px │ 252px      │ flexible, dominant        │ 360px        │
│      │            │                           │              │
└──────┴────────────┴───────────────────────────┴──────────────┘
```

Target proportions:

- App rail: 56px
- Navigator: 252px
- Context panel: 360px
- Editor region: remaining width, visually dominant
- Editor writing column: 760-820px max width
- Top bar: 52px

The editor region should feel visually larger than the combined weight of the two side panels.

## Visual Tokens for Wireframe

Use realistic low-fidelity styling, not pure grayscale boxes.

Suggested tokens:

| Token | Value |
| --- | --- |
| App background | `#F7F7F5` |
| Surface | `#FFFFFF` |
| Soft surface | `#FAFAF8` |
| Border | `#E5E2DC` |
| Text primary | `#242424` |
| Text secondary | `#6F6B63` |
| Text muted | `#9A948B` |
| Accent | `#2F7D7A` |
| Proposal accent | `#5B6EE1` |
| Warning | `#B7791F` |
| Risk | `#C94A4A` |
| Saved | `#3C8A5F` |

Rules:

- Borders should be subtle.
- Radius should be 8px or less.
- Avoid deep shadows.
- Avoid gradient backgrounds.
- Avoid decorative blobs or atmospheric visuals.
- Use enough contrast that the editor does not look washed out.

## Typography

Wireframe typography should already imply hierarchy.

Application UI:

- Font: Inter, SF Pro, or equivalent modern sans-serif
- Body: 13px
- Secondary labels: 12px
- Section headers: 12px medium, uppercase optional but use sparingly
- No negative letter spacing

Editor:

- Font: system serif or author-selectable writing font placeholder
- Body: 17px
- Line height: 1.75
- Chapter title: 30-34px
- Editor metadata: 13px sans-serif

## Shared Components

### Top Bar

Height: 52px.

Contents:

- project name
- current chapter title
- autosave status
- Save Snapshot button
- search / command icon button
- settings icon button

Avoid:

- old toolbar strips
- formatting ribbons
- too many visible commands

### App Rail

Width: 56px.

Items:

- Manuscript
- Studio Coordinator
- State
- Skills
- Writers' Room
- Snapshots
- Settings

Use icon-only buttons with tooltips in implementation. In wireframes, icons may be represented by simple symbols plus labels only if needed for clarity.

### Navigator

Width: 252px.

Writer-first structure:

- Project title
- Part selector, optional
- Chapter list
- Notes shortcut
- Snapshot shortcut

Do not render it as a raw filesystem tree.

### Manuscript Editor

The editor has:

- chapter title
- optional chapter metadata row
- writing body
- word count
- autosave status
- selected-text floating toolbar in relevant frames

The body should not look like code or raw Markdown.

### Context Panel

Width: 360px.

Tabs or segmented control:

- Room
- State
- Impact
- Notes

The panel should feel secondary and collapsible.

### Proposal Card

A proposal card must show:

- change type
- affected scope summary
- proposed update
- evidence / reason
- Accept
- Edit
- Reject

Use simple user-facing wording:

```text
This update may affect:
3 chapters
2 characters
1 unresolved thread
```

Do not use technical language such as event sourcing, projection, graph mutation, or schema validation.

## F01: Manuscript Workspace - Default

Purpose: the main screen users spend most time in.

Layout:

```text
Top Bar
Rail | Navigator | Editor | Context Panel
```

Navigator content:

- Project: `The Glass City`
- Part: `Act I`
- Chapter list:
  - Chapter 01 - Rain at the South Gate
  - Chapter 02 - The False Receipt
  - Chapter 03 - A Name Removed
  - Chapter 04 - The Lantern Room
- Each chapter row shows title, word count, and small status indicator.

Editor content:

- Chapter title: `Chapter 03 - A Name Removed`
- Metadata row:
  - `2,418 words`
  - `Autosaved 12s ago`
  - `Draft`
- Body text with 5-7 paragraphs of sample manuscript copy.
- Writing column centered inside the editor region.

Context panel:

- Default tab: `Room`
- Studio Coordinator status:
  - `3 unresolved threads`
  - `2 pending updates`
  - `1 possible continuity issue`
- Next useful actions:
  - `Review pending updates`
  - `Check affected chapters`
  - `Save snapshot`

Success criteria:

- user immediately knows where to write
- editor is visually calm and dominant
- AI/status information is visible but not loud

## F02: Manuscript Workspace - Focus

Purpose: validate distraction-light writing mode.

Layout:

- Top bar remains
- Rail remains slim or fades to minimal state
- Navigator collapsed
- Context panel collapsed
- Editor expands

Visible elements:

- chapter title
- body text
- small autosave indicator
- word count
- one subtle button to reopen panels

Success criteria:

- feels like a modern writing app, not a database tool
- no AI surfaces compete with the text

## F03: Proposal Review

Purpose: validate human-in-the-loop state updates.

Layout:

- Same shell as default workspace
- Editor remains visible on the left or center
- Context panel switches to proposal review
- Selected manuscript passage is subtly highlighted

Proposal surface:

- Header: `2 pending updates from Character Sheet`
- Card 1: `Character State Update`
- Card 2: `Open Thread Update`

Card structure:

```text
Character State Update
Detected in Chapter 03

This update may affect:
2 chapters
1 character
1 unresolved thread

Proposed update:
Mira now suspects that the archive record was changed after the trial.

Evidence:
"the ink was newer than the paper"

[Reject] [Edit] [Accept]
```

Interaction states to show:

- default proposal card
- accepted card
- rejected card, optional small variant
- edit mode can be a later frame if needed

Success criteria:

- proposal cards feel easy to understand
- user sees scope before accepting
- state update does not feel automatic or mysterious

## F04: Writers' Room Meeting

Purpose: validate a professional meeting-style interaction for author and agents.

Design reference:

- closer to Zoom, an editorial review call, or a structured product review
- not a roleplay room
- not an endless chat stream
- not a loose agent group chat

Layout:

- Context panel or main panel shows meeting setup/results
- Editor remains available as the reference surface
- meeting structure remains visible: question, participants/perspectives, observations, summary, author decision

Meeting setup:

- Question field:
  - `Does Mira's reaction in Chapter 03 feel too passive?`
- Context scope:
  - `Current chapter`
  - `Related character state`
  - `Open threads`
- Perspective selector:
  - Development Editor
  - Reader Agent
  - Character Editor
  - Continuity Editor
- Author role:
  - author owns the question
  - author decides whether observations become proposal cards

Meeting result:

- Each perspective appears as a structured section:
  - `Observation`
  - `Risk`
  - `Suggested check`
- Studio Coordinator summary appears after agent observations.
- Studio Coordinator keeps the meeting structured and turns outcomes into follow-up actions.
- Author decision area appears after the summary:
  - `Create proposal cards`
  - `Keep as meeting note`
  - `Ask follow-up`
  - `Dismiss`
- Proposal cards appear in a separate section if generated.

Avoid:

- playful avatars
- casual banter
- chat bubbles as the dominant structure
- simulated personalities
- endless chat transcript

Success criteria:

- feels like a chaired editorial meeting or professional review call
- writer can scan observations quickly
- output can lead to proposal cards without forcing changes
- author decision remains visually explicit

## F05: State Panel - Characters

Purpose: validate inspectable state without graph complexity.

Layout:

- Rail active item: State
- Navigator may list state categories:
  - Characters
  - Relationships
  - Timeline
  - Open Threads
  - World Rules
- Main area contains a searchable character list and detail panel.

Character list:

- Mira Chen
- Shen Yao
- Archivist Ren
- Lio

Detail panel:

- role
- current desire
- fear
- current status
- unresolved threads
- referenced chapters
- recent changes

Use structured rows, not a big prose blob.

Success criteria:

- state feels useful and inspectable
- avoids looking like a raw JSON editor
- avoids over-investing in a graph view for P0

## F06: Snapshot Impact

Purpose: validate user-facing rewrite impact.

Layout:

- Header: `Changes since last snapshot`
- Summary metrics:
  - `3 changed chapters`
  - `4 affected characters`
  - `2 unresolved threads`
  - `1 timeline item`
- Changed chapters list
- Affected elements list
- Suggested review areas

Use user-facing terms:

- Save Snapshot
- Compare Changes
- Affected Elements
- Restore Snapshot

Developer/debug mode may expose:

- commit hash
- branch
- raw diff
- Git status

But do not show these in the normal frame.

Success criteria:

- impact feels practical, not scary
- user can understand why they should review certain story elements
- Git remains invisible

## F07: Compact Desktop

Purpose: validate layout at `1280 x 800`.

Expected behavior:

- rail remains 56px
- navigator collapses or narrows
- context panel can become overlay/drawer
- editor remains comfortable

The editor must not become squeezed between two dominant sidebars.

Success criteria:

- writing remains comfortable
- context is accessible but not permanently competing
- no text overlaps or cramped toolbar behavior

## Interaction Notes for Figma Prototype

Prototype only the most important transitions:

- open / collapse navigator
- open / collapse context panel
- switch context tabs
- accept proposal card
- switch from default workspace to focus mode
- open Writers' Room from selected text

Do not prototype full project creation yet.

## Figma Component Set

Create a small component set during wireframing:

- App Shell
- Top Bar
- App Rail Item
- Navigator Chapter Row
- Editor Header
- Context Tabs
- Studio Coordinator Status Item
- Proposal Card
- State List Row
- State Detail Section
- Writers' Room Perspective Section
- Impact Metric

Do not build a full design system yet.

## Copy Guidelines

Use calm, plain product language.

Prefer:

- `Pending updates`
- `Affected chapters`
- `Unresolved threads`
- `Save Snapshot`
- `Review impact`
- `Accept update`

Avoid:

- `Agent swarm`
- `Memory mutation`
- `Graph projection`
- `Commit hash`
- `Prompt chain`
- `Vector context`

## Wireframe Review Checklist

Before moving to high fidelity, check:

- editor occupies the visual center
- side panels are useful but secondary
- UI does not look like a file explorer
- no raw folder names are visible
- proposal cards are understandable in 5 seconds
- Writers' Room feels like a professional meeting, not an unstructured chat stream
- snapshot view does not expose Git
- typography feels suitable for long writing sessions
- color does not create a one-note purple, beige, dark slate, or brown palette
- every panel can collapse or get out of the writing flow

## Next Step After This Spec

Use this document as the Figma generation brief.

The first Figma pass should prioritize:

1. F01 Manuscript Workspace - Default
2. F03 Proposal Review
3. F04 Writers' Room Meeting

Only after those three feel right should the remaining frames be refined.
