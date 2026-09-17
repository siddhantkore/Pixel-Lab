import React from "react";
import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";

export type Crumb = { label: string; to?: string };

export const Breadcrumbs: React.FC<{ items: Crumb[] }> = ({ items }) => (
  <nav aria-label="Breadcrumb" className="flex items-center gap-1 text-sm text-slate-500 mb-4">
    {items.map((c, i) => (
      <React.Fragment key={i}>
        {c.to ? (
          <Link to={c.to} className="hover:text-brand-600">
            {c.label}
          </Link>
        ) : (
          <span className="text-slate-800 font-medium">{c.label}</span>
        )}
        {i < items.length - 1 && <ChevronRight size={14} />}
      </React.Fragment>
    ))}
  </nav>
);