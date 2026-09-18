import React from "react";
import { labRegistry, type LabProps } from "../../experiments/registry";
import { FlaskConical } from "lucide-react";

export const LabSlot: React.FC<{
  experimentId: string;
  sampleImage: string;
}> = ({ experimentId, sampleImage }) => {
  const Lab = labRegistry[experimentId];

  if (!Lab) {
    return (
      <div className="rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 p-8 text-center">
        <div className="w-12 h-12 mx-auto rounded-full bg-brand-100 text-brand-700 grid place-items-center mb-3">
          <FlaskConical size={22} />
        </div>
        <h3 className="font-semibold text-slate-800">
          Interactive lab coming soon
        </h3>
        <p className="text-sm text-slate-600 mt-1 max-w-md mx-auto">
          The theory, procedure, and reference code for{" "}
          <code className="px-1.5 py-0.5 rounded bg-slate-200 text-slate-800">
            {experimentId}
          </code>{" "}
          are ready. The live experiment is under construction.
        </p>
      </div>
    );
  }

  return <Lab sampleImage={sampleImage} />;
};