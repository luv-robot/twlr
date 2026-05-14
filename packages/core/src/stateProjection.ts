import type { CharacterState, CharacterStateFile, NarrativeEvent } from "@twlr/schema";

export function createEmptyCharacterStateFile(): CharacterStateFile {
  return {
    schema_version: 1,
    characters: [],
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

function mergeUnique(left: string[], right: string[]): string[] {
  return [...new Set([...left, ...right])];
}
