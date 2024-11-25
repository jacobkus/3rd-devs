import OpenAI from 'openai';

export class MLX extends OpenAI {
  constructor() {
    super({ baseURL: 'http://localhost:8080/v1' });
  }
}
