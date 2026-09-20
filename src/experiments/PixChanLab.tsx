import React, { useEffect, useState } from "react";
import { Card } from "../components/common/Card";
import { ImageCanvas } from "../components/lab/ImageCanvas";
import { ImageUploader } from "../components/lab/ImageUploader";
import { LabSlider } from "../components/lab/LabSlider";
import { LabShell } from "./LabShell";
import { useImageProcessor } from "../hooks/useImageProcessor";
import { applyLinear, drawToCanvas, isolateChannel } from "../lib/imageOps";
import type { LabProps } from "./registry";

type Channel = "all" | "r" | "g" | "b";

export const PixChanLab: React.FC<LabProps> = ({ sampleImage }) => {
  const { originalRef, workingRef, loadImage, sourceLoaded } =
    useImageProcessor(sampleImage);
  const [channel, setChannel] = useState<Channel>("all");
  const [alpha, setAlpha] = useState(1);
  const [beta, setBeta] = useState(0);

  useEffect(() => {
    loadImage(sampleImage);
  }, [sampleImage, loadImage]);

  useEffect(() => {
    const orig = originalRef.current;
    const work = workingRef.current;
    if (!orig || !work || !sourceLoaded) return;
    drawToCanvas(orig, work);
    if (channel !== "all") isolateChannel(work, channel);
    if (alpha !== 1 || beta !== 0) applyLinear(work, alpha, beta);
  }, [channel, alpha, beta, sourceLoaded, originalRef, workingRef]);

  const chBtn = (id: Channel, label: string, color: string) => (
    <button
      key={id}
      onClick={() => setChannel(id)}
      className={`flex-1 px-3 py-1.5 rounded-lg text-sm border font-medium ${
        channel === id
          ? `${color} border-transparent text-white`
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
            <h3 className="font-semibold text-slate-800 mb-3">Channel</h3>
            <div className="flex gap-2">
              {chBtn("all", "All", "bg-slate-700")}
              {chBtn("r", "R", "bg-red-500")}
              {chBtn("g", "G", "bg-green-600")}
              {chBtn("b", "B", "bg-blue-600")}
            </div>
          </Card>

          <Card>
            <h3 className="font-semibold text-slate-800 mb-3">
              Brightness & Contrast
            </h3>
            <div className="space-y-4">
              <LabSlider
                label="Brightness (β)"
                value={beta}
                min={-100}
                max={100}
                step={1}
                onChange={setBeta}
              />
              <LabSlider
                label="Contrast (α)"
                value={alpha}
                min={0.2}
                max={2.5}
                step={0.1}
                displayValue={alpha.toFixed(1)}
                onChange={setAlpha}
              />
              <button
                onClick={() => { setAlpha(1); setBeta(0); setChannel("all"); }}
                className="btn-secondary text-xs w-full"
              >
                Reset all
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