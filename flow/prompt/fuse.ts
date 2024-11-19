import { PromptFuseTemplate } from 'flow/template/prompt-fuse-template';
import { LangfuseService } from 'traceflow/helper/langfuse/langfuse.service';

class Fuse {
  private static instance: Fuse;
  private langfuseService: LangfuseService;

  constructor() {
    this.langfuseService = new LangfuseService();
  }

  public static getInstance(): Fuse {
    if (!Fuse.instance) {
      Fuse.instance = new Fuse();
    }
    return Fuse.instance;
  }

  public async pull(name: string): Promise<PromptFuseTemplate> {
    const prompt = await this.langfuseService.getPrompt(name);
    return new PromptFuseTemplate(prompt);
  }
}

export const fuse = Fuse.getInstance();
