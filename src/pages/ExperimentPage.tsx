import React, { useEffect, useMemo, useState } from "react";
import { Navigate, useParams } from "react-router-dom";
import { getExperiment } from "../data/experiments";
import { getOperation } from "../data/operations";
import { getModule } from "../data/modules";
import { Breadcrumbs } from "../components/common/Breadcrumbs";
import { Tabs } from "../components/common/Tabs";
import { Card } from "../components/common/Card";
import { Badge } from "../components/common/Badge";
import { ImageCanvas } from "../components/lab/ImageCanvas";
import { ImageUploader } from "../components/lab/ImageUploader";
import { OperationPanel } from "../components/lab/OperationPanel";
import { TheorySection } from "../components/lab/TheorySection";
import { ResourceLinks } from "../components/lab/ResourceLinks";
import { DownloadExperiment } from "../components/lab/DownloadExperiment";
import { useImageProcessor } from "../hooks/useImageProcessor";
import { DEFAULT_SAMPLE } from "../lib/constants";
import { Clock } from "lucide-react";

export const ExperimentPage: React.FC = () => {
  const { experimentId } = useParams();
  const experiment = experimentId ? getExperiment(experimentId) : undefined;
  if (!experiment) return <Navigate to="/modules" replace />;

  const mod = getModule(experiment.moduleId)!;
  const ops = useMemo(
    () =>
      experiment.operationIds
        .map((id) => getOperation(id))
        .filter(Boolean) as NonNullable<ReturnType<typeof getOperation>>[],
    [experiment]
  );

  const [activeOpId, setActiveOpId] = useState(ops[0]?.id);
  const activeOp = ops.find((o) => o.id === activeOpId) ?? ops[0];

  const { originalRef, workingRef, loadImage, applyOperation, resetWorking, isProcessing, sourceLoaded } =
    useImageProcessor(experiment.sampleImage ?? DEFAULT_SAMPLE);

  useEffect(() => {
    loadImage(experiment.sampleImage ?? DEFAULT_SAMPLE);
  }, [experiment.sampleImage, loadImage]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Breadcrumbs
        items={[
          { label: "Home", to: "/" },
          { label: "Modules", to: "/modules" },
          { label: mod.title, to: `/modules/${mod.id}` },
          { label: experiment.title },
        ]}
      />

      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="section-title">{experiment.title}</h1>
          <div className="mt-2 flex items-center gap-3 text-sm text-slate-600">
            <Badge>{experiment.difficulty}</Badge>
            <span className="inline-flex items-center gap-1">
              <Clock size={14} /> {experiment.estimatedTime}
            </span>
          </div>
        </div>
        <DownloadExperiment experiment={experiment} />
      </div>

      {/* Main grid */}
      <div className="mt-8 grid lg:grid-cols-3 gap-6">
        {/* Left: viewer */}
        <div className="lg:col-span-2 space-y-4">
          <Card className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="font-semibold text-slate-800">Interactive workspace</h2>
              <ImageUploader
                onUpload={loadImage}
                sampleSrc={experiment.sampleImage}
                onUseSample={() => loadImage(experiment.sampleImage ?? DEFAULT_SAMPLE)}
              />
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <ImageCanvas canvasRef={originalRef} label="Original" />
              <ImageCanvas canvasRef={workingRef} label="Processed" />
            </div>
            {!sourceLoaded && (
              <p className="text-sm text-slate-500">Loading sample image…</p>
            )}
          </Card>

          <Card>
            <Tabs
              tabs={[
                {
                  id: "theory",
                  label: "Theory",
                  content: (
                    <TheorySection aim={experiment.aim} theory={experiment.theory} />
                  ),
                },
                {
                  id: "resources",
                  label: "Resources",
                  content: (
                    <div className="space-y-3">
                      <p className="text-sm text-slate-600">
                        Papers, Stanford lecture slides, blogs and documentation curated for this experiment.
                      </p>
                      <ResourceLinks resources={experiment.resources} />
                    </div>
                  ),
                },
              ]}
            />
          </Card>
        </div>

        {/* Right: ops panel */}
        <div className="space-y-4">
          <Card>
            <h2 className="font-semibold text-slate-800 mb-3">Operations</h2>
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
    </div>
  );
};