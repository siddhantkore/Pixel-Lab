import React from "react";
import { CheckCircle2 } from "lucide-react";
import { Markdown } from "../common/Markdown";

export const ProcedureSteps: React.FC<{ steps: string[] }> = ({ steps }) => (
  <ol className="space-y-2">
    {steps.map((s, i) => (
      <li
        key={i}
        className="flex gap-3 items-start rounded-lg border border-slate-200 bg-white p-3"
      >
        <span className="shrink-0 w-6 h-6 rounded-full bg-brand-100 text-brand-700 grid place-items-center text-xs font-bold">
          {i + 1}
        </span>
        <div className="text-sm text-slate-700">
          <Markdown source={s} />
        </div>
        <CheckCircle2 size={16} className="text-slate-300 ml-auto shrink-0 mt-0.5" />
      </li>
    ))}
  </ol>
);