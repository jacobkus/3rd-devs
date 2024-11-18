import type { BaseMessage } from 'flow/message/base-message.interface';
import { UserMessage } from 'flow/message/user-message';
import { BaseState } from 'workflow/base/base-state';
import { reducer } from 'workflow/reducer/reducer';
import { WorkFlow } from 'workflow/core/workflow';
import { ChatOpenAI } from 'flow/chat-client/chat-openai';
import { w } from 'workflow/core/w';

class MessageState extends BaseState {
  messages = w.array<BaseMessage>(reducer);
}

const model = new ChatOpenAI({
  model: 'gpt-4o-mini',
});

async function predictCompletion(state: MessageState) {
  return {
    messages: [await model.predict(state.messages)],
  };
}

const workflow = new WorkFlow<MessageState>({ state: MessageState })
  .addNode('predictCompletion', predictCompletion)
  .addEdge('__start__', 'predictCompletion');

const messages: BaseMessage[] = [
  new UserMessage({ content: 'Write a haiku about AI' }),
];

await workflow.predict({ messages });
