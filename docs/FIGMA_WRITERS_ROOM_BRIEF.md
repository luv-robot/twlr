# Figma Brief: Writers' Room Page

The next design pass should focus on Writers' Room as TWLR's core consultation scene.

The meeting experience is more important to TWLR than the editor surface. The deepest product moat is the quality of official agents: professional consultation grounded in large-scale analysis of long-form works, genres, tropes, reader expectations, and production patterns.

## Updated Product Direction

Writers' Room has two distinct states:

1. **Live Meeting**
   - feels like a restrained professional group chat
   - low setup friction
   - no heavy management UI
   - agents respond when asked or explicitly invited
   - the author can ask follow-up questions naturally

2. **After Meeting**
   - the Studio Coordinator sends a meeting record
   - the record contains summary, key observations, cited manuscript passages or links when relevant, and optional state-save candidates
   - the author may save selected parts of the record into project state
   - nothing becomes durable state without author confirmation

This replaces the earlier "meeting as dashboard / decision queue" direction.

## Meeting Role Model

Meeting size is limited to 3-8 participants, including:

- Author
- Studio Coordinator / Assistant
- 1-6 official agents

Required participants:

- Author
- Studio Coordinator / Assistant
- at least 1 official agent

The Studio Coordinator is present in every meeting, but the meeting record is issued under the Assistant / Coordinator voice after the discussion ends.

## Agent Behavior

Agents should feel:

- professional
- restrained
- precise
- well-read
- senior but not theatrical

Agents should not:

- speak too often without being asked
- banter with each other
- roleplay personalities
- compete for attention
- create noisy brainstorming streams
- pressure the author with project-management language

Outside meetings, agents are not high-frequency proactive companions. At most, TWLR may send occasional low-volume emails or summaries when the user has opted in.

## Live Meeting Interaction Model

The live meeting can look like a normal group chat, but with professional discipline.

Flow:

```text
Author asks a question
-> Assistant confirms scope if needed
-> selected agents answer concisely
-> Author asks follow-up or ends meeting
-> Assistant creates meeting record
```

Live meeting UI should include:

- meeting title / question
- participant list, limited to 3-8 people
- current context scope, if available
- chat-style transcript
- simple composer
- end meeting button

Live meeting UI should avoid:

- decision queue
- production board
- dense state panels
- multiple simultaneous control surfaces
- complex meeting-management affordances
- voice/video controls

## After Meeting Interaction Model

When the author ends the meeting, TWLR generates a meeting record from the Assistant.

The meeting record should include:

- meeting question
- participants
- concise summary
- key observations grouped by topic or agent
- cited manuscript passages or chapter links when relevant
- "save to project state" candidates
- unresolved questions, if any

The author can:

- keep the record as meeting notes
- save selected notes into story state
- link notes to a chapter / character / open loop
- reopen the meeting thread
- discard the record

Avoid the term `decision queue` in normal user-facing UI.

Use softer language:

- `Save selected notes`
- `Add to project memory`
- `Link to Chapter 18`
- `Keep as meeting record`
- `Do not save`

## Design References

Reference:

- professional group chat
- editorial consultation transcript
- meeting minutes
- research interview notes
- document comments with citations

Do not reference:

- project management board
- ticket queue
- CRM dashboard
- agent marketplace
- roleplay room
- video-conference UI

Zoom-like references are allowed only at the level of participant presence and meeting state. Do not add voice, camera, or complex host controls in P0.

## Revised Variants To Explore

### Variant A: Live Consultation Room

Default live meeting view.

Structure:

- left participant strip or compact roster
- central chat transcript
- right context packet with current chapter / selected passage
- bottom composer
- top meeting status and `End meeting`

Best for the active discussion state.

### Variant B: Live Room With Source References

Same as Variant A, but shows cited manuscript passages beside agent responses.

Structure:

- chat transcript remains primary
- inline source cards / quote chips appear only when relevant
- source cards link to chapter, scene, or selected passage

Best for chapter review meetings and continuity questions.

### Variant C: Assistant Meeting Record

Default after-meeting state.

Structure:

- Assistant-authored meeting record
- summary first
- observations and citations below
- selected-save controls
- no pressure-heavy project-management language

Best for durable meeting output.

### Variant D: Save Selected Notes

Lightweight confirmation state for saving parts of a meeting record.

Structure:

- selected notes list
- destination choices: chapter, character, open loop, timeline, notes
- evidence / citation shown where available
- `Save selected` / `Keep as note` / `Do not save`

Best for human-in-the-loop state updates without a management-board feel.

## Required Frames

Create these desktop frames:

- Live Consultation Room
- Live Room With Source References
- Assistant Meeting Record
- Save Selected Notes

Frame size:

- 1440 x 960

Each frame should include:

- same demo project: `The Glass City`
- same author question about Mira's Chapter 03 reaction
- 3-8 participants including Author and Assistant
- professional restrained agent copy
- no voice controls
- no decision queue
- no production board
- no heavy dashboard pattern

## Copy Direction

Use low-emotion, professional language.

Good:

```text
Assistant: I will keep this meeting scoped to Chapter 03 and Mira's agency.
Reader Agent: The clue creates curiosity, but Mira needs one visible choice.
Assistant: Meeting record ready. 4 notes can be saved if you choose.
```

Avoid:

```text
Your creative team is excited to brainstorm!
Let's all jump in with ideas.
Decision queue: 3 pending actions require approval.
```
