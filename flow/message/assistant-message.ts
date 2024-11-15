import type { NormalizedCompletion } from 'flow/chat-client/normalized-completion.interface';

export class AssistantMessage<RawResponse> {
  public readonly role = 'assistant';
  public readonly content: string;
  public readonly metadata: NormalizedCompletion<RawResponse>;

  constructor({
    content,
    metadata,
  }: {
    content: string;
    metadata: NormalizedCompletion<RawResponse>;
  }) {
    this.content = content;
    this.metadata = metadata;
  }
}
