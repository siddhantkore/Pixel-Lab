import React from "react";
import { Sigma, Lightbulb, Settings2 } from "lucide-react";
import { Markdown } from "../common/Markdown";
import { inlineMath } from "../../lib/math";

export const ConceptCard: React.FC<{
  formula?: string;
  intuition?: string;
  parametersHint?: React.ReactNode;
}> = ({ formula, intuition, parametersHint }) => (
  <aside className="space-y-4 lg:sticky lg:top-24">
    {formula && (
      <div className="rounded-xl border border-brand-100 bg-brand-50/60 p-4">
        <div className="flex items-center gap-2 text-brand-800 font-semibold text-sm mb-2">
          <Sigma size={16} /> Formula / Key Idea
        </div>
        <pre className="text-[13px] leading-relaxed whitespace-pre-wrap font-mono text-slate-800">
          {inlineMath(formula)}
        </pre>
      </div>
    )}

    {intuition && (
      <div className="rounded-xl border border-amber-100 bg-amber-50/60 p-4">
        <div className="flex items-center gap-2 text-amber-800 font-semibold text-sm mb-2">
          <Lightbulb size={16} /> Intuition
        </div>
        <Markdown source={intuition} className="text-[13px]" />
      </div>
    )}

    {parametersHint && (
      <div className="rounded-xl border border-emerald-100 bg-emerald-50/60 p-4">
        <div className="flex items-center gap-2 text-emerald-800 font-semibold text-sm mb-2">
          <Settings2 size={16} /> Key Parameters
        </div>
        {parametersHint}
      </div>
    )}
  </aside>
);