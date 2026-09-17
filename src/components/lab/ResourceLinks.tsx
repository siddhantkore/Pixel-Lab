import React from "react";
import {
  FileText,
  Presentation,
  BookOpen,
  Video,
  ExternalLink,
  Library,
} from "lucide-react";
import type { Resource } from "../../types";

const iconFor = (t: Resource["type"]) => {
  switch (t) {
    case "paper": return <FileText size={16} />;
    case "ppt": return <Presentation size={16} />;
    case "blog": return <BookOpen size={16} />;
    case "video": return <Video size={16} />;
    default: return <Library size={16} />;
  }
};

const colorFor = (t: Resource["type"]) =>
  ({
    paper: "text-violet-600 bg-violet-50 border-violet-200",
    ppt: "text-amber-700 bg-amber-50 border-amber-200",
    blog: "text-emerald-700 bg-emerald-50 border-emerald-200",
    video: "text-rose-700 bg-rose-50 border-rose-200",
    docs: "text-sky-700 bg-sky-50 border-sky-200",
  } as Record<string, string>)[t] ?? "text-slate-700 bg-slate-50 border-slate-200";

export const ResourceLinks: React.FC<{ resources: Resource[] }> = ({
  resources,
}) => (
  <ul className="grid sm:grid-cols-2 gap-3">
    {resources.map((r, i) => (
      <li key={i}>
        <a
          href={r.url}
          target="_blank"
          rel="noopener noreferrer"
          className={`group flex items-start gap-3 p-3 rounded-lg border transition-colors hover:shadow-sm ${colorFor(r.type)}`}
        >
          <span className="mt-0.5 shrink-0">{iconFor(r.type)}</span>
          <span className="flex-1 min-w-0">
            <span className="block text-xs uppercase font-semibold tracking-wide opacity-70">
              {r.type}
              {r.source ? ` · ${r.source}` : ""}
              {r.year ? ` · ${r.year}` : ""}
            </span>
            <span className="block text-sm font-medium text-slate-800 group-hover:underline">
              {r.title}
            </span>
          </span>
          <ExternalLink size={14} className="shrink-0 opacity-60 group-hover:opacity-100" />
        </a>
      </li>
    ))}
  </ul>
);