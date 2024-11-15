import type { BaseState } from 'workflow/base/base-state';
import { WorkflowUtil } from 'workflow/core/workflow.util';

export class Workflow<T extends BaseState> {
  private nodes = new Map<string, any>();
  private edges = new Map<string, string | ((state: T) => string)>();
  private readonly state!: T;
  private initialState?: Partial<T>;

  private util = new WorkflowUtil();

  constructor(options?: { state: new () => T }) {
    if (options?.state) {
      this.state = this.util.wrapStateWithProxy(options.state);
    }

    this.initialize();
  }

  private initialize() {
    this.nodes.set('__start__', this.startNode);
    this.nodes.set('__end__', (state: T) => state);
  }

  private startNode(state: T) {
    return this.initialState;
  }

  public addNode(name: string, node: any) {
    this.nodes.set(name, node);
    return this;
  }

  public addEdge(from: string, to: string) {
    this.edges.set(from, to);
    return this;
  }

  public addConditionalEdges(from: string, condition: (state: T) => string) {
    this.edges.set(from, condition);
    return this;
  }

  public async predict(initialState?: Partial<T>): Promise<T> {
    let currentNode: string = '__start__';
    this.initialState = initialState;

    while (currentNode !== '__end__') {
      console.log(`\n--- Invoke ---`);
      console.log(`Node -> ${currentNode}`);

      const node = this.nodes.get(currentNode);
      const flowingState = await node.apply(this, [this.state]);

      if (flowingState) {
        Object.assign(this.state, flowingState);
        console.log(`State -> ${JSON.stringify(this.state, null, 2)}`);
      }

      const nextNodeOrCondition = this.edges.get(currentNode);
      let nextNode: string | undefined;

      if (typeof nextNodeOrCondition === 'function') {
        nextNode = await nextNodeOrCondition.apply(this, [this.state as T]);
      } else {
        nextNode = nextNodeOrCondition;
      }

      if (!nextNode) {
        nextNode = '__end__';
      }

      currentNode = nextNode;
    }

    return this.state;
  }
}
