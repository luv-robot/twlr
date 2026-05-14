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
import { generateLlmStructured, getLlmEnvironmentStatus, type LlmProviderStatus } from "./twlrCommands";

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

  let providerStatus: LlmProviderStatus | null = null;

  try {
    providerStatus = await getLlmEnvironmentStatus();
    const proposal = await generateLlmStructured<StateProposal>({
      schema_name: remoteRequest.schemaName,
      json_schema: remoteRequest.jsonSchema,
      system_prompt: remoteRequest.systemPrompt,
      prompt: remoteRequest.prompt,
    });

    return {
      proposal: normalizeRemoteStateProposalSkillResult(proposal, remoteRequest, context),
      message: `${formatProviderLabel(providerStatus.provider)} ${remoteRequest.skillLabel} proposal generated.`,
    };
  } catch (error) {
    return {
      proposal: runMockProductionSkill(skillId, context),
      message: `${summarizeLlmProviderError(error, {
        providerLabel: providerStatus ? formatProviderLabel(providerStatus.provider) : "Remote provider",
        capabilityLabel: remoteRequest.skillLabel,
      })} Using mock ${remoteRequest.skillLabel}.`,
    };
  }
}

export async function getAiProviderStatus(): Promise<string> {
  if (!isTauriRuntime()) {
    return "Browser preview. Remote providers run in the Tauri desktop app.";
  }

  return (await getLlmEnvironmentStatus()).message;
}

function formatProviderLabel(provider: LlmProviderStatus["provider"]): string {
  if (provider === "deepseek") {
    return "DeepSeek";
  }

  return "OpenAI";
}
