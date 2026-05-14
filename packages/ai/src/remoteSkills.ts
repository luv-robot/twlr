import { stateProposalJsonSchema, type StateProposal } from "@twlr/schema";
import type { ProductionSkillContext, ProductionSkillId } from "./skills";

interface RemoteStateProposalSkillDefinition {
  skillId: ProductionSkillId;
  skillLabel: string;
  proposalIdSuffix: string;
  systemFocus: string;
  task: string;
  outputRules: string[];
}

export interface CreateRemoteStateProposalSkillRequestOptions {
  createdAt?: string;
  proposalId?: string;
}

export interface RemoteStateProposalSkillRequest {
  skillId: ProductionSkillId;
  skillLabel: string;
  proposalId: string;
  createdAt: string;
  schemaName: string;
  jsonSchema: Record<string, unknown>;
  systemPrompt: string;
  prompt: string;
}

const remoteStateProposalSkillDefinitions: Partial<Record<ProductionSkillId, RemoteStateProposalSkillDefinition>> = {
  character_sheet: {
    skillId: "character_sheet",
    skillLabel: "Character Sheet",
    proposalIdSuffix: "openai_character",
    systemFocus: "Focus on observed character state, motivation signals, secrets, arc stage, and reader-facing function.",
    task: "Create a concise Character Sheet state proposal from the context packet.",
    outputRules: [
      "Summary must be one short state update, 18 to 28 English words when possible.",
      "Summary must not start with Create, Analyze, Review, or Suggest.",
      "Summary should describe the story-state change, not the skill action.",
      "Evidence should contain 1 or 2 short quotes or paraphrased observations from the selected text.",
      "Prefer character_state_changed for observed character status, motivation, fear, desire, secret, or arc-stage changes.",
      "If the text implies a secret, cover-up, unexplained motive, altered record, hidden identity, missing cause, or suspicious silence, include one open_loop_created proposal.",
      "If you propose an open loop, include its id in affected.open_loops.",
      "Do not produce broad literary critique or scene advice.",
    ],
  },
};

export function createRemoteStateProposalSkillRequest(
  skillId: ProductionSkillId,
  context: ProductionSkillContext,
  options: CreateRemoteStateProposalSkillRequestOptions = {},
): RemoteStateProposalSkillRequest | null {
  const definition = remoteStateProposalSkillDefinitions[skillId];

  if (!definition) {
    return null;
  }

  const createdAt = options.createdAt ?? new Date().toISOString();
  const proposalId = options.proposalId ?? `proposal_${Date.now()}_${definition.proposalIdSuffix}`;

  return {
    skillId,
    skillLabel: definition.skillLabel,
    proposalId,
    createdAt,
    schemaName: "twlr_state_proposal",
    jsonSchema: stateProposalJsonSchema,
    systemPrompt: createStateProposalSystemPrompt(definition),
    prompt: createStateProposalPrompt({ definition, context, proposalId, createdAt }),
  };
}

export function normalizeRemoteStateProposalSkillResult(
  proposal: StateProposal,
  request: RemoteStateProposalSkillRequest,
  context: ProductionSkillContext,
): StateProposal {
  const proposedEvents = proposal.proposed_events ?? [];

  return {
    ...proposal,
    proposal_id: proposal.proposal_id || request.proposalId,
    created_at: proposal.created_at || request.createdAt,
    status: "pending",
    source: {
      kind: "skill",
      name: request.skillLabel,
      llm_provider: "remote",
    },
    scope: {
      chapters: proposal.scope?.chapters?.length ? proposal.scope.chapters : [context.chapter_id],
      selected_text_range: proposal.scope?.selected_text_range ?? null,
    },
    affected: {
      chapters: proposal.affected?.chapters?.length ? proposal.affected.chapters : [context.chapter_id],
      characters: proposal.affected?.characters ?? [],
      open_loops: proposal.affected?.open_loops?.length
        ? proposal.affected.open_loops
        : inferOpenLoopIds(proposedEvents),
      timeline_events: proposal.affected?.timeline_events ?? [],
    },
    summary: normalizeProposalSummary(
      typeof proposal.summary === "string" ? proposal.summary : "Review character state update.",
    ),
    evidence: normalizeEvidence(proposal.evidence ?? []),
    proposed_events: proposedEvents,
    review: {
      reviewed_at: null,
      reviewed_by: null,
      decision: null,
      edited_summary: null,
    },
  };
}

function createStateProposalSystemPrompt(definition: RemoteStateProposalSkillDefinition): string {
  return [
    `You are TWLR's ${definition.skillLabel} production skill.`,
    "Return exactly one StateProposal JSON object.",
    "Do not mutate project state directly.",
    "Only propose durable story-state changes that the author can review.",
    "Represent proposed event old_value and new_value as concise strings or null.",
    "Use low-emotion, professional language.",
    definition.systemFocus,
    ...definition.outputRules,
  ].join(" ");
}

function createStateProposalPrompt(input: {
  definition: RemoteStateProposalSkillDefinition;
  context: ProductionSkillContext;
  proposalId: string;
  createdAt: string;
}): string {
  return JSON.stringify(
    {
      task: input.definition.task,
      required_values: {
        proposal_id: input.proposalId,
        created_at: input.createdAt,
        status: "pending",
        source: {
          kind: "skill",
          name: input.definition.skillLabel,
          llm_provider: "remote",
        },
        review: {
          reviewed_at: null,
          reviewed_by: null,
          decision: null,
          edited_summary: null,
        },
      },
      context_packet: input.context.context_packet,
      selected_text: input.context.selected_text ?? null,
      output_contract: {
        summary: "One short state update, not an explanation paragraph.",
        evidence: "1 or 2 short entries.",
        open_loop_policy:
          "Create an open loop when the selected text suggests a secret, cover-up, unexplained motive, suspicious silence, or altered record.",
        proposal_card_reader: "The author should be able to decide accept/reject from the card without reading a long essay.",
      },
    },
    null,
    2,
  );
}

function normalizeProposalSummary(summary: string): string {
  const trimmed = summary.trim();
  const sentences = trimmed.match(/[^.!?]+[.!?]?/g) ?? [trimmed];
  const firstSentence = sentences[0]?.trim() ?? trimmed;
  const words = firstSentence.split(/\s+/).filter(Boolean);

  if (words.length <= 32) {
    return firstSentence;
  }

  return `${words.slice(0, 28).join(" ")}...`;
}

function normalizeEvidence(evidence: string[]): string[] {
  return evidence
    .map((entry) => entry.trim())
    .filter(Boolean)
    .slice(0, 2);
}

function inferOpenLoopIds(events: StateProposal["proposed_events"]): string[] {
  return events
    .filter((event) => event.payload.target_type === "open_loop")
    .map((event) => event.payload.target_id)
    .filter(Boolean);
}
