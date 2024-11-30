import { ChatOpenAI } from 'flow/chat-client/chat-openai';
import { AnthropicChat } from 'flow/chat-client/anthropic-chat.ts';
import { OllamaChat } from 'flow/chat-client/ollama-chat.ts';
import { UserMessage } from 'flow/message/user-message';

const chatOpenAI = new ChatOpenAI({
  model: 'gpt-4o-mini',
  temperature: 0.7,
});

const chatAnthropic = new AnthropicChat({
  model: 'claude-3-haiku-20240307',
  max_tokens: 1000,
});

const chatOllama = new OllamaChat({
  model: 'llama3.2',
  temperature: 0.7,
});

const messages = [new UserMessage({ content: 'Write a haiku about ai' })];

const openAIResponse = await chatOpenAI.invoke(messages);
const anthropicResponse = await chatAnthropic.invoke(messages);
const ollamaResponse = await chatOllama.invoke(messages);

console.log(`\n--- OpenAI ---\n${openAIResponse.content}`);
console.log(`\n--- Anthropic ---\n${anthropicResponse.content}`);
console.log(`\n--- Ollama ---\n${ollamaResponse.content}`);
