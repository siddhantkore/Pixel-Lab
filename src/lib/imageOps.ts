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



/* =================================================================
 * Edge detection — Sobel & Laplacian
 * ================================================================= */

/** Sobel gradient magnitude, optional threshold. Returns void, mutates canvas. */
export function sobelEdges(
  c: HTMLCanvasElement,
  threshold = 0,
  ksize = 3
) {
  toGrayscale(c);
  const ctx = c.getContext("2d")!;
  const img = ctx.getImageData(0, 0, c.width, c.height);
  const p = img.data;
  const W = c.width;
  const H = c.height;

  // Sobel kernels
  const kx = [
    [-1, 0, 1],
    [-2, 0, 2],
    [-1, 0, 1],
  ];
  const ky = [
    [-1, -2, -1],
    [0, 0, 0],
    [1, 2, 1],
  ];
  const half = 1;

  const out = new Uint8ClampedArray(p.length);
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      let gx = 0, gy = 0;
      for (let j = 0; j < 3; j++) {
        for (let i = 0; i < 3; i++) {
          const yy = Math.min(H - 1, Math.max(0, y + j - half));
          const xx = Math.min(W - 1, Math.max(0, x + i - half));
          const v = p[(yy * W + xx) * 4];
          gx += v * kx[j][i];
          gy += v * ky[j][i];
        }
      }
      const mag = Math.sqrt(gx * gx + gy * gy);
      const v = mag >= threshold ? 255 : 0;
      const i = (y * W + x) * 4;
      out[i] = out[i + 1] = out[i + 2] = v;
      out[i + 3] = 255;
    }
  }
  for (let i = 0; i < p.length; i++) p[i] = out[i];
  ctx.putImageData(img, 0, 0);
  // ksize is accepted for API parity with OpenCV; this demo uses 3×3.
  void ksize;
}

/** Laplacian magnitude (approximate), zero-crossings become edges */
export function laplacianEdges(c: HTMLCanvasElement) {
  toGrayscale(c);
  const ctx = c.getContext("2d")!;
  const img = ctx.getImageData(0, 0, c.width, c.height);
  const p = img.data;
  const W = c.width;
  const H = c.height;

  const k = [
    [0, -1, 0],
    [-1, 4, -1],
    [0, -1, 0],
  ];
  const half = 1;
  const out = new Uint8ClampedArray(p.length);

  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      let acc = 0;
      for (let j = 0; j < 3; j++) {
        for (let i = 0; i < 3; i++) {
          const yy = Math.min(H - 1, Math.max(0, y + j - half));
          const xx = Math.min(W - 1, Math.max(0, x + i - half));
          const v = p[(yy * W + xx) * 4];
          acc += v * k[j][i];
        }
      }
      const v = Math.abs(acc);
      const i = (y * W + x) * 4;
      out[i] = out[i + 1] = out[i + 2] = v;
      out[i + 3] = 255;
    }
  }
  for (let i = 0; i < p.length; i++) p[i] = out[i];
  ctx.putImageData(img, 0, 0);
}

/** Unsharp mask: sharp = f + amount · (f − blur) */
export function unsharpMask(
  c: HTMLCanvasElement,
  amount = 1,
  radius = 3,
  sigma = 1.5
) {
  const src = cloneCanvas(c);
  const blurred = cloneCanvas(c);
  gaussianBlur(blurred, radius, sigma);

  const ctx = c.getContext("2d")!;
  const srcData = src.getContext("2d")!.getImageData(0, 0, src.width, src.height);
  const blurData = blurred
    .getContext("2d")!
    .getImageData(0, 0, blurred.width, blurred.height);
  const p = srcData.data;
  const b = blurData.data;

  for (let i = 0; i < p.length; i += 4) {
    p[i] = clamp(p[i] + amount * (p[i] - b[i]));
    p[i + 1] = clamp(p[i + 1] + amount * (p[i + 1] - b[i + 1]));
    p[i + 2] = clamp(p[i + 2] + amount * (p[i + 2] - b[i + 2]));
  }
  ctx.putImageData(srcData, 0, 0);
}

/** High-boost filter: hb = A·f − blur  (A ≥ 1) */
export function highBoost(
  c: HTMLCanvasElement,
  A = 1.5,
  radius = 3,
  sigma = 1.5
) {
  const src = cloneCanvas(c);
  const blurred = cloneCanvas(c);
  gaussianBlur(blurred, radius, sigma);

  const ctx = c.getContext("2d")!;
  const srcData = src.getContext("2d")!.getImageData(0, 0, src.width, src.height);
  const blurData = blurred
    .getContext("2d")!
    .getImageData(0, 0, blurred.width, blurred.height);
  const p = srcData.data;
  const b = blurData.data;

  for (let i = 0; i < p.length; i += 4) {
    p[i] = clamp(A * p[i] - b[i]);
    p[i + 1] = clamp(A * p[i + 1] - b[i + 1]);
    p[i + 2] = clamp(A * p[i + 2] - b[i + 2]);
  }
  ctx.putImageData(srcData, 0, 0);
}

/* =================================================================
 * Morphology
 * ================================================================= */

export type MorphKernel = "rect" | "ellipse" | "cross";

/** Build a 0/1 structuring element of size k×k */
function structuringElement(
  k: number,
  shape: MorphKernel
): Uint8Array[] {
  const r = Math.floor(k / 2);
  const out: Uint8Array[] = [];
  for (let y = 0; y < k; y++) {
    out.push(new Uint8Array(k));
    for (let x = 0; x < k; x++) {
      const dx = x - r;
      const dy = y - r;
      let on = true;
      if (shape === "ellipse") on = dx * dx + dy * dy <= r * r + 1;
      else if (shape === "cross") on = dx === 0 || dy === 0;
      else on = true;
      out[y][x] = on ? 1 : 0;
    }
  }
  return out;
}

/** Threshold to binary (0/255) — used before morphology */
export function toBinary(c: HTMLCanvasElement, t = 127) {
  const ctx = c.getContext("2d")!;
  const img = ctx.getImageData(0, 0, c.width, c.height);
  const p = img.data;
  for (let i = 0; i < p.length; i += 4) {
    const y = 0.299 * p[i] + 0.587 * p[i + 1] + 0.114 * p[i + 2];
    const v = y > t ? 255 : 0;
    p[i] = p[i + 1] = p[i + 2] = v;
  }
  ctx.putImageData(img, 0, 0);
}

/** Erosion: for each pixel, keep 255 only if all SE pixels are 255 */
export function erode(
  c: HTMLCanvasElement,
  k: number,
  shape: MorphKernel = "rect"
) {
  const se = structuringElement(k, shape);
  const half = Math.floor(k / 2);
  const ctx = c.getContext("2d")!;
  const img = ctx.getImageData(0, 0, c.width, c.height);
  const src = new Uint8ClampedArray(img.data);
  const out = img.data;
  const W = c.width;
  const H = c.height;

  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      let v = 255;
      for (let j = 0; j < k && v === 255; j++) {
        for (let i = 0; i < k; i++) {
          if (!se[j][i]) continue;
          const yy = Math.min(H - 1, Math.max(0, y + j - half));
          const xx = Math.min(W - 1, Math.max(0, x + i - half));
          if (src[(yy * W + xx) * 4] < 128) {
            v = 0;
            break;
          }
        }
      }
      const idx = (y * W + x) * 4;
      out[idx] = out[idx + 1] = out[idx + 2] = v;
    }
  }
  ctx.putImageData(img, 0, 0);
}

/** Dilation: 255 if any SE pixel is 255 */
export function dilate(
  c: HTMLCanvasElement,
  k: number,
  shape: MorphKernel = "rect"
) {
  const se = structuringElement(k, shape);
  const half = Math.floor(k / 2);
  const ctx = c.getContext("2d")!;
  const img = ctx.getImageData(0, 0, c.width, c.height);
  const src = new Uint8ClampedArray(img.data);
  const out = img.data;
  const W = c.width;
  const H = c.height;

  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      let v = 0;
      for (let j = 0; j < k && v === 0; j++) {
        for (let i = 0; i < k; i++) {
          if (!se[j][i]) continue;
          const yy = Math.min(H - 1, Math.max(0, y + j - half));
          const xx = Math.min(W - 1, Math.max(0, x + i - half));
          if (src[(yy * W + xx) * 4] >= 128) {
            v = 255;
            break;
          }
        }
      }
      const idx = (y * W + x) * 4;
      out[idx] = out[idx + 1] = out[idx + 2] = v;
    }
  }
  ctx.putImageData(img, 0, 0);
}

/** Opening = erode → dilate (removes small bright specks outside objects) */
export function morphOpen(
  c: HTMLCanvasElement,
  k: number,
  shape: MorphKernel = "rect"
) {
  erode(c, k, shape);
  dilate(c, k, shape);
}

/** Closing = dilate → erode (fills small dark holes inside objects) */
export function morphClose(
  c: HTMLCanvasElement,
  k: number,
  shape: MorphKernel = "rect"
) {
  dilate(c, k, shape);
  erode(c, k, shape);
}

/** Morphological gradient = dilate − erode  (extracts object boundaries) */
export function morphGradient(
  c: HTMLCanvasElement,
  k: number,
  shape: MorphKernel = "rect"
) {
  const d = cloneCanvas(c);
  const e = cloneCanvas(c);
  dilate(d, k, shape);
  erode(e, k, shape);

  const ctx = c.getContext("2d")!;
  const dData = d.getContext("2d")!.getImageData(0, 0, c.width, c.height);
  const eData = e.getContext("2d")!.getImageData(0, 0, c.width, c.height);
  const out = ctx.getImageData(0, 0, c.width, c.height);
  const dp = dData.data;
  const ep = eData.data;
  const op = out.data;

  for (let i = 0; i < op.length; i += 4) {
    const v = Math.max(0, dp[i] - ep[i]);
    op[i] = op[i + 1] = op[i + 2] = v;
  }
  ctx.putImageData(out, 0, 0);
}

/* =================================================================
 * Distance transform — for e-pix-rel
 * ================================================================= */

export type DistanceMetric = "euclidean" | "manhattan" | "chessboard";

/**
 * Distance transform on a binary image.
 * Returns a canvas where brighter = farther from nearest foreground (0) pixel.
 * Only foreground pixels (== 0) act as sources; everything else is measured.
 */
export function distanceTransform(
  c: HTMLCanvasElement,
  metric: DistanceMetric
): void {
  const ctx = c.getContext("2d")!;
  const img = ctx.getImageData(0, 0, c.width, c.height);
  const p = img.data;
  const W = c.width;
  const H = c.height;
  const INF = 1e9;

  // Distance buffer initialized: 0 at foreground, INF elsewhere
  const dist = new Float32Array(W * H);
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const i = (y * W + x) * 4;
      const isFg = p[i] < 128;
      dist[y * W + x] = isFg ? 0 : INF;
    }
  }

  // Two-pass chamfer transform
  const cost = metric === "euclidean" ? 1 : 1;
  const diagCost = metric === "euclidean" ? Math.SQRT2 : metric === "chessboard" ? 1 : 2;

  // Forward pass
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const i = y * W + x;
      let d = dist[i];
      if (y > 0)             d = Math.min(d, dist[(y - 1) * W + x] + cost);
      if (x > 0)             d = Math.min(d, dist[y * W + (x - 1)] + cost);
      if (metric === "chessboard" && y > 0 && x > 0)
        d = Math.min(d, dist[(y - 1) * W + (x - 1)] + 1);
      if (metric === "manhattan" && y > 0 && x > 0)
        d = Math.min(d, dist[(y - 1) * W + (x - 1)] + 2);
      if (metric === "euclidean" && y > 0 && x > 0)
        d = Math.min(d, dist[(y - 1) * W + (x - 1)] + diagCost);
      dist[i] = d;
    }
  }
  // Backward pass
  for (let y = H - 1; y >= 0; y--) {
    for (let x = W - 1; x >= 0; x--) {
      const i = y * W + x;
      let d = dist[i];
      if (y < H - 1)         d = Math.min(d, dist[(y + 1) * W + x] + cost);
      if (x < W - 1)         d = Math.min(d, dist[y * W + (x + 1)] + cost);
      if (metric === "chessboard" && y < H - 1 && x < W - 1)
        d = Math.min(d, dist[(y + 1) * W + (x + 1)] + 1);
      if (metric === "manhattan" && y < H - 1 && x < W - 1)
        d = Math.min(d, dist[(y + 1) * W + (x + 1)] + 2);
      if (metric === "euclidean" && y < H - 1 && x < W - 1)
        d = Math.min(d, dist[(y + 1) * W + (x + 1)] + diagCost);
      dist[i] = d;
    }
  }

  // Normalize to 0..255 and write back
  let maxD = 1;
  for (let i = 0; i < dist.length; i++) if (dist[i] < INF && dist[i] > maxD) maxD = dist[i];

  for (let i = 0; i < dist.length; i++) {
    const v = dist[i] >= INF ? 0 : Math.round((dist[i] / maxD) * 255);
    const idx = i * 4;
    p[idx] = p[idx + 1] = p[idx + 2] = v;
    p[idx + 3] = 255;
  }
  ctx.putImageData(img, 0, 0);
}

/* =================================================================
 * Synthetic helpers — for e-pix-rel grid
 * ================================================================= */

/** Draw a black dot at the center of a white canvas + a grid overlay */
export function makeGridCanvas(
  canvas: HTMLCanvasElement,
  size = 320,
  step = 20
) {
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d")!;
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, size, size);

  // grid
  ctx.strokeStyle = "#e2e8f0";
  ctx.lineWidth = 0.5;
  for (let x = 0; x <= size; x += step) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, size);
    ctx.stroke();
  }
  for (let y = 0; y <= size; y += step) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(size, y);
    ctx.stroke();
  }

  // center dot
  const cx = size / 2;
  const cy = size / 2;
  ctx.fillStyle = "#000000";
  ctx.beginPath();
  ctx.arc(cx, cy, 4, 0, Math.PI * 2);
  ctx.fill();
}

/* =================================================================
 * Noise generation
 * ================================================================= */

/** Box-Muller Gaussian sample */
function gaussianSample(): number {
  let u = 0, v = 0;
  while (u === 0) u = Math.random();
  while (v === 0) v = Math.random();
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
}

/** Additive white Gaussian noise */
export function addGaussianNoise(
  c: HTMLCanvasElement,
  mean = 0,
  sigma = 25
) {
  const ctx = c.getContext("2d")!;
  const img = ctx.getImageData(0, 0, c.width, c.height);
  const p = img.data;
  for (let i = 0; i < p.length; i += 4) {
    p[i]     = clamp(p[i]     + mean + sigma * gaussianSample());
    p[i + 1] = clamp(p[i + 1] + mean + sigma * gaussianSample());
    p[i + 2] = clamp(p[i + 2] + mean + sigma * gaussianSample());
  }
  ctx.putImageData(img, 0, 0);
}

/** Salt & pepper noise — density in [0,1] */
export function addSaltPepperNoise(
  c: HTMLCanvasElement,
  density = 0.05
) {
  const ctx = c.getContext("2d")!;
  const img = ctx.getImageData(0, 0, c.width, c.height);
  const p = img.data;
  const half = density / 2;
  for (let i = 0; i < p.length; i += 4) {
    const r = Math.random();
    if (r < half) {
      p[i] = p[i + 1] = p[i + 2] = 0;         // pepper
    } else if (r > 1 - half) {
      p[i] = p[i + 1] = p[i + 2] = 255;       // salt
    }
  }
  ctx.putImageData(img, 0, 0);
}

/* =================================================================
 * Restoration filters
 * ================================================================= */

/** Contraharmonic mean filter — order Q
 *  Q > 0 removes pepper, Q < 0 removes salt.
 */
export function contraharmonicMean(
  c: HTMLCanvasElement,
  k: number,
  Q: number
) {
  const size = Math.max(3, k | 1);
  const half = Math.floor(size / 2);
  const ctx = c.getContext("2d")!;
  const img = ctx.getImageData(0, 0, c.width, c.height);
  const src = new Uint8ClampedArray(img.data);
  const out = img.data;
  const W = c.width;
  const H = c.height;

  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      let numR = 0, denR = 0;
      let numG = 0, denG = 0;
      let numB = 0, denB = 0;

      for (let ky = -half; ky <= half; ky++) {
        for (let kx = -half; kx <= half; kx++) {
          const yy = Math.min(H - 1, Math.max(0, y + ky));
          const xx = Math.min(W - 1, Math.max(0, x + kx));
          const idx = (yy * W + xx) * 4;
          const vr = src[idx];
          const vg = src[idx + 1];
          const vb = src[idx + 2];
          numR += Math.pow(vr, Q + 1); denR += Math.pow(vr, Q);
          numG += Math.pow(vg, Q + 1); denG += Math.pow(vg, Q);
          numB += Math.pow(vb, Q + 1); denB += Math.pow(vb, Q);
        }
      }
      const i = (y * W + x) * 4;
      out[i]     = clamp(denR ? numR / denR : 0);
      out[i + 1] = clamp(denG ? numG / denG : 0);
      out[i + 2] = clamp(denB ? numB / denB : 0);
    }
  }
  ctx.putImageData(img, 0, 0);
}

/** Alpha-trimmed mean filter — drop d/2 lowest & d/2 highest before averaging */
export function alphaTrimmedMean(
  c: HTMLCanvasElement,
  k: number,
  d = 4
) {
  const size = Math.max(3, k | 1);
  const half = Math.floor(size / 2);
  const ctx = c.getContext("2d")!;
  const img = ctx.getImageData(0, 0, c.width, c.height);
  const src = new Uint8ClampedArray(img.data);
  const out = img.data;
  const W = c.width;
  const H = c.height;
  const drop = Math.max(0, Math.floor(d / 2));

  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const rv: number[] = [], gv: number[] = [], bv: number[] = [];
      for (let ky = -half; ky <= half; ky++) {
        for (let kx = -half; kx <= half; kx++) {
          const yy = Math.min(H - 1, Math.max(0, y + ky));
          const xx = Math.min(W - 1, Math.max(0, x + kx));
          const idx = (yy * W + xx) * 4;
          rv.push(src[idx]);
          gv.push(src[idx + 1]);
          bv.push(src[idx + 2]);
        }
      }
      rv.sort((a, b) => a - b);
      gv.sort((a, b) => a - b);
      bv.sort((a, b) => a - b);

      const slice = (arr: number[]) =>
        arr.slice(drop, arr.length - drop);
      const mean = (arr: number[]) =>
        arr.reduce((s, v) => s + v, 0) / Math.max(1, arr.length);

      const i = (y * W + x) * 4;
      out[i]     = clamp(mean(slice(rv)));
      out[i + 1] = clamp(mean(slice(gv)));
      out[i + 2] = clamp(mean(slice(bv)));
    }
  }
  ctx.putImageData(img, 0, 0);
}

/* =================================================================
 * Color space conversions
 * ================================================================= */

export type ColorSpace = "rgb" | "hsv" | "ycrcb" | "lab";

/** RGB → HSV: H in [0,360), S,V in [0,1] */
function rgb2hsv(r: number, g: number, b: number): [number, number, number] {
  const rn = r / 255, gn = g / 255, bn = b / 255;
  const max = Math.max(rn, gn, bn);
  const min = Math.min(rn, gn, bn);
  const d = max - min;
  let h = 0;
  if (d !== 0) {
    if (max === rn) h = ((gn - bn) / d) % 6;
    else if (max === gn) h = (bn - rn) / d + 2;
    else h = (rn - gn) / d + 4;
    h *= 60;
    if (h < 0) h += 360;
  }
  const s = max === 0 ? 0 : d / max;
  return [h, s, max];
}

/** RGB → YCrCb (BT.601) */
function rgb2ycrcb(r: number, g: number, b: number): [number, number, number] {
  const y  =  0.299 * r + 0.587 * g + 0.114 * b;
  const cr = (r - y) * 0.713 + 128;
  const cb = (b - y) * 0.564 + 128;
  return [y, cr, cb];
}

/** RGB → CIELAB (D65) */
function rgb2lab(r: number, g: number, b: number): [number, number, number] {
  const pivotR = r / 255, pivotG = g / 255, pivotB = b / 255;
  const srgb = (u: number) =>
    u > 0.04045 ? Math.pow((u + 0.055) / 1.055, 2.4) : u / 12.92;
  const R = srgb(pivotR), G = srgb(pivotG), B = srgb(pivotB);

  // sRGB → XYZ (D65)
  const X = R * 0.4124564 + G * 0.3575761 + B * 0.1804375;
  const Y = R * 0.2126729 + G * 0.7151522 + B * 0.0721750;
  const Z = R * 0.0193339 + G * 0.1191920 + B * 0.9503041;

  // XYZ → Lab (reference white D65)
  const Xn = 0.95047, Yn = 1.0, Zn = 1.08883;
  const f = (t: number) =>
    t > Math.pow(6 / 29, 3)
      ? Math.cbrt(t)
      : (t / (3 * Math.pow(6 / 29, 2)) + 4 / 29);

  const fx = f(X / Xn), fy = f(Y / Yn), fz = f(Z / Zn);
  const L = 116 * fy - 16;
  const a = 500 * (fx - fy);
  const bb = 200 * (fy - fz);
  return [L, a, bb];
}

/** Convert canvas to a chosen color space and visualize as RGB */
export function visualizeColorSpace(
  c: HTMLCanvasElement,
  space: ColorSpace,
  channel: "all" | "0" | "1" | "2"
) {
  const ctx = c.getContext("2d")!;
  const img = ctx.getImageData(0, 0, c.width, c.height);
  const p = img.data;

  const showCh = channel === "all" ? -1 : parseInt(channel, 10);

  for (let i = 0; i < p.length; i += 4) {
    const r = p[i], g = p[i + 1], b = p[i + 2];
    let ch0 = 0, ch1 = 0, ch2 = 0;

    if (space === "rgb") {
      ch0 = r; ch1 = g; ch2 = b;
    } else if (space === "hsv") {
      const [h, s, v] = rgb2hsv(r, g, b);
      ch0 = (h / 360) * 255;
      ch1 = s * 255;
      ch2 = v * 255;
    } else if (space === "ycrcb") {
      const [y, cr, cb] = rgb2ycrcb(r, g, b);
      ch0 = y; ch1 = cr; ch2 = cb;
    } else {
      const [L, a, bb] = rgb2lab(r, g, b);
      // Normalize Lab to displayable range
      ch0 = clamp((L / 100) * 255);
      ch1 = clamp(((a + 128) / 256) * 255);
      ch2 = clamp(((bb + 128) / 256) * 255);
    }

    if (showCh === -1) {
      p[i] = ch0; p[i + 1] = ch1; p[i + 2] = ch2;
    } else {
      const v = [ch0, ch1, ch2][showCh];
      p[i] = p[i + 1] = p[i + 2] = v;
    }
  }
  ctx.putImageData(img, 0, 0);
}

/* =================================================================
 * Thresholding & segmentation
 * ================================================================= */

export type ThresholdMethod = "global" | "otsu" | "adaptive";

/** Global threshold */
export function globalThreshold(c: HTMLCanvasElement, t: number) {
  toGrayscale(c);
  const ctx = c.getContext("2d")!;
  const img = ctx.getImageData(0, 0, c.width, c.height);
  const p = img.data;
  for (let i = 0; i < p.length; i += 4) {
    const v = p[i] > t ? 255 : 0;
    p[i] = p[i + 1] = p[i + 2] = v;
  }
  ctx.putImageData(img, 0, 0);
}

/**
 * Otsu's automatic threshold.
 * Returns the computed threshold value (for display).
 */
export function otsuThreshold(c: HTMLCanvasElement): number {
  toGrayscale(c);
  const ctx = c.getContext("2d")!;
  const img = ctx.getImageData(0, 0, c.width, c.height);
  const p = img.data;

  const hist = new Uint32Array(256);
  let total = 0;
  for (let i = 0; i < p.length; i += 4) {
    hist[p[i]]++; total++;
  }

  let sumAll = 0;
  for (let i = 0; i < 256; i++) sumAll += i * hist[i];

  let sumB = 0, wB = 0, maxVar = 0, threshold = 0;
  for (let t = 0; t < 256; t++) {
    wB += hist[t];
    if (wB === 0) continue;
    const wF = total - wB;
    if (wF === 0) break;
    sumB += t * hist[t];
    const mB = sumB / wB;
    const mF = (sumAll - sumB) / wF;
    const between = wB * wF * (mB - mF) * (mB - mF);
    if (between > maxVar) {
      maxVar = between;
      threshold = t;
    }
  }

  for (let i = 0; i < p.length; i += 4) {
    const v = p[i] > threshold ? 255 : 0;
    p[i] = p[i + 1] = p[i + 2] = v;
  }
  ctx.putImageData(img, 0, 0);
  return threshold;
}

/** Adaptive threshold (mean of local window − C) */
export function adaptiveThreshold(
  c: HTMLCanvasElement,
  blockSize: number,
  C: number
) {
  toGrayscale(c);
  const size = Math.max(3, blockSize | 1);
  const half = Math.floor(size / 2);
  const ctx = c.getContext("2d")!;
  const img = ctx.getImageData(0, 0, c.width, c.height);
  const src = new Uint8ClampedArray(img.data);
  const out = img.data;
  const W = c.width;
  const H = c.height;

  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      let sum = 0, count = 0;
      for (let ky = -half; ky <= half; ky++) {
        for (let kx = -half; kx <= half; kx++) {
          const yy = Math.min(H - 1, Math.max(0, y + ky));
          const xx = Math.min(W - 1, Math.max(0, x + kx));
          sum += src[(yy * W + xx) * 4];
          count++;
        }
      }
      const mean = sum / count;
      const thr = mean - C;
      const v = src[(y * W + x) * 4] > thr ? 255 : 0;
      const i = (y * W + x) * 4;
      out[i] = out[i + 1] = out[i + 2] = v;
    }
  }
  ctx.putImageData(img, 0, 0);
}

/**
 * Draw bounding boxes around connected components of foreground (255)
 * pixels in a binarized canvas. Uses a simple BFS flood fill.
 * Returns the number of components drawn.
 */
export function drawBoundingBoxes(
  c: HTMLCanvasElement,
  minArea = 100
): number {
  const ctx = c.getContext("2d")!;
  const img = ctx.getImageData(0, 0, c.width, c.height);
  const p = img.data;
  const W = c.width;
  const H = c.height;

  const visited = new Uint8Array(W * H);
  const isFg = (x: number, y: number) => p[(y * W + x) * 4] > 128;

  let boxes = 0;
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const idx = y * W + x;
      if (visited[idx] || !isFg(x, y)) continue;

      // BFS flood fill this component
      const queue: number[] = [idx];
      visited[idx] = 1;
      let minX = x, maxX = x, minY = y, maxY = y, area = 0;

      while (queue.length) {
        const q = queue.pop()!;
        const qy = Math.floor(q / W);
        const qx = q % W;
        area++;
        if (qx < minX) minX = qx;
        if (qx > maxX) maxX = qx;
        if (qy < minY) minY = qy;
        if (qy > maxY) maxY = qy;

        // 4-neighbors
        const neighbors = [
          [qx + 1, qy],
          [qx - 1, qy],
          [qx, qy + 1],
          [qx, qy - 1],
        ];
        for (const [nx, ny] of neighbors) {
          if (nx < 0 || nx >= W || ny < 0 || ny >= H) continue;
          const nIdx = ny * W + nx;
          if (!visited[nIdx] && isFg(nx, ny)) {
            visited[nIdx] = 1;
            queue.push(nIdx);
          }
        }
      }

      if (area >= minArea) {
        // Draw a green rectangle using raw pixel writes (post-putImageData)
        drawRectOutline(p, W, H, minX, minY, maxX, maxY, [16, 185, 129]);
        boxes++;
      }
    }
  }
  ctx.putImageData(img, 0, 0);
  return boxes;
}

function drawRectOutline(
  p: Uint8ClampedArray,
  W: number,
  H: number,
  x0: number,
  y0: number,
  x1: number,
  y1: number,
  rgb: [number, number, number]
) {
  const set = (x: number, y: number) => {
    if (x < 0 || x >= W || y < 0 || y >= H) return;
    const i = (y * W + x) * 4;
    p[i] = rgb[0]; p[i + 1] = rgb[1]; p[i + 2] = rgb[2]; p[i + 3] = 255;
  };
  for (let x = x0; x <= x1; x++) { set(x, y0); set(x, y1); }
  for (let y = y0; y <= y1; y++) { set(x0, y); set(x1, y); }
  // corner dots for clarity
  set(x0, y0); set(x1, y0); set(x0, y1); set(x1, y1);
}