import type { NarrativeEvent, StateProposal } from "@twlr/schema";
import { isTauriRuntime } from "./tauriRuntime";
import { appendNarrativeEvents, appendStateProposals } from "./twlrCommands";

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
