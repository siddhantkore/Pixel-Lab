import React from "react";
import { Link } from "react-router-dom";

export const NotFound: React.FC = () => (
  <div className="max-w-xl mx-auto text-center py-24 px-4">
    <h1 className="text-5xl font-bold text-slate-900">404</h1>
    <p className="mt-3 text-slate-600">That page doesn't exist in Pixel-Lab.</p>
    <Link to="/" className="btn-primary mt-6 inline-flex">Back home</Link>
  </div>
);