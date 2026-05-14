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
        "Represent proposed event old_value and new_value as concise strings or null.",
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
      message: `${summarizeOpenAiError(error)} Using mock Character Sheet.`,
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

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }

  if (typeof error === "string") {
    return error;
  }

  try {
    return JSON.stringify(error);
  } catch {
    return "Unknown error.";
  }
}

function summarizeOpenAiError(error: unknown): string {
  const message = getErrorMessage(error);

  if (message.includes("insufficient_quota") || message.includes("exceeded your current quota")) {
    return "OpenAI Character Sheet failed: quota is unavailable. Check the API key's plan, billing, or credits.";
  }

  if (message.includes("invalid_api_key") || message.includes("Incorrect API key") || message.includes("401")) {
    return "OpenAI Character Sheet failed: API key is invalid or not authorized.";
  }

  if (message.includes("model_not_found") || message.includes("does not have access to model") || message.includes("404")) {
    return "OpenAI Character Sheet failed: the configured model is unavailable for this key.";
  }

  if (message.includes("schema") || message.includes("response_format") || message.includes("json_schema")) {
    return `OpenAI Character Sheet failed: structured output schema was rejected. ${message}`;
  }

  return `OpenAI Character Sheet failed: ${message}`;
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
