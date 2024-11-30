import { BaseState } from 'workflow/base/base-state';
import { WorkFlow } from 'workflow/core/workflow';
import { reducer } from 'workflow/reducer/reducer';
import { w } from 'workflow/core/w';
import { traceflow } from 'traceflow/core/traceflow';
import { LangfuseService } from 'traceflow/helper/langfuse/langfuse.service';
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

async function query(state: State): Promise<Partial<State>> {
  await processAsync(2);
  return { docs: [{ content: 'query' }] };
}

async function shouldQueryOrRecall(state: State): Promise<string> {
  return ['query', 'processRetrieval', 'buildContext'][
    Math.floor(Math.random() * 3)
  ];
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
  .addNode('query', query)
  .addNode('answer', answer)
  .addEdge(START, ['processAudio', 'processRetrieval', 'processSearch'])
  .addEdge('processAudio', 'buildContext')
  .addEdge('processRetrieval', 'rerank')
  .addConditionalEdges('rerank', shouldQueryOrRecall, [
    'query',
    'processRetrieval',
    'buildContext',
  ])
  .addEdge('query', 'buildContext')
  .addEdge('processSearch', 'removeLinks')
  .addEdge('removeLinks', 'buildContext')
  .addEdge('buildContext', 'answer')
  .addEdge('answer', END);

const result = await workflow.invoke({
  question: 'What is the weather in Tokyo?',
});
console.log(result);

saveWorkflowDiagram('advanced-parallel', workflow);
