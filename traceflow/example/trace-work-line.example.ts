import { traceflow } from 'traceflow/core/traceflow';
import { LangfuseService } from 'traceflow/helper/langfuse/langfuse.service';
import { ChatOpenAI } from 'flow/chat-client/chat-openai';
import { StringTemplate } from 'flow/template/string-template';
import { StringOutputParser } from 'flow/parser/string-output-parser';

traceflow.initialize(new LangfuseService());

const template = new StringTemplate();
const parser = new StringOutputParser();
const model = new ChatOpenAI({
  model: 'gpt-4o-mini',
});

const line = template.line(model).line(parser);

const result = await line.predict('Write a haiku about ai');

console.log(result);
