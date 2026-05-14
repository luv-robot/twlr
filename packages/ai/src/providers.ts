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
  systemPrompt?: string;
  temperature?: number;
}

export interface LlmTextResponse {
  text: string;
  usage?: LlmUsage;
}

export interface LlmStructuredRequest {
  prompt: string;
  schemaName: string;
  jsonSchema?: Record<string, unknown>;
  systemPrompt?: string;
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

export const defaultOpenAiProviderConfig: LlmProviderConfig = {
  provider_id: "openai",
  label: "OpenAI",
  kind: "remote",
  vendor: "openai",
  model: "gpt-4.1-mini",
  base_url: "https://api.openai.com/v1",
  api_key_source: "environment",
  api_key_ref: "OPENAI_API_KEY",
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

export interface CreateOpenAiProviderOptions {
  config?: LlmProviderConfig;
  apiKey?: string;
  fetchImpl?: typeof fetch;
}

interface OpenAiResponsesResult {
  id?: string;
  output_text?: string;
  output?: Array<{
    content?: Array<{
      type?: string;
      text?: string;
    }>;
  }>;
  usage?: {
    input_tokens?: number;
    output_tokens?: number;
  };
}

export function createOpenAiProvider(options: CreateOpenAiProviderOptions = {}): LlmProvider {
  const config = options.config ?? defaultOpenAiProviderConfig;
  const fetchImpl = options.fetchImpl ?? fetch;
  const apiKey = options.apiKey ?? readEnvironmentApiKey(config.api_key_ref);

  if (config.vendor !== "openai") {
    throw new Error("OpenAI provider requires an OpenAI vendor config.");
  }

  return {
    id: config.provider_id,
    label: config.label,
    kind: config.kind,
    async generateText(input: LlmTextRequest) {
      const result = await createOpenAiResponse({
        apiKey,
        config,
        fetchImpl,
        input: buildOpenAiInput(input.prompt, input.systemPrompt),
        temperature: input.temperature,
      });

      return {
        text: extractOpenAiText(result),
        usage: mapOpenAiUsage(result),
      };
    },
    async generateStructured<T>(input: LlmStructuredRequest) {
      const result = await createOpenAiResponse({
        apiKey,
        config,
        fetchImpl,
        input: buildOpenAiInput(input.prompt, input.systemPrompt),
        text:
          input.jsonSchema ?
            {
              format: {
                type: "json_schema",
                name: input.schemaName,
                schema: input.jsonSchema,
                strict: true,
              },
            }
          : undefined,
        temperature: input.temperature,
      });
      const text = extractOpenAiText(result);

      return {
        data: JSON.parse(text) as T,
        usage: mapOpenAiUsage(result),
      };
    },
  };
}

function buildOpenAiInput(prompt: string, systemPrompt?: string) {
  return [
    ...(systemPrompt ? [{ role: "system", content: systemPrompt }] : []),
    { role: "user", content: prompt },
  ];
}

async function createOpenAiResponse(input: {
  apiKey: string;
  config: LlmProviderConfig;
  fetchImpl: typeof fetch;
  input: Array<{ role: string; content: string }>;
  text?: Record<string, unknown>;
  temperature?: number;
}): Promise<OpenAiResponsesResult> {
  const baseUrl = input.config.base_url ?? defaultOpenAiProviderConfig.base_url;
  const response = await input.fetchImpl(`${baseUrl}/responses`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${input.apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: input.config.model,
      input: input.input,
      text: input.text,
      temperature: input.temperature,
    }),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`OpenAI request failed: ${response.status} ${body}`);
  }

  return response.json() as Promise<OpenAiResponsesResult>;
}

function extractOpenAiText(result: OpenAiResponsesResult): string {
  if (result.output_text) {
    return result.output_text;
  }

  const text = result.output
    ?.flatMap((item) => item.content ?? [])
    .find((content) => typeof content.text === "string")?.text;

  if (!text) {
    throw new Error("OpenAI response did not include text output.");
  }

  return text;
}

function mapOpenAiUsage(result: OpenAiResponsesResult): LlmUsage | undefined {
  if (!result.usage) {
    return undefined;
  }

  return {
    inputTokens: result.usage.input_tokens,
    outputTokens: result.usage.output_tokens,
  };
}

function readEnvironmentApiKey(apiKeyRef: string | undefined): string {
  if (!apiKeyRef) {
    throw new Error("OpenAI API key environment variable is not configured.");
  }

  const value = getProcessEnv()[apiKeyRef];
  if (!value) {
    throw new Error(`${apiKeyRef} is not set.`);
  }

  return value;
}

function getProcessEnv(): Record<string, string | undefined> {
  const maybeGlobal = globalThis as typeof globalThis & {
    process?: {
      env?: Record<string, string | undefined>;
    };
  };

  return maybeGlobal.process?.env ?? {};
}
