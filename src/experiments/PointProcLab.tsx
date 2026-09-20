import React, { useEffect, useState } from "react";
import { Card } from "../components/common/Card";
import { ImageCanvas } from "../components/lab/ImageCanvas";
import { ImageUploader } from "../components/lab/ImageUploader";
import { LabSlider } from "../components/lab/LabSlider";
import { LabShell } from "./LabShell";
import { useImageProcessor } from "../hooks/useImageProcessor";
import { applyGamma, drawToCanvas, toNegative, toGrayscale } from "../lib/imageOps";
import type { LabProps } from "./registry";

type Transform = "none" | "negative" | "log" | "gamma" | "slice";

export const PointProcLab: React.FC<LabProps> = ({ sampleImage }) => {
  const { originalRef, workingRef, loadImage, sourceLoaded } =
    useImageProcessor(sampleImage);
  const [t, setT] = useState<Transform>("none");
  const [gamma, setGamma] = useState(1);
  const [sliceLow, setSliceLow] = useState(100);
  const [sliceHigh, setSliceHigh] = useState(180);

  useEffect(() => { loadImage(sampleImage); }, [sampleImage, loadImage]);

  useEffect(() => {
    const orig = originalRef.current;
    const work = workingRef.current;
    if (!orig || !work || !sourceLoaded) return;
    drawToCanvas(orig, work);
    toGrayscale(work);

    if (t === "negative") toNegative(work);
    else if (t === "log") {
      const ctx = work.getContext("2d")!;
      const img = ctx.getImageData(0, 0, work.width, work.height);
      const p = img.data;
      const c = 255 / Math.log(1 + 255);
      const LUT = new Uint8Array(256);
      for (let i = 0; i < 256; i++) LUT[i] = Math.round(c * Math.log(1 + i));
      for (let i = 0; i < p.length; i += 4) {
        const v = LUT[p[i]];
        p[i] = p[i + 1] = p[i + 2] = v;
      }
      ctx.putImageData(img, 0, 0);
    } else if (t === "gamma") {
      applyGamma(work, gamma);
    } else if (t === "slice") {
      const lo = Math.min(sliceLow, sliceHigh);
      const hi = Math.max(sliceLow, sliceHigh);
      const ctx = work.getContext("2d")!;
      const img = ctx.getImageData(0, 0, work.width, work.height);
      const p = img.data;
      for (let i = 0; i < p.length; i += 4) {
        const v = p[i];
        const out = v >= lo && v <= hi ? 255 : v;
        p[i] = p[i + 1] = p[i + 2] = out;
      }
      ctx.putImageData(img, 0, 0);
    }
  }, [t, gamma, sliceLow, sliceHigh, sourceLoaded, originalRef, workingRef]);

  const btn = (id: Transform, label: string) => (
    <button
      key={id}
      onClick={() => setT(id)}
      className={`w-full text-left px-3 py-2 rounded-lg text-sm border transition-colors ${
        t === id
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
            <h3 className="font-semibold text-slate-800 mb-3">Transform</h3>
            <div className="space-y-2">
              {btn("none", "Original")}
              {btn("negative", "Image Negative")}
              {btn("log", "Logarithmic")}
              {btn("gamma", "Gamma Correction")}
              {btn("slice", "Gray-Level Slicing")}
            </div>

            {t === "gamma" && (
              <div className="mt-4">
                <LabSlider
                  label="γ"
                  value={gamma}
                  min={0.1}
                  max={3}
                  step={0.1}
                  displayValue={gamma.toFixed(1)}
                  onChange={setGamma}
                />
              </div>
            )}

            {t === "slice" && (
              <div className="mt-4 space-y-3">
                <LabSlider
                  label="Lower bound"
                  value={sliceLow}
                  min={0}
                  max={255}
                  onChange={setSliceLow}
                />
                <LabSlider
                  label="Upper bound"
                  value={sliceHigh}
                  min={0}
                  max={255}
                  onChange={setSliceHigh}
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