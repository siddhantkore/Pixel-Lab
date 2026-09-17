import React from "react";
import { Rocket } from "lucide-react";
import { Markdown } from "../common/Markdown";

export const ApplicationList: React.FC<{ items: string[] }> = ({ items }) => (
  <div className="grid sm:grid-cols-2 gap-3">
    {items.map((a, i) => (
      <div
        key={i}
        className="flex gap-3 items-start p-3 rounded-lg border border-violet-100 bg-violet-50/50"
      >
        <Rocket size={16} className="text-violet-700 shrink-0 mt-0.5" />
        <div className="text-sm text-slate-700">
          <Markdown source={a} />
        </div>
      </div>
    ))}
  </div>
);