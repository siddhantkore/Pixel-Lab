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


/* =================================================================
 * Convolution & spatial filtering
 * ================================================================= */

/**
 * Apply an arbitrary (2n+1)×(2n+1) convolution kernel to a canvas.
 * Border pixels are handled by clamping (edge extension).
 */
export function convolve(c: HTMLCanvasElement, kernel: number[][]) {
  const k = kernel.length;
  const half = Math.floor(k / 2);
  const ctx = c.getContext("2d")!;
  const img = ctx.getImageData(0, 0, c.width, c.height);
  const src = new Uint8ClampedArray(img.data);
  const out = img.data;

  for (let y = 0; y < c.height; y++) {
    for (let x = 0; x < c.width; x++) {
      let r = 0, g = 0, b = 0;
      for (let ky = 0; ky < k; ky++) {
        for (let kx = 0; kx < k; kx++) {
          const yy = Math.min(c.height - 1, Math.max(0, y + ky - half));
          const xx = Math.min(c.width - 1, Math.max(0, x + kx - half));
          const idx = (yy * c.width + xx) * 4;
          const w = kernel[ky][kx];
          r += src[idx] * w;
          g += src[idx + 1] * w;
          b += src[idx + 2] * w;
        }
      }
      const i = (y * c.width + x) * 4;
      out[i] = clamp(r);
      out[i + 1] = clamp(g);
      out[i + 2] = clamp(b);
    }
  }
  ctx.putImageData(img, 0, 0);
}

/** Uniform box blur (mean filter) */
export function boxBlur(c: HTMLCanvasElement, k: number) {
  const size = Math.max(3, k | 1);
  const w = 1 / (size * size);
  const kernel = Array.from({ length: size }, () =>
    Array.from({ length: size }, () => w)
  );
  convolve(c, kernel);
}

/** Gaussian blur via two-pass separable kernel */
export function gaussianBlur(
  c: HTMLCanvasElement,
  k: number,
  sigma: number
) {
  const size = Math.max(3, k | 1);
  const half = Math.floor(size / 2);
  const kernel1d = new Array(size).fill(0);
  let sum = 0;
  for (let i = -half; i <= half; i++) {
    const v = Math.exp(-(i * i) / (2 * sigma * sigma));
    kernel1d[i + half] = v;
    sum += v;
  }
  for (let i = 0; i < size; i++) kernel1d[i] /= sum;

  // Horizontal then vertical pass
  const ctx = c.getContext("2d")!;
  const img = ctx.getImageData(0, 0, c.width, c.height);
  const src = new Uint8ClampedArray(img.data);
  const tmp = new Uint8ClampedArray(src.length);

  for (let y = 0; y < c.height; y++) {
    for (let x = 0; x < c.width; x++) {
      let r = 0, g = 0, b = 0;
      for (let kx = -half; kx <= half; kx++) {
        const xx = Math.min(c.width - 1, Math.max(0, x + kx));
        const idx = (y * c.width + xx) * 4;
        const w = kernel1d[kx + half];
        r += src[idx] * w;
        g += src[idx + 1] * w;
        b += src[idx + 2] * w;
      }
      const i = (y * c.width + x) * 4;
      tmp[i] = r; tmp[i + 1] = g; tmp[i + 2] = b; tmp[i + 3] = src[i + 3];
    }
  }
  for (let y = 0; y < c.height; y++) {
    for (let x = 0; x < c.width; x++) {
      let r = 0, g = 0, b = 0;
      for (let ky = -half; ky <= half; ky++) {
        const yy = Math.min(c.height - 1, Math.max(0, y + ky));
        const idx = (yy * c.width + x) * 4;
        const w = kernel1d[ky + half];
        r += tmp[idx] * w;
        g += tmp[idx + 1] * w;
        b += tmp[idx + 2] * w;
      }
      const i = (y * c.width + x) * 4;
      img.data[i] = clamp(r);
      img.data[i + 1] = clamp(g);
      img.data[i + 2] = clamp(b);
    }
  }
  ctx.putImageData(img, 0, 0);
}

/** Median filter — non-linear, great against salt-and-pepper */
export function medianFilter(c: HTMLCanvasElement, k: number) {
  const size = Math.max(3, k | 1);
  const half = Math.floor(size / 2);
  const ctx = c.getContext("2d")!;
  const img = ctx.getImageData(0, 0, c.width, c.height);
  const src = new Uint8ClampedArray(img.data);
  const out = img.data;

  for (let y = 0; y < c.height; y++) {
    for (let x = 0; x < c.width; x++) {
      const rv: number[] = [], gv: number[] = [], bv: number[] = [];
      for (let ky = -half; ky <= half; ky++) {
        for (let kx = -half; kx <= half; kx++) {
          const yy = Math.min(c.height - 1, Math.max(0, y + ky));
          const xx = Math.min(c.width - 1, Math.max(0, x + kx));
          const idx = (yy * c.width + xx) * 4;
          rv.push(src[idx]);
          gv.push(src[idx + 1]);
          bv.push(src[idx + 2]);
        }
      }
      rv.sort((a, b) => a - b);
      gv.sort((a, b) => a - b);
      bv.sort((a, b) => a - b);
      const mid = Math.floor(rv.length / 2);
      const i = (y * c.width + x) * 4;
      out[i] = rv[mid];
      out[i + 1] = gv[mid];
      out[i + 2] = bv[mid];
    }
  }
  ctx.putImageData(img, 0, 0);
}

/** Approximate bilateral filter (spatial + range weighting) */
export function bilateralFilter(
  c: HTMLCanvasElement,
  radius: number,
  sigmaSpace: number,
  sigmaColor: number
) {
  const ctx = c.getContext("2d")!;
  const img = ctx.getImageData(0, 0, c.width, c.height);
  const src = new Uint8ClampedArray(img.data);
  const out = img.data;
  const r = Math.max(1, radius | 0);

  const spatialKernel: number[][] = [];
  for (let y = -r; y <= r; y++) {
    spatialKernel.push([]);
    for (let x = -r; x <= r; x++) {
      spatialKernel[y + r].push(
        Math.exp(-(x * x + y * y) / (2 * sigmaSpace * sigmaSpace))
      );
    }
  }

  for (let y = 0; y < c.height; y++) {
    for (let x = 0; x < c.width; x++) {
      let sumR = 0, sumG = 0, sumB = 0, sumW = 0;
      const centerI = (y * c.width + x) * 4;
      const cR = src[centerI], cG = src[centerI + 1], cB = src[centerI + 2];

      for (let ky = -r; ky <= r; ky++) {
        for (let kx = -r; kx <= r; kx++) {
          const yy = Math.min(c.height - 1, Math.max(0, y + ky));
          const xx = Math.min(c.width - 1, Math.max(0, x + kx));
          const idx = (yy * c.width + xx) * 4;
          const dr = src[idx] - cR;
          const dg = src[idx + 1] - cG;
          const db = src[idx + 2] - cB;
          const colorDist = (dr * dr + dg * dg + db * db) / 3;
          const rangeW = Math.exp(-colorDist / (2 * sigmaColor * sigmaColor));
          const w = spatialKernel[ky + r][kx + r] * rangeW;
          sumR += src[idx] * w;
          sumG += src[idx + 1] * w;
          sumB += src[idx + 2] * w;
          sumW += w;
        }
      }
      const i = (y * c.width + x) * 4;
      out[i] = clamp(sumR / sumW);
      out[i + 1] = clamp(sumG / sumW);
      out[i + 2] = clamp(sumB / sumW);
    }
  }
  ctx.putImageData(img, 0, 0);
}

/* =================================================================
 * CLAHE (simplified, tile-based)
 * ================================================================= */

/** Simplified CLAHE: divide into tiles, equalize each, interpolate */
export function clahe(
  c: HTMLCanvasElement,
  clipLimit: number,
  tiles: number
) {
  // Convert to grayscale first
  toGrayscale(c);
  const ctx = c.getContext("2d")!;
  const img = ctx.getImageData(0, 0, c.width, c.height);
  const p = img.data;
  const W = c.width, H = c.height;
  const tileW = Math.ceil(W / tiles);
  const tileH = Math.ceil(H / tiles);

  // Precompute per-tile LUTs
  const luts: Uint8Array[][] = [];
  for (let ty = 0; ty < tiles; ty++) {
    luts[ty] = [];
    for (let tx = 0; tx < tiles; tx++) {
      const hist = new Uint32Array(256);
      let count = 0;
      const x0 = tx * tileW, y0 = ty * tileH;
      const x1 = Math.min(W, x0 + tileW);
      const y1 = Math.min(H, y0 + tileH);
      for (let y = y0; y < y1; y++) {
        for (let x = x0; x < x1; x++) {
          const i = (y * W + x) * 4;
          hist[p[i]]++;
          count++;
        }
      }
      // Clip
      const limit = Math.max(1, Math.floor((clipLimit * count) / 256));
      let excess = 0;
      for (let i = 0; i < 256; i++) {
        if (hist[i] > limit) {
          excess += hist[i] - limit;
          hist[i] = limit;
        }
      }
      const inc = excess / 256;
      for (let i = 0; i < 256; i++) hist[i] += inc;

      const cdf = new Uint32Array(256);
      let acc = 0;
      for (let i = 0; i < 256; i++) {
        acc += hist[i];
        cdf[i] = acc;
      }
      const total = cdf[255] || 1;
      const lut = new Uint8Array(256);
      for (let i = 0; i < 256; i++) {
        lut[i] = Math.round((cdf[i] / total) * 255);
      }
      luts[ty][tx] = lut;
    }
  }

  // Apply with bilinear interpolation between tiles
  const out = new Uint8ClampedArray(p.length);
  for (let y = 0; y < H; y++) {
    const ty = Math.min(tiles - 1, Math.floor(y / tileH));
    const fy = (y % tileH) / tileH;
    for (let x = 0; x < W; x++) {
      const tx = Math.min(tiles - 1, Math.floor(x / tileW));
      const fx = (x % tileW) / tileW;
      const i = (y * W + x) * 4;
      const v = p[i];
      const lut00 = luts[ty][tx];
      const lut01 = luts[ty][Math.min(tiles - 1, tx + 1)];
      const lut10 = luts[Math.min(tiles - 1, ty + 1)][tx];
      const lut11 = luts[Math.min(tiles - 1, ty + 1)][Math.min(tiles - 1, tx + 1)];

      const v00 = lut00[v], v01 = lut01[v], v10 = lut10[v], v11 = lut11[v];
      const vTop = v00 * (1 - fx) + v01 * fx;
      const vBot = v10 * (1 - fx) + v11 * fx;
      const val = vTop * (1 - fy) + vBot * fy;

      out[i] = out[i + 1] = out[i + 2] = val;
      out[i + 3] = 255;
    }
  }
  for (let i = 0; i < p.length; i++) p[i] = out[i];
  ctx.putImageData(img, 0, 0);
}

/* =================================================================
 * Histogram overlay helper
 * ================================================================= */

/**
 * Draw a histogram plot into a small canvas, given a source image canvas.
 * Used by HistLab to display before/after histograms side by side.
 */
export function drawHistogram(
  src: HTMLCanvasElement,
  target: HTMLCanvasElement,
  color = "#1c62f5"
) {
  const hist = computeHistogram(src);
  const max = Math.max(...hist);
  const w = target.width;
  const h = target.height;
  const ctx = target.getContext("2d")!;
  ctx.fillStyle = "#f8fafc";
  ctx.fillRect(0, 0, w, h);

  ctx.strokeStyle = "#e2e8f0";
  ctx.lineWidth = 1;
  for (let i = 1; i < 4; i++) {
    const y = (h / 4) * i;
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(w, y);
    ctx.stroke();
  }

  ctx.fillStyle = color;
  const bw = w / 256;
  for (let i = 0; i < 256; i++) {
    const barH = (hist[i] / max) * (h - 4);
    ctx.fillRect(i * bw, h - barH, Math.max(1, bw), barH);
  }
}