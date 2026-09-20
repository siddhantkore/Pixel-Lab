import type { ComponentType } from "react";
import { SetupLab } from "./SetupLab";
import { IoGeoLab } from "./IoGeoLab";
import { PixChanLab } from "./PixChanLab";
import { ArithBitLab } from "./ArithBitLab";
import { SamplingLab } from "./SamplingLab";

export interface LabProps {
  sampleImage: string;
}

/**
 * Registry maps experiment id → custom lab component.
 * Add new labs here as you build them. Missing ids get a placeholder
 * from <LabSlot/>, so partial progress never breaks the app.
 */
export const labRegistry: Record<string, ComponentType<LabProps>> = {
  "e-setup": SetupLab,
  "e-io-geo": IoGeoLab,
  "e-pix-chan": PixChanLab,
  "e-arith-bit": ArithBitLab,
  "e-sq": SamplingLab,

  // Module 2 — uncomment as you add each:
  // "e-point-proc": PointProcLab,
  // "e-hist":       HistLab,
  // "e-spat-filt":  SpatFiltLab,

  // Module 3 — uncomment as you add each:
  // "e-pix-rel":    PixRelLab,
  // "e-sharp-edge": SharpEdgeLab,
  // "e-morph":      MorphLab,

  // Module 4 — uncomment as you add each:
  // "e-noise-rest": NoiseRestLab,
  // "e-color-proc": ColorProcLab,
  // "e-seg-tech":   SegTechLab,
};