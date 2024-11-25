import type { WorkFlow } from 'workflow/core/workflow';
import fs from 'fs';

export function saveWorkflowDiagram(name: string, workflow: WorkFlow<any>) {
  fs.writeFileSync(
    `workflow-ide/diagram/${name}-workflow-diagram.md`,
    workflow.getMermaidDiagram(),
  );
}
