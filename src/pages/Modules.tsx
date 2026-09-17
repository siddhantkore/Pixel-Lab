import React from "react";
import { Link } from "react-router-dom";
import { modules } from "../data/modules";
import { getExperimentsByModule } from "../data/experiments";
import { Card } from "../components/common/Card";
import { Breadcrumbs } from "../components/common/Breadcrumbs";
import { ExperimentCard } from "../components/lab/ExperimentCard";

export const Modules: React.FC = () => (
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
    <Breadcrumbs items={[{ label: "Home", to: "/" }, { label: "Modules" }]} />
    <h1 className="section-title">All Modules</h1>
    <p className="text-slate-600 mt-2">
      Six core modules cover the standard Digital Image Processing syllabus.
    </p>

    <div className="mt-8 space-y-10">
      {modules.map((m) => {
        const exps = getExperimentsByModule(m.id);
        return (
          <section key={m.id} id={m.id}>
            <div className="flex items-center gap-3">
              <div
                className={`w-10 h-10 rounded-lg bg-gradient-to-br ${m.color} text-white grid place-items-center font-bold`}
              >
                {m.title.charAt(0)}
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-900">{m.title}</h2>
                <p className="text-sm text-slate-600">{m.description}</p>
              </div>
            </div>
            <div className="mt-4 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {exps.map((e) => (
                <ExperimentCard key={e.id} experiment={e} />
              ))}
            </div>
          </section>
        );
      })}
    </div>
  </div>
);