import { WorkTier } from 'traceflow/core/enum/work-tier.enum';
import { WorkType } from 'traceflow/core/enum/work-type.enum';
import type { LangfuseService } from 'traceflow/helper/langfuse/langfuse.service';
import { TraceLogLevel } from 'traceflow/core/enum/trace-log-level.enum';
import type { TraceElement } from 'traceflow/core/type/trace-element.type';
import type { GenerationElement } from 'traceflow/core/type/generation-element.type';
import type { SpanElement } from 'traceflow/core/type/span-element.type';
import { v4 as uuidv4 } from 'uuid';
import type { AssistantMessage } from 'flow/message/assistant-message';
import { AsyncLocalStorage } from 'async_hooks';
import { sleep } from 'bun';

type TraceOptions = {
  name?: string;
  tier?: WorkTier;
  type?: WorkType;
  logLevel?: TraceLogLevel;
};

type TraceContext = {
  id: string;
  parentId: string | null;
  element: TraceElement | SpanElement | GenerationElement;
  name: string;
  startTime: number;
  children: Set<string>;
};

export class TraceFlow {
  private static instance: TraceFlow;
  private traceService?: LangfuseService;
  private asyncContext = new AsyncLocalStorage<TraceContext>();
  private traces = new Map<string, TraceContext>();

  public static getInstance(): TraceFlow {
    if (!TraceFlow.instance) {
      TraceFlow.instance = new TraceFlow();
    }
    return TraceFlow.instance;
  }

  public initialize(service: LangfuseService): void {
    this.traceService = service;
  }

  public trace(options?: TraceOptions) {
    return (
      target: unknown,
      propertyKey: string,
      descriptor: PropertyDescriptor,
    ): PropertyDescriptor => {
      const originalMethod = descriptor.value;

      descriptor.value = async function (this: any, ...args: any[]) {
        const traceflow = TraceFlow.getInstance();

        if (!traceflow.traceService) {
          return originalMethod.apply(this, args);
        }

        let element: TraceElement | SpanElement | GenerationElement;

        try {
          const executionId = uuidv4();
          const parentContext = traceflow.asyncContext.getStore();

          const elementName = `(${options?.tier}) ${
            options?.tier === WorkTier.NODE ||
            options?.tier === WorkTier.CONDITIONAL_EDGE
              ? this.name
              : (options?.name ?? options?.tier ?? '')
          }`;

          const inputCopy = JSON.parse(JSON.stringify(args[0] ?? {}));

          if (options?.tier === WorkTier.WORKFLOW) {
            element = await traceflow.traceService.createTrace({
              id: `work-${uuidv4()}`,
              name: elementName,
              input: inputCopy,
            });
          } else {
            if (options?.type === WorkType.GENERATION) {
              element = await traceflow.traceService.createGeneration(
                parentContext?.element,
                {
                  id: `gen-${uuidv4()}`,
                  name: elementName,
                  input: inputCopy,
                  modelParameters: this.params,
                },
              );
            } else {
              element = await traceflow.traceService.createSpan(
                parentContext?.element,
                {
                  id: `span-${uuidv4()}`,
                  name: elementName,
                  input: inputCopy,
                },
              );
            }
          }

          const context: TraceContext = {
            id: executionId,
            parentId: parentContext?.id || null,
            element,
            name: elementName,
            startTime: Date.now(),
            children: new Set(),
          };

          if (parentContext) {
            parentContext.children.add(executionId);
          }

          traceflow.traces.set(executionId, context);

          // console.log(
          //   `[${executionId}] Starting ${
          //     this.name ?? options?.name ?? options?.tier ?? ''
          //   }${parentContext ? ` (parent: ${parentContext.name})` : ''}`,
          // );

          const output = await traceflow.asyncContext.run(context, () =>
            originalMethod.apply(this, args),
          );

          if (options?.tier === WorkTier.WORKFLOW) {
            await traceflow.traceService.finalizeTrace(element, {
              output,
              level: options?.logLevel,
            });
          } else {
            const assistantMessage = output as AssistantMessage<any>;
            if (options?.type === WorkType.GENERATION) {
              await traceflow.traceService.finalizeGeneration(element, {
                output,
                usage: {
                  input: assistantMessage.metadata.usage.inputTokens,
                  output: assistantMessage.metadata.usage.outputTokens,
                  total: assistantMessage.metadata.usage.totalTokens,
                },
                level: options?.logLevel,
              });
            } else {
              await traceflow.traceService.finalizeSpan(element, {
                output,
                level: options?.logLevel,
              });
            }
          }

          // const childrenNames = Array.from(context.children)
          //   .map((childId) => traceflow.traces.get(childId)?.name)
          //   .filter(Boolean);

          // console.log(
          //   `[${executionId}] Completed ${elementName} with children: [${childrenNames.join(', ')}]`,
          // );

          return output;
        } catch (error) {
          const level = TraceLogLevel.ERROR;
          const errorObject =
            error instanceof Error ? error.message : 'Unknown error';

          if (options?.tier === WorkTier.WORKFLOW) {
            await traceflow.traceService.finalizeTrace(element, {
              level,
              statusMessage: errorObject,
            });
          } else {
            if (options?.type === WorkType.GENERATION) {
              await traceflow.traceService.finalizeGeneration(element, {
                level,
                statusMessage: errorObject,
              });
            } else {
              await traceflow.traceService.finalizeSpan(element, {
                level,
                statusMessage: errorObject,
              });
            }
          }
        } finally {
          await sleep(1);
        }
      };

      return descriptor;
    };
  }

  public reset(): void {
    this.traceService = undefined;
    this.traces.clear();
    this.asyncContext = new AsyncLocalStorage<TraceContext>();
  }
}

export const traceflow = TraceFlow.getInstance();
