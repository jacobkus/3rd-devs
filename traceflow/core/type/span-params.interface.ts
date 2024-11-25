import type { TraceLogLevel } from 'traceflow/core/enum/trace-log-level.enum';

export interface SpanParams {
  id?: string;
  startTime?: Date;
  endTime?: Date;
  name?: string;
  metadata?: any;
  statusMessage?: string;
  input?: any;
  output?: any;
  level?: TraceLogLevel;
}
