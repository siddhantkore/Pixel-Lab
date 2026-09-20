import React, { useState } from "react";
import { Download, Check, AlertTriangle } from "lucide-react";
import type { Experiment } from "../../types";
import { downloadExperimentPDF } from "../../lib/pdfGenerator";
import { Button } from "../common/Button";

export const DownloadExperiment: React.FC<{ experiment: Experiment }> = ({
  experiment,
}) => {
  const [state, setState] = useState<"idle" | "working" | "done" | "error">(
    "idle"
  );

  const handle = async () => {
    try {
      setState("working");
      downloadExperimentPDF(experiment);
      setState("done");
      setTimeout(() => setState("idle"), 1800);
    } catch (err) {
      console.error("PDF generation failed:", err);
      setState("error");
      setTimeout(() => setState("idle"), 2500);
    }
  };

  return (
    <Button
      variant="secondary"
      onClick={handle}
      disabled={state === "working"}
      title="Download a printable PDF of this experiment"
    >
      {state === "working" && <Download size={16} className="animate-pulse" />}
      {state === "done" && <Check size={16} className="text-emerald-600" />}
      {state === "error" && (
        <AlertTriangle size={16} className="text-rose-600" />
      )}
      {state === "idle" && <Download size={16} />}

      {state === "idle" && "Download experiment (PDF)"}
      {state === "working" && "Generating…"}
      {state === "done" && "Downloaded"}
      {state === "error" && "Failed — see console"}
    </Button>
  );
};