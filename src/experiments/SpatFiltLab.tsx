import React, { useEffect, useState } from "react";
import { Card } from "../components/common/Card";
import { ImageCanvas } from "../components/lab/ImageCanvas";
import { ImageUploader } from "../components/lab/ImageUploader";
import { LabSlider } from "../components/lab/LabSlider";
import { LabShell } from "./LabShell";
import { useImageProcessor } from "../hooks/useImageProcessor";
import {
  bilateralFilter,
  boxBlur,
  drawToCanvas,
  gaussianBlur,
  medianFilter,
} from "../lib/imageOps";
import type { LabProps } from "./registry";

type Filter = "none" | "box" | "gaussian" | "median" | "bilateral";

export const SpatFiltLab: React.FC<LabProps> = ({ sampleImage }) => {
  const { originalRef, workingRef, loadImage, sourceLoaded } =
    useImageProcessor(sampleImage);
  const [filter, setFilter] = useState<Filter>("none");
  const [kernel, setKernel] = useState(5);
  const [sigma, setSigma] = useState(1.5);

  useEffect(() => { loadImage(sampleImage); }, [sampleImage, loadImage]);

  useEffect(() => {
    const orig = originalRef.current;
    const work = workingRef.current;
    if (!orig || !work || !sourceLoaded) return;
    drawToCanvas(orig, work);

    switch (filter) {
      case "box":       boxBlur(work, kernel); break;
      case "gaussian":  gaussianBlur(work, kernel, sigma); break;
      case "median":    medianFilter(work, kernel); break;
      case "bilateral": bilateralFilter(work, Math.floor(kernel / 2), 3, 40); break;
    }
  }, [filter, kernel, sigma, sourceLoaded, originalRef, workingRef]);

  const btn = (id: Filter, label: string) => (
    <button
      key={id}
      onClick={() => setFilter(id)}
      className={`w-full text-left px-3 py-2 rounded-lg text-sm border transition-colors ${
        filter === id
          ? "border-brand-300 bg-brand-50 text-brand-800"
          : "border-slate-200 hover:bg-slate-50 text-slate-700"
      }`}
    >
      {label}
    </button>
  );

  const showKernel = filter !== "none" && filter !== "bilateral";
  const showSigma = filter === "gaussian";
  const showBilateralNote = filter === "bilateral";

  return (
    <LabShell
      title="Workspace"
      controls={
        <>
          <Card>
            <h3 className="font-semibold text-slate-800 mb-3">Filter</h3>
            <div className="space-y-2">
              {btn("none", "Original")}
              {btn("box", "Mean / Box Blur")}
              {btn("gaussian", "Gaussian Blur")}
              {btn("median", "Median Filter")}
              {btn("bilateral", "Bilateral Filter")}
            </div>

            {showKernel && (
              <div className="mt-4">
                <LabSlider
                  label="Kernel size"
                  value={kernel}
                  min={3}
                  max={15}
                  step={2}
                  displayValue={`${kernel}×${kernel}`}
                  onChange={setKernel}
                />
              </div>
            )}

            {showSigma && (
              <div className="mt-4">
                <LabSlider
                  label="σ (sigma)"
                  value={sigma}
                  min={0.5}
                  max={5}
                  step={0.1}
                  displayValue={sigma.toFixed(1)}
                  onChange={setSigma}
                />
              </div>
            )}

            {showBilateralNote && (
              <p className="mt-4 text-xs text-slate-500 italic">
                Bilateral filter uses kernel radius {Math.floor(kernel / 2)} — edges preserved.
              </p>
            )}
          </Card>

          <Card>
            <ImageUploader
              onUpload={loadImage}
              sampleSrc={sampleImage}
              onUseSample={() => loadImage(sampleImage)}
            />
          </Card>
        </>
      }
    >
      <Card className="space-y-4">
        <div className="grid sm:grid-cols-2 gap-4">
          <ImageCanvas canvasRef={originalRef} label="Original" />
          <ImageCanvas canvasRef={workingRef} label="Filtered" />
        </div>
      </Card>
    </LabShell>
  );
};