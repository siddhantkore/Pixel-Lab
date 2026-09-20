# Pixel-Lab

A browser-based virtual laboratory for **Digital Image Processing**. Learn by manipulating real pixels — no install, no signup, no server.

<p align="center">
  <img alt="React" src="https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=white" />
  <img alt="TypeScript" src="https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white" />
  <img alt="Vite" src="https://img.shields.io/badge/Vite-8-646CFF?logo=vite&logoColor=white" />
  <img alt="Tailwind" src="https://img.shields.io/badge/Tailwind-4-06B6D4?logo=tailwindcss&logoColor=white" />
  <img alt="License" src="https://img.shields.io/badge/license-MIT-green" />
</p>

---

## Overview

Pixel-Lab is an interactive lab companion for standard Digital Image Processing courses. It offers **14 experiments across 6 modules**, each with theory, formula, procedure, live parameter controls, reference Python code, and a downloadable PDF lab report. All processing runs in the browser via Canvas 2D — nothing leaves the user's device.

**Modules covered:** Image Fundamentals · Spatial Enhancement · Frequency & Shape · Restoration & Analysis

## Quick start

```bash
git clone <repo-url> pixel-lab
cd pixel-lab
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

```bash
npm run build      # production build → dist/
npm run preview    # preview the build locally
```

Requires Node.js 18+.

## Project structure

```
src/
├── content/experiments/     # One JSON per experiment (metadata + theory)
├── experiments/             # One React component per experiment's live lab
│   └── registry.ts          # Maps experiment id → lab component
├── components/              # Reusable UI (common, lab, layout)
├── lib/                     # imageOps, math, pdfGenerator, experiments loader
├── pages/                   # Route-level views
├── hooks/                   # useImageProcessor
└── types/                   # Shared TypeScript types
```

## Adding an experiment

1. Add `src/content/experiments/<id>.json` with the experiment metadata.
2. Add `src/experiments/<Name>Lab.tsx` implementing the interactive lab.
3. Register it in `src/experiments/registry.ts`:
   ```ts
   "e-<id>": <Name>Lab,
   ```

The experiment appears under its module automatically — no other files need editing.

## Tech stack

React · TypeScript · Vite · Tailwind CSS v4 · Canvas 2D · jsPDF
---