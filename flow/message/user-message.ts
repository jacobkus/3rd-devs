import type { BaseMessage } from 'flow/message/base-message.interface';

export class UserMessage implements BaseMessage {
  public role = 'user';

  constructor(public content: string) {}
}
