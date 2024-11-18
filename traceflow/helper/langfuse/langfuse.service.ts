import type { TraceParams } from 'traceflow/core/type/trace-params.interface';
import type { SpanParams } from 'traceflow/core/type/span-params.interface';
import type { GenerationParams } from 'traceflow/core/type/generation-params.interface';
import type { TraceElement } from 'traceflow/core/type/trace-element.type';
import type { GenerationElement } from 'traceflow/core/type/generation-element.type';
import type { SpanElement } from 'traceflow/core/type/span-element.type';
import Langfuse from 'langfuse';

export class LangfuseService {
  public langfuse: Langfuse;

  constructor() {
    this.langfuse = new Langfuse({
      publicKey: process.env.LANGFUSE_PUBLIC_KEY,
      secretKey: process.env.LANGFUSE_SECRET_KEY,
      baseUrl: process.env.LANGFUSE_HOST,
    });

    this.langfuse.on('error', (error: Error) => {
      console.error('Langfuse error:', error);
    });

    if (process.env.LANGFUSE_DEBUG) {
      this.langfuse.debug();
    }
  }

  public createTrace(params: TraceParams): TraceElement {
    return this.langfuse.trace(params);
  }

  public createSpan(
    element: TraceElement | SpanElement,
    params: SpanParams,
  ): SpanElement {
    return element.span(params);
  }

  public async finalizeSpan(
    span: SpanElement,
    params: SpanParams,
  ): Promise<void> {
    await span.update(params);
  }

  public createGeneration(
    client: TraceElement | SpanElement,
    params: GenerationParams,
  ): GenerationElement {
    return client.generation(params);
  }

  public async finalizeGeneration(
    generation: GenerationElement,
    params: GenerationParams,
  ): Promise<void> {
    await generation.update(params);
  }

  public async finalizeTrace(
    trace: TraceElement,
    params: TraceParams,
  ): Promise<void> {
    await trace.update(params);
    await this.langfuse.flushAsync();
  }
}
