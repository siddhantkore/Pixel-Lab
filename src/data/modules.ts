import type { Module } from "../types";

export const modules: Module[] = [
  {
    id: "m1",
    title: "Image Fundamentals",
    description: "Pixels, color spaces, sampling, quantization and basic manipulations.",
    icon: "Image",
    color: "from-sky-500 to-blue-600",
    experimentIds: ["e-sq", "e1", "e2"],
},
  {
    id: "m2",
    title: "Image Enhancement (Spatial)",
    description: "Point operations and spatial filtering in the spatial domain.",
    icon: "SlidersHorizontal",
    color: "from-emerald-500 to-teal-600",
    experimentIds: ["e3", "e4", "e5"],
  },
  {
    id: "m3",
    title: "Image Enhancement (Frequency)",
    description: "Fourier transform, frequency-domain filtering and restoration.",
    icon: "Radio",
    color: "from-violet-500 to-purple-600",
    experimentIds: ["e6", "e7"],
  },
  {
    id: "m4",
    title: "Image Restoration",
    description: "Noise models, denoising and deblurring techniques.",
    icon: "Wand2",
    color: "from-amber-500 to-orange-600",
    experimentIds: ["e8", "e9"],
  },
  {
    id: "m5",
    title: "Morphological Processing",
    description: "Erosion, dilation, opening, closing and shape analysis.",
    icon: "Shapes",
    color: "from-rose-500 to-pink-600",
    experimentIds: ["e10", "e11"],
  },
  {
    id: "m6",
    title: "Segmentation & Features",
    description: "Edge detection, thresholding, contours and feature extraction.",
    icon: "Scissors",
    color: "from-indigo-500 to-blue-700",
    experimentIds: ["e12", "e13"],
  },
];

export const getModule = (id: string) => modules.find((m) => m.id === id);