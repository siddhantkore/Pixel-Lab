export type ModuleId = string;
export type ExperimentId = string;
export type OperationId = string;

export interface Module {
  id: ModuleId;
  title: string;
  description: string;
  icon: string;
  color: string;
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
  pythonCode: string;
  apply: (
    canvas: HTMLCanvasElement,
    params: Record<string, number | string | boolean>
  ) => Promise<void> | void;
}

export type ResourceType = "paper" | "ppt" | "blog" | "video" | "docs";

export interface Resource {
  type: ResourceType;
  title: string;
  url: string;
  source?: string;
  year?: number;
}

/** Parsed from markdown frontmatter + body */
export interface Experiment {
  id: ExperimentId;
  moduleId: ModuleId;
  title: string;
  aim: string;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  estimatedTime: string;
  sampleImage?: string;
  operationIds: OperationId[];

  // Pedagogical blocks (frontmatter)
  coreConcept: string;
  formula: string;
  intuition: string;
  procedure: string[];
  applications: string[];
  pythonCode: string;
  resources: Resource[];

  // Free-form markdown body (## Theory ...)
  theoryMarkdown: string;
}