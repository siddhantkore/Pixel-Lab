import React from "react";
import { Navigate, useParams } from "react-router-dom";
import {
  BookOpen, ListOrdered, FlaskConical, Code2,
  Rocket, Library, Clock, Target, HelpCircle,
} from "lucide-react";

import { getExperiment } from "../lib/experiments";
import { getModule } from "../data/modules";
import { DEFAULT_SAMPLE } from "../lib/constants";

import { Breadcrumbs } from "../components/common/Breadcrumbs";
import { Card } from "../components/common/Card";
import { Badge } from "../components/common/Badge";
import { CodeBlock } from "../components/common/CodeBlock";
import { Markdown } from "../components/common/Markdown";

import { SectionBlock } from "../components/lab/SectionBlock";
import { ConceptCard } from "../components/lab/ConceptCard";
import { ProcedureSteps } from "../components/lab/ProcedureSteps";
import { ApplicationList } from "../components/lab/ApplicationList";
import { ResourceLinks } from "../components/lab/ResourceLinks";
import { DownloadExperiment } from "../components/lab/DownloadExperiment";
import { LabSlot } from "../components/lab/LabSlot";

const NAV = [
  { id: "theory", label: "Theory" },
  { id: "procedure", label: "Procedure" },
  { id: "lab", label: "Live Lab" },
  { id: "code", label: "Python Code" },
  { id: "think", label: "Think About It" },
  { id: "applications", label: "Applications" },
  { id: "resources", label: "Further Reading" },
];

export const ExperimentPage: React.FC = () => {
  const { experimentId } = useParams();
  const experiment = experimentId ? getExperiment(experimentId) : undefined;
  if (!experiment) return <Navigate to="/modules" replace />;
  const mod = getModule(experiment.moduleId);
  const sampleImage = experiment.sampleImage ?? DEFAULT_SAMPLE;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Breadcrumbs
        items={[
          { label: "Home", to: "/" },
          { label: "Modules", to: "/modules" },
          mod && { label: mod.title, to: `/modules/${mod.id}` },
          { label: experiment.title },
        ].filter(Boolean) as any}
      />

      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="section-title">{experiment.title}</h1>
          <p className="mt-2 text-slate-600 max-w-3xl">{experiment.aim}</p>
          <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-slate-600">
            <Badge>{experiment.difficulty}</Badge>
            <span className="inline-flex items-center gap-1">
              <Clock size={14} /> {experiment.estimatedTime}
            </span>
            <span className="inline-flex items-center gap-1">
              <Target size={14} /> {experiment.thinkAbout.length} reflection questions
            </span>
          </div>
        </div>
        <DownloadExperiment experiment={experiment} />
      </div>

      {/* Sticky nav */}
      <nav
        aria-label="Experiment sections"
        className="sticky top-16 z-30 mt-6 -mx-4 sm:mx-0 px-4 sm:px-0 bg-slate-50/90 backdrop-blur py-2 border-y border-slate-200"
      >
        <ul className="flex gap-1 overflow-x-auto text-sm">
          {NAV.map((n) => (
            <li key={n.id}>
              <a href={`#${n.id}`} className="px-3 py-1.5 rounded-md text-slate-600 hover:text-brand-700 hover:bg-brand-50 whitespace-nowrap">
                {n.label}
              </a>
            </li>
          ))}
        </ul>
      </nav>

      {/* 1 — Theory */}
      <div className="mt-10">
        <SectionBlock
          id="theory"
          icon={<BookOpen size={18} />}
          title="Theory & Core Concept"
          subtitle="Understand what it is, why we need it, and how it works."
          tone="brand"
        >
          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-4">
              {experiment.coreConcept && (
                <Card>
                  <h3 className="font-semibold text-slate-800 mb-2">Core Concept</h3>
                  <Markdown source={experiment.coreConcept} />
                </Card>
              )}
              {experiment.theory && (
                <Card>
                  <Markdown source={experiment.theory} />
                </Card>
              )}
            </div>
            <ConceptCard
              formula={experiment.formula}
              intuition={experiment.intuition}
            />
          </div>
        </SectionBlock>
      </div>

      {/* 2 — Procedure */}
      <div className="mt-14">
        <SectionBlock
          id="procedure"
          icon={<ListOrdered size={18} />}
          title="Procedure"
          subtitle="Follow these steps in order."
          tone="amber"
        >
          <Card><ProcedureSteps steps={experiment.procedure} /></Card>
        </SectionBlock>
      </div>

      {/* 3 — Live Lab (custom per experiment) */}
      <div className="mt-14">
        <SectionBlock
          id="lab"
          icon={<FlaskConical size={18} />}
          title="Interactive Lab"
          subtitle="Manipulate the image and observe changes in real time."
          tone="emerald"
        >
          <LabSlot experimentId={experiment.id} sampleImage={sampleImage} />
        </SectionBlock>
      </div>

      {/* 4 — Python */}
      <div className="mt-14">
        <SectionBlock
          id="code"
          icon={<Code2 size={18} />}
          title="Reference Python Code"
          subtitle="Copy-paste ready."
          tone="violet"
        >
          <Card><CodeBlock code={experiment.pythonCode} /></Card>
        </SectionBlock>
      </div>

      {/* 5 — Think About It */}
      {experiment.thinkAbout.length > 0 && (
        <div className="mt-14">
          <SectionBlock
            id="think"
            icon={<HelpCircle size={18} />}
            title="Think About It"
            subtitle="Reflection questions to consolidate understanding."
            tone="amber"
          >
            <Card>
              <ul className="list-disc pl-5 space-y-2 text-sm text-slate-700">
                {experiment.thinkAbout.map((q, i) => (
                  <li key={i}><Markdown source={q} /></li>
                ))}
              </ul>
            </Card>
          </SectionBlock>
        </div>
      )}

      {/* 6 — Applications */}
      <div className="mt-14">
        <SectionBlock
          id="applications"
          icon={<Rocket size={18} />}
          title="Applications"
          subtitle="Where this concept is used."
          tone="violet"
        >
          <ApplicationList items={experiment.applications} />
        </SectionBlock>
      </div>

      {/* 7 — Resources */}
      <div className="mt-14 mb-4">
        <SectionBlock
          id="resources"
          icon={<Library size={18} />}
          title="Further Reading"
          subtitle="Papers, slides, blogs, docs."
        >
          <ResourceLinks resources={experiment.resources} />
        </SectionBlock>
      </div>
    </div>
  );
};