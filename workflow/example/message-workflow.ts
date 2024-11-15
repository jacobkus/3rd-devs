import type { BaseMessage } from 'flow/message/base-message.interface';
import { UserMessage } from 'flow/message/user-message';
import { BaseState } from 'workflow/base/base-state';
import { reducer } from 'workflow/reducer/reducer';
import { Workflow } from 'workflow/core/workflow';
import { ChatOpenAI } from 'flow/chat-client/chat-openai';
import { AssistantMessage } from 'flow/message/assistant-message';
import { w } from 'workflow/core/w';

class MessageState extends BaseState {
  messages = w.array<BaseMessage>(reducer);
}

const model = new ChatOpenAI({
  model: 'gpt-4o-mini',
});

async function predictCompletion(state: MessageState) {
  return {
    messages: [
      new AssistantMessage((await model.predict(state.messages)).content),
    ],
  };
}

const workflow = new Workflow<MessageState>({ state: MessageState })
  .addNode('predictCompletion', predictCompletion)
  .addEdge('__start__', 'predictCompletion');

const messages: BaseMessage[] = [new UserMessage('Write a haiku about AI')];

await workflow.predict({ messages });
