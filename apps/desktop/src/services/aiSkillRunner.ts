import {
  createRemoteStateProposalSkillRequest,
  normalizeRemoteStateProposalSkillResult,
  runMockProductionSkill,
  summarizeLlmProviderError,
  type ProductionSkillContext,
  type ProductionSkillId,
} from "@twlr/ai";
import type { StateProposal } from "@twlr/schema";
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
  const remoteRequest = createRemoteStateProposalSkillRequest(skillId, context);

  if (!remoteRequest || !isTauriRuntime()) {
    return {
      proposal: runMockProductionSkill(skillId, context),
      message: "Mock skill output generated.",
    };
  }

  try {
    const proposal = await generateOpenAiStructured<StateProposal>({
      schema_name: remoteRequest.schemaName,
      json_schema: remoteRequest.jsonSchema,
      system_prompt: remoteRequest.systemPrompt,
      prompt: remoteRequest.prompt,
    });

    return {
      proposal: normalizeRemoteStateProposalSkillResult(proposal, remoteRequest, context),
      message: `OpenAI ${remoteRequest.skillLabel} proposal generated.`,
    };
  } catch (error) {
    return {
      proposal: runMockProductionSkill(skillId, context),
      message: `${summarizeLlmProviderError(error, {
        providerLabel: "OpenAI",
        capabilityLabel: remoteRequest.skillLabel,
      })} Using mock ${remoteRequest.skillLabel}.`,
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
