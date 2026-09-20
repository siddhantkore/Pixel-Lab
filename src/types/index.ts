export interface Experiment {
  id: string;
  moduleId: string;
  title: string;
  aim: string;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  estimatedTime: string;
  sampleImage?: string;
  coreConcept: string;
  formula: string;
  intuition: string;
  procedure: string[];
  theory: string;
  pythonCode: string;
  thinkAbout: string[];
  applications: string[];
  resources: Resource[];
}