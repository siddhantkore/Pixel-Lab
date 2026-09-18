export type ModuleId = string;
export type ExperimentId = string;

export interface Module {
  id: ModuleId;
  title: string;
  description: string;
  icon: string;
  color: string;
  experimentIds: ExperimentId[];
}

export type ResourceType = "paper" | "ppt" | "blog" | "video" | "docs";

export interface Resource {
  type: ResourceType;
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
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  estimatedTime: string;
  sampleImage?: string;
  coreConcept: string;
  formula: string;
  intuition: string;
  procedure: string[];
  theory: string;         // full markdown string
  pythonCode: string;
  thinkAbout: string[];
  applications: string[];
  resources: Resource[];
}