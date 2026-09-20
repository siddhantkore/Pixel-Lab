import React, { useEffect, useRef, useState } from "react";
import { Card } from "../components/common/Card";
import { ImageCanvas } from "../components/lab/ImageCanvas";
import { ImageUploader } from "../components/lab/ImageUploader";
import { LabSlider } from "../components/lab/LabSlider";
import { LabShell } from "./LabShell";
import { useImageProcessor } from "../hooks/useImageProcessor";
import {
  addGaussianNoise,
  addSaltPepperNoise,
  alphaTrimmedMean,
  boxBlur,
  cloneCanvas,
  contraharmonicMean,
  drawToCanvas,
  medianFilter,
} from "../lib/imageOps";
import type { LabProps } from "./registry";

type NoiseType = "none" | "gaussian" | "saltpepper";
type FilterType =
  | "none"
  | "mean"
  | "median"
  | "contrapositive"
  | "contranegative"
  | "alphatrim";

export const NoiseRestLab: React.FC<LabProps> = ({ sampleImage }) => {
  const { originalRef, workingRef, loadImage, sourceLoaded } =
    useImageProcessor(sampleImage);
  const [noise, setNoise] = useState<NoiseType>("gaussian");
  const [sigma, setSigma] = useState(25);
  const [density, setDensity] = useState(0.05);
  const [filter, setFilter] = useState<FilterType>("median");
  const [k, setK] = useState(5);

  // Staged canvas: original + noise, kept aside so we can re-filter cleanly
  const stagedRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => { loadImage(sampleImage); }, [sampleImage, loadImage]);

  // Step 1: build the noisy image into a hidden staged canvas
  useEffect(() => {
    const orig = originalRef.current;
    if (!orig || !sourceLoaded) return;
    if (!stagedRef.current) {
      stagedRef.current = document.createElement("canvas");
    }
    const staged = stagedRef.current;
    drawToCanvas(orig, staged);

    if (noise === "gaussian") addGaussianNoise(staged, 0, sigma);
    else if (noise === "saltpepper") addSaltPepperNoise(staged, density);
  }, [noise, sigma, density, sourceLoaded, originalRef]);

  // Step 2: apply filter to a copy of staged, put result into working
  useEffect(() => {
    const staged = stagedRef.current;
    const work = workingRef.current;
    if (!staged || !work) return;

    const copy = cloneCanvas(staged);
    switch (filter) {
      case "mean":          boxBlur(copy, k); break;
      case "median":        medianFilter(copy, k); break;
      case "contrapositive":contraharmonicMean(copy, k, 1.5); break;
      case "contranegative":contraharmonicMean(copy, k, -1.5); break;
      case "alphatrim":     alphaTrimmedMean(copy, k, 4); break;
      case "none":
      default: break;
    }
    drawToCanvas(copy, work);
  }, [filter, k, noise, sigma, density, sourceLoaded, workingRef]);

  // Re-trigger filter effect when staged content changes
  const [tick, setTick] = useState(0);
  useEffect(() => { setTick((t) => t + 1); }, [noise, sigma, density]);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { /* no-op, just triggers re-render */ }, [tick]);

  const noiseBtn = (id: NoiseType, label: string) => (
    <button
      key={id}
      onClick={() => setNoise(id)}
      className={`flex-1 px-3 py-1.5 rounded-lg text-xs border font-medium ${
        noise === id
          ? "border-brand-300 bg-brand-50 text-brand-800"
          : "border-slate-200 text-slate-700 hover:bg-slate-50"
      }`}
    >
      {label}
    </button>
  );

  const filterBtn = (id: FilterType, label: string) => (
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

  return (
    <LabShell
      title="Workspace"
      controls={
        <>
          <Card>
            <h3 className="font-semibold text-slate-800 mb-3">1. Noise</h3>
            <div className="flex gap-2 mb-3">
              {noiseBtn("none", "Clean")}
              {noiseBtn("gaussian", "Gaussian")}
              {noiseBtn("saltpepper", "S & P")}
            </div>
            {noise === "gaussian" && (
              <LabSlider
                label="σ (noise std)"
                value={sigma}
                min={0}
                max={60}
                step={1}
                onChange={setSigma}
              />
            )}
            {noise === "saltpepper" && (
              <LabSlider
                label="Density"
                value={density}
                min={0}
                max={0.2}
                step={0.005}
                displayValue={`${(density * 100).toFixed(1)}%`}
                onChange={setDensity}
              />
            )}
          </Card>

          <Card>
            <h3 className="font-semibold text-slate-800 mb-3">2. Restoration filter</h3>
            <div className="space-y-2">
              {filterBtn("none", "None (raw noisy)")}
              {filterBtn("mean", "Arithmetic mean")}
              {filterBtn("median", "Median filter")}
              {filterBtn("contrapositive", "Contraharmonic Q = +1.5")}
              {filterBtn("contranegative", "Contraharmonic Q = −1.5")}
              {filterBtn("alphatrim", "Alpha-trimmed (d=4)")}
            </div>
            {filter !== "none" && (
              <div className="mt-4">
                <LabSlider
                  label="Kernel size"
                  value={k}
                  min={3}
                  max={9}
                  step={2}
                  displayValue={`${k}×${k}`}
                  onChange={setK}
                />
              </div>
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
          <ImageCanvas canvasRef={workingRef} label="Noisy → Filtered" />
        </div>
        <p className="text-xs text-slate-500">
          Step 1 adds noise; step 2 filters. Try Median on Salt & Pepper — then
          try Arithmetic mean on the same noise to see the difference.
        </p>
      </Card>
    </LabShell>
  );
};