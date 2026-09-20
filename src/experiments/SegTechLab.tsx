import React, { useEffect, useState } from "react";
import { Card } from "../components/common/Card";
import { ImageCanvas } from "../components/lab/ImageCanvas";
import { ImageUploader } from "../components/lab/ImageUploader";
import { LabSlider } from "../components/lab/LabSlider";
import { LabShell } from "./LabShell";
import { useImageProcessor } from "../hooks/useImageProcessor";
import {
  adaptiveThreshold,
  drawBoundingBoxes,
  drawToCanvas,
  globalThreshold,
  otsuThreshold,
  toGrayscale,
} from "../lib/imageOps";
import type { LabProps } from "./registry";

type Method = "global" | "otsu" | "adaptive";

export const SegTechLab: React.FC<LabProps> = ({ sampleImage }) => {
  const { originalRef, workingRef, loadImage, sourceLoaded } =
    useImageProcessor(sampleImage);
  const [method, setMethod] = useState<Method>("otsu");
  const [threshold, setThreshold] = useState(127);
  const [blockSize, setBlockSize] = useState(15);
  const [C, setC] = useState(5);
  const [showBoxes, setShowBoxes] = useState(true);
  const [otsuValue, setOtsuValue] = useState<number | null>(null);
  const [boxCount, setBoxCount] = useState<number | null>(null);

  useEffect(() => { loadImage(sampleImage); }, [sampleImage, loadImage]);

  useEffect(() => {
    const orig = originalRef.current;
    const work = workingRef.current;
    if (!orig || !work || !sourceLoaded) return;
    drawToCanvas(orig, work);
    toGrayscale(work);

    let computedT: number | null = null;
    switch (method) {
      case "global":
        globalThreshold(work, threshold);
        break;
      case "otsu":
        computedT = otsuThreshold(work);
        setOtsuValue(computedT);
        break;
      case "adaptive":
        adaptiveThreshold(work, blockSize, C);
        break;
    }

    if (showBoxes) {
      const n = drawBoundingBoxes(work, 200);
      setBoxCount(n);
    } else {
      setBoxCount(null);
    }
  }, [
    method, threshold, blockSize, C, showBoxes,
    sourceLoaded, originalRef, workingRef,
  ]);

  const methodBtn = (id: Method, label: string) => (
    <button
      key={id}
      onClick={() => setMethod(id)}
      className={`w-full text-left px-3 py-2 rounded-lg text-sm border transition-colors ${
        method === id
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
            <h3 className="font-semibold text-slate-800 mb-3">Method</h3>
            <div className="space-y-2">
              {methodBtn("global", "Global threshold")}
              {methodBtn("otsu", "Otsu (auto)")}
              {methodBtn("adaptive", "Adaptive Gaussian")}
            </div>
          </Card>

          {method === "global" && (
            <Card>
              <LabSlider
                label="Threshold T"
                value={threshold}
                min={0}
                max={255}
                step={1}
                onChange={setThreshold}
              />
            </Card>
          )}

          {method === "otsu" && otsuValue !== null && (
            <Card>
              <h3 className="text-sm font-semibold text-slate-800 mb-2">
                Computed threshold
              </h3>
              <p className="text-3xl font-bold text-brand-700 tabular-nums">
                T* = {otsuValue}
              </p>
              <p className="text-xs text-slate-500 mt-1">
                Chosen to maximize between-class variance.
              </p>
            </Card>
          )}

          {method === "adaptive" && (
            <Card>
              <div className="space-y-4">
                <LabSlider
                  label="Block size"
                  value={blockSize}
                  min={3}
                  max={31}
                  step={2}
                  displayValue={`${blockSize}×${blockSize}`}
                  onChange={setBlockSize}
                />
                <LabSlider
                  label="Constant C"
                  value={C}
                  min={0}
                  max={20}
                  step={1}
                  onChange={setC}
                />
              </div>
            </Card>
          )}

          <Card>
            <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
              <input
                type="checkbox"
                checked={showBoxes}
                onChange={(e) => setShowBoxes(e.target.checked)}
                className="accent-brand-600"
              />
              Draw bounding boxes
            </label>
            {boxCount !== null && (
              <p className="text-xs text-slate-500 mt-2">
                {boxCount} object{boxCount === 1 ? "" : "s"} detected (area ≥ 200 px).
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
          <ImageCanvas canvasRef={workingRef} label="Segmented" />
        </div>
        <p className="text-xs text-slate-500">
          Bounding boxes are drawn in green around each detected connected component.
        </p>
      </Card>
    </LabShell>
  );
};