export interface SpanParams {
  id?: string;
  startTime?: Date;
  endTime?: Date;
  name?: string;
  metadata?: any;
  statusMessage?: string;
  input?: any;
  output?: any;
}
