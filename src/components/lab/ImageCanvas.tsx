import React from "react";

type Props = {
  canvasRef: React.RefObject<HTMLCanvasElement>;
  label: string;
  className?: string;
};

export const ImageCanvas: React.FC<Props> = ({ canvasRef, label, className = "" }) => (
  <div className={`space-y-2 ${className}`}>
    <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
      {label}
    </div>
    <div className="bg-slate-100 border border-slate-200 rounded-lg p-2 grid place-items-center min-h-[300px]">
      <canvas ref={canvasRef} className="max-w-full max-h-[520px] rounded" />
    </div>
  </div>
);