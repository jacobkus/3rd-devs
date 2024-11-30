import type { BaseMessage } from 'flow/message/base-message.interface';
import { UserMessage } from 'flow/message/user-message';
import { BaseState } from 'workflow/base/base-state';
import { reducer } from 'workflow/reducer/reducer';
import { WorkFlow } from 'workflow/core/workflow';
import { ChatOpenAI } from 'flow/chat-client/chat-openai';
import { w } from 'workflow/core/w';
import { saveWorkflowDiagram } from 'workflow-ide/diagram/save-workflow-diagram';
import { START, END } from 'workflow/base/node';
import { traceflow } from 'traceflow/core/traceflow';
import { LangfuseService } from 'traceflow/helper/langfuse/langfuse.service';

traceflow.initialize(new LangfuseService());

class MessageState extends BaseState {
  messages = w.array<BaseMessage>(reducer);
}

const model = new ChatOpenAI({
  model: 'gpt-4o-mini',
});

async function callModel(state: MessageState) {
  return {
    messages: [await model.invoke(state.messages)],
  };
}

const workflow = new WorkFlow<MessageState>({ state: MessageState })
  .addNode('callModel', callModel)
  .addEdge(START, 'callModel')
  .addEdge('callModel', END);

const messages: BaseMessage[] = [
  new UserMessage({ content: 'Write a haiku about ai' }),
];

await workflow.invoke({ messages });

saveWorkflowDiagram('message', workflow);
