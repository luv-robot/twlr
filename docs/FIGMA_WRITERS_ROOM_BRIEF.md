# Figma Brief: Writers' Room Page

The next Figma pass should focus on the Writers' Room page.

Goal: explore several professional meeting-room layouts that feel closer to Zoom, meeting notes, editorial review, or production review software than an agent chatroom.

## Design Constraints

- Writers' Room is a structured creative meeting.
- It should feel professional, not roleplay-oriented.
- The author remains the decision maker.
- Agents provide perspectives, not autonomous debate.
- Studio Coordinator summarizes and turns outcomes into proposal cards.
- Avoid making "not a chatroom" the only design principle; the page may borrow professional meeting affordances such as agenda, participants, active speaker, minutes, action items, and decisions.
- Avoid infinite chat streams.
- Avoid social companion aesthetics.
- Avoid roleplay avatars, mascot energy, emotional check-ins, or playful agent banter.
- Avoid making agents appear autonomous after the meeting ends.

## Core Interaction Model

The meeting is a bounded event.

```text
Author question
-> selected perspectives
-> concise observations
-> Coordinator summary
-> author decision
-> optional proposal cards
```

The author should always understand:

- what question is being discussed
- which perspectives are present
- what each perspective observed
- what the Coordinator recommends operationally
- what will become project state only after author confirmation

## Meeting Tool References

Reference professional patterns rather than social chat patterns:

- Zoom participant strip and active speaker hierarchy
- meeting agenda / minutes layout
- document review side panel
- action item tracker
- production review dashboard
- editorial meeting notes

Do not imitate consumer chat:

- no scrolling message transcript as the main artifact
- no typing indicators as a core interaction
- no agent-to-agent banter
- no presence-driven social feed

## Variants To Explore

### Variant A: Meeting Minutes

Structure:

- question / agenda at top
- selected perspectives as participants
- concise observations grouped by agent
- Coordinator summary
- decision section
- proposal card creation action

Best for clarity and reviewability.

Design notes:

- make the meeting output look like a durable record
- emphasize decisions and action items over conversational turns
- suitable default for serious revision work

### Variant B: Professional Video Meeting Metaphor

Structure:

- participant strip
- active speaker / selected perspective panel
- meeting notes column
- decision queue
- Coordinator as meeting host

Best for making Writers' Room feel like a real professional room.

Design notes:

- borrow the mental model of a meeting, not literal video tiles
- participants can be compact role chips instead of faces
- active perspective can feel like a speaker view
- meeting notes should remain more important than any avatar or tile

### Variant C: Editorial Roundtable

Structure:

- central author question
- perspective cards arranged as editorial seats
- risk / suggestion / evidence fields
- lower decision rail

Best for showing multiple lenses at once.

Design notes:

- useful when comparing agent perspectives side by side
- avoid card overload by keeping each role's output short
- preserve a clear final decision area

### Variant D: Review Packet

Structure:

- left context packet
- right agent observations
- bottom state proposal candidates

Best for state-first clarity and long-form revision workflows.

Design notes:

- best when context projection is visible
- strongest for continuity, timeline, and rewrite impact meetings
- may feel denser than the default meeting page

### Variant E: Production Review Board

Structure:

- agenda and scope header
- left role roster
- center observation table
- right decision queue
- bottom proposal card staging area

Best for web novel / script production workflows where many chapters and open loops are active.

Design notes:

- feels like a producer's review board
- supports repeated use without drama
- good bridge between Writers' Room and Studio Coordinator

## Required States

Each variant should show:

- before meeting
- meeting with observations
- Coordinator summary
- generated proposal cards
- rejected / accepted decision state
- meeting already recorded
- proposal generation in progress
- no selected perspectives

## Figma Deliverables

Create at least three desktop frames:

- Meeting Minutes default
- Professional Meeting variant
- Production Review Board variant

Optional fourth frame:

- Review Packet dense mode

Each frame should include:

- 1440 x 960 desktop layout
- same demo content and agent labels
- visible author question
- selected perspectives
- Coordinator summary
- proposal card action
- enough surrounding shell to understand where the editor sits

Do not redesign the whole TWLR app during this pass. Focus on the Writers' Room page and its right-side / full-page meeting behavior.

## Copy Direction

Use low-emotion, professional language.

Good:

```text
3 perspectives returned observations.
2 proposal cards are ready for review.
Chapter 18 payoff may be affected.
```

Avoid:

```text
Your creative team is excited to help.
Let's brainstorm together.
```
