export interface BaseMessage {
  role: 'user' | 'assistant';
  content: string;
}
