import { BaseState } from 'workflow/base/base-state';
import { WorkFlow } from 'workflow/core/workflow';
import { reducer } from 'workflow/reducer/reducer';
import { w } from 'workflow/core/w';
import { traceflow } from 'traceflow/core/traceflow';
import { LangfuseService } from 'traceflow/helper/langfuse/langfuse.service';
import { StringOutputParser } from 'flow/parser/string-output-parser';
import { UserMessage } from 'flow/message/user-message';
import { saveWorkflowDiagram } from 'workflow-ide/diagram/save-workflow-diagram';
import { START, END } from 'workflow/base/node';

traceflow.initialize(new LangfuseService());

class State extends BaseState {
  docs = w.array(reducer);
  context = w.array(reducer);
  answer = w.string();
  question = w.string();
}

async function processAsync(seconds: number = 1): Promise<void> {
  await new StringOutputParser().predict(
    new UserMessage({
      content: 'Hello, world!',
    }),
  );
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve();
    }, seconds * 1000);
  });
}

async function processAudio(state: State): Promise<Partial<State>> {
  await processAsync();
  return { docs: [{ content: 'audio' }] };
}

async function processRetrieval(state: State): Promise<Partial<State>> {
  await processAsync();
  return { docs: [{ content: 'docs' }] };
}

async function rerank(state: State): Promise<Partial<State>> {
  await processAsync(2);
  return { docs: [{ content: 'rerank' }] };
}

async function processSearch(state: State): Promise<Partial<State>> {
  await processAsync();
  return { docs: [{ content: 'search' }] };
}

async function removeLinks(state: State): Promise<Partial<State>> {
  await processAsync(3);
  return { docs: [{ content: 'remove links' }] };
}

async function buildContext(state: State): Promise<Partial<State>> {
  await processAsync();
  return { context: [...state.docs, { content: 'build context' }] };
}

async function answer(state: State): Promise<Partial<State>> {
  await processAsync();
  return {
    answer: `Q: ${state.question}\nA: ${state.context
      .map((doc: any) => doc.content)
      .join(' -> ')}`,
  };
}

const workflow = new WorkFlow<State>({ state: State })
  .addNode('processAudio', processAudio)
  .addNode('processRetrieval', processRetrieval)
  .addNode('rerank', rerank)
  .addNode('processSearch', processSearch)
  .addNode('removeLinks', removeLinks)
  .addNode('buildContext', buildContext)
  .addNode('answer', answer)
  .addEdge(START, ['processAudio', 'processRetrieval', 'processSearch'])
  .addEdge('processAudio', 'buildContext')
  .addEdge('processRetrieval', 'rerank')
  .addEdge('rerank', 'buildContext')
  .addEdge('processSearch', 'removeLinks')
  .addEdge('removeLinks', 'buildContext')
  .addEdge('buildContext', 'answer')
  .addEdge('answer', END);

const result = await workflow.predict({
  question: 'What is the weather in Tokyo?',
});
console.log(result);

saveWorkflowDiagram('parallel', workflow);
