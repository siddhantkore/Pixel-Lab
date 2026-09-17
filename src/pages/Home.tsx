import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Sparkles, FlaskConical, BookOpen, Download } from "lucide-react";
import { APP_DESCRIPTION, APP_NAME, APP_TAGLINE } from "../lib/constants";
import { modules } from "../data/modules";
import { experiments } from "../data/experiments";
import { Card } from "../components/common/Card";

export const Home: React.FC = () => (
  <div>
    {/* Hero */}
    <section className="bg-gradient-to-b from-brand-50 via-white to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 text-center">
        <span className="inline-flex items-center gap-2 text-xs font-semibold tracking-wide uppercase text-brand-700 bg-brand-100 px-3 py-1 rounded-full">
          <Sparkles size={14} /> Interactive Learning
        </span>
        <h1 className="mt-5 text-4xl sm:text-6xl font-extrabold text-slate-900 tracking-tight">
          {APP_NAME}
        </h1>
        <p className="mt-3 text-lg text-brand-700 font-medium">{APP_TAGLINE}</p>
        <p className="mt-5 max-w-2xl mx-auto text-slate-600">{APP_DESCRIPTION}</p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link to="/modules" className="btn-primary">
            Start exploring <ArrowRight size={16} />
          </Link>
          <Link to="/about" className="btn-secondary">
            Learn more
          </Link>
        </div>
      </div>
    </section>

    {/* Stats */}
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid sm:grid-cols-3 gap-4 -mt-4">
      {[
        { n: modules.length, l: "Modules", icon: FlaskConical },
        { n: experiments.length, l: "Experiments", icon: BookOpen },
        { n: "PDF", l: "Downloadable reports", icon: Download },
      ].map(({ n, l, icon: Icon }) => (
        <Card key={l} className="flex items-center gap-4">
          <div className="w-11 h-11 rounded-lg bg-brand-50 text-brand-700 grid place-items-center">
            <Icon size={20} />
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-900">{n}</div>
            <div className="text-sm text-slate-600">{l}</div>
          </div>
        </Card>
      ))}
    </section>

    {/* Modules preview */}
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <h2 className="section-title">Explore modules</h2>
      <p className="text-slate-600 mt-2">
        Each module contains curated experiments with live parameter controls, reference code,
        and a curated reading list.
      </p>
      <div className="mt-8 grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {modules.map((m) => (
          <Link key={m.id} to={`/modules/${m.id}`} className="group">
            <Card className="h-full flex flex-col gap-3 hover:border-brand-300">
              <div
                className={`w-11 h-11 rounded-lg bg-gradient-to-br ${m.color} text-white grid place-items-center font-bold`}
              >
                {m.title.charAt(0)}
              </div>
              <h3 className="font-semibold text-slate-900 group-hover:text-brand-700">
                {m.title}
              </h3>
              <p className="text-sm text-slate-600">{m.description}</p>
              <span className="text-xs text-slate-500 mt-auto">
                {m.experimentIds.length} experiments
              </span>
            </Card>
          </Link>
        ))}
      </div>
    </section>
  </div>
);