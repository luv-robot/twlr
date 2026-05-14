import { runMockProductionSkill, type ProductionSkillContext, type ProductionSkillId } from "@twlr/ai";
import { stateProposalJsonSchema, type StateProposal } from "@twlr/schema";
import { isTauriRuntime } from "./tauriRuntime";
import { generateOpenAiStructured, getOpenAiEnvironmentStatus } from "./twlrCommands";

export interface RunProductionSkillResult {
  proposal: StateProposal | null;
  message: string;
}

export async function runProductionSkill(
  skillId: ProductionSkillId,
  context: ProductionSkillContext,
): Promise<RunProductionSkillResult> {
  if (skillId !== "character_sheet" || !isTauriRuntime()) {
    return {
      proposal: runMockProductionSkill(skillId, context),
      message: "Mock skill output generated.",
    };
  }

  const proposalId = `proposal_${Date.now()}_openai_character`;
  const createdAt = new Date().toISOString();

  try {
    const proposal = await generateOpenAiStructured<StateProposal>({
      schema_name: "twlr_state_proposal",
      json_schema: stateProposalJsonSchema,
      system_prompt: [
        "You are TWLR's Character Sheet production skill.",
        "Return exactly one StateProposal JSON object.",
        "Do not mutate project state directly.",
        "Only propose durable story-state changes that the author can review.",
        "Use low-emotion, professional language.",
      ].join(" "),
      prompt: JSON.stringify(
        {
          task: "Create a Character Sheet state proposal from the context packet.",
          required_values: {
            proposal_id: proposalId,
            created_at: createdAt,
            status: "pending",
            source: {
              kind: "skill",
              name: "Character Sheet",
              llm_provider: "remote",
            },
            review: {
              reviewed_at: null,
              reviewed_by: null,
              decision: null,
              edited_summary: null,
            },
          },
          context_packet: context.context_packet,
          selected_text: context.selected_text ?? null,
        },
        null,
        2,
      ),
    });

    return {
      proposal: normalizeRemoteCharacterProposal(proposal, proposalId, createdAt, context),
      message: "OpenAI Character Sheet proposal generated.",
    };
  } catch (error) {
    return {
      proposal: runMockProductionSkill(skillId, context),
      message: error instanceof Error ? `${error.message} Using mock Character Sheet.` : "Using mock Character Sheet.",
    };
  }
}

export async function getAiProviderStatus(): Promise<string> {
  if (!isTauriRuntime()) {
    return "Browser preview. OpenAI runs in the Tauri desktop app.";
  }

  return (await getOpenAiEnvironmentStatus())
    ? "OpenAI provider ready."
    : "OPENAI_API_KEY is not set. Character Sheet will use mock output.";
}

function normalizeRemoteCharacterProposal(
  proposal: StateProposal,
  proposalId: string,
  createdAt: string,
  context: ProductionSkillContext,
): StateProposal {
  return {
    ...proposal,
    proposal_id: proposal.proposal_id || proposalId,
    created_at: proposal.created_at || createdAt,
    status: "pending",
    source: {
      kind: "skill",
      name: "Character Sheet",
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
