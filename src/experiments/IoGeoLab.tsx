import React, { useEffect, useState } from "react";
import { Card } from "../components/common/Card";
import { ImageCanvas } from "../components/lab/ImageCanvas";
import { ImageUploader } from "../components/lab/ImageUploader";
import { LabShell } from "./LabShell";
import { useImageProcessor } from "../hooks/useImageProcessor";
import {
  flipHorizontal,
  flipVertical,
  rotate90,
  transposeCanvas,
  resizeTo,
  drawToCanvas,
} from "../lib/imageOps";
import type { LabProps } from "./registry";
import { RotateCw, FlipHorizontal, FlipVertical, MoveDiagonal, Maximize2 } from "lucide-react";

type GeoOp = "none" | "rotate" | "flip-h" | "flip-v" | "transpose" | "resize";

export const IoGeoLab: React.FC<LabProps> = ({ sampleImage }) => {
  const { originalRef, workingRef, loadImage, sourceLoaded } =
    useImageProcessor(sampleImage);
  const [op, setOp] = useState<GeoOp>("none");
  const [resizeW, setResizeW] = useState(300);

  useEffect(() => {
    loadImage(sampleImage);
  }, [sampleImage, loadImage]);

  // Recompute whenever op or resizeW changes
  useEffect(() => {
    const orig = originalRef.current;
    const work = workingRef.current;
    if (!orig || !work || !sourceLoaded) return;
    drawToCanvas(orig, work);

    switch (op) {
      case "rotate":     rotate90(work); break;
      case "flip-h":     flipHorizontal(work); break;
      case "flip-v":     flipVertical(work); break;
      case "transpose":  transposeCanvas(work); break;
      case "resize":     resizeTo(work, resizeW, resizeW, true); break;
      case "none":
      default: break;
    }
  }, [op, resizeW, sourceLoaded, originalRef, workingRef]);

  const btn = (id: GeoOp, label: string, Icon: React.ElementType) => (
    <button
      key={id}
      onClick={() => setOp(id)}
      className={`w-full text-left px-3 py-2 rounded-lg text-sm border transition-colors flex items-center gap-2 ${
        op === id
          ? "border-brand-300 bg-brand-50 text-brand-800"
          : "border-slate-200 hover:bg-slate-50 text-slate-700"
      }`}
    >
      <Icon size={14} /> {label}
    </button>
  );

  return (
    <LabShell
      title="Workspace"
      controls={
        <>
          <Card>
            <h3 className="font-semibold text-slate-800 mb-3">Transform</h3>
            <div className="space-y-2">
              {btn("none", "Original", Maximize2)}
              {btn("rotate", "Rotate 90° CW", RotateCw)}
              {btn("transpose", "Transpose", MoveDiagonal)}
              {btn("flip-h", "Flip horizontal", FlipHorizontal)}
              {btn("flip-v", "Flip vertical", FlipVertical)}
              {btn("resize", "Resize square", Maximize2)}
            </div>

            {op === "resize" && (
              <div className="mt-4 space-y-2">
                <label className="text-sm font-medium text-slate-700">
                  Size: {resizeW}×{resizeW} px
                </label>
                <input
                  type="range"
                  min={100}
                  max={600}
                  step={20}
                  value={resizeW}
                  onChange={(e) => setResizeW(Number(e.target.value))}
                  className="w-full accent-brand-600"
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
          <ImageCanvas canvasRef={workingRef} label="Transformed" />
        </div>
      </Card>
    </LabShell>
  );
};