# TWLR MVP Data Model

This document defines the MVP data model for The Writer's Living Room.

The model follows one rule:

```text
Portable local files are the source of truth.
SQLite is an index and cache.
AI output is a proposal until the author confirms it.
```

## Source Of Truth

The durable project truth lives in:

1. `twlr.project.json`
2. `manuscript/*.md`
3. `events/narrative_events.jsonl`
4. `state/*.json`
5. `proposals/state_proposals.jsonl`
6. `meetings/room_meetings.jsonl`

SQLite can always be rebuilt from local project files.

## Project Folder

```text
my-story/
├── manuscript/
│   ├── chapter-001.md
│   └── chapter-002.md
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
├── assets/
├── cache/
│   └── twlr.sqlite
├── .gitignore
└── twlr.project.json
```

## ID Conventions

IDs should be stable, readable, and scoped by entity type.

Examples:

- `work_main`
- `chapter_001`
- `scene_001_01`
- `char_mira_chen`
- `rel_mira_shen`
- `loop_altered_archive_record`
- `event_000042`
- `proposal_000018`
- `meeting_000007`

The MVP can generate IDs with deterministic slugs plus collision suffixes.

## Common Metadata

Most durable records should include:

```json
{
  "id": "record_id",
  "created_at": "2026-05-14T00:00:00.000Z",
  "updated_at": "2026-05-14T00:00:00.000Z",
  "source": "user"
}
```

Recommended `source` values:

- `user`
- `import`
- `accepted_proposal`
- `system`
- `migration`

## Project Metadata

File: `twlr.project.json`

```json
{
  "schema_version": 1,
  "project_id": "project_glass_city",
  "title": "The Glass City",
  "kind": "web_novel",
  "language": "en",
  "created_at": "2026-05-14T00:00:00.000Z",
  "updated_at": "2026-05-14T00:00:00.000Z",
  "settings": {
    "default_chapter_directory": "manuscript",
    "snapshot_mode": "manual",
    "developer_mode": false
  }
}
```

Recommended `kind` values:

- `web_novel`
- `script`
- `light_novel`
- `genre_fiction`
- `other`

## Manuscript Chapter

File: `manuscript/chapter-001.md`

Use Markdown with optional frontmatter.

```markdown
---
id: chapter_001
title: Rain at the South Gate
order: 1
status: draft
word_count: 2140
created_at: 2026-05-14T00:00:00.000Z
updated_at: 2026-05-14T00:00:00.000Z
---

# Rain at the South Gate

Chapter text...
```

Recommended `status` values:

- `outline`
- `draft`
- `revision`
- `locked`

The stored `word_count` is advisory. The app may recalculate it during indexing.

## Work State

File: `state/work.json`

```json
{
  "schema_version": 1,
  "work_id": "work_main",
  "title": "The Glass City",
  "genre": ["mystery", "fantasy"],
  "format": "web_novel",
  "current_phase": "draft",
  "main_plot_status": "paused before the archive reveal",
  "active_chapter_id": "chapter_003",
  "last_main_plot_update_at": "2026-05-01T00:00:00.000Z",
  "tags": ["archive", "hidden identity", "political intrigue"]
}
```

## Character State

File: `state/characters.json`

```json
{
  "schema_version": 1,
  "characters": [
    {
      "character_id": "char_mira_chen",
      "name": "Mira Chen",
      "role": "protagonist",
      "current_status": "suspects the archive record was changed",
      "desire": "prove the archive record was altered",
      "fear": "accusing the wrong person before she has proof",
      "arc_stage": "investigation",
      "secrets": [],
      "open_loops": ["loop_altered_archive_record"],
      "relationships": ["rel_mira_shen"],
      "referenced_chapters": ["chapter_001", "chapter_002", "chapter_003"],
      "updated_at": "2026-05-14T00:00:00.000Z"
    }
  ]
}
```

MVP required fields:

- `character_id`
- `name`
- `role`
- `current_status`
- `referenced_chapters`

## Relationship State

File: `state/relationships.json`

```json
{
  "schema_version": 1,
  "relationships": [
    {
      "relationship_id": "rel_mira_shen",
      "character_ids": ["char_mira_chen", "char_shen_yao"],
      "type": "trust_conflict",
      "current_status": "Mira suspects Shen Yao knows more than he says",
      "tension": "withheld information",
      "open_loops": ["loop_shen_silence"],
      "referenced_chapters": ["chapter_003"],
      "updated_at": "2026-05-14T00:00:00.000Z"
    }
  ]
}
```

## Timeline Event

File: `state/timeline.json`

```json
{
  "schema_version": 1,
  "timeline_events": [
    {
      "timeline_event_id": "time_archive_record_changed",
      "label": "Archive record was altered",
      "story_time": "before Chapter 03",
      "chapter_id": "chapter_003",
      "scene_id": null,
      "characters": ["char_mira_chen"],
      "summary": "Mira notices that the ink is newer than the paper.",
      "certainty": "confirmed",
      "updated_at": "2026-05-14T00:00:00.000Z"
    }
  ]
}
```

Recommended `certainty` values:

- `confirmed`
- `inferred`
- `contradicted`
- `needs_review`

## Open Loop

File: `state/open_loops.json`

```json
{
  "schema_version": 1,
  "open_loops": [
    {
      "open_loop_id": "loop_altered_archive_record",
      "title": "Altered archive record",
      "status": "open",
      "introduced_in": "chapter_003",
      "expected_payoff": "unknown",
      "related_characters": ["char_mira_chen", "char_shen_yao"],
      "related_chapters": ["chapter_003"],
      "notes": "The paper is old but the ink appears new.",
      "updated_at": "2026-05-14T00:00:00.000Z"
    }
  ]
}
```

Recommended `status` values:

- `open`
- `developing`
- `paid_off`
- `dropped`
- `needs_review`

## Theme State

File: `state/themes.json`

```json
{
  "schema_version": 1,
  "themes": [
    {
      "theme_id": "theme_truth_records",
      "label": "Truth and official records",
      "description": "The story repeatedly questions whether institutional memory can be trusted.",
      "related_chapters": ["chapter_001", "chapter_003"],
      "related_open_loops": ["loop_altered_archive_record"],
      "updated_at": "2026-05-14T00:00:00.000Z"
    }
  ]
}
```

Theme state is optional in early P0.

## World Rule

File: `state/world_rules.json`

```json
{
  "schema_version": 1,
  "world_rules": [
    {
      "world_rule_id": "rule_archive_ink",
      "title": "Archive ink aging",
      "description": "Official archive ink should not retain a wet shine after one day.",
      "status": "confirmed",
      "related_chapters": ["chapter_003"],
      "updated_at": "2026-05-14T00:00:00.000Z"
    }
  ]
}
```

World rules are optional in early P0 but important for fantasy, sci-fi, and light novel workflows.

## Narrative Event Log

File: `events/narrative_events.jsonl`

One JSON object per line.

Narrative events are append-only records of durable story-state changes.

```json
{
  "event_id": "event_000042",
  "event_type": "character_state_changed",
  "created_at": "2026-05-14T00:00:00.000Z",
  "source": {
    "kind": "accepted_proposal",
    "proposal_id": "proposal_000018"
  },
  "references": {
    "chapters": ["chapter_003"],
    "characters": ["char_mira_chen"],
    "open_loops": ["loop_altered_archive_record"],
    "timeline_events": []
  },
  "payload": {
    "target_type": "character",
    "target_id": "char_mira_chen",
    "field": "current_status",
    "old_value": "investigating the archive",
    "new_value": "suspects the archive record was changed"
  }
}
```

Recommended `event_type` values:

- `character_created`
- `character_state_changed`
- `relationship_state_changed`
- `timeline_event_created`
- `timeline_event_changed`
- `open_loop_created`
- `open_loop_changed`
- `open_loop_paid_off`
- `theme_changed`
- `world_rule_changed`
- `chapter_metadata_changed`

## State Proposal

File: `proposals/state_proposals.jsonl`

One JSON object per line.

AI output becomes a proposal first. It does not mutate durable state until the author accepts it.

```json
{
  "proposal_id": "proposal_000018",
  "created_at": "2026-05-14T00:00:00.000Z",
  "status": "pending",
  "source": {
    "kind": "skill",
    "name": "Character Sheet",
    "llm_provider": "remote"
  },
  "scope": {
    "chapters": ["chapter_003"],
    "selected_text_range": {
      "chapter_id": "chapter_003",
      "start": 240,
      "end": 520
    }
  },
  "affected": {
    "chapters": ["chapter_003"],
    "characters": ["char_mira_chen"],
    "open_loops": ["loop_altered_archive_record"],
    "timeline_events": []
  },
  "summary": "Mira now suspects that the archive record was changed after the trial.",
  "evidence": [
    "The paper was old, but the ink had the faint wet shine of something written in a hurry."
  ],
  "proposed_events": [
    {
      "event_type": "character_state_changed",
      "payload": {
        "target_type": "character",
        "target_id": "char_mira_chen",
        "field": "current_status",
        "old_value": "investigating the archive",
        "new_value": "suspects the archive record was changed"
      }
    }
  ],
  "review": {
    "reviewed_at": null,
    "reviewed_by": null,
    "decision": null,
    "edited_summary": null
  }
}
```

Recommended `status` values:

- `pending`
- `accepted`
- `edited`
- `rejected`

Only `accepted` or `edited` proposals append narrative events.

## Writers' Room Meeting

File: `meetings/room_meetings.jsonl`

```json
{
  "meeting_id": "meeting_000007",
  "created_at": "2026-05-14T00:00:00.000Z",
  "question": "Does Mira's reaction in Chapter 03 feel too passive?",
  "scope": {
    "chapters": ["chapter_003"],
    "characters": ["char_mira_chen"],
    "open_loops": ["loop_altered_archive_record"]
  },
  "perspectives": [
    {
      "agent_id": "development_editor",
      "label": "Development Editor",
      "observation": "The scene has a strong clue, but Mira does not make a visible choice after noticing it.",
      "risk": "The chapter may feel like setup without movement.",
      "suggested_check": "Give her one private decision."
    }
  ],
  "studio_coordinator_summary": {
    "summary": "Mira can remain cautious, but the scene needs one visible choice.",
    "follow_up_actions": [
      "Review Mira's action at the end of Chapter 03",
      "Create proposal card for altered archive record"
    ]
  },
  "generated_proposals": ["proposal_000018"],
  "author_decision": {
    "decision": "create_proposal_cards",
    "decided_at": "2026-05-14T00:00:00.000Z"
  }
}
```

Recommended `author_decision.decision` values:

- `create_proposal_cards`
- `keep_as_meeting_note`
- `ask_follow_up`
- `dismiss`

## Studio Coordinator Status

The Studio Coordinator status can be computed from project files and cached in SQLite.

It does not need to be a durable source-of-truth file in P0.

Computed shape:

```json
{
  "generated_at": "2026-05-14T00:00:00.000Z",
  "project_id": "project_glass_city",
  "summary": "3 pending updates, 2 unresolved threads, 1 possible timeline conflict.",
  "metrics": {
    "pending_proposals": 3,
    "unresolved_open_loops": 2,
    "changed_chapters_since_snapshot": 3,
    "timeline_conflicts": 1,
    "unreviewed_meeting_followups": 2
  },
  "alerts": [
    {
      "severity": "review",
      "message": "Chapter 18 payoff may be affected by today's edits.",
      "related": {
        "chapters": ["chapter_018"],
        "open_loops": ["loop_altered_archive_record"]
      }
    }
  ],
  "next_actions": [
    {
      "action_id": "review_pending_updates",
      "label": "Review pending updates",
      "target": "proposals"
    }
  ]
}
```

Recommended `severity` values:

- `info`
- `review`
- `warning`
- `risk`

## Snapshot Metadata

Git stores the actual snapshot.

The app may cache writer-facing metadata:

```json
{
  "snapshot_id": "snapshot_000012",
  "created_at": "2026-05-14T00:00:00.000Z",
  "label": "Before Chapter 12 rewrite",
  "git_commit": "hidden_in_normal_mode",
  "changed_chapters": ["chapter_003", "chapter_004"],
  "author_note": "Preserve version before reveal changes."
}
```

This metadata can live in SQLite in P0. If it becomes durable later, add `snapshots/snapshots.jsonl`.

## SQLite Cache

File: `cache/twlr.sqlite`

SQLite is for speed and search only.

Recommended P0 tables:

### `chapter_index`

- `chapter_id`
- `file_path`
- `title`
- `chapter_order`
- `status`
- `word_count`
- `updated_at`

### `entity_index`

- `entity_id`
- `entity_type`
- `display_name`
- `state_file`
- `updated_at`

### `mention_index`

- `mention_id`
- `entity_id`
- `chapter_id`
- `start_offset`
- `end_offset`
- `confidence`

### `proposal_index`

- `proposal_id`
- `status`
- `source_kind`
- `created_at`
- `affected_count`

### `meeting_index`

- `meeting_id`
- `question`
- `created_at`
- `generated_proposal_count`
- `unreviewed_followup_count`

### `snapshot_index`

- `snapshot_id`
- `created_at`
- `label`
- `changed_chapter_count`

### `fts_manuscript`

Use SQLite FTS5 if available.

- `chapter_id`
- `title`
- `body`

## Context Projection Packet

Context projection should create task-specific packets for AI calls.

```json
{
  "task": "character_sheet",
  "request": "Extract character state updates from Chapter 03.",
  "scope": {
    "chapters": ["chapter_003"],
    "selected_text": null
  },
  "manuscript": [
    {
      "chapter_id": "chapter_003",
      "title": "A Name Removed",
      "excerpt": "Mira noticed the receipt before anyone else did..."
    }
  ],
  "state": {
    "characters": [],
    "open_loops": [],
    "timeline_events": []
  },
  "recent_events": [],
  "output_schema": "state_proposal"
}
```

The projection packet is not a durable file by default.

## Mutation Rules

P0 must follow these rules:

1. Manuscript edits write only to `manuscript/*.md`.
2. AI output writes only to `proposals/state_proposals.jsonl` or `meetings/room_meetings.jsonl`.
3. Durable story state changes only after author confirmation.
4. Accepted proposal appends one or more narrative events.
5. Projected state updates from accepted narrative events.
6. SQLite indexes can be rebuilt and are never the only copy.
7. Git snapshots are manual and meaningful, not autosave commits.

## Schema Package Mapping

Recommended schema files:

```text
packages/schema/
├── project.schema.json
├── chapter.schema.json
├── work.schema.json
├── character.schema.json
├── relationship.schema.json
├── timeline_event.schema.json
├── open_loop.schema.json
├── theme.schema.json
├── world_rule.schema.json
├── narrative_event.schema.json
├── state_proposal.schema.json
├── room_meeting.schema.json
└── studio_coordinator_status.schema.json
```

In implementation, Zod can be the source schema and JSON Schema can be generated later.

## MVP Data Model Definition Of Done

The data layer is ready for P0 implementation when:

- project creation writes all required files
- project validation catches missing required files
- chapter files can be indexed
- proposals can be accepted / edited / rejected
- accepted proposals append narrative events
- projected state can be rebuilt from local files
- Coordinator status can be computed from local project state
- SQLite can be deleted and rebuilt without data loss
