import type { TraceLogLevel } from 'traceflow/core/enum/trace-log-level.enum';

export interface TraceParams {
  id?: string;
  name?: string;
  input?: any;
  output?: any;
  metadata?: any;
  sessionId?: string;
  userId?: string;
  tags?: string[];
  statusMessage?: string;
  level?: TraceLogLevel;
}
