import { WorkTier } from 'traceflow/core/enum/work-tier.enum';
import { WorkType } from 'traceflow/core/enum/work-type.enum';
import type { LangfuseService } from 'traceflow/helper/langfuse/langfuse.service';
import { TraceLogLevel } from 'traceflow/core/enum/trace-log-level.enum';
import type { TraceElement } from 'traceflow/core/type/trace-element.type';
import type { GenerationElement } from 'traceflow/core/type/generation-element.type';
import type { SpanElement } from 'traceflow/core/type/span-element.type';
import { v4 as uuidv4 } from 'uuid';
import type { AssistantMessage } from 'flow/message/assistant-message';
import { sleep } from 'bun';

type TraceOptions = {
  name?: string;
  tier?: WorkTier;
  type?: WorkType;
  logLevel?: TraceLogLevel;
};

export class TraceFlow {
  private static instance: TraceFlow;
  private traceService?: LangfuseService;
  private traceStack: (TraceElement | SpanElement | GenerationElement)[] = [];

  public static getInstance(): TraceFlow {
    if (!TraceFlow.instance) {
      TraceFlow.instance = new TraceFlow();
    }
    return TraceFlow.instance;
  }

  public initialize(service: LangfuseService): void {
    this.traceService = service;
  }

  private async handleTraceStart(
    self: any,
    input: any[],
    options?: TraceOptions,
  ): Promise<TraceElement | SpanElement | GenerationElement> {
    const elementName = `(${options?.tier}) ${
      options?.tier === WorkTier.NODE ||
      options?.tier === WorkTier.CONDITIONAL_EDGE
        ? self.name
        : (options?.name ?? options?.tier ?? '')
    }`;

    if (this.traceStack.length === 0) {
      const trace = await this.traceService!.createTrace({
        id: `work-${uuidv4()}`,
        name: elementName,
        input,
      });
      this.traceStack.push(trace);
    }

    const parentElement = this.traceStack[this.traceStack.length - 1];

    if (options?.type === WorkType.GENERATION) {
      const generation = await this.traceService!.createGeneration(
        parentElement,
        {
          name: elementName,
          input,
          modelParameters: self.params,
        },
      );
      this.traceStack.push(generation);
      return generation;
    }

    const span = await this.traceService!.createSpan(parentElement, {
      name: elementName,
      input,
    });

    this.traceStack.push(span);
    return span;
  }

  private async handleTraceEnd(
    element: TraceElement | SpanElement | GenerationElement,
    output: unknown,
    options?: TraceOptions,
    error?: { statusMessage: string; level: TraceLogLevel },
  ): Promise<void> {
    try {
      const level = error?.level || options?.logLevel;

      if (options?.type === WorkType.GENERATION) {
        const assistantMessage = output as AssistantMessage<any>;

        await this.traceService!.finalizeGeneration(element, {
          output,
          usage: {
            input: assistantMessage.metadata.usage.inputTokens,
            output: assistantMessage.metadata.usage.outputTokens,
            total: assistantMessage.metadata.usage.totalTokens,
          },
          level,
          ...error,
        });
      } else {
        await this.traceService!.finalizeSpan(element, {
          output,
          level,
          ...error,
        });
      }

      if (this.traceStack.length === 2) {
        await this.traceService!.finalizeTrace(this.traceStack[0], {
          output,
          level,
          ...error,
        });
      }
    } finally {
      this.traceStack.pop();
    }
  }

  public trace(options?: TraceOptions) {
    return (
      target: unknown,
      propertyKey: string,
      descriptor: PropertyDescriptor,
    ): PropertyDescriptor => {
      const originalMethod = descriptor.value;

      descriptor.value = async function (...args: any[]) {
        const traceflow = TraceFlow.getInstance();

        if (!traceflow.traceService) {
          return originalMethod.apply(this, args);
        }

        let currentElement: TraceElement | SpanElement | GenerationElement;
        const input = args[0];

        try {
          currentElement = await traceflow.handleTraceStart(
            this,
            input,
            options,
          );
          const result = await originalMethod.apply(this, args);
          await traceflow.handleTraceEnd(currentElement, result, options);
          return result;
        } catch (error) {
          if (currentElement!) {
            await traceflow.handleTraceEnd(currentElement, {}, options, {
              statusMessage:
                error instanceof Error ? error.message : 'Unknown error',
              level: TraceLogLevel.ERROR,
            });
          }
          throw error;
        } finally {
          await sleep(1);
        }
      };

      return descriptor;
    };
  }

  public reset(): void {
    this.traceStack = [];
    this.traceService = undefined;
  }
}

export const traceflow = TraceFlow.getInstance();
