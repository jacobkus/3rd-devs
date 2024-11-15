import { ChatOpenAI } from 'flow/chat-client/chat-openai';
import { ChatAnthropic } from 'flow/chat-client/chat-anthropic';
import { ChatOllama } from 'flow/chat-client/chat-ollama';
import { UserMessage } from 'flow/message/user-message';

const chatOpenAI = new ChatOpenAI({
  model: 'gpt-4o-mini',
  temperature: 0.7,
});

const chatAnthropic = new ChatAnthropic({
  model: 'claude-3-haiku-20240307',
  max_tokens: 1000,
});

const chatOllama = new ChatOllama({
  model: 'llama3.2',
  temperature: 0.7,
});

const messages = [new UserMessage({ content: 'Write a haiku about AI' })];

const openAIResponse = await chatOpenAI.predict(messages);
const anthropicResponse = await chatAnthropic.predict(messages);
const ollamaResponse = await chatOllama.predict(messages);

console.log(`\n--- OpenAI ---\n${openAIResponse.content}`);
console.log(`\n--- Anthropic ---\n${anthropicResponse.content}`);
console.log(`\n--- Ollama ---\n${ollamaResponse.content}`);
