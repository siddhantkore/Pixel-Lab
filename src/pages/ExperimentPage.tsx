import React, { useEffect, useMemo, useState } from "react";
import { Navigate, useParams } from "react-router-dom";
import {
  BookOpen,
  ListOrdered,
  FlaskConical,
  Code2,
  Rocket,
  Library,
  Clock,
  Target,
} from "lucide-react";

import { getExperiment } from "../lib/markdown";
import { getOperation } from "../data/operations";
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
import { ImageCanvas } from "../components/lab/ImageCanvas";
import { ImageUploader } from "../components/lab/ImageUploader";
import { OperationPanel } from "../components/lab/OperationPanel";

import { useImageProcessor } from "../hooks/useImageProcessor";

const NAV = [
  { id: "theory", label: "Theory" },
  { id: "procedure", label: "Procedure" },
  { id: "lab", label: "Live Lab" },
  { id: "code", label: "Python Code" },
  { id: "applications", label: "Applications" },
  { id: "resources", label: "Further Reading" },
];

export const ExperimentPage: React.FC = () => {
  const { experimentId } = useParams();
  const experiment = experimentId ? getExperiment(experimentId) : undefined;

  // Hooks must be top-level — grab optional experiment safely
  const ops = useMemo(() => {
    if (!experiment) return [];
    return experiment.operationIds
      .map((id) => getOperation(id))
      .filter(Boolean) as NonNullable<ReturnType<typeof getOperation>>[];
  }, [experiment]);

  const [activeOpId, setActiveOpId] = useState<string | undefined>(ops[0]?.id);
  useEffect(() => {
    setActiveOpId(ops[0]?.id);
  }, [ops]);
  const activeOp = ops.find((o) => o.id === activeOpId) ?? ops[0];

  const sampleSrc = experiment?.sampleImage ?? DEFAULT_SAMPLE;
  const {
    originalRef,
    workingRef,
    loadImage,
    resetWorking,
    applyOperation,
    isProcessing,
    sourceLoaded,
  } = useImageProcessor(sampleSrc);

  useEffect(() => {
    if (experiment) loadImage(sampleSrc);
  }, [experiment, sampleSrc, loadImage]);

  if (!experiment) return <Navigate to="/modules" replace />;
  const mod = getModule(experiment.moduleId);

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

      {/* -------- Header -------- */}
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
              <Target size={14} /> {experiment.operationIds.length} operation
              {experiment.operationIds.length > 1 ? "s" : ""}
            </span>
          </div>
        </div>
        <DownloadExperiment experiment={experiment} />
      </div>

      {/* -------- Sticky section nav -------- */}
      <nav
        aria-label="Experiment sections"
        className="sticky top-16 z-30 mt-6 -mx-4 sm:mx-0 px-4 sm:px-0 bg-slate-50/90 backdrop-blur py-2 border-y border-slate-200"
      >
        <ul className="flex gap-1 overflow-x-auto text-sm">
          {NAV.map((n) => (
            <li key={n.id}>
              <a
                href={`#${n.id}`}
                className="px-3 py-1.5 rounded-md text-slate-600 hover:text-brand-700 hover:bg-brand-50 whitespace-nowrap"
              >
                {n.label}
              </a>
            </li>
          ))}
        </ul>
      </nav>

      {/* ================================================================ */}
      {/* SECTION 1 — THEORY (core concept + formula/intuition card)      */}
      {/* ================================================================ */}
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
              {experiment.theoryMarkdown && (
                <Card>
                  <Markdown source={experiment.theoryMarkdown} />
                </Card>
              )}
            </div>

            <ConceptCard
              formula={experiment.formula}
              intuition={experiment.intuition}
              parametersHint={
                activeOp && activeOp.parameters.length > 0 ? (
                  <ul className="text-[13px] text-slate-700 space-y-1.5">
                    {activeOp.parameters.map((p) => (
                      <li key={p.id}>
                        <span className="font-semibold">{p.label}</span>
                        <span className="text-slate-500">
                          {" "}
                          — {p.type === "range"
                            ? `range ${p.min}…${p.max}`
                            : p.type === "select"
                            ? `one of: ${(p.options ?? []).map((o) => o.value).join(", ")}`
                            : "boolean"}
                        </span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-[13px] text-slate-600">
                    This experiment has no tunable parameters.
                  </p>
                )
              }
            />
          </div>
        </SectionBlock>
      </div>

      {/* ================================================================ */}
      {/* SECTION 2 — PROCEDURE                                            */}
      {/* ================================================================ */}
      <div className="mt-14">
        <SectionBlock
          id="procedure"
          icon={<ListOrdered size={18} />}
          title="Procedure"
          subtitle="Follow these steps in order. Each maps to a section below."
          tone="amber"
        >
          <Card>
            <ProcedureSteps steps={experiment.procedure} />
          </Card>
        </SectionBlock>
      </div>

      {/* ================================================================ */}
      {/* SECTION 3 — LIVE LAB                                             */}
      {/* ================================================================ */}
      <div className="mt-14">
        <SectionBlock
          id="lab"
          icon={<FlaskConical size={18} />}
          title="Interactive Lab"
          subtitle="Upload your own image or use the sample. Adjust parameters and observe."
          tone="emerald"
        >
          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-4">
              <Card className="space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <h3 className="font-semibold text-slate-800">Workspace</h3>
                  <span className="text-xs text-slate-500">
                    {sourceLoaded
                      ? `Loaded · ${originalRef.current?.width ?? 0}×${
                          originalRef.current?.height ?? 0
                        }`
                      : "Loading…"}
                  </span>
                </div>

                <ImageUploader
                  onUpload={loadImage}
                  sampleSrc={sampleSrc}
                  onUseSample={() => loadImage(sampleSrc)}
                />

                <div className="grid sm:grid-cols-2 gap-4">
                  <ImageCanvas canvasRef={originalRef} label="Original" />
                  <ImageCanvas canvasRef={workingRef} label="Processed" />
                </div>
              </Card>
            </div>

            <div className="space-y-4">
              <Card>
                <h3 className="font-semibold text-slate-800 mb-3">Operations</h3>
                <div className="space-y-2">
                  {ops.map((op) => (
                    <button
                      key={op.id}
                      onClick={() => setActiveOpId(op.id)}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm border transition-colors ${
                        activeOp?.id === op.id
                          ? "border-brand-300 bg-brand-50 text-brand-800"
                          : "border-slate-200 hover:bg-slate-50 text-slate-700"
                      }`}
                    >
                      {op.name}
                    </button>
                  ))}
                </div>
              </Card>

              {activeOp && (
                <Card>
                  <OperationPanel
                    operation={activeOp}
                    busy={isProcessing}
                    onApply={(params) => applyOperation(activeOp, params)}
                    onReset={resetWorking}
                  />
                </Card>
              )}
            </div>
          </div>
        </SectionBlock>
      </div>

      {/* ================================================================ */}
      {/* SECTION 4 — PYTHON CODE                                          */}
      {/* ================================================================ */}
      <div className="mt-14">
        <SectionBlock
          id="code"
          icon={<Code2 size={18} />}
          title="Reference Python Code"
          subtitle="Copy-paste ready. Matches the operation you performed above."
          tone="violet"
        >
          <Card>
            <CodeBlock code={experiment.pythonCode} />
          </Card>
        </SectionBlock>
      </div>

      {/* ================================================================ */}
      {/* SECTION 5 — APPLICATIONS                                         */}
      {/* ================================================================ */}
      <div className="mt-14">
        <SectionBlock
          id="applications"
          icon={<Rocket size={18} />}
          title="Applications"
          subtitle="Where this concept is used in the real world."
          tone="violet"
        >
          <ApplicationList items={experiment.applications} />
        </SectionBlock>
      </div>

      {/* ================================================================ */}
      {/* SECTION 6 — RESOURCES                                            */}
      {/* ================================================================ */}
      <div className="mt-14 mb-4">
        <SectionBlock
          id="resources"
          icon={<Library size={18} />}
          title="Further Reading"
          subtitle="Papers, Stanford lecture slides, blogs and docs curated for this experiment."
          tone="default"
        >
          <ResourceLinks resources={experiment.resources} />
        </SectionBlock>
      </div>
    </div>
  );
};