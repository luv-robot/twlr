export type LlmProviderKind = "mock" | "remote";

export type RemoteLlmVendor = "openai" | "anthropic" | "gemini" | "custom";

export interface LlmProvider {
  readonly id: string;
  readonly label: string;
  readonly kind: LlmProviderKind;
  generateText(input: LlmTextRequest): Promise<LlmTextResponse>;
  generateStructured<T>(input: LlmStructuredRequest): Promise<LlmStructuredResponse<T>>;
  estimateCost?(usage: LlmUsage): LlmCostEstimate;
}

export interface LlmProviderConfig {
  provider_id: string;
  label: string;
  kind: LlmProviderKind;
  vendor?: RemoteLlmVendor;
  model?: string;
  base_url?: string;
  api_key_source?: "environment" | "desktop_keychain";
  api_key_ref?: string;
  enabled: boolean;
}

export interface LlmTextRequest {
  prompt: string;
  temperature?: number;
}

export interface LlmTextResponse {
  text: string;
  usage?: LlmUsage;
}

export interface LlmStructuredRequest {
  prompt: string;
  schemaName: string;
  temperature?: number;
}

export interface LlmStructuredResponse<T> {
  data: T;
  usage?: LlmUsage;
}

export interface LlmUsage {
  inputTokens?: number;
  outputTokens?: number;
  estimatedCostUsd?: number;
}

export interface LlmCostEstimate {
  estimatedCostUsd: number;
  currency: "USD";
}

export const mockProviderConfig: LlmProviderConfig = {
  provider_id: "mock",
  label: "Mock Provider",
  kind: "mock",
  enabled: true,
};

export function createMockLlmProvider(options: { textResponse?: string; structuredResponse?: unknown } = {}): LlmProvider {
  return {
    id: mockProviderConfig.provider_id,
    label: mockProviderConfig.label,
    kind: mockProviderConfig.kind,
    async generateText() {
      return {
        text: options.textResponse ?? "Mock provider response.",
        usage: {
          inputTokens: 0,
          outputTokens: 0,
          estimatedCostUsd: 0,
        },
      };
    },
    async generateStructured<T>() {
      if (options.structuredResponse === undefined) {
        throw new Error("Mock structured response is not configured.");
      }

      return {
        data: options.structuredResponse as T,
        usage: {
          inputTokens: 0,
          outputTokens: 0,
          estimatedCostUsd: 0,
        },
      };
    },
    estimateCost() {
      return {
        estimatedCostUsd: 0,
        currency: "USD",
      };
    },
  };
}

export function isRemoteProviderReady(config: LlmProviderConfig): boolean {
  if (config.kind !== "remote" || !config.enabled) {
    return false;
  }

  return Boolean(config.vendor && config.model && config.api_key_ref);
}
