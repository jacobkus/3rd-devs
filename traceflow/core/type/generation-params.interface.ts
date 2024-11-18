export interface GenerationParams {
  id?: string;
  name?: string;
  startTime?: Date;
  completionStartTime?: Date;
  endTime?: Date;
  model?: string;
  modelParameters?: any;
  input?: any;
  output?: any;
  usage?: any;
  metadata?: any;
  statusMessage?: string;
}
