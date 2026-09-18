import type { Experiment } from "../types";

const modules = import.meta.glob<Experiment>(
  "../content/experiments/*.json",
  { eager: true, import: "default" }
);

export const experiments: Experiment[] = Object.values(modules).sort((a, b) =>
  a.id.localeCompare(b.id)
);

export const getExperiment = (id: string) =>
  experiments.find((e) => e.id === id);

export const getExperimentsByModule = (moduleId: string) =>
  experiments.filter((e) => e.moduleId === moduleId);