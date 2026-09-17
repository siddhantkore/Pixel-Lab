import React from "react";

export const SectionBlock: React.FC<{
  id: string;
  icon: React.ReactNode;
  title: string;
  subtitle?: string;
  tone?: "default" | "brand" | "amber" | "emerald" | "violet";
  children: React.ReactNode;
}> = ({ id, icon, title, subtitle, tone = "default", children }) => {
  const toneCls = {
    default: "bg-slate-50 text-slate-700 border-slate-200",
    brand: "bg-brand-50 text-brand-700 border-brand-100",
    amber: "bg-amber-50 text-amber-700 border-amber-100",
    emerald: "bg-emerald-50 text-emerald-700 border-emerald-100",
    violet: "bg-violet-50 text-violet-700 border-violet-100",
  }[tone];

  return (
    <section id={id} className="scroll-mt-24">
      <div className="flex items-start gap-3 mb-4">
        <div
          className={`w-10 h-10 rounded-lg border grid place-items-center shrink-0 ${toneCls}`}
        >
          {icon}
        </div>
        <div>
          <h2 className="text-xl font-bold text-slate-900">{title}</h2>
          {subtitle && <p className="text-sm text-slate-600 mt-0.5">{subtitle}</p>}
        </div>
      </div>
      {children}
    </section>
  );
};