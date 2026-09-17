import type { Operation } from "../types";

/* ---------- helpers ---------- */
const loadToCanvas = (
  canvas: HTMLCanvasElement,
  src: HTMLCanvasElement | HTMLImageElement
) => {
  const ctx = canvas.getContext("2d")!;
  canvas.width = src.width;
  canvas.height = src.height;
  ctx.drawImage(src, 0, 0);
};

const cvReady = (): Promise<void> =>
  new Promise((resolve) => {
    // @ts-expect-error opencv global
    if (window.cv && window.cv.Mat) return resolve();
    // @ts-expect-error opencv global
    window.cv = window.cv || {};
    // @ts-expect-error opencv global
    window.cv.onRuntimeInitialized = () => resolve();
  });

const canvasToMat = (canvas: HTMLCanvasElement) => {
  // @ts-expect-error opencv global
  return window.cv.imread(canvas);
};

const matToCanvas = (mat: any, canvas: HTMLCanvasElement) => {
  // @ts-expect-error opencv global
  window.cv.imshow(canvas, mat);
  mat.delete();
};

/* ---------- operations ---------- */
export const operations: Record<string, Operation> = {
  /* --- e1: Grayscale conversion --- */
  "op-grayscale": {
    id: "op-grayscale",
    name: "Grayscale Conversion",
    description: "Convert a color image to grayscale using the luminance formula.",
    parameters: [
      {
        id: "method",
        label: "Method",
        type: "select",
        default: "luminance",
        options: [
          { label: "Luminance (0.299R + 0.587G + 0.114B)", value: "luminance" },
          { label: "Average", value: "average" },
          { label: "Max channel", value: "max" },
        ],
      },
    ],
    pythonCode: `import cv2
img = cv2.imread("input.jpg")
gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)   # luminance
# gray = img.mean(axis=2).astype("uint8")      # average
# gray = img.max(axis=2)                       # max channel
cv2.imwrite("gray.jpg", gray)`,
    apply: async (canvas, params) => {
      const ctx = canvas.getContext("2d")!;
      const { width, height } = canvas;
      const imgData = ctx.getImageData(0, 0, width, height);
      const d = imgData.data;
      for (let i = 0; i < d.length; i += 4) {
        const r = d[i], g = d[i + 1], b = d[i + 2];
        let v = 0;
        if (params.method === "average") v = (r + g + b) / 3;
        else if (params.method === "max") v = Math.max(r, g, b);
        else v = 0.299 * r + 0.587 * g + 0.114 * b;
        d[i] = d[i + 1] = d[i + 2] = v;
      }
      ctx.putImageData(imgData, 0, 0);
    },
  },

  /* --- e2: Brightness / Contrast --- */
  "op-brightness-contrast": {
    id: "op-brightness-contrast",
    name: "Brightness & Contrast",
    description: "Linear point operation: g(x) = α·f(x) + β.",
    parameters: [
      { id: "alpha", label: "Contrast (α)", type: "range", min: 0, max: 3, step: 0.1, default: 1 },
      { id: "beta", label: "Brightness (β)", type: "range", min: -100, max: 100, step: 1, default: 0 },
    ],
    pythonCode: `import cv2, numpy as np
img = cv2.imread("input.jpg").astype(np.float32)
alpha, beta = 1.5, 30
out = np.clip(alpha * img + beta, 0, 255).astype(np.uint8)
cv2.imwrite("out.jpg", out)`,
    apply: async (canvas, params) => {
      const alpha = Number(params.alpha);
      const beta = Number(params.beta);
      const ctx = canvas.getContext("2d")!;
      const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const d = imgData.data;
      for (let i = 0; i < d.length; i += 4) {
        d[i] = Math.max(0, Math.min(255, alpha * d[i] + beta));
        d[i + 1] = Math.max(0, Math.min(255, alpha * d[i + 1] + beta));
        d[i + 2] = Math.max(0, Math.min(255, alpha * d[i + 2] + beta));
      }
      ctx.putImageData(imgData, 0, 0);
    },
  },

  /* --- e3: Histogram Equalization --- */
  "op-hist-eq": {
    id: "op-hist-eq",
    name: "Histogram Equalization",
    description: "Improve global contrast by flattening the histogram.",
    parameters: [],
    pythonCode: `import cv2
img = cv2.imread("input.jpg", cv2.IMREAD_GRAYSCALE)
eq = cv2.equalizeHist(img)
cv2.imwrite("equalized.jpg", eq)`,
    apply: async (canvas) => {
      await cvReady();
      const mat = canvasToMat(canvas);
      // @ts-expect-error cv global
      const cv = window.cv;
      const gray = new cv.Mat();
      const eq = new cv.Mat();
      cv.cvtColor(mat, gray, cv.COLOR_RGBA2GRAY);
      cv.equalizeHist(gray, eq);
      const rgba = new cv.Mat();
      cv.cvtColor(eq, rgba, cv.COLOR_GRAY2RGBA);
      matToCanvas(rgba, canvas);
      mat.delete(); gray.delete(); eq.delete();
    },
  },

  /* --- e4: Mean / Gaussian Blur --- */
  "op-blur": {
    id: "op-blur",
    name: "Smoothing (Mean / Gaussian)",
    description: "Low-pass filter to reduce noise and detail.",
    parameters: [
      {
        id: "type",
        label: "Filter",
        type: "select",
        default: "gaussian",
        options: [
          { label: "Gaussian", value: "gaussian" },
          { label: "Mean", value: "mean" },
        ],
      },
      { id: "ksize", label: "Kernel size", type: "range", min: 1, max: 31, step: 2, default: 5 },
      { id: "sigma", label: "Sigma (Gaussian)", type: "range", min: 0, max: 10, step: 0.5, default: 1.5 },
    ],
    pythonCode: `import cv2
img = cv2.imread("input.jpg")
# Gaussian
out = cv2.GaussianBlur(img, (5, 5), sigmaX=1.5)
# Mean
# out = cv2.blur(img, (5, 5))
cv2.imwrite("blurred.jpg", out)`,
    apply: async (canvas, params) => {
      await cvReady();
      const cv = (window as any).cv;
      const mat = canvasToMat(canvas);
      const out = new cv.Mat();
      const k = Number(params.ksize) | 1;
      if (params.type === "mean") cv.blur(mat, out, new cv.Size(k, k));
      else cv.GaussianBlur(mat, out, new cv.Size(k, k), Number(params.sigma));
      matToCanvas(out, canvas);
      mat.delete();
    },
  },

  /* --- e5: Sharpening --- */
  "op-sharpen": {
    id: "op-sharpen",
    name: "Sharpening (Unsharp Mask)",
    description: "Enhance edges by subtracting a blurred version.",
    parameters: [
      { id: "amount", label: "Amount", type: "range", min: 0, max: 3, step: 0.1, default: 1 },
      { id: "radius", label: "Radius", type: "range", min: 1, max: 10, step: 1, default: 3 },
    ],
    pythonCode: `import cv2
img = cv2.imread("input.jpg")
blur = cv2.GaussianBlur(img, (0, 0), sigmaX=3)
sharp = cv2.addWeighted(img, 1.5, blur, -0.5, 0)
cv2.imwrite("sharp.jpg", sharp)`,
    apply: async (canvas, params) => {
      await cvReady();
      const cv = (window as any).cv;
      const mat = canvasToMat(canvas);
      const blur = new cv.Mat();
      const out = new cv.Mat();
      cv.GaussianBlur(mat, blur, new cv.Size(0, 0), Number(params.radius));
      const a = Number(params.amount);
      cv.addWeighted(mat, 1 + a, blur, -a, 0, out);
      matToCanvas(out, canvas);
      mat.delete(); blur.delete();
    },
  },

  /* --- e6: FFT Magnitude --- */
  "op-fft": {
    id: "op-fft",
    name: "FFT Magnitude Spectrum",
    description: "Visualize the frequency content of the image.",
    parameters: [],
    pythonCode: `import cv2, numpy as np
img = cv2.imread("input.jpg", 0)
f = np.fft.fft2(img)
fshift = np.fft.fftshift(f)
mag = 20 * np.log(np.abs(fshift) + 1)
mag = cv2.normalize(mag, None, 0, 255, cv2.NORM_MINMAX).astype("uint8")
cv2.imwrite("spectrum.jpg", mag)`,
    apply: async (canvas) => {
      await cvReady();
      const cv = (window as any).cv;
      const src = canvasToMat(canvas);
      const gray = new cv.Mat();
      cv.cvtColor(src, gray, cv.COLOR_RGBA2GRAY);
      // pad to optimal DFT size
      let m = cv.getOptimalDFTSize(gray.rows);
      let n = cv.getOptimalDFTSize(gray.cols);
      const padded = new cv.Mat();
      cv.copyMakeBorder(gray, padded, 0, m - gray.rows, 0, n - gray.cols, cv.BORDER_CONSTANT, new cv.Scalar(0));
      const planes = new cv.MatVector();
      planes.push_back(padded);
      planes.push_back(cv.Mat.zeros(padded.rows, padded.cols, cv.CV_32F));
      const complex = new cv.Mat();
      cv.merge(planes, complex);
      cv.dft(complex, complex);
      const p = new cv.MatVector();
      cv.split(complex, p);
      const mag = new cv.Mat();
      cv.magnitude(p.get(0), p.get(1), mag);
      mag.convertTo(mag, cv.CV_8U, 1, 0);
      // log scale
      cv.add(mag, new cv.Scalar(1), mag);
      cv.log(mag, mag);
      const rgba = new cv.Mat();
      cv.cvtColor(mag, rgba, cv.COLOR_GRAY2RGBA);
      matToCanvas(rgba, canvas);
      [src, gray, padded, complex, mag].forEach((x) => x.delete());
      planes.delete(); p.delete();
    },
  },

  /* --- e7: Ideal Low-pass Filter (Frequency) --- */
  "op-lpf": {
    id: "op-lpf",
    name: "Ideal Low-pass Filter",
    description: "Suppress high frequencies beyond a radius.",
    parameters: [
      { id: "radius", label: "Cutoff radius", type: "range", min: 5, max: 200, step: 5, default: 40 },
    ],
    pythonCode: `import cv2, numpy as np
img = cv2.imread("input.jpg", 0)
f = np.fft.fftshift(np.fft.fft2(img))
h, w = img.shape
cy, cx = h//2, w//2
Y, X = np.ogrid[:h, :w]
mask = (X-cx)**2 + (Y-cy)**2 <= 40**2
f *= mask
out = np.abs(np.fft.ifft2(np.fft.ifftshift(f)))
cv2.imwrite("lpf.jpg", out.astype("uint8"))`,
    apply: async (canvas, params) => {
      await cvReady();
      const cv = (window as any).cv;
      const src = canvasToMat(canvas);
      const gray = new cv.Mat();
      cv.cvtColor(src, gray, cv.COLOR_RGBA2GRAY);
      const f = new cv.Mat();
      gray.convertTo(f, cv.CV_32F);
      const planes = new cv.MatVector();
      planes.push_back(f);
      planes.push_back(cv.Mat.zeros(f.rows, f.cols, cv.CV_32F));
      const complex = new cv.Mat();
      cv.merge(planes, complex);
      cv.dft(complex, complex);
      // build circular mask
      const mask = cv.Mat.zeros(f.rows, f.cols, cv.CV_32F);
      const cy = Math.floor(f.rows / 2), cx = Math.floor(f.cols / 2);
      const r = Number(params.radius);
      for (let y = 0; y < f.rows; y++)
        for (let x = 0; x < f.cols; x++) {
          const dy = Math.min(y, Math.abs(y - f.rows));
          const dx = Math.min(x, Math.abs(x - f.cols));
          if (dx * dx + dy * dy <= r * r) mask.floatPtr(y, x)[0] = 1;
        }
      // apply mask to both planes
      const cp = new cv.MatVector();
      cv.split(complex, cp);
      const re = cp.get(0), im = cp.get(1);
      cv.multiply(re, mask, re);
      cv.multiply(im, mask, im);
      cp.set(0, re); cp.set(1, im);
      cv.merge(cp, complex);
      cv.idft(complex, complex);
      const split2 = new cv.MatVector();
      cv.split(complex, split2);
      const mag = new cv.Mat();
      cv.magnitude(split2.get(0), split2.get(1), mag);
      cv.normalize(mag, mag, 0, 255, cv.NORM_MINMAX);
      mag.convertTo(mag, cv.CV_8U);
      const rgba = new cv.Mat();
      cv.cvtColor(mag, rgba, cv.COLOR_GRAY2RGBA);
      matToCanvas(rgba, canvas);
      [src, gray, f, complex, mask, mag].forEach((x) => x.delete());
    },
  },

  /* --- e8: Gaussian Noise Addition --- */
  "op-add-noise": {
    id: "op-add-noise",
    name: "Add Gaussian Noise",
    description: "Simulate additive white Gaussian noise.",
    parameters: [
      { id: "mean", label: "Mean", type: "range", min: -50, max: 50, step: 1, default: 0 },
      { id: "sigma", label: "Sigma", type: "range", min: 0, max: 80, step: 1, default: 25 },
    ],
    pythonCode: `import cv2, numpy as np
img = cv2.imread("input.jpg").astype(np.float32)
noise = np.random.normal(0, 25, img.shape)
out = np.clip(img + noise, 0, 255).astype(np.uint8)
cv2.imwrite("noisy.jpg", out)`,
    apply: async (canvas, params) => {
      const ctx = canvas.getContext("2d")!;
      const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const d = imgData.data;
      const mu = Number(params.mean), sigma = Number(params.sigma);
      const gauss = () => {
        let u = 0, v = 0;
        while (u === 0) u = Math.random();
        while (v === 0) v = Math.random();
        return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
      };
      for (let i = 0; i < d.length; i += 4) {
        d[i] = Math.max(0, Math.min(255, d[i] + mu + sigma * gauss()));
        d[i + 1] = Math.max(0, Math.min(255, d[i + 1] + mu + sigma * gauss()));
        d[i + 2] = Math.max(0, Math.min(255, d[i + 2] + mu + sigma * gauss()));
      }
      ctx.putImageData(imgData, 0, 0);
    },
  },

  /* --- e9: Median Denoise --- */
  "op-median": {
    id: "op-median",
    name: "Median Filter",
    description: "Non-linear filter effective against salt-and-pepper noise.",
    parameters: [
      { id: "ksize", label: "Kernel size", type: "range", min: 3, max: 15, step: 2, default: 5 },
    ],
    pythonCode: `import cv2
img = cv2.imread("input.jpg")
out = cv2.medianBlur(img, 5)
cv2.imwrite("denoised.jpg", out)`,
    apply: async (canvas, params) => {
      await cvReady();
      const cv = (window as any).cv;
      const mat = canvasToMat(canvas);
      const out = new cv.Mat();
      cv.medianBlur(mat, out, Number(params.ksize));
      matToCanvas(out, canvas);
      mat.delete();
    },
  },

  /* --- e10: Erosion --- */
  "op-erode": {
    id: "op-erode",
    name: "Erosion",
    description: "Shrink bright regions using a structuring element.",
    parameters: [
      { id: "ksize", label: "Kernel size", type: "range", min: 1, max: 15, step: 2, default: 3 },
      {
        id: "shape",
        label: "Element shape",
        type: "select",
        default: "rect",
        options: [
          { label: "Rectangle", value: "rect" },
          { label: "Ellipse", value: "ellipse" },
          { label: "Cross", value: "cross" },
        ],
      },
    ],
    pythonCode: `import cv2, numpy as np
img = cv2.imread("input.jpg", 0)
k = cv2.getStructuringElement(cv2.MORPH_RECT, (3,3))
eroded = cv2.erode(img, k, iterations=1)
cv2.imwrite("eroded.jpg", eroded)`,
    apply: async (canvas, params) => {
      await cvReady();
      const cv = (window as any).cv;
      const mat = canvasToMat(canvas);
      const k = Number(params.ksize);
      const shape =
        params.shape === "ellipse"
          ? cv.MORPH_ELLIPSE
          : params.shape === "cross"
          ? cv.MORPH_CROSS
          : cv.MORPH_RECT;
      const kernel = cv.getStructuringElement(shape, new cv.Size(k, k));
      const out = new cv.Mat();
      cv.erode(mat, out, kernel);
      matToCanvas(out, canvas);
      mat.delete(); kernel.delete();
    },
  },

  /* --- e11: Dilation --- */
  "op-dilate": {
    id: "op-dilate",
    name: "Dilation",
    description: "Expand bright regions using a structuring element.",
    parameters: [
      { id: "ksize", label: "Kernel size", type: "range", min: 1, max: 15, step: 2, default: 3 },
      {
        id: "shape",
        label: "Element shape",
        type: "select",
        default: "rect",
        options: [
          { label: "Rectangle", value: "rect" },
          { label: "Ellipse", value: "ellipse" },
          { label: "Cross", value: "cross" },
        ],
      },
    ],
    pythonCode: `import cv2
img = cv2.imread("input.jpg", 0)
k = cv2.getStructuringElement(cv2.MORPH_RECT, (3,3))
dil = cv2.dilate(img, k, iterations=1)
cv2.imwrite("dilated.jpg", dil)`,
    apply: async (canvas, params) => {
      await cvReady();
      const cv = (window as any).cv;
      const mat = canvasToMat(canvas);
      const k = Number(params.ksize);
      const shape =
        params.shape === "ellipse"
          ? cv.MORPH_ELLIPSE
          : params.shape === "cross"
          ? cv.MORPH_CROSS
          : cv.MORPH_RECT;
      const kernel = cv.getStructuringElement(shape, new cv.Size(k, k));
      const out = new cv.Mat();
      cv.dilate(mat, out, kernel);
      matToCanvas(out, canvas);
      mat.delete(); kernel.delete();
    },
  },

  /* --- e12: Sobel Edges --- */
  "op-sobel": {
    id: "op-sobel",
    name: "Sobel Edge Detection",
    description: "Gradient-based edge detector.",
    parameters: [
      { id: "ksize", label: "Kernel size", type: "range", min: 1, max: 7, step: 2, default: 3 },
      { id: "threshold", label: "Threshold", type: "range", min: 0, max: 255, step: 5, default: 80 },
    ],
    pythonCode: `import cv2, numpy as np
img = cv2.imread("input.jpg", 0)
gx = cv2.Sobel(img, cv2.CV_32F, 1, 0, ksize=3)
gy = cv2.Sobel(img, cv2.CV_32F, 0, 1, ksize=3)
mag = cv2.magnitude(gx, gy)
mag = np.clip(mag, 0, 255).astype("uint8")
_, edges = cv2.threshold(mag, 80, 255, cv2.THRESH_BINARY)
cv2.imwrite("edges.jpg", edges)`,
    apply: async (canvas, params) => {
      await cvReady();
      const cv = (window as any).cv;
      const src = canvasToMat(canvas);
      const gray = new cv.Mat();
      cv.cvtColor(src, gray, cv.COLOR_RGBA2GRAY);
      const gx = new cv.Mat(), gy = new cv.Mat(), mag = new cv.Mat();
      const k = Number(params.ksize);
      cv.Sobel(gray, gx, cv.CV_32F, 1, 0, k);
      cv.Sobel(gray, gy, cv.CV_32F, 0, 1, k);
      cv.magnitude(gx, gy, mag);
      const mask = new cv.Mat();
      cv.threshold(mag, mask, Number(params.threshold), 255, cv.THRESH_BINARY);
      mask.convertTo(mask, cv.CV_8U);
      const rgba = new cv.Mat();
      cv.cvtColor(mask, rgba, cv.COLOR_GRAY2RGBA);
      matToCanvas(rgba, canvas);
      [src, gray, gx, gy, mag, mask].forEach((m) => m.delete());
    },
  },

  /* --- e13: Otsu Thresholding --- */
  "op-otsu": {
    id: "op-otsu",
    name: "Otsu Thresholding",
    description: "Automatic global threshold based on histogram bimodality.",
    parameters: [],
    pythonCode: `import cv2
img = cv2.imread("input.jpg", 0)
t, bw = cv2.threshold(img, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)
print("Otsu threshold =", t)
cv2.imwrite("binary.jpg", bw)`,
    apply: async (canvas) => {
      await cvReady();
      const cv = (window as any).cv;
      const src = canvasToMat(canvas);
      const gray = new cv.Mat();
      cv.cvtColor(src, gray, cv.COLOR_RGBA2GRAY);
      const bw = new cv.Mat();
      cv.threshold(gray, bw, 0, 255, cv.THRESH_BINARY + cv.THRESH_OTSU);
      const rgba = new cv.Mat();
      cv.cvtColor(bw, rgba, cv.COLOR_GRAY2RGBA);
      matToCanvas(rgba, canvas);
      [src, gray, bw].forEach((m) => m.delete());
    },
  },

  /* --- e2: image negative (second op example) --- */
  "op-negative": {
    id: "op-negative",
    name: "Image Negative",
    description: "Invert intensities: s = L − 1 − r.",
    parameters: [],
    pythonCode: `import cv2
img = cv2.imread("input.jpg")
neg = 255 - img
cv2.imwrite("negative.jpg", neg)`,
    apply: async (canvas) => {
      const ctx = canvas.getContext("2d")!;
      const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const d = imgData.data;
      for (let i = 0; i < d.length; i += 4) {
        d[i] = 255 - d[i];
        d[i + 1] = 255 - d[i + 1];
        d[i + 2] = 255 - d[i + 2];
      }
      ctx.putImageData(imgData, 0, 0);
    },
  },
};

export const getOperation = (id: string) => operations[id];