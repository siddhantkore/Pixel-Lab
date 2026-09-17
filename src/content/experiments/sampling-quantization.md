---
id: e-sq
moduleId: m1
title: "Sampling & Quantization"
aim: "Understand how a continuous image is digitized into pixels (sampling) and intensity levels (quantization), and observe the visual effects of both."
difficulty: Beginner
estimatedTime: "25 min"
sampleImage: /samples/cameraman.png
operationIds: ["op-downsample", "op-quantize"]

# ---------- Core concept & formula (left/right side card) ----------
coreConcept: |
  **Sampling** converts a continuous spatial signal into discrete points.
  **Quantization** converts continuous intensity values into a finite set of levels.

  Together they define the *resolution* of a digital image:
  - More samples → higher spatial resolution
  - More levels → higher tonal (gray-level) resolution

formula: |
  Sampled signal:  f_s[m, n] = f(m·Δx, n·Δy)
  Quantized value: q = round( f_s / Δ ) · Δ
  Storage bits:    B = M · N · k    (k = bits per pixel)

intuition: |
  Picture a photograph painted on graph paper. Sampling decides
  **how big each square** is (how many squares cover the picture).
  Quantization decides **how many shades of gray** you're allowed
  to paint each square with.

# ---------- Procedure (student follows these steps) ----------
procedure:
  - "Upload or pick a sample image."
  - "Note its dimensions — this is the sampling grid."
  - "Apply **downsampling** with factor 2, 4, 8 and observe the blocking."
  - "Apply **quantization** to 8, 4, 2 gray levels and observe banding."
  - "Compare the two effects — which one causes blur? Which causes false contours?"
  - "Download the PDF report for your lab record."

# ---------- Applications (last section before resources) ----------
applications:
  - "Choosing camera resolution (MP) for printing vs web."
  - "JPEG / MP3 compression (both operate on quantized coefficients)."
  - "Medical imaging: bit-depth affects diagnostic accuracy."
  - "Satellite imaging: trade-off between coverage and detail."
  - "Display bit-depth (8-bit vs 10-bit HDR panels)."

# ---------- Python reference code (shown on right) ----------
pythonCode: |
  import cv2
  import numpy as np

  img = cv2.imread("input.jpg")

  # ----- Sampling: downsample by factor s -----
  s = 4
  small = cv2.resize(img, None, fx=1/s, fy=1/s, interpolation=cv2.INTER_NEAREST)
  # (Optionally re-upsample to view the pixelation effect)
  upsampled = cv2.resize(small, (img.shape[1], img.shape[0]),
                         interpolation=cv2.INTER_NEAREST)

  # ----- Quantization: reduce gray levels to L -----
  L = 4
  gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
  step = 256 // L
  quantized = (gray // step) * step + step // 2

  cv2.imwrite("downsampled.jpg", upsampled)
  cv2.imwrite("quantized.jpg", quantized)

# ---------- Resources ----------
resources:
  - type: ppt
    title: "Sampling & Quantization — Stanford CS448"
    url: "https://web.stanford.edu/class/cs448f/lectures/"
    source: Stanford
  - type: paper
    title: "Fundamentals of Digital Image Processing (Jain, 1989)"
    url: "https://www.ece.ucsb.edu/Faculty/Rabbani/classes/ece178/fundamentals_of_digital_image_processing.pdf"
  - type: blog
    title: "Sampling, Quantization & Resolution — TutorialsPoint"
    url: "https://www.tutorialspoint.com/dip/concept_of_sampling_and_quantization.htm"
---

## Theory

Imagine you want to store a photograph on a computer. The real world is
*continuous* — light intensity varies smoothly across space, and time.
A computer can only store **finite numbers**. So we must do two things:

1. **Sample** the image — pick a finite grid of spatial points.
2. **Quantize** the intensity — round each value to a finite set of levels.

### Why do we need this?

- Digital storage, transmission, and processing require discrete data.
- File size scales directly with both resolutions (samples × levels).
- Choosing them poorly causes **aliasing**, **blur**, **banding**, or
  **false contours** — visual artifacts we want to control.

### What happens if we do too little of either?

| Too few samples | Too few levels |
|---|---|
| Blocky, pixelated image | Visible "banding" (false contours) |
| Aliasing (jagged edges) | Loss of subtle gradients |

The **Nyquist criterion** says: to faithfully represent a signal with
highest frequency `f_max`, we must sample at least at `2·f_max`. For
images, `f_max` is determined by the finest detail you wish to preserve.