import React from "react";

const colorMap: Record<string, string> = {
  Beginner: "bg-emerald-50 text-emerald-700 border-emerald-200",
  Intermediate: "bg-amber-50 text-amber-700 border-amber-200",
  Advanced: "bg-rose-50 text-rose-700 border-rose-200",
  default: "bg-slate-100 text-slate-700 border-slate-200",
};

export const Badge: React.FC<{ children: string; className?: string }> = ({
  children,
  className = "",
}) => (
  <span
    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
      colorMap[children] || colorMap.default
    } ${className}`}
  >
    {children}
  </span>
);