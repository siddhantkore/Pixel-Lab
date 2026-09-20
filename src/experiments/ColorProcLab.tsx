import React, { useEffect, useState } from "react";
import { Card } from "../components/common/Card";
import { ImageCanvas } from "../components/lab/ImageCanvas";
import { ImageUploader } from "../components/lab/ImageUploader";
import { LabShell } from "./LabShell";
import { useImageProcessor } from "../hooks/useImageProcessor";
import {
  drawToCanvas,
  visualizeColorSpace,
  type ColorSpace,
} from "../lib/imageOps";
import type { LabProps } from "./registry";

export const ColorProcLab: React.FC<LabProps> = ({ sampleImage }) => {
  const { originalRef, workingRef, loadImage, sourceLoaded } =
    useImageProcessor(sampleImage);
  const [space, setSpace] = useState<ColorSpace>("hsv");
  const [channel, setChannel] = useState<"all" | "0" | "1" | "2">("all");

  useEffect(() => { loadImage(sampleImage); }, [sampleImage, loadImage]);

  useEffect(() => {
    const orig = originalRef.current;
    const work = workingRef.current;
    if (!orig || !work || !sourceLoaded) return;
    drawToCanvas(orig, work);
    visualizeColorSpace(work, space, channel);
  }, [space, channel, sourceLoaded, originalRef, workingRef]);

  const spaceBtn = (id: ColorSpace, label: string, sub: string) => (
    <button
      key={id}
      onClick={() => { setSpace(id); setChannel("all"); }}
      className={`w-full text-left px-3 py-2 rounded-lg text-sm border transition-colors ${
        space === id
          ? "border-brand-300 bg-brand-50 text-brand-800"
          : "border-slate-200 hover:bg-slate-50 text-slate-700"
      }`}
    >
      <div className="font-medium">{label}</div>
      <div className="text-xs text-slate-500 font-mono">{sub}</div>
    </button>
  );

  const channelNames: Record<ColorSpace, [string, string, string]> = {
    rgb:   ["R", "G", "B"],
    hsv:   ["Hue", "Saturation", "Value"],
    ycrcb: ["Y (luma)", "Cr", "Cb"],
    lab:   ["L*", "a*", "b*"],
  };
  const chNames = channelNames[space];

  const chBtn = (id: "all" | "0" | "1" | "2", label: string) => (
    <button
      key={id}
      onClick={() => setChannel(id)}
      className={`flex-1 px-2 py-1.5 rounded-lg text-xs border font-medium ${
        channel === id
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
            <h3 className="font-semibold text-slate-800 mb-3">Color space</h3>
            <div className="space-y-2">
              {spaceBtn("rgb", "RGB", "R, G, B")}
              {spaceBtn("hsv", "HSV", "Hue, Sat, Value")}
              {spaceBtn("ycrcb", "YCrCb", "Luma + chroma")}
              {spaceBtn("lab", "CIELAB", "L*, a*, b*")}
            </div>
          </Card>

          <Card>
            <h3 className="font-semibold text-slate-800 mb-3">Channel view</h3>
            <div className="flex gap-2">
              {chBtn("all", "All")}
              {chBtn("0", chNames[0])}
              {chBtn("1", chNames[1])}
              {chBtn("2", chNames[2])}
            </div>
            <p className="text-xs text-slate-500 mt-3">
              Isolate a single channel to see what information it carries.
            </p>
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
          <ImageCanvas canvasRef={originalRef} label="Original (RGB)" />
          <ImageCanvas
            canvasRef={workingRef}
            label={`${space.toUpperCase()} · ${channel === "all" ? "all channels" : chNames[parseInt(channel)]}`}
          />
        </div>
      </Card>
    </LabShell>
  );
};