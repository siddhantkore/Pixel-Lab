import React from "react";
import { Download } from "lucide-react";
import type { Experiment } from "../../types";
import { downloadExperimentPDF } from "../../lib/pdfGenerator";
import { Button } from "../common/Button";

export const DownloadExperiment: React.FC<{ experiment: Experiment }> = ({
  experiment,
}) => (
  <Button
    variant="secondary"
    onClick={() => downloadExperimentPDF(experiment)}
    title="Download a printable PDF of this experiment"
  >
    <Download size={16} /> Download experiment (PDF)
  </Button>
);