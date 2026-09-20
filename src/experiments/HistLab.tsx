import React, { useEffect, useRef, useState } from "react";
import { Card } from "../components/common/Card";
import { ImageCanvas } from "../components/lab/ImageCanvas";
import { ImageUploader } from "../components/lab/ImageUploader";
import { LabSlider } from "../components/lab/LabSlider";
import { LabShell } from "./LabShell";
import { useImageProcessor } from "../hooks/useImageProcessor";
import {
  clahe,
  drawHistogram,
  drawToCanvas,
  equalizeHistogram,
  toGrayscale,
} from "../lib/imageOps";
import type { LabProps } from "./registry";

type Mode = "none" | "global" | "clahe";

export const HistLab: React.FC<LabProps> = ({ sampleImage }) => {
  const { originalRef, workingRef, loadImage, sourceLoaded } =
    useImageProcessor(sampleImage);
  const [mode, setMode] = useState<Mode>("none");
  const [clipLimit, setClipLimit] = useState(2);
  const [tiles, setTiles] = useState(8);

  const origHistRef = useRef<HTMLCanvasElement>(null);
  const workHistRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => { loadImage(sampleImage); }, [sampleImage, loadImage]);

  // Redraw processed image AND both histograms whenever state changes
  useEffect(() => {
    const orig = originalRef.current;
    const work = workingRef.current;
    if (!orig || !work || !sourceLoaded) return;

    drawToCanvas(orig, work);
    toGrayscale(work);

    if (mode === "global") equalizeHistogram(work);
    else if (mode === "clahe") clahe(work, clipLimit, tiles);

    if (origHistRef.current && workHistRef.current) {
      drawHistogram(orig, origHistRef.current, "#94a3b8");
      drawHistogram(work, workHistRef.current, "#1c62f5");
    }
  }, [mode, clipLimit, tiles, sourceLoaded, originalRef, workingRef]);

  const modeBtn = (id: Mode, label: string) => (
    <button
      key={id}
      onClick={() => setMode(id)}
      className={`w-full text-left px-3 py-2 rounded-lg text-sm border transition-colors ${
        mode === id
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
              {modeBtn("none", "Original")}
              {modeBtn("global", "Global Equalization")}
              {modeBtn("clahe", "CLAHE (adaptive)")}
            </div>

            {mode === "clahe" && (
              <div className="mt-4 space-y-3">
                <LabSlider
                  label="Clip limit"
                  value={clipLimit}
                  min={1}
                  max={8}
                  step={0.5}
                  displayValue={clipLimit.toFixed(1)}
                  onChange={setClipLimit}
                />
                <LabSlider
                  label="Tiles per axis"
                  value={tiles}
                  min={4}
                  max={16}
                  step={1}
                  displayValue={`${tiles}×${tiles}`}
                  onChange={setTiles}
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
          <ImageCanvas canvasRef={workingRef} label="Equalized" />
        </div>
        <div className="grid sm:grid-cols-2 gap-4 pt-2 border-t border-slate-100">
          <div>
            <div className="text-xs font-semibold uppercase tracking-wide text-slate-500 mb-2">
              Original histogram
            </div>
            <canvas
              ref={origHistRef}
              width={340}
              height={120}
              className="w-full rounded-lg border border-slate-200"
            />
          </div>
          <div>
            <div className="text-xs font-semibold uppercase tracking-wide text-slate-500 mb-2">
              Equalized histogram
            </div>
            <canvas
              ref={workHistRef}
              width={340}
              height={120}
              className="w-full rounded-lg border border-slate-200"
            />
          </div>
        </div>
      </Card>
    </LabShell>
  );
};