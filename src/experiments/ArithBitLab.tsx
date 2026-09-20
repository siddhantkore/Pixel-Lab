import React, { useEffect, useState } from "react";
import { Card } from "../components/common/Card";
import { ImageCanvas } from "../components/lab/ImageCanvas";
import { ImageUploader } from "../components/lab/ImageUploader";
import { LabSlider } from "../components/lab/LabSlider";
import { LabShell } from "./LabShell";
import { useImageProcessor } from "../hooks/useImageProcessor";
import { applyCircularMask, drawToCanvas, toNegative } from "../lib/imageOps";
import type { LabProps } from "./registry";

type Mode = "blend" | "mask";

export const ArithBitLab: React.FC<LabProps> = ({ sampleImage }) => {
  const { originalRef, workingRef, loadImage, sourceLoaded } =
    useImageProcessor(sampleImage);
  const [mode, setMode] = useState<Mode>("blend");
  const [alpha, setAlpha] = useState(0.5);
  const [radius, setRadius] = useState(0.4);

  useEffect(() => {
    loadImage(sampleImage);
  }, [sampleImage, loadImage]);

  useEffect(() => {
    const orig = originalRef.current;
    const work = workingRef.current;
    if (!orig || !work || !sourceLoaded) return;
    drawToCanvas(orig, work);

    if (mode === "blend") {
      // Blend original with its own negative
      const ctx = work.getContext("2d")!;
      ctx.globalAlpha = 1;
      ctx.drawImage(orig, 0, 0);
      const neg = document.createElement("canvas");
      neg.width = orig.width;
      neg.height = orig.height;
      neg.getContext("2d")!.drawImage(orig, 0, 0);
      toNegative(neg);
      ctx.globalAlpha = alpha;
      ctx.drawImage(neg, 0, 0);
      ctx.globalAlpha = 1;
    } else {
      applyCircularMask(work, radius);
    }
  }, [mode, alpha, radius, sourceLoaded, originalRef, workingRef]);

  const modeBtn = (id: Mode, label: string) => (
    <button
      key={id}
      onClick={() => setMode(id)}
      className={`flex-1 px-3 py-1.5 rounded-lg text-sm border font-medium ${
        mode === id
          ? "border-brand-300 bg-brand-50 text-brand-800"
          : "border-slate-200 text-slate-700 hover:bg-slate-50"
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
            <h3 className="font-semibold text-slate-800 mb-3">Mode</h3>
            <div className="flex gap-2">
              {modeBtn("blend", "Blend with negative")}
              {modeBtn("mask", "Circular mask")}
            </div>
          </Card>

          <Card>
            {mode === "blend" ? (
              <LabSlider
                label="Alpha (blend weight)"
                value={alpha}
                min={0}
                max={1}
                step={0.05}
                displayValue={alpha.toFixed(2)}
                onChange={setAlpha}
              />
            ) : (
              <LabSlider
                label="Mask radius"
                value={radius}
                min={0.1}
                max={0.5}
                step={0.02}
                displayValue={`${(radius * 100).toFixed(0)}%`}
                onChange={setRadius}
              />
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
          <ImageCanvas canvasRef={workingRef} label="Processed" />
        </div>
      </Card>
    </LabShell>
  );
};