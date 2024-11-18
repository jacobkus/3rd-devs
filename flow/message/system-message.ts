import type { BaseMessage } from 'flow/message/base-message.interface';

export class SystemMessage implements BaseMessage {
  public readonly role = 'system';
  public readonly content: string;

  constructor({ content }: { content: string }) {
    this.content = content;
  }
}
