import React, { useEffect, useState } from "react";
import { Card } from "../components/common/Card";
import { ImageCanvas } from "../components/lab/ImageCanvas";
import { ImageUploader } from "../components/lab/ImageUploader";
import { LabShell } from "./LabShell";
import { useImageProcessor } from "../hooks/useImageProcessor";

type Props = { sampleImage: string };

export const SetupLab: React.FC<Props> = ({ sampleImage }) => {
  const { originalRef, workingRef, loadImage, sourceLoaded } =
    useImageProcessor(sampleImage);
  const [tone, setTone] = useState<"rgb" | "gray">("rgb");

  useEffect(() => {
    loadImage(sampleImage);
  }, [sampleImage, loadImage]);

  // Convert working canvas to grayscale live when tone changes
  useEffect(() => {
    const c = workingRef.current;
    if (!c) return;
    const ctx = c.getContext("2d")!;
    const img = ctx.getImageData(0, 0, c.width, c.height);
    const d = img.data;
    for (let i = 0; i < d.length; i += 4) {
      const r = d[i], g = d[i + 1], b = d[i + 2];
      const y = tone === "gray" ? 0.299 * r + 0.587 * g + 0.114 * b : r;
      d[i] = tone === "gray" ? y : r;
      d[i + 1] = tone === "gray" ? y : g;
      d[i + 2] = tone === "gray" ? y : b;
    }
    ctx.putImageData(img, 0, 0);
  }, [tone, sourceLoaded]);

  return (
    <LabShell
      title="Workspace"
      controls={
        <>
          <Card>
            <h3 className="font-semibold text-slate-800 mb-3">Controls</h3>
            <div className="flex gap-2">
              <button
                onClick={() => setTone("rgb")}
                className={`px-3 py-1.5 rounded-lg text-sm border ${
                  tone === "rgb"
                    ? "border-brand-300 bg-brand-50 text-brand-700"
                    : "border-slate-200 hover:bg-slate-50"
                }`}
              >
                RGB
              </button>
              <button
                onClick={() => setTone("gray")}
                className={`px-3 py-1.5 rounded-lg text-sm border ${
                  tone === "gray"
                    ? "border-brand-300 bg-brand-50 text-brand-700"
                    : "border-slate-200 hover:bg-slate-50"
                }`}
              >
                Grayscale
              </button>
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
          <ImageCanvas canvasRef={workingRef} label="Processed" />
        </div>
      </Card>
    </LabShell>
  );
};