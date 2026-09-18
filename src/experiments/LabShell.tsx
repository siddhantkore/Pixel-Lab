import React from "react";

/**
 * Wraps a per-experiment custom lab in a consistent card:
 * gives you a title, optional controls slot on the right, canvas area on the left.
 */
export const LabShell: React.FC<{
  title: string;
  controls: React.ReactNode;
  children: React.ReactNode; // image canvas(es)
}> = ({ title, controls, children }) => (
  <div className="grid lg:grid-cols-3 gap-6">
    <div className="lg:col-span-2 space-y-4">{children}</div>
    <div className="space-y-4">{controls}</div>
  </div>
);