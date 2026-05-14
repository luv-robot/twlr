import type { NarrativeEvent, StateProposal } from "@twlr/schema";
import type { CharacterStateFile } from "@twlr/schema";
import { isTauriRuntime } from "./tauriRuntime";
import { appendNarrativeEvents, appendStateProposals, writeCharacterState } from "./twlrCommands";

export type PersistenceResult =
  | {
      status: "persisted";
      message: string;
    }
  | {
      status: "skipped";
      message: string;
    };

export interface PersistAcceptedProposalInput {
  projectPath: string | null;
  proposal: StateProposal;
  events: NarrativeEvent[];
}

export async function persistAcceptedProposal(input: PersistAcceptedProposalInput): Promise<PersistenceResult> {
  if (!input.projectPath) {
    return {
      status: "skipped",
      message: "Demo session only. No project folder is open.",
    };
  }

  if (!isTauriRuntime()) {
    return {
      status: "skipped",
      message: "Browser preview only. Tauri storage is unavailable.",
    };
  }

  await appendStateProposals({
    project_path: input.projectPath,
    records: [input.proposal],
  });
  await appendNarrativeEvents({
    project_path: input.projectPath,
    records: input.events,
  });

  return {
    status: "persisted",
    message: `${input.events.length} event(s) appended to local project logs.`,
  };
}

export async function persistCharacterState(
  projectPath: string | null,
  state: CharacterStateFile,
): Promise<PersistenceResult> {
  if (!projectPath) {
    return {
      status: "skipped",
      message: "Character state is held in this demo session.",
    };
  }

  if (!isTauriRuntime()) {
    return {
      status: "skipped",
      message: "Browser preview only. Character state was not written.",
    };
  }

  await writeCharacterState({
    project_path: projectPath,
    value: state,
  });

  return {
    status: "persisted",
    message: "Character state updated in local project.",
  };
}
