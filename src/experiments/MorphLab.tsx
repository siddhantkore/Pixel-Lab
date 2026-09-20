import React, { useEffect, useState } from "react";
import { Card } from "../components/common/Card";
import { ImageCanvas } from "../components/lab/ImageCanvas";
import { ImageUploader } from "../components/lab/ImageUploader";
import { LabSlider } from "../components/lab/LabSlider";
import { LabShell } from "./LabShell";
import { useImageProcessor } from "../hooks/useImageProcessor";
import {
  dilate,
  drawToCanvas,
  erode,
  morphClose,
  morphGradient,
  morphOpen,
  toBinary,
  type MorphKernel,
} from "../lib/imageOps";
import type { LabProps } from "./registry";

type Op = "none" | "erode" | "dilate" | "open" | "close" | "gradient";

export const MorphLab: React.FC<LabProps> = ({ sampleImage }) => {
  const { originalRef, workingRef, loadImage, sourceLoaded } =
    useImageProcessor(sampleImage);
  const [op, setOp] = useState<Op>("erode");
  const [k, setK] = useState(3);
  const [shape, setShape] = useState<MorphKernel>("rect");

  useEffect(() => { loadImage(sampleImage); }, [sampleImage, loadImage]);

  useEffect(() => {
    const orig = originalRef.current;
    const work = workingRef.current;
    if (!orig || !work || !sourceLoaded) return;
    drawToCanvas(orig, work);
    toBinary(work, 127);

    switch (op) {
      case "erode":    erode(work, k, shape); break;
      case "dilate":   dilate(work, k, shape); break;
      case "open":     morphOpen(work, k, shape); break;
      case "close":    morphClose(work, k, shape); break;
      case "gradient": morphGradient(work, k, shape); break;
      case "none":
      default: break;
    }
  }, [op, k, shape, sourceLoaded, originalRef, workingRef]);

  const btn = (id: Op, label: string) => (
    <button
      key={id}
      onClick={() => setOp(id)}
      className={`w-full text-left px-3 py-2 rounded-lg text-sm border transition-colors ${
        op === id
          ? "border-brand-300 bg-brand-50 text-brand-800"
          : "border-slate-200 hover:bg-slate-50 text-slate-700"
      }`}
    >
      {label}
    </button>
  );

  const shapeBtn = (id: MorphKernel, label: string) => (
    <button
      key={id}
      onClick={() => setShape(id)}
      className={`flex-1 px-3 py-1.5 rounded-lg text-xs border font-medium ${
        shape === id
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
            <h3 className="font-semibold text-slate-800 mb-3">Operation</h3>
            <div className="space-y-2">
              {btn("none", "Binary input")}
              {btn("erode", "Erosion")}
              {btn("dilate", "Dilation")}
              {btn("open", "Opening (erode → dilate)")}
              {btn("close", "Closing (dilate → erode)")}
              {btn("gradient", "Morphological gradient")}
            </div>
          </Card>

          <Card>
            <h3 className="font-semibold text-slate-800 mb-3">
              Structuring element
            </h3>
            <LabSlider
              label="Kernel size"
              value={k}
              min={3}
              max={15}
              step={2}
              displayValue={`${k}×${k}`}
              onChange={setK}
            />
            <div className="flex gap-2 mt-3">
              {shapeBtn("rect", "Rect")}
              {shapeBtn("ellipse", "Ellipse")}
              {shapeBtn("cross", "Cross")}
            </div>
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
          <ImageCanvas canvasRef={workingRef} label="Morphology output" />
        </div>
        <p className="text-xs text-slate-500">
          Images are thresholded to binary before morphology. Original shown for reference.
        </p>
      </Card>
    </LabShell>
  );
};