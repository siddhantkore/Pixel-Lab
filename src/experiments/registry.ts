import type { ComponentType } from "react";
import { SetupLab } from "./SetupLab";
import { IoGeoLab } from "./IoGeoLab";
import { PixChanLab } from "./PixChanLab";
import { ArithBitLab } from "./ArithBitLab";
import { SamplingLab } from "./SamplingLab";
import { PointProcLab } from "./PointProcLab";
import { HistLab } from "./HistLab";
import { SpatFiltLab } from "./SpatFiltLab";
import { PixRelLab } from "./PixRelLab";
import { SharpEdgeLab } from "./SharpEdgeLab";
import { MorphLab } from "./MorphLab";
import { NoiseRestLab } from "./NoiseRestLab";
import { ColorProcLab } from "./ColorProcLab";
import { SegTechLab } from "./SegTechLab";

export interface LabProps {
  sampleImage: string;
}

export const labRegistry: Record<string, ComponentType<LabProps>> = {
  /* Module 1 — Image Fundamentals */
  "e-setup":     SetupLab,
  "e-io-geo":    IoGeoLab,
  "e-pix-chan":  PixChanLab,
  "e-arith-bit": ArithBitLab,
  "e-sq":        SamplingLab,

  /* Module 2 — Spatial Enhancement */
  "e-point-proc": PointProcLab,
  "e-hist":       HistLab,
  "e-spat-filt":  SpatFiltLab,

  /* Module 3 — Frequency & Shape */
  "e-pix-rel":    PixRelLab,
  "e-sharp-edge": SharpEdgeLab,
  "e-morph":      MorphLab,

  /* Module 4 — Restoration & Analysis */
  "e-noise-rest": NoiseRestLab,
  "e-color-proc": ColorProcLab,
  "e-seg-tech":   SegTechLab,
};