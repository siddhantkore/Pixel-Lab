export type ModuleId = string;
export type ExperimentId = string;
export type OperationId = string;

export interface Module {
  id: ModuleId;
  title: string;
  description: string;
  icon: string;           // lucide icon name
  color: string;          // tailwind gradient classes
  experimentIds: ExperimentId[];
}

export interface ParameterDef {
  id: string;
  label: string;
  type: "range" | "select" | "checkbox";
  min?: number;
  max?: number;
  step?: number;
  default: number | string | boolean;
  options?: { label: string; value: string }[];
  unit?: string;
  help?: string;
}

export interface Operation {
  id: OperationId;
  name: string;
  description: string;
  parameters: ParameterDef[];
  pythonCode: string;             // snippet shown to student
  apply: (
    canvas: HTMLCanvasElement,
    params: Record<string, number | string | boolean>
  ) => Promise<void> | void;
}

export interface Resource {
  type: "paper" | "ppt" | "blog" | "video" | "docs";
  title: string;
  url: string;
  source?: string;
  year?: number;
}

export interface Experiment {
  id: ExperimentId;
  moduleId: ModuleId;
  title: string;
  aim: string;
  theory: string;              // markdown-lite string
  operationIds: OperationId[];
  resources: Resource[];
  sampleImage?: string;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  estimatedTime: string;       // e.g. "20 min"
}