import { traceflow } from 'traceflow/core/traceflow';
import { LangfuseService } from 'traceflow/helper/langfuse/langfuse.service';
import { UserMessage } from 'flow/message/user-message';
import { ChatOpenAI } from 'flow/chat-client/chat-openai';

traceflow.initialize(new LangfuseService());

const model = new ChatOpenAI({
  model: 'gpt-4o-mini',
});

const result = await model.invoke([
  new UserMessage({ content: 'Write a haiku about ai' }),
]);

console.log(result);
