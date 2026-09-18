import type { ComponentType } from "react";
import { SetupLab } from "./SetupLab";

/**
 * Registry maps experiment id → custom lab component.
 *
 * As you build labs, add them here. Missing ids get a friendly placeholder
 * from <LabSlot/>, so partial progress never breaks the app.
 */
export const labRegistry: Record<string, ComponentType<LabProps>> = {
  "e-setup": SetupLab,

  // ↓ Uncomment each line as you add the file:
  // "e-io-geo":    IoGeoLab,
  // "e-pix-chan":  PixChanLab,
  // "e-arith-bit": ArithBitLab,
  // "e-sq":        SamplingLab,
  // "e-point-proc":PointProcLab,
  // "e-hist":      HistLab,
  // "e-spat-filt": SpatFiltLab,
  // "e-pix-rel":   PixRelLab,
  // "e-sharp-edge":SharpEdgeLab,
  // "e-morph":     MorphLab,
  // "e-noise-rest":NoiseRestLab,
  // "e-color-proc":ColorProcLab,
  // "e-seg-tech":  SegTechLab,
};

export interface LabProps {
  sampleImage: string;
}