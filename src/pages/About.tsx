import React from "react";
import { Card } from "../components/common/Card";

export const About: React.FC = () => (
  <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-6">
    <h1 className="section-title">About Pixel-Lab</h1>
    <Card>
      <p className="text-slate-700">
        <strong>Pixel-Lab</strong> is a browser-based virtual laboratory for Digital Image Processing.
        It runs entirely on the client — no server needed — using OpenCV.js (WebAssembly) and the
        HTML Canvas API to perform real image operations on your device.
      </p>
    </Card>
    <Card>
      <h2 className="font-semibold text-slate-800 mb-2">Features</h2>
      <ul className="list-disc list-inside text-slate-700 space-y-1 text-sm">
        <li>Modular structure: modules → experiments → operations.</li>
        <li>Live parameter sliders for every operation.</li>
        <li>Curated resources: research papers, Stanford PPTs, blogs, docs.</li>
        <li>Downloadable PDF of each experiment for offline lab work.</li>
        <li>Accessible and keyboard-navigable UI.</li>
      </ul>
    </Card>
    <Card>
      <h2 className="font-semibold text-slate-800 mb-2">Tech stack</h2>
      <p className="text-sm text-slate-700">React · TypeScript · Vite · Tailwind CSS · OpenCV.js · jsPDF</p>
    </Card>
  </div>
);