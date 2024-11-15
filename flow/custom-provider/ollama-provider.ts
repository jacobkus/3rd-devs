import OpenAI from 'openai';

export class Ollama extends OpenAI {
  constructor() {
    super({ baseURL: 'http://localhost:11434/v1' });
  }
}
