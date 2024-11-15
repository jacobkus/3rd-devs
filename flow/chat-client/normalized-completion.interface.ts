export interface NormalizedCompletion<RawResponse> {
  id: string;
  text: string;
  usage: {
    inputTokens: number;
    outputTokens: number;
    totalTokens: number; // OpenAI specific
  };
  metadata: {
    model: string;
    role: 'assistant';
    type: string; // Anthropic specific
  };
  raw: RawResponse;
}
