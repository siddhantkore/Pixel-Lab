import React, { useEffect, useRef, useState } from "react";
import { Card } from "../components/common/Card";
import { ImageUploader } from "../components/lab/ImageUploader";
import { LabShell } from "./LabShell";
import { useImageProcessor } from "../hooks/useImageProcessor";
import {
  distanceTransform,
  drawToCanvas,
  makeGridCanvas,
  toBinary,
  type DistanceMetric,
} from "../lib/imageOps";
import type { LabProps } from "./registry";

export const PixRelLab: React.FC<LabProps> = ({ sampleImage }) => {
  const { originalRef, workingRef, loadImage, sourceLoaded } =
    useImageProcessor(sampleImage);
  const [metric, setMetric] = useState<DistanceMetric>("euclidean");
  const [useGrid, setUseGrid] = useState(true);
  const gridRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (useGrid && gridRef.current) {
      makeGridCanvas(gridRef.current, 320, 20);
    } else {
      loadImage(sampleImage);
    }
  }, [useGrid, sampleImage, loadImage]);

  // Recompute the working canvas whenever metric changes
  useEffect(() => {
    const orig = originalRef.current;
    const work = workingRef.current;
    if (!orig || !work) return;

    if (useGrid && gridRef.current) {
      // Copy grid to working, threshold to binary, distance-transform
      drawToCanvas(gridRef.current, work);
      toBinary(work, 127);
      distanceTransform(work, metric);
    } else if (sourceLoaded) {
      drawToCanvas(orig, work);
      toBinary(work, 127);
      distanceTransform(work, metric);
    }
  }, [metric, useGrid, sourceLoaded, originalRef, workingRef]);

  const btn = (id: DistanceMetric, label: string, sub: string) => (
    <button
      key={id}
      onClick={() => setMetric(id)}
      className={`w-full text-left px-3 py-2 rounded-lg text-sm border transition-colors ${
        metric === id
          ? "border-brand-300 bg-brand-50 text-brand-800"
          : "border-slate-200 hover:bg-slate-50 text-slate-700"
      }`}
    >
      <div className="font-medium">{label}</div>
      <div className="text-xs text-slate-500 font-mono">{sub}</div>
    </button>
  );

  return (
    <LabShell
      title="Workspace"
      controls={
        <>
          <Card>
            <h3 className="font-semibold text-slate-800 mb-3">Distance metric</h3>
            <div className="space-y-2">
              {btn("euclidean", "Euclidean", "√(dx² + dy²)")}
              {btn("manhattan", "City-Block (D4)", "|dx| + |dy|")}
              {btn("chessboard", "Chessboard (D8)", "max(|dx|, |dy|)")}
            </div>
          </Card>

          <Card>
            <h3 className="font-semibold text-slate-800 mb-3">Source</h3>
            <div className="flex gap-2">
              <button
                onClick={() => setUseGrid(true)}
                className={`flex-1 px-3 py-1.5 rounded-lg text-sm border ${
                  useGrid
                    ? "border-brand-300 bg-brand-50 text-brand-800"
                    : "border-slate-200 text-slate-700 hover:bg-slate-50"
                }`}
              >
                Grid
              </button>
              <button
                onClick={() => setUseGrid(false)}
                className={`flex-1 px-3 py-1.5 rounded-lg text-sm border ${
                  !useGrid
                    ? "border-brand-300 bg-brand-50 text-brand-800"
                    : "border-slate-200 text-slate-700 hover:bg-slate-50"
                }`}
              >
                Image
              </button>
            </div>
          </Card>

          {!useGrid && (
            <Card>
              <ImageUploader
                onUpload={loadImage}
                sampleSrc={sampleImage}
                onUseSample={() => loadImage(sampleImage)}
              />
            </Card>
          )}
        </>
      }
    >
      <Card className="space-y-4">
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Binary source
            </div>
            <div className="bg-slate-100 border border-slate-200 rounded-lg p-2 grid place-items-center min-h-[300px]">
              <canvas ref={gridRef} className="max-w-full max-h-[300px] rounded" />
            </div>
          </div>
          <div className="space-y-2">
            <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Distance transform ({metric})
            </div>
            <div className="bg-slate-100 border border-slate-200 rounded-lg p-2 grid place-items-center min-h-[300px]">
              <canvas ref={workingRef} className="max-w-full max-h-[300px] rounded" />
            </div>
          </div>
        </div>
        <p className="text-xs text-slate-500">
          Bright regions = farther from the source pixel. Each metric produces a
          distinct equidistant contour.
        </p>
      </Card>
    </LabShell>
  );
};