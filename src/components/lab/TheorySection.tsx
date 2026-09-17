import React from "react";
import { BookOpen } from "lucide-react";

export const TheorySection: React.FC<{ aim: string; theory: string }> = ({
  aim,
  theory,
}) => (
  <div className="space-y-4">
    <div>
      <h3 className="text-base font-semibold text-slate-900 flex items-center gap-2">
        <BookOpen size={16} /> Aim
      </h3>
      <p className="text-sm text-slate-700 mt-1">{aim}</p>
    </div>
    <div>
      <h3 className="text-base font-semibold text-slate-900">Theory</h3>
      <p className="text-sm text-slate-700 mt-1 leading-relaxed">{theory}</p>
    </div>
  </div>
);