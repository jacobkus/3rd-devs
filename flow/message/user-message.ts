import type { BaseMessage } from 'flow/message/base-message.interface';

export class UserMessage implements BaseMessage {
  public readonly role = 'user';
  public readonly content: string;

  constructor({ content }: { content: string }) {
    this.content = content;
  }
}
