import type { ComponentType } from "react";
import { SetupLab } from "./SetupLab";
import { IoGeoLab } from "./IoGeoLab";
import { PixChanLab } from "./PixChanLab";
import { ArithBitLab } from "./ArithBitLab";
import { SamplingLab } from "./SamplingLab";
import { PointProcLab } from "./PointProcLab";
import { HistLab } from "./HistLab";
import { SpatFiltLab } from "./SpatFiltLab";

export interface LabProps {
  sampleImage: string;
}

export const labRegistry: Record<string, ComponentType<LabProps>> = {
  "e-setup":       SetupLab,
  "e-io-geo":      IoGeoLab,
  "e-pix-chan":    PixChanLab,
  "e-arith-bit":   ArithBitLab,
  "e-sq":          SamplingLab,
  "e-point-proc":  PointProcLab,
  "e-hist":        HistLab,
  "e-spat-filt":   SpatFiltLab,

  // Module 3 — uncomment as you add each:
  // "e-pix-rel":    PixRelLab,
  // "e-sharp-edge": SharpEdgeLab,
  // "e-morph":      MorphLab,

  // Module 4 — uncomment as you add each:
  // "e-noise-rest": NoiseRestLab,
  // "e-color-proc": ColorProcLab,
  // "e-seg-tech":   SegTechLab,
};