import { stateProposalJsonSchema, type StateProposal } from "@twlr/schema";
import type { ProductionSkillContext, ProductionSkillId } from "./skills";

interface RemoteStateProposalSkillDefinition {
  skillId: ProductionSkillId;
  skillLabel: string;
  proposalIdSuffix: string;
  systemFocus: string;
  task: string;
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
    systemFocus: "Focus on character state, motivation, secrets, arc stage, and reader-facing function.",
    task: "Create a Character Sheet state proposal from the context packet.",
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
    },
    null,
    2,
  );
}
