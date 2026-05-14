import type { CharacterState, CharacterStateFile, NarrativeEvent, OpenLoop, OpenLoopStateFile } from "@twlr/schema";

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
  if (event.payload.field === "current_status" && typeof event.payload.new_value === "string") {
    return {
      ...character,
      current_status: event.payload.new_value,
      referenced_chapters: mergeUnique(character.referenced_chapters, event.references.chapters),
      open_loops: mergeUnique(character.open_loops, event.references.open_loops),
      updated_at: event.created_at,
    };
  }

  return {
    ...character,
    referenced_chapters: mergeUnique(character.referenced_chapters, event.references.chapters),
    open_loops: mergeUnique(character.open_loops, event.references.open_loops),
    updated_at: event.created_at,
  };
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

function applyOpenLoopEvent(openLoop: OpenLoop, event: NarrativeEvent): OpenLoop {
  if (event.event_type === "open_loop_paid_off") {
    return {
      ...openLoop,
      status: "paid_off",
      related_chapters: mergeUnique(openLoop.related_chapters, event.references.chapters),
      related_characters: mergeUnique(openLoop.related_characters, event.references.characters),
      updated_at: event.created_at,
    };
  }

  if (event.payload.field === "title" && typeof event.payload.new_value === "string") {
    return {
      ...openLoop,
      title: event.payload.new_value,
      related_chapters: mergeUnique(openLoop.related_chapters, event.references.chapters),
      related_characters: mergeUnique(openLoop.related_characters, event.references.characters),
      updated_at: event.created_at,
    };
  }

  if (event.payload.field === "notes" && typeof event.payload.new_value === "string") {
    return {
      ...openLoop,
      notes: event.payload.new_value,
      related_chapters: mergeUnique(openLoop.related_chapters, event.references.chapters),
      related_characters: mergeUnique(openLoop.related_characters, event.references.characters),
      updated_at: event.created_at,
    };
  }

  return {
    ...openLoop,
    status: openLoop.status === "paid_off" ? "paid_off" : "open",
    related_chapters: mergeUnique(openLoop.related_chapters, event.references.chapters),
    related_characters: mergeUnique(openLoop.related_characters, event.references.characters),
    updated_at: event.created_at,
  };
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

function mergeUnique(left: string[], right: string[]): string[] {
  return [...new Set([...left, ...right])];
}
