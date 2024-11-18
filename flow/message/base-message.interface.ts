export interface BaseMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}
