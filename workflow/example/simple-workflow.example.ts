import { BaseState } from 'workflow/base/base-state';
import { WorkFlow } from 'workflow/core/workflow';
import { reducer } from 'workflow/reducer/reducer';
import { w } from 'workflow/core/w';

class State extends BaseState {
  str = w.string(reducer);
}

function node1(state: State): Partial<State> {
  return { str: ' Jacob here.' };
}

function node2(state: State): Partial<State> {
  return { str: ' I am sad.' };
}

function node3(state: State): Partial<State> {
  return { str: ' I am happy.' };
}

async function decideMood(state: State): Promise<string> {
  return Math.random() > 0.5 ? 'node2' : 'node3';
}

const workflow = new WorkFlow<State>({ state: State })
  .addNode('node1', node1)
  .addNode('node2', node2)
  .addNode('node3', node3)
  .addEdge('__start__', 'node1')
  .addConditionalEdges('node1', decideMood);

await workflow.predict({ str: 'Hi!' });
