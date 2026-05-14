import type { NarrativeEvent, OpenLoopStateFile, RoomMeeting, StateProposal, TimelineStateFile } from "@twlr/schema";
import type { CharacterStateFile } from "@twlr/schema";
import { isTauriRuntime } from "./tauriRuntime";
import {
  appendNarrativeEvents,
  appendRoomMeetings,
  appendStateProposals,
  writeCharacterState,
  writeOpenLoopState,
  writeTimelineState,
} from "./twlrCommands";

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

export async function persistPendingProposals(
  projectPath: string | null,
  proposals: StateProposal[],
): Promise<PersistenceResult> {
  if (proposals.length === 0) {
    return {
      status: "skipped",
      message: "No proposal cards to persist.",
    };
  }

  if (!projectPath) {
    return {
      status: "skipped",
      message: "Proposal cards are held in this demo session.",
    };
  }

  if (!isTauriRuntime()) {
    return {
      status: "skipped",
      message: "Browser preview only. Proposal cards were not written.",
    };
  }

  await appendStateProposals({
    project_path: projectPath,
    records: proposals,
  });

  return {
    status: "persisted",
    message: `${proposals.length} proposal card(s) saved for review.`,
  };
}

export async function persistReviewedProposal(
  projectPath: string | null,
  proposal: StateProposal,
): Promise<PersistenceResult> {
  if (!projectPath) {
    return {
      status: "skipped",
      message: "Reviewed proposal is held in this demo session.",
    };
  }

  if (!isTauriRuntime()) {
    return {
      status: "skipped",
      message: "Browser preview only. Reviewed proposal was not written.",
    };
  }

  await appendStateProposals({
    project_path: projectPath,
    records: [proposal],
  });

  return {
    status: "persisted",
    message: `Proposal ${proposal.status}.`,
  };
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

export async function persistOpenLoopState(
  projectPath: string | null,
  state: OpenLoopStateFile,
): Promise<PersistenceResult> {
  if (!projectPath) {
    return {
      status: "skipped",
      message: "Open loop state is held in this demo session.",
    };
  }

  if (!isTauriRuntime()) {
    return {
      status: "skipped",
      message: "Browser preview only. Open loop state was not written.",
    };
  }

  await writeOpenLoopState({
    project_path: projectPath,
    value: state,
  });

  return {
    status: "persisted",
    message: "Open loop state updated in local project.",
  };
}

export async function persistTimelineState(
  projectPath: string | null,
  state: TimelineStateFile,
): Promise<PersistenceResult> {
  if (!projectPath) {
    return {
      status: "skipped",
      message: "Timeline state is held in this demo session.",
    };
  }

  if (!isTauriRuntime()) {
    return {
      status: "skipped",
      message: "Browser preview only. Timeline state was not written.",
    };
  }

  await writeTimelineState({
    project_path: projectPath,
    value: state,
  });

  return {
    status: "persisted",
    message: "Timeline state updated in local project.",
  };
}

export async function persistRoomMeeting(
  projectPath: string | null,
  meeting: RoomMeeting,
): Promise<PersistenceResult> {
  if (!projectPath) {
    return {
      status: "skipped",
      message: "Writers' Room meeting is held in this demo session.",
    };
  }

  if (!isTauriRuntime()) {
    return {
      status: "skipped",
      message: "Browser preview only. Meeting was not written.",
    };
  }

  await appendRoomMeetings({
    project_path: projectPath,
    records: [meeting],
  });

  return {
    status: "persisted",
    message: "Writers' Room meeting appended to local project log.",
  };
}
