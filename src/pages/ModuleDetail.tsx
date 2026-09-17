import React from "react";
import { useParams, Navigate } from "react-router-dom";
import { getModule } from "../data/modules";
import { getExperimentsByModule } from "../lib/markdown";   // ← changed
import { ExperimentCard } from "../components/lab/ExperimentCard";
import { Breadcrumbs } from "../components/common/Breadcrumbs";

export const ModuleDetail: React.FC = () => {
  const { moduleId } = useParams();
  const mod = moduleId ? getModule(moduleId) : undefined;
  if (!mod) return <Navigate to="/modules" replace />;
  const exps = getExperimentsByModule(mod.id);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Breadcrumbs
        items={[
          { label: "Home", to: "/" },
          { label: "Modules", to: "/modules" },
          { label: mod.title },
        ]}
      />
      <div className="flex items-center gap-4">
        <div
          className={`w-14 h-14 rounded-xl bg-gradient-to-br ${mod.color} text-white grid place-items-center text-xl font-bold`}
        >
          {mod.title.charAt(0)}
        </div>
        <div>
          <h1 className="section-title">{mod.title}</h1>
          <p className="text-slate-600 mt-1">{mod.description}</p>
        </div>
      </div>

      <h2 className="mt-10 mb-4 font-semibold text-slate-800">Experiments</h2>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {exps.map((e) => (
          <ExperimentCard key={e.id} experiment={e} />
        ))}
      </div>
    </div>
  );
};