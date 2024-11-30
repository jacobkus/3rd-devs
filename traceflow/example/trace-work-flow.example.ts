import type { BaseMessage } from 'flow/message/base-message.interface';
import { UserMessage } from 'flow/message/user-message';
import { BaseState } from 'workflow/base/base-state';
import { reducer } from 'workflow/reducer/reducer';
import { WorkFlow } from 'workflow/core/workflow';
import { ChatOpenAI } from 'flow/chat-client/chat-openai';
import { w } from 'workflow/core/w';
import { SystemMessage } from 'flow/message/system-message';
import { traceflow } from 'traceflow/core/traceflow';
import { LangfuseService } from 'traceflow/helper/langfuse/langfuse.service';

traceflow.initialize(new LangfuseService());

class MessageState extends BaseState {
  messages = w.array<BaseMessage>(reducer);
}

const model = new ChatOpenAI({
  model: 'gpt-4o-mini',
  temperature: 0.5,
});

async function sentimentAnalysis(state: MessageState) {
  const sys_prompt = new SystemMessage({
    content: 'Analyze ultra-concisely the sentiment of the following messages.',
  });

  return {
    messages: [await model.invoke([sys_prompt, ...state.messages])],
  };
}

async function grammaticalAnalysis(state: MessageState) {
  const sys_prompt = new SystemMessage({
    content:
      'Analyze ultra-concisely the grammatical correctness of the following messages.',
  });

  return {
    messages: [await model.invoke([sys_prompt, ...state.messages])],
  };
}

async function pickRandomNode(state: MessageState): Promise<string> {
  return ['sentimentAnalysis', 'grammaticalAnalysis'][
    Math.floor(Math.random() * 2)
  ];
}

const workflow = new WorkFlow<MessageState>({ state: MessageState })
  .addNode('sentimentAnalysis', sentimentAnalysis)
  .addNode('grammaticalAnalysis', grammaticalAnalysis)
  .addConditionalEdges('__start__', pickRandomNode);

const messages: BaseMessage[] = [
  new UserMessage({ content: 'My dog is too sarcastic.' }),
];

await workflow.invoke({ messages });
