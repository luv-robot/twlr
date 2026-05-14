import type {
  CharacterState,
  CharacterStateFile,
  NarrativeEvent,
  OpenLoop,
  OpenLoopStateFile,
  TimelineEvent,
  TimelineStateFile,
} from "@twlr/schema";

export function createEmptyCharacterStateFile(): CharacterStateFile {
  return {
    schema_version: 1,
    characters: [],
  };
}

export function createEmptyOpenLoopStateFile(): OpenLoopStateFile {
  return {
    schema_version: 1,
    open_loops: [],
  };
}

export function createEmptyTimelineStateFile(): TimelineStateFile {
  return {
    schema_version: 1,
    timeline_events: [],
  };
}

export function applyCharacterEvents(
  stateFile: CharacterStateFile,
  events: NarrativeEvent[],
): CharacterStateFile {
  const characters = new Map(stateFile.characters.map((character) => [character.character_id, character]));

  for (const event of events) {
    if (event.payload.target_type !== "character") {
      continue;
    }

    const existing = characters.get(event.payload.target_id) ?? createUnknownCharacter(event.payload.target_id);
    const next = applyCharacterEvent(existing, event);
    characters.set(next.character_id, next);
  }

  return {
    schema_version: 1,
    characters: [...characters.values()],
  };
}

function applyCharacterEvent(character: CharacterState, event: NarrativeEvent): CharacterState {
  const base = {
    ...character,
    referenced_chapters: mergeUnique(character.referenced_chapters, event.references.chapters),
    open_loops: mergeUnique(character.open_loops, event.references.open_loops),
    updated_at: event.created_at,
  };

  if (typeof event.payload.new_value !== "string") {
    return base;
  }

  if (event.payload.field === "name") {
    return {
      ...base,
      name: event.payload.new_value,
    };
  }

  if (event.payload.field === "role") {
    return {
      ...base,
      role: event.payload.new_value,
    };
  }

  if (event.payload.field === "current_status") {
    return {
      ...base,
      current_status: event.payload.new_value,
    };
  }

  if (event.payload.field === "desire") {
    return {
      ...base,
      desire: event.payload.new_value,
    };
  }

  if (event.payload.field === "fear") {
    return {
      ...base,
      fear: event.payload.new_value,
    };
  }

  if (event.payload.field === "arc_stage") {
    return {
      ...base,
      arc_stage: event.payload.new_value,
    };
  }

  if (event.payload.field === "secret" || event.payload.field === "secrets") {
    return {
      ...base,
      secrets: mergeUnique(character.secrets ?? [], splitStateListValue(event.payload.new_value)),
    };
  }

  return base;
}

export function applyOpenLoopEvents(
  stateFile: OpenLoopStateFile,
  events: NarrativeEvent[],
): OpenLoopStateFile {
  const openLoops = new Map(stateFile.open_loops.map((openLoop) => [openLoop.open_loop_id, openLoop]));

  for (const event of events) {
    if (event.payload.target_type !== "open_loop") {
      continue;
    }

    const existing = openLoops.get(event.payload.target_id) ?? createUnknownOpenLoop(event.payload.target_id, event);
    const next = applyOpenLoopEvent(existing, event);
    openLoops.set(next.open_loop_id, next);
  }

  return {
    schema_version: 1,
    open_loops: [...openLoops.values()],
  };
}

export function applyTimelineEvents(
  stateFile: TimelineStateFile,
  events: NarrativeEvent[],
): TimelineStateFile {
  const timelineEvents = new Map(
    stateFile.timeline_events.map((timelineEvent) => [timelineEvent.timeline_event_id, timelineEvent]),
  );

  for (const event of events) {
    if (event.payload.target_type !== "timeline_event") {
      continue;
    }

    const existing = timelineEvents.get(event.payload.target_id) ?? createUnknownTimelineEvent(event.payload.target_id, event);
    const next = applyTimelineEvent(existing, event);
    timelineEvents.set(next.timeline_event_id, next);
  }

  return {
    schema_version: 1,
    timeline_events: [...timelineEvents.values()],
  };
}

function applyTimelineEvent(timelineEvent: TimelineEvent, event: NarrativeEvent): TimelineEvent {
  const base = {
    ...timelineEvent,
    characters: mergeUnique(timelineEvent.characters, event.references.characters),
    chapter_id: timelineEvent.chapter_id ?? event.references.chapters[0] ?? null,
    updated_at: event.created_at,
  };

  if (event.payload.field === "label" && typeof event.payload.new_value === "string") {
    return {
      ...base,
      label: event.payload.new_value,
    };
  }

  if (event.payload.field === "summary" && typeof event.payload.new_value === "string") {
    return {
      ...base,
      summary: event.payload.new_value,
    };
  }

  if (event.payload.field === "story_time" && typeof event.payload.new_value === "string") {
    return {
      ...base,
      story_time: event.payload.new_value,
    };
  }

  if (
    event.payload.field === "certainty" &&
    (event.payload.new_value === "confirmed" ||
      event.payload.new_value === "inferred" ||
      event.payload.new_value === "contradicted" ||
      event.payload.new_value === "needs_review")
  ) {
    return {
      ...base,
      certainty: event.payload.new_value,
    };
  }

  return base;
}

function applyOpenLoopEvent(openLoop: OpenLoop, event: NarrativeEvent): OpenLoop {
  const base = {
    ...openLoop,
    status: openLoop.status,
    related_chapters: mergeUnique(openLoop.related_chapters, event.references.chapters),
    related_characters: mergeUnique(openLoop.related_characters, event.references.characters),
    updated_at: event.created_at,
  };

  if (event.event_type === "open_loop_paid_off") {
    return {
      ...base,
      status: "paid_off",
    };
  }

  if (event.payload.field === "title" && typeof event.payload.new_value === "string") {
    return {
      ...base,
      title: event.payload.new_value,
    };
  }

  if (event.payload.field === "notes" && typeof event.payload.new_value === "string") {
    return {
      ...base,
      notes: event.payload.new_value,
    };
  }

  if (
    (event.payload.field === "summary" || event.payload.field === "description") &&
    typeof event.payload.new_value === "string"
  ) {
    return {
      ...base,
      notes: event.payload.new_value,
    };
  }

  if (event.payload.field === "expected_payoff" && typeof event.payload.new_value === "string") {
    return {
      ...base,
      expected_payoff: event.payload.new_value,
    };
  }

  if (event.payload.field === "status" && isOpenLoopStatus(event.payload.new_value)) {
    return {
      ...base,
      status: event.payload.new_value,
    };
  }

  return base;
}

function createUnknownCharacter(characterId: string): CharacterState {
  return {
    character_id: characterId,
    name: characterId.replace(/^char_/, "").replaceAll("_", " "),
    role: "unknown",
    current_status: "needs review",
    open_loops: [],
    relationships: [],
    referenced_chapters: [],
    updated_at: new Date().toISOString(),
  };
}

function createUnknownOpenLoop(openLoopId: string, event: NarrativeEvent): OpenLoop {
  return {
    open_loop_id: openLoopId,
    title: openLoopId.replace(/^loop_/, "").replaceAll("_", " "),
    status: "open",
    introduced_in: event.references.chapters[0] ?? null,
    expected_payoff: "needs review",
    related_characters: event.references.characters,
    related_chapters: event.references.chapters,
    notes: "Created from accepted proposal.",
    updated_at: event.created_at,
  };
}

function createUnknownTimelineEvent(timelineEventId: string, event: NarrativeEvent): TimelineEvent {
  return {
    timeline_event_id: timelineEventId,
    label: timelineEventId.replace(/^event_/, "").replaceAll("_", " "),
    story_time: "unknown",
    chapter_id: event.references.chapters[0] ?? null,
    scene_id: null,
    characters: event.references.characters,
    summary: "Created from accepted proposal.",
    certainty: "needs_review",
    updated_at: event.created_at,
  };
}

function mergeUnique(left: string[], right: string[]): string[] {
  return [...new Set([...left, ...right])];
}

function splitStateListValue(value: string): string[] {
  return value
    .split(/[,;\n]/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function isOpenLoopStatus(value: unknown): value is OpenLoop["status"] {
  return (
    value === "open" ||
    value === "developing" ||
    value === "paid_off" ||
    value === "dropped" ||
    value === "needs_review"
  );
}
