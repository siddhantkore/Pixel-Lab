import type { Resource } from "../types";

export const resourcesByExperiment: Record<string, Resource[]> = {
  e1: [
    { type: "ppt", title: "Color Image Processing — Stanford CS", url: "https://web.stanford.edu/class/cs448f/lectures/", source: "Stanford", year: 2023 },
    { type: "paper", title: "Color Space Transformations (Gonzalez & Woods)", url: "https://www.imageprocessingplace.com/", year: 2018 },
    { type: "blog", title: "Grayscale Conversion Methods — PyImageSearch", url: "https://pyimagesearch.com/2015/02/09/grayscale-images-opencv/", source: "PyImageSearch" },
    { type: "docs", title: "OpenCV Color Conversions", url: "https://docs.opencv.org/4.x/d8/d01/group__imgproc__color__conversions.html" },
  ],
  e2: [
    { type: "ppt", title: "Intensity Transformations", url: "https://web.stanford.edu/class/cs448f/lectures/", source: "Stanford" },
    { type: "blog", title: "Image Enhancement Basics — Analytics Vidhya", url: "https://www.analyticsvidhya.com/blog/2021/07/image-enhancement-techniques/" },
    { type: "docs", title: "OpenCV convertScaleAbs", url: "https://docs.opencv.org/4.x/d2/de8/group__core__array.html" },
  ],
  e3: [
    { type: "paper", title: "Histogram Equalization — Hummel (1977)", url: "https://ieeexplore.ieee.org/document/4307741", year: 1977 },
    { type: "ppt", title: "Histogram Processing — Stanford", url: "https://web.stanford.edu/class/cs448f/lectures/", source: "Stanford" },
    { type: "blog", title: "Histogram Equalization — Scikit-image", url: "https://scikit-image.org/docs/stable/auto_examples/color_exposure/plot_equalize.html" },
  ],
  e4: [
    { type: "ppt", title: "Spatial Filtering — Stanford CS", url: "https://web.stanford.edu/class/cs448f/lectures/", source: "Stanford" },
    { type: "blog", title: "Gaussian Blurring — OpenCV Tutorial", url: "https://docs.opencv.org/4.x/d4/d13/tutorial_py_filtering.html" },
    { type: "paper", title: "Gaussian Blur and Scale Space (Lindeberg 1994)", url: "https://link.springer.com/article/10.1007/BF01267947", year: 1994 },
  ],
  e5: [
    { type: "paper", title: "Unsharp Masking (Schreiber 1970)", url: "https://opg.optica.org/josa/abstract.cfm?uri=josa-60-9-1195", year: 1970 },
    { type: "blog", title: "Unsharp Mask — Cambridge in Colour", url: "https://www.cambridgeincolour.com/tutorials/unsharp-mask.htm" },
  ],
  e6: [
    { type: "ppt", title: "Fourier Transform in 2D — Stanford", url: "https://web.stanford.edu/class/cs448f/lectures/", source: "Stanford" },
    { type: "blog", title: "Fourier Transform — Image Processing (OpenCV)", url: "https://docs.opencv.org/4.x/de/dbc/tutorial_py_fourier_transform.html" },
    { type: "video", title: "But what is the Fourier Transform? — 3Blue1Brown", url: "https://www.youtube.com/watch?v=spUNpyF58BY" },
  ],
  e7: [
    { type: "ppt", title: "Frequency-domain Filtering — Stanford CS", url: "https://web.stanford.edu/class/cs448f/lectures/", source: "Stanford" },
    { type: "paper", title: "Digital Image Filtering in Frequency Domain (Cooley-Tukey)", url: "https://ieeexplore.ieee.org/document/5217220", year: 1965 },
  ],
  e8: [
    { type: "paper", title: "Noise Models in Images — Gonzalez & Woods", url: "https://www.imageprocessingplace.com/" },
    { type: "blog", title: "Adding Gaussian Noise — PyImageSearch", url: "https://pyimagesearch.com/2017/03/27/simple-image-noising-with-opencv/" },
  ],
  e9: [
    { type: "paper", title: "Median Filtering (Huang 1979)", url: "https://ieeexplore.ieee.org/document/1163114", year: 1979 },
    { type: "blog", title: "Median Blur — OpenCV Docs", url: "https://docs.opencv.org/4.x/d4/d13/tutorial_py_filtering.html" },
  ],
  e10: [
    { type: "ppt", title: "Morphological Image Processing — Stanford", url: "https://web.stanford.edu/class/cs448f/lectures/", source: "Stanford" },
    { type: "paper", title: "Image Analysis & Mathematical Morphology (Serra)", url: "https://www.sciencedirect.com/book/9780126372427/image-analysis-and-mathematical-morphology" },
  ],
  e11: [
    { type: "ppt", title: "Morphological Image Processing — Stanford", url: "https://web.stanford.edu/class/cs448f/lectures/", source: "Stanford" },
    { type: "blog", title: "Dilation & Erosion — OpenCV", url: "https://docs.opencv.org/4.x/d9/d61/tutorial_py_morphological_ops.html" },
  ],
  e12: [
    { type: "paper", title: "Sobel & Feldman (1968) Gradient Operator", url: "https://ieeexplore.ieee.org/document/4082265", year: 1968 },
    { type: "blog", title: "Edge Detection — Canny vs Sobel", url: "https://docs.opencv.org/4.x/da/d22/tutorial_py_canny.html" },
  ],
  e13: [
    { type: "paper", title: "Otsu (1979) — A Threshold Selection Method", url: "https://ieeexplore.ieee.org/document/4310076", year: 1979 },
    { type: "blog", title: "Otsu Thresholding — Scikit-image", url: "https://scikit-image.org/docs/stable/auto_examples/segmentation/plot_thresholding.html" },
  ],
};