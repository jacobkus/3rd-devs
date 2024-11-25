import type { BaseMessage } from 'flow/message/base-message.interface';
import { UserMessage } from 'flow/message/user-message';
import { BaseState } from 'workflow/base/base-state';
import { reducer } from 'workflow/reducer/reducer';
import { WorkFlow } from 'workflow/core/workflow';
import { w } from 'workflow/core/w';
import { ChatOllama } from 'flow/chat-client/chat-ollama';
import { SystemMessage } from 'flow/message/system-message';
import { traceflow } from 'traceflow/core/traceflow';
import { LangfuseService } from 'traceflow/helper/langfuse/langfuse.service';
import { START, END } from 'workflow/base/node';

traceflow.initialize(new LangfuseService());

class MessageState extends BaseState {
  messages = w.array<BaseMessage>(reducer);
}

const model = new ChatOllama({
  model: 'llama3.2',
});

async function callModel(state: MessageState) {
  return {
    messages: [await model.predict(state.messages)],
  };
}

const workflow = new WorkFlow<MessageState>({ state: MessageState })
  .addNode('callModel', callModel)
  .addEdge(START, 'callModel')
  .addEdge('callModel', END);

let messages: BaseMessage[] = [
  new SystemMessage({ content: 'Answer ultra-concise' }),
  new UserMessage({ content: 'What do you think about the future of ai?' }),
];
await workflow.predict({ messages });

messages = [new UserMessage({ content: 'And the end write a haiku about ai' })];
await workflow.predict({ messages });
