import { SystemMessage } from 'flow/message/system-message';
import { WorkUnit } from 'flow/work/work-unit';
import type { LangfusePromptClient } from 'langfuse';
import { WorkTier } from 'traceflow/core/enum/work-tier.enum';
import { traceflow } from 'traceflow/core/traceflow';

export class PromptFuseTemplate extends WorkUnit {
  constructor(private prompt: LangfusePromptClient) {
    super();
  }

  @traceflow.trace({ name: 'PromptFuseTemplate', tier: WorkTier.UNIT })
  public async invoke(
    variables: Record<string, string>,
  ): Promise<SystemMessage[]> {
    const compiledPrompt = this.prompt.compile(variables) as string;
    return [new SystemMessage({ content: compiledPrompt })];
  }
}
