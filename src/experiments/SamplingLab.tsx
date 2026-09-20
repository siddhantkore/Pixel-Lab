import React, { useEffect, useState } from "react";
import { Card } from "../components/common/Card";
import { ImageCanvas } from "../components/lab/ImageCanvas";
import { ImageUploader } from "../components/lab/ImageUploader";
import { LabSlider } from "../components/lab/LabSlider";
import { LabShell } from "./LabShell";
import { useImageProcessor } from "../hooks/useImageProcessor";
import { drawToCanvas, pixelate, quantize } from "../lib/imageOps";
import type { LabProps } from "./registry";

export const SamplingLab: React.FC<LabProps> = ({ sampleImage }) => {
  const { originalRef, workingRef, loadImage, sourceLoaded } =
    useImageProcessor(sampleImage);
  const [factor, setFactor] = useState(1);
  const [levels, setLevels] = useState(256);

  useEffect(() => {
    loadImage(sampleImage);
  }, [sampleImage, loadImage]);

  useEffect(() => {
    const orig = originalRef.current;
    const work = workingRef.current;
    if (!orig || !work || !sourceLoaded) return;
    drawToCanvas(orig, work);
    if (factor > 1) pixelate(work, factor);
    if (levels < 256) quantize(work, levels);
  }, [factor, levels, sourceLoaded, originalRef, workingRef]);

  // Estimate "effective resolution" for display
  const origW = originalRef.current?.width ?? 0;
  const origH = originalRef.current?.height ?? 0;
  const sampledW = Math.max(1, Math.floor(origW / factor));
  const sampledH = Math.max(1, Math.floor(origH / factor));

  return (
    <LabShell
      title="Workspace"
      controls={
        <>
          <Card>
            <h3 className="font-semibold text-slate-800 mb-3">Sampling</h3>
            <LabSlider
              label="Downsample factor"
              value={factor}
              min={1}
              max={16}
              step={1}
              displayValue={`1/${factor} (${sampledW}×${sampledH})`}
              onChange={setFactor}
            />
          </Card>

          <Card>
            <h3 className="font-semibold text-slate-800 mb-3">Quantization</h3>
            <LabSlider
              label="Gray levels"
              value={levels}
              min={2}
              max={256}
              step={1}
              displayValue={`${levels} levels (${Math.ceil(Math.log2(levels))} bits)`}
              onChange={setLevels}
            />
          </Card>

          <Card className="text-xs text-slate-600 space-y-1">
            <div><strong>Original:</strong> {origW}×{origH}</div>
            <div><strong>Sampled:</strong> {sampledW}×{sampledH}</div>
            <div>
              <strong>Bits/pixel:</strong> {Math.ceil(Math.log2(levels))}
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
          <ImageCanvas canvasRef={workingRef} label="Sampled + Quantized" />
        </div>
        <button
          onClick={() => { setFactor(1); setLevels(256); }}
          className="btn-secondary text-xs"
        >
          Reset both
        </button>
      </Card>
    </LabShell>
  );
};