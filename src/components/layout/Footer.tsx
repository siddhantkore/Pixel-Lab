import React from "react";
import { APP_NAME } from "../../lib/constants";

export const Footer: React.FC = () => (
  <footer className="border-t border-slate-200 mt-16">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-sm text-slate-500 flex flex-col sm:flex-row justify-between gap-3">
      <p>© {new Date().getFullYear()} {APP_NAME}. For educational use.</p>
      <p>Built with React · OpenCV.js · Tailwind</p>
    </div>
  </footer>
);