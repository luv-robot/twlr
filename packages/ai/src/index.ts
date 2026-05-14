export interface LlmProvider {
  readonly id: string;
  generateText(input: LlmTextRequest): Promise<LlmTextResponse>;
  generateStructured<T>(input: LlmStructuredRequest): Promise<LlmStructuredResponse<T>>;
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
