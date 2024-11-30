import { ChatOpenAI } from 'flow/chat-client/chat-openai';
import { StringOutputParser } from 'flow/parser/string-output-parser';
import { fuse } from 'flow/prompt/fuse';
import { traceflow } from 'traceflow/core/traceflow';
import { LangfuseService } from 'traceflow/helper/langfuse/langfuse.service';

traceflow.initialize(new LangfuseService());

const prompt = await fuse.pull('example');
const parser = new StringOutputParser();
const model = new ChatOpenAI({ model: 'gpt-4o-mini' });

const line = prompt.line(model).line(parser);

const result = await line.invoke({
  context: 'You are speaking to Jacob.',
  question: 'What is my name?',
});

console.log(result);
