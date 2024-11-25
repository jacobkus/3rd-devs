import { WorkUnit } from 'flow/work/work-unit';
import { WorkType } from 'traceflow/core/enum/work-type.enum';
import { WorkTier } from 'traceflow/core/enum/work-tier.enum';
import { traceflow } from 'traceflow/core/traceflow';
import Groq from 'groq-sdk';
import type { TranscriptionCreateParams } from 'groq-sdk/src/resources/audio/transcriptions.js';

export class GroqSTTLoader extends WorkUnit {
  private client: Groq;
  private readonly params: TranscriptionCreateParams;

  constructor(params: TranscriptionCreateParams) {
    super();
    this.client = new Groq();
    this.params = params;
  }

  @traceflow.trace({
    name: 'GroqSTTLoader',
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
