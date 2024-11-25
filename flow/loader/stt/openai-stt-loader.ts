import { WorkUnit } from 'flow/work/work-unit';
import { WorkType } from 'traceflow/core/enum/work-type.enum';
import { WorkTier } from 'traceflow/core/enum/work-tier.enum';
import { traceflow } from 'traceflow/core/traceflow';
import OpenAI from 'openai';
import type { TranscriptionCreateParams } from 'openai/resources/audio/transcriptions';

export class OpenAISTTLoader extends WorkUnit {
  private client: OpenAI;
  private readonly params: TranscriptionCreateParams;

  constructor(params: TranscriptionCreateParams) {
    super();
    this.client = new OpenAI();
    this.params = params;
  }

  @traceflow.trace({
    name: 'OpenAISTTLoader',
    tier: WorkTier.UNIT,
    type: WorkType.GENERATION,
  })
  async load(): Promise<string> {
    const transcription = await this.client.audio.transcriptions.create({
      ...this.params,
    });

    return transcription.text;
  }
}
