import { BaseState } from 'workflow/base/base-state';
import { WorkFlow } from 'workflow/core/workflow';
import { reducer } from 'workflow/reducer/reducer';
import { w } from 'workflow/core/w';
import { saveWorkflowDiagram } from 'workflow-ide/diagram/save-workflow-diagram';
import { START, END } from 'workflow/base/node';
import { traceflow } from 'traceflow/core/traceflow';
import { LangfuseService } from 'traceflow/helper/langfuse/langfuse.service';

traceflow.initialize(new LangfuseService());

class State extends BaseState {
  aggregate = w.array(reducer);
}

function a(state: State): Partial<State> {
  return { aggregate: ['a'] };
}

function b(state: State): Partial<State> {
  return { aggregate: ['b'] };
}

function c(state: State): Partial<State> {
  return { aggregate: ['c'] };
}

function d(state: State): Partial<State> {
  return { aggregate: ['d'] };
}

function e(state: State): Partial<State> {
  return { aggregate: ['e'] };
}

function f(state: State): Partial<State> {
  return { aggregate: ['f'] };
}

async function firstDecide(state: State): Promise<string> {
  return ['b', 'c', 'd'][Math.floor(Math.random() * 3)];
}

async function secondDecide(state: State): Promise<string> {
  return ['e', 'f'][Math.floor(Math.random() * 2)];
}

const workflow = new WorkFlow<State>({ state: State })
  .addNode('a', a)
  .addNode('b', b)
  .addNode('c', c)
  .addNode('d', d)
  .addNode('e', e)
  .addNode('f', f)
  .addEdge(START, 'a')
  .addConditionalEdges('a', firstDecide, ['b', 'c', 'd'])
  .addEdge('b', END)
  .addEdge('c', 'e')
  .addEdge('e', 'a')
  .addConditionalEdges('d', secondDecide, ['e', 'f'])
  .addEdge('f', END);

saveWorkflowDiagram('advanced', workflow);
