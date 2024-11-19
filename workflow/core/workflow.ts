import { WorkNode } from 'workflow/work/work-node';
import { WorkTier } from 'traceflow/core/enum/work-tier.enum';
import { traceflow } from 'traceflow/core/traceflow';
import { BaseState } from 'workflow/base/base-state';
import { WorkflowUtil } from 'workflow/core/workflow.util';
import { WorkConditionalEdge } from 'workflow/work/work-conditional-edge';

export class WorkFlow<T extends BaseState> {
  private nodes = new Map<string, any>();
  private edges = new Map<string, string | WorkConditionalEdge>();
  private state: T = new BaseState() as T;
  private readonly initialStateClass!: new () => T;

  private util = new WorkflowUtil();

  constructor(options?: { state: new () => T }) {
    if (options?.state) {
      this.initialStateClass = options.state;
    }

    this.initialize();
  }

  private initialize() {
    this.nodes.set(
      '__start__',
      new WorkNode('__start__', async () => await Promise.resolve()),
    );
    this.nodes.set(
      '__end__',
      new WorkNode('__end__', async () => await Promise.resolve()),
    );
  }

  public addNode(name: string, node: any) {
    this.nodes.set(name, new WorkNode(name, node));
    return this;
  }

  public addEdge(from: string, to: string) {
    this.edges.set(from, to);
    return this;
  }

  public addConditionalEdges(
    from: string,
    condition: (state: T) => Promise<string>,
  ) {
    this.edges.set(from, new WorkConditionalEdge(condition.name, condition));
    return this;
  }

  @traceflow.trace({ tier: WorkTier.WORKFLOW })
  public async predict(state?: Partial<T>): Promise<T> {
    let currentNode: string = '__start__';

    this.state = this.util.wrapStateWithProxy(this.initialStateClass);
    Object.assign(this.state, state);

    while (currentNode !== '__end__') {
      console.log(`\n--- Invoke ---`);
      console.log(`Node -> ${currentNode}`);

      const node = this.nodes.get(currentNode);
      const flowingState = await node.predict(this.state);

      if (flowingState) {
        Object.assign(this.state, flowingState);
        console.log(`State -> ${JSON.stringify(this.state, null, 2)}`);
      }

      const nextNodeOrCondition = this.edges.get(currentNode);
      let nextNode: string | undefined;

      if (nextNodeOrCondition instanceof WorkConditionalEdge) {
        nextNode = await nextNodeOrCondition.predict(this.state);
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
