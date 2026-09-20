import React, { useEffect, useState } from "react";
import { Card } from "../components/common/Card";
import { ImageCanvas } from "../components/lab/ImageCanvas";
import { ImageUploader } from "../components/lab/ImageUploader";
import { LabSlider } from "../components/lab/LabSlider";
import { LabShell } from "./LabShell";
import { useImageProcessor } from "../hooks/useImageProcessor";
import {
  drawToCanvas,
  highBoost,
  laplacianEdges,
  sobelEdges,
  unsharpMask,
} from "../lib/imageOps";
import type { LabProps } from "./registry";

type Method = "none" | "sobel" | "laplacian" | "unsharp" | "highboost";

export const SharpEdgeLab: React.FC<LabProps> = ({ sampleImage }) => {
  const { originalRef, workingRef, loadImage, sourceLoaded } =
    useImageProcessor(sampleImage);
  const [method, setMethod] = useState<Method>("sobel");
  const [threshold, setThreshold] = useState(0);
  const [amount, setAmount] = useState(1);
  const [A, setA] = useState(1.5);

  useEffect(() => { loadImage(sampleImage); }, [sampleImage, loadImage]);

  useEffect(() => {
    const orig = originalRef.current;
    const work = workingRef.current;
    if (!orig || !work || !sourceLoaded) return;
    drawToCanvas(orig, work);

    switch (method) {
      case "sobel":     sobelEdges(work, threshold); break;
      case "laplacian": laplacianEdges(work); break;
      case "unsharp":   unsharpMask(work, amount, 3, 1.5); break;
      case "highboost": highBoost(work, A, 3, 1.5); break;
      case "none":
      default: break;
    }
  }, [method, threshold, amount, A, sourceLoaded, originalRef, workingRef]);

  const btn = (id: Method, label: string) => (
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
              {btn("none", "Original")}
              {btn("sobel", "Sobel gradient")}
              {btn("laplacian", "Laplacian")}
              {btn("unsharp", "Unsharp mask")}
              {btn("highboost", "High-boost")}
            </div>
          </Card>

          {method === "sobel" && (
            <Card>
              <LabSlider
                label="Threshold"
                value={threshold}
                min={0}
                max={255}
                step={5}
                onChange={setThreshold}
              />
              <p className="text-xs text-slate-500 mt-2">
                Pixels below threshold are darkened — helps suppress weak edges.
              </p>
            </Card>
          )}

          {method === "unsharp" && (
            <Card>
              <LabSlider
                label="Amount (α)"
                value={amount}
                min={0}
                max={3}
                step={0.1}
                displayValue={amount.toFixed(1)}
                onChange={setAmount}
              />
            </Card>
          )}

          {method === "highboost" && (
            <Card>
              <LabSlider
                label="Boost factor (A)"
                value={A}
                min={1}
                max={3}
                step={0.1}
                displayValue={A.toFixed(1)}
                onChange={setA}
              />
            </Card>
          )}

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
          <ImageCanvas canvasRef={workingRef} label="Processed" />
        </div>
      </Card>
    </LabShell>
  );
};