/**
 * Shared image operations.
 *
 * Every function takes an HTMLCanvasElement and mutates it in place,
 * OR takes two canvases (source + target). Keeping them pure over the
 * canvas API lets labs be a thin shell of controls + these helpers.
 *
 * Naming:
 *   - mutate:   apply*  (modifies canvas)
 *   - produce:  get*    (returns a value)
 *   - transform: blit*  (draws source → target)
 */

/* =================================================================
 * Canvas helpers
 * ================================================================= */

export function cloneCanvas(src: HTMLCanvasElement): HTMLCanvasElement {
  const out = document.createElement("canvas");
  out.width = src.width;
  out.height = src.height;
  out.getContext("2d")!.drawImage(src, 0, 0);
  return out;
}

export function clearCanvas(c: HTMLCanvasElement) {
  c.getContext("2d")!.clearRect(0, 0, c.width, c.height);
}

export function drawToCanvas(src: HTMLCanvasElement, target: HTMLCanvasElement) {
  target.width = src.width;
  target.height = src.height;
  const ctx = target.getContext("2d")!;
  ctx.clearRect(0, 0, target.width, target.height);
  ctx.drawImage(src, 0, 0);
}

export function resizeCanvasTo(
  target: HTMLCanvasElement,
  w: number,
  h: number
) {
  target.width = w;
  target.height = h;
}

/* =================================================================
 * Point operations
 * ================================================================= */

/** Convert to grayscale with Rec. 601 luminance */
export function toGrayscale(c: HTMLCanvasElement) {
  const ctx = c.getContext("2d")!;
  const d = ctx.getImageData(0, 0, c.width, c.height);
  const p = d.data;
  for (let i = 0; i < p.length; i += 4) {
    const y = 0.299 * p[i] + 0.587 * p[i + 1] + 0.114 * p[i + 2];
    p[i] = p[i + 1] = p[i + 2] = y;
  }
  ctx.putImageData(d, 0, 0);
}

/** Invert intensities */
export function toNegative(c: HTMLCanvasElement) {
  const ctx = c.getContext("2d")!;
  const d = ctx.getImageData(0, 0, c.width, c.height);
  const p = d.data;
  for (let i = 0; i < p.length; i += 4) {
    p[i] = 255 - p[i];
    p[i + 1] = 255 - p[i + 1];
    p[i + 2] = 255 - p[i + 2];
  }
  ctx.putImageData(d, 0, 0);
}

/** g = alpha*f + beta  (contrast + brightness) */
export function applyLinear(
  c: HTMLCanvasElement,
  alpha: number,
  beta: number
) {
  const ctx = c.getContext("2d")!;
  const d = ctx.getImageData(0, 0, c.width, c.height);
  const p = d.data;
  for (let i = 0; i < p.length; i += 4) {
    p[i] = clamp(alpha * p[i] + beta);
    p[i + 1] = clamp(alpha * p[i + 1] + beta);
    p[i + 2] = clamp(alpha * p[i + 2] + beta);
  }
  ctx.putImageData(d, 0, 0);
}

/** Gamma correction, gamma<1 brightens, gamma>1 darkens */
export function applyGamma(c: HTMLCanvasElement, gamma: number) {
  const inv = 1 / Math.max(gamma, 0.01);
  const LUT = new Uint8Array(256);
  for (let i = 0; i < 256; i++) {
    LUT[i] = Math.round(Math.pow(i / 255, inv) * 255);
  }
  const ctx = c.getContext("2d")!;
  const d = ctx.getImageData(0, 0, c.width, c.height);
  const p = d.data;
  for (let i = 0; i < p.length; i += 4) {
    p[i] = LUT[p[i]];
    p[i + 1] = LUT[p[i + 1]];
    p[i + 2] = LUT[p[i + 2]];
  }
  ctx.putImageData(d, 0, 0);
}

/** Keep only one channel (r|g|b) */
export function isolateChannel(c: HTMLCanvasElement, ch: "r" | "g" | "b") {
  const keep = ch === "r" ? 0 : ch === "g" ? 1 : 2;
  const ctx = c.getContext("2d")!;
  const d = ctx.getImageData(0, 0, c.width, c.height);
  const p = d.data;
  for (let i = 0; i < p.length; i += 4) {
    if (keep !== 0) p[i] = 0;
    if (keep !== 1) p[i + 1] = 0;
    if (keep !== 2) p[i + 2] = 0;
  }
  ctx.putImageData(d, 0, 0);
}

/* =================================================================
 * Sampling & quantization
 * ================================================================= */

/** Nearest-neighbor downsample then upsample (pixelation effect) */
export function pixelate(c: HTMLCanvasElement, factor: number) {
  if (factor <= 1) return;
  const w = c.width;
  const h = c.height;
  const smallW = Math.max(1, Math.floor(w / factor));
  const smallH = Math.max(1, Math.floor(h / factor));

  // draw down to temp
  const tmp = document.createElement("canvas");
  tmp.width = smallW;
  tmp.height = smallH;
  const tctx = tmp.getContext("2d")!;
  tctx.imageSmoothingEnabled = false;
  tctx.drawImage(c, 0, 0, w, h, 0, 0, smallW, smallH);

  // draw back up
  const ctx = c.getContext("2d")!;
  ctx.clearRect(0, 0, w, h);
  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(tmp, 0, 0, smallW, smallH, 0, 0, w, h);
}

/** Reduce the number of intensity levels (per channel) */
export function quantize(c: HTMLCanvasElement, levels: number) {
  const L = Math.max(2, Math.min(256, Math.floor(levels)));
  const step = 256 / L;
  const ctx = c.getContext("2d")!;
  const d = ctx.getImageData(0, 0, c.width, c.height);
  const p = d.data;
  for (let i = 0; i < p.length; i += 4) {
    p[i] = Math.min(255, Math.floor(p[i] / step) * step + step / 2);
    p[i + 1] = Math.min(255, Math.floor(p[i + 1] / step) * step + step / 2);
    p[i + 2] = Math.min(255, Math.floor(p[i + 2] / step) * step + step / 2);
  }
  ctx.putImageData(d, 0, 0);
}

/* =================================================================
 * Geometry
 * ================================================================= */

export function rotate90(c: HTMLCanvasElement) {
  const src = cloneCanvas(c);
  resizeCanvasTo(c, src.height, src.width);
  const ctx = c.getContext("2d")!;
  ctx.save();
  ctx.translate(c.width, 0);
  ctx.rotate(Math.PI / 2);
  ctx.drawImage(src, 0, 0);
  ctx.restore();
}

export function flipHorizontal(c: HTMLCanvasElement) {
  const src = cloneCanvas(c);
  const ctx = c.getContext("2d")!;
  ctx.clearRect(0, 0, c.width, c.height);
  ctx.save();
  ctx.translate(c.width, 0);
  ctx.scale(-1, 1);
  ctx.drawImage(src, 0, 0);
  ctx.restore();
}

export function flipVertical(c: HTMLCanvasElement) {
  const src = cloneCanvas(c);
  const ctx = c.getContext("2d")!;
  ctx.clearRect(0, 0, c.width, c.height);
  ctx.save();
  ctx.translate(0, c.height);
  ctx.scale(1, -1);
  ctx.drawImage(src, 0, 0);
  ctx.restore();
}

export function transposeCanvas(c: HTMLCanvasElement) {
  const src = cloneCanvas(c);
  resizeCanvasTo(c, src.height, src.width);
  const ctx = c.getContext("2d")!;
  ctx.save();
  ctx.translate(0, 0);
  ctx.rotate(-Math.PI / 2);
  ctx.translate(-src.height, 0);
  ctx.scale(-1, 1);
  ctx.drawImage(src, 0, 0);
  ctx.restore();
}

export function resizeTo(
  c: HTMLCanvasElement,
  newW: number,
  newH: number,
  smooth = true
) {
  const src = cloneCanvas(c);
  resizeCanvasTo(c, newW, newH);
  const ctx = c.getContext("2d")!;
  ctx.imageSmoothingEnabled = smooth;
  ctx.drawImage(src, 0, 0, newW, newH);
}

/* =================================================================
 * Arithmetic / bitwise
 * ================================================================= */

/** Weighted blend of two canvases drawn onto target */
export function blendTo(
  a: HTMLCanvasElement,
  b: HTMLCanvasElement,
  alpha: number,
  target: HTMLCanvasElement
) {
  resizeCanvasTo(target, a.width, a.height);
  const ctx = target.getContext("2d")!;
  ctx.clearRect(0, 0, target.width, target.height);
  ctx.globalAlpha = 1;
  ctx.drawImage(a, 0, 0);
  ctx.globalAlpha = alpha;
  ctx.drawImage(b, 0, 0, target.width, target.height);
  ctx.globalAlpha = 1;
}

/** Apply a circular mask (255 inside circle, 0 outside) */
export function applyCircularMask(
  c: HTMLCanvasElement,
  radiusFraction = 0.4
) {
  const cx = c.width / 2;
  const cy = c.height / 2;
  const r = Math.min(c.width, c.height) * radiusFraction;
  const ctx = c.getContext("2d")!;
  const d = ctx.getImageData(0, 0, c.width, c.height);
  const p = d.data;
  for (let y = 0; y < c.height; y++) {
    for (let x = 0; x < c.width; x++) {
      const dx = x - cx;
      const dy = y - cy;
      if (dx * dx + dy * dy > r * r) {
        const i = (y * c.width + x) * 4;
        p[i] = p[i + 1] = p[i + 2] = 0;
      }
    }
  }
  ctx.putImageData(d, 0, 0);
}

/* =================================================================
 * Histogram & equalization (used in Batch 2, defined here for reuse)
 * ================================================================= */

export function computeHistogram(c: HTMLCanvasElement): Uint32Array {
  const ctx = c.getContext("2d")!;
  const d = ctx.getImageData(0, 0, c.width, c.height);
  const hist = new Uint32Array(256);
  const p = d.data;
  for (let i = 0; i < p.length; i += 4) {
    const y = Math.round(0.299 * p[i] + 0.587 * p[i + 1] + 0.114 * p[i + 2]);
    hist[y]++;
  }
  return hist;
}

export function equalizeHistogram(c: HTMLCanvasElement) {
  const ctx = c.getContext("2d")!;
  const d = ctx.getImageData(0, 0, c.width, c.height);
  const p = d.data;

  const hist = new Uint32Array(256);
  for (let i = 0; i < p.length; i += 4) {
    const y = Math.round(0.299 * p[i] + 0.587 * p[i + 1] + 0.114 * p[i + 2]);
    hist[y]++;
  }

  const cdf = new Uint32Array(256);
  let acc = 0;
  for (let i = 0; i < 256; i++) {
    acc += hist[i];
    cdf[i] = acc;
  }

  const total = cdf[255];
  const LUT = new Uint8Array(256);
  for (let i = 0; i < 256; i++) {
    LUT[i] = Math.round((cdf[i] / total) * 255);
  }

  for (let i = 0; i < p.length; i += 4) {
    const y = Math.round(0.299 * p[i] + 0.587 * p[i + 1] + 0.114 * p[i + 2]);
    const v = LUT[y];
    p[i] = p[i + 1] = p[i + 2] = v;
  }
  ctx.putImageData(d, 0, 0);
}

/* =================================================================
 * Utility
 * ================================================================= */

export function clamp(v: number, lo = 0, hi = 255) {
  return v < lo ? lo : v > hi ? hi : v;
}