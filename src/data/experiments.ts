import type { Experiment } from "../types";
import { resourcesByExperiment } from "./resources";

const base = (
  e: Omit<Experiment, "resources">
): Experiment => ({ ...e, resources: resourcesByExperiment[e.id] ?? [] });

export const experiments: Experiment[] = [
  base({
    id: "e1",
    moduleId: "m1",
    title: "Color to Grayscale Conversion",
    aim: "Convert a color image to grayscale using different weighting schemes and compare results.",
    theory:
      "A grayscale image has one intensity value per pixel instead of three RGB values. The luminance method mimics human perception by weighting R, G, and B differently (Rec. 601).",
    operationIds: ["op-grayscale"],
    sampleImage: "/samples/lena.png",
    difficulty: "Beginner",
    estimatedTime: "15 min",
  }),
  base({
    id: "e2",
    moduleId: "m1",
    title: "Brightness, Contrast & Image Negative",
    aim: "Study point operations: linear contrast stretch and the photographic negative.",
    theory:
      "Point operations modify each pixel independently of neighbors. g(x,y) = α·f(x,y) + β changes brightness (β) and contrast (α). The negative inverts each intensity.",
    operationIds: ["op-brightness-contrast", "op-negative"],
    sampleImage: "/samples/cameraman.png",
    difficulty: "Beginner",
    estimatedTime: "20 min",
  }),
  base({
    id: "e3",
    moduleId: "m2",
    title: "Histogram Equalization",
    aim: "Improve contrast of a low-contrast image using global histogram equalization.",
    theory:
      "Histogram equalization remaps intensities via the cumulative distribution function, producing a near-uniform histogram and better perceived contrast.",
    operationIds: ["op-hist-eq"],
    sampleImage: "/samples/lowlax.png",
    difficulty: "Intermediate",
    estimatedTime: "25 min",
  }),
  base({
    id: "e4",
    moduleId: "m2",
    title: "Smoothing Filters (Mean & Gaussian)",
    aim: "Compare mean and Gaussian blur for noise suppression.",
    theory:
      "Both are linear low-pass filters. Gaussian weights neighbors by a 2D Gaussian kernel, preserving edges slightly better than a uniform mean filter.",
    operationIds: ["op-blur"],
    sampleImage: "/samples/lena.png",
    difficulty: "Beginner",
    estimatedTime: "20 min",
  }),
  base({
    id: "e5",
    moduleId: "m2",
    title: "Sharpening with Unsharp Masking",
    aim: "Sharpen a blurred image using unsharp masking.",
    theory:
      "Unsharp masking subtracts a blurred copy from the original to emphasize high-frequency detail. Amount controls gain, radius controls scale.",
    operationIds: ["op-sharpen"],
    sampleImage: "/samples/cameraman.png",
    difficulty: "Intermediate",
    estimatedTime: "20 min",
  }),
  base({
    id: "e6",
    moduleId: "m3",
    title: "2D Fourier Transform (Magnitude Spectrum)",
    aim: "Visualize the frequency content of an image using FFT.",
    theory:
      "The 2D DFT decomposes an image into sinusoidal bases. The log-magnitude spectrum reveals dominant frequencies; DC is at the center after fftshift.",
    operationIds: ["op-fft"],
    sampleImage: "/samples/cameraman.png",
    difficulty: "Intermediate",
    estimatedTime: "30 min",
  }),
  base({
    id: "e7",
    moduleId: "m3",
    title: "Ideal Low-pass Filtering",
    aim: "Remove high-frequency detail using an ideal circular low-pass mask in the frequency domain.",
    theory:
      "Multiplying the DFT by a circular mask of radius R keeps frequencies within R and zeros others. Small R → heavy blur (ringing due to sinc).",
    operationIds: ["op-lpf"],
    sampleImage: "/samples/lena.png",
    difficulty: "Advanced",
    estimatedTime: "35 min",
  }),
  base({
    id: "e8",
    moduleId: "m4",
    title: "Adding Gaussian Noise",
    aim: "Simulate additive white Gaussian noise and observe effect on image statistics.",
    theory:
      "Gaussian noise is modeled as independent samples from N(μ, σ²) added to each pixel. σ controls visual noise strength.",
    operationIds: ["op-add-noise"],
    sampleImage: "/samples/cameraman.png",
    difficulty: "Beginner",
    estimatedTime: "20 min",
  }),
  base({
    id: "e9",
    moduleId: "m4",
    title: "Median Filter Denoising",
    aim: "Denoise an image corrupted by salt-and-pepper noise using a median filter.",
    theory:
      "Median filtering replaces each pixel by the median of its neighborhood; excellent against impulsive noise and preserves edges better than mean filtering.",
    operationIds: ["op-median", "op-add-noise"],
    sampleImage: "/samples/lena.png",
    difficulty: "Intermediate",
    estimatedTime: "25 min",
  }),
  base({
    id: "e10",
    moduleId: "m5",
    title: "Erosion",
    aim: "Apply erosion with different structuring elements and observe shape shrinkage.",
    theory:
      "Erosion shrinks bright regions: A ⊖ B = {z | (B)_z ⊆ A}. Kernel shape and size determine how much shrinkage occurs.",
    operationIds: ["op-erode"],
    sampleImage: "/samples/fingerprint.png",
    difficulty: "Beginner",
    estimatedTime: "20 min",
  }),
  base({
    id: "e11",
    moduleId: "m5",
    title: "Dilation",
    aim: "Apply dilation to expand bright regions and close small gaps.",
    theory:
      "Dilation expands bright regions: A ⊕ B = {z | (B̂)_z ∩ A ≠ ∅}. Used to fill holes and join broken segments.",
    operationIds: ["op-dilate"],
    sampleImage: "/samples/fingerprint.png",
    difficulty: "Beginner",
    estimatedTime: "20 min",
  }),
  base({
    id: "e12",
    moduleId: "m6",
    title: "Sobel Edge Detection",
    aim: "Detect edges using gradient operators and threshold the magnitude.",
    theory:
      "Edges correspond to intensity gradients. Sobel computes discrete derivatives in x and y; magnitude gives edge strength.",
    operationIds: ["op-sobel"],
    sampleImage: "/samples/cameraman.png",
    difficulty: "Intermediate",
    estimatedTime: "25 min",
  }),
  base({
    id: "e13",
    moduleId: "m6",
    title: "Otsu Automatic Thresholding",
    aim: "Segment an image into foreground/background using Otsu's method.",
    theory:
      "Otsu's method picks the threshold that minimizes intra-class variance of the two pixel classes, assuming a bimodal histogram.",
    operationIds: ["op-otsu"],
    sampleImage: "/samples/coins.png",
    difficulty: "Intermediate",
    estimatedTime: "25 min",
  }),
];

export const getExperiment = (id: string) => experiments.find((e) => e.id === id);
export const getExperimentsByModule = (moduleId: string) =>
  experiments.filter((e) => e.moduleId === moduleId);