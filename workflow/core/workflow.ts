import { WorkNode } from 'workflow/work/work-node';
import { WorkTier } from 'traceflow/core/enum/work-tier.enum';
import { traceflow } from 'traceflow/core/traceflow';
import { BaseState } from 'workflow/base/base-state';
import { WorkflowUtil } from 'workflow/core/workflow.util';
import { WorkConditionalEdge } from 'workflow/work/work-conditional-edge';
import { START, END } from 'workflow/base/node';

export class WorkFlow<T extends BaseState> {
  private nodes = new Map<string, any>();
  private edges = new Map<string, string | string[] | WorkConditionalEdge>();
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
      START,
      new WorkNode(START, async () => await Promise.resolve({})),
    );
    this.nodes.set(
      END,
      new WorkNode(END, async () => await Promise.resolve({})),
    );
  }

  public addNode(name: string, node: any) {
    this.nodes.set(name, new WorkNode(name, node));
    return this;
  }

  public addEdge(from: string, to: string | string[]) {
    this.edges.set(from, to);
    return this;
  }

  public addConditionalEdges(
    from: string,
    condition: (state: T) => Promise<string>,
    possibleNextNodes: string[],
  ) {
    this.edges.set(
      from,
      new WorkConditionalEdge(condition.name, condition, possibleNextNodes),
    );
    return this;
  }

  private async predictNode(
    currentNode: string,
    convergenceNode?: string,
  ): Promise<void> {
    if (currentNode === END || currentNode === convergenceNode) {
      return;
    }

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
    } else if (Array.isArray(nextNodeOrCondition)) {
      nextNode = await this.parallelPredict(nextNodeOrCondition);
    } else {
      nextNode = nextNodeOrCondition;
    }

    await this.predictNode(nextNode || END, convergenceNode);
  }

  @traceflow.trace({ name: 'Parallel', tier: WorkTier.PARALLEL_NODE })
  private async parallelPredict(nodes: string[]) {
    const convergenceNode = this.findConvergencePoint(nodes);
    const promises = nodes.map((node) =>
      this.predictNode(node, convergenceNode),
    );
    await Promise.all(promises);
    return convergenceNode;
  }

  @traceflow.trace({ tier: WorkTier.WORKFLOW })
  public async predict(state: Partial<T> = {}): Promise<T> {
    this.state = this.util.wrapStateWithProxy(this.initialStateClass);
    Object.assign(this.state, state);

    await this.predictNode(START);
    return this.state;
  }

  private findConvergencePoint(nodes: string[]): string | undefined {
    const paths = new Map<string, Set<string>>();

    const getNextNodes = (current: string): string[] => {
      const next = this.edges.get(current);
      if (!next) return [];

      if (typeof next === 'string') {
        return [next];
      } else if (next instanceof WorkConditionalEdge) {
        return next.possibleNextNodes;
      } else if (Array.isArray(next)) {
        const nestedConvergence = this.findConvergencePoint(next);
        return nestedConvergence ? [nestedConvergence] : [];
      }
      return [];
    };

    for (const startNode of nodes) {
      const allPaths = new Set<string>();
      const stack = [startNode];
      const visited = new Set<string>();

      while (stack.length > 0) {
        const current = stack.pop()!;
        if (visited.has(current)) continue;

        visited.add(current);
        allPaths.add(current);

        if (current === END) continue;

        const nextNodes = getNextNodes(current);
        for (const next of nextNodes) {
          if (!visited.has(next)) {
            stack.push(next);
          }
        }
      }

      paths.set(startNode, allPaths);
    }

    const commonNodes = new Set<string>();
    const [firstPath] = paths.values();
    if (!firstPath) return undefined;

    for (const node of firstPath) {
      if ([...paths.values()].every((path) => path.has(node))) {
        commonNodes.add(node);
      }
    }

    for (const startNode of nodes) {
      let current = startNode;
      while (current !== END) {
        const nextNodes = getNextNodes(current);

        const convergenceNode = nextNodes.find((node) => commonNodes.has(node));
        if (convergenceNode) {
          return convergenceNode;
        }

        if (nextNodes.length !== 1) break;
        current = nextNodes[0];
      }
    }

    return;
  }

  public getMermaidDiagram(): string {
    const lines: string[] = [];
    lines.push('flowchart TD');

    const escapeMermaidId = (id: string): string => {
      return id.replace(/[^a-zA-Z0-9]/g, '_');
    };

    for (const [nodeId] of this.nodes) {
      const escapedId = escapeMermaidId(nodeId);
      lines.push(`    ${escapedId}["${nodeId}"]`);
    }

    for (const [source, target] of this.edges.entries()) {
      const escapedSource = escapeMermaidId(source);

      if (target instanceof WorkConditionalEdge) {
        target.possibleNextNodes.forEach((nextNode) => {
          const escapedTarget = escapeMermaidId(nextNode);
          lines.push(
            `    ${escapedSource} -->|${target.name}| ${escapedTarget}`,
          );
        });
      } else if (Array.isArray(target)) {
        target.forEach((nextNode) => {
          const escapedTarget = escapeMermaidId(nextNode);
          lines.push(`    ${escapedSource} ==>|parallel| ${escapedTarget}`);
        });
      } else if (typeof target === 'string') {
        const escapedTarget = escapeMermaidId(target);
        lines.push(`    ${escapedSource} --> ${escapedTarget}`);
      }
    }

    return lines.join('\n');
  }
}
