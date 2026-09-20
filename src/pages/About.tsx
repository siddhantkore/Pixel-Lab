import React from "react";
import { Link } from "react-router-dom";
import {
  BookOpen,
  Code2,
  Cpu,
  FlaskConical,
  GraduationCap,
  Layers,
  Library,
  Rocket,
  Sparkles,
  Users,
  ArrowRight,
  Mail,
  Github,
} from "lucide-react";
import { Card } from "../components/common/Card";
import { APP_NAME, APP_DESCRIPTION } from "../lib/constants";
import { modules } from "../data/modules";
import { experiments } from "../lib/experiments";

export const About: React.FC = () => (
  <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16">
    {/* ---------- Hero ---------- */}
    <section className="text-center animate-fade-up">
      <span className="inline-flex items-center gap-2 text-xs font-semibold tracking-wide uppercase text-brand-700 bg-brand-100 px-3 py-1 rounded-full">
        <Sparkles size={14} /> About Pixel-Lab
      </span>
      <h1 className="mt-5 text-4xl sm:text-5xl font-extrabold text-slate-900 tracking-tight">
        A virtual lab for the way you actually learn.
      </h1>
      <p className="mt-4 max-w-2xl mx-auto text-slate-600">
        {APP_DESCRIPTION}
      </p>
    </section>

    {/* ---------- Mission ---------- */}
    <section className="grid md:grid-cols-2 gap-6">
      <Card className="space-y-3 animate-fade-up">
        <div className="w-11 h-11 rounded-lg bg-brand-50 text-brand-700 grid place-items-center">
          <Rocket size={20} />
        </div>
        <h2 className="text-lg font-bold text-slate-900">Why we built this</h2>
        <p className="text-sm text-slate-700 leading-relaxed">
          Traditional DIP labs force you to install Python, OpenCV, and a
          notebook, then debug environment issues before you ever touch an
          image. We wanted the opposite: open a browser, choose an experiment,
          and start manipulating pixels in the first 30 seconds.
        </p>
      </Card>

      <Card className="space-y-3 animate-fade-up delay-100">
        <div className="w-11 h-11 rounded-lg bg-emerald-50 text-emerald-700 grid place-items-center">
          <GraduationCap size={20} />
        </div>
        <h2 className="text-lg font-bold text-slate-900">What you'll learn</h2>
        <ul className="text-sm text-slate-700 space-y-1 list-disc list-inside">
          <li>Theory, formula, and intuition for each technique</li>
          <li>How parameters actually change the output — live</li>
          <li>Reference Python code that reproduces the lab locally</li>
          <li>Real-world applications and further reading</li>
        </ul>
      </Card>
    </section>

    {/* ---------- Numbers ---------- */}
    <section className="grid sm:grid-cols-3 gap-4">
      {[
        { n: modules.length, l: "Curated modules", icon: FlaskConical, tone: "text-brand-600 bg-brand-50" },
        { n: experiments.length, l: "Interactive experiments", icon: BookOpen, tone: "text-violet-600 bg-violet-50" },
        { n: "100%", l: "Browser · no install", icon: Cpu, tone: "text-emerald-600 bg-emerald-50" },
      ].map(({ n, l, icon: Icon, tone }, i) => (
        <Card key={l} className={`flex items-center gap-4 animate-fade-up delay-${(i + 1) * 100}`}>
          <div className={`w-11 h-11 rounded-lg grid place-items-center ${tone}`}>
            <Icon size={20} />
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-900 tabular-nums">{n}</div>
            <div className="text-sm text-slate-600">{l}</div>
          </div>
        </Card>
      ))}
    </section>

    {/* ---------- What's inside each experiment ---------- */}
    <section>
      <h2 className="text-2xl font-bold text-slate-900 text-center">
        Every experiment is a self-contained lesson
      </h2>
      <p className="text-slate-600 mt-2 text-center max-w-2xl mx-auto">
        Same six-part structure across the board — you always know where to look.
      </p>

      <div className="mt-10 grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {[
          { icon: BookOpen, t: "Theory & Concept", d: "What it is, why it matters, and the formula, laid out side by side." },
          { icon: Layers,   t: "Procedure",         d: "Numbered steps that map to the live lab below." },
          { icon: FlaskConical, t: "Interactive Lab", d: "Live sliders and before/after canvases — the core of the site." },
          { icon: Code2,    t: "Python Code",       d: "Copy-paste reference using OpenCV / NumPy." },
          { icon: Users,    t: "Think About It",    d: "Reflection questions to consolidate the idea." },
          { icon: Library,  t: "Further Reading",   d: "Papers, Stanford slides, blogs, and docs." },
        ].map(({ icon: Icon, t, d }, i) => (
          <Card key={t} className={`space-y-2 animate-fade-up delay-${(i + 1) * 100}`}>
            <div className="w-10 h-10 rounded-lg bg-brand-50 text-brand-700 grid place-items-center">
              <Icon size={18} />
            </div>
            <h3 className="font-semibold text-slate-900">{t}</h3>
            <p className="text-sm text-slate-600">{d}</p>
          </Card>
        ))}
      </div>
    </section>

    {/* ---------- Who is this for ---------- */}
    <section className="grid md:grid-cols-3 gap-6">
      {[
        { icon: GraduationCap, t: "Students", d: "Undergrad or postgrad — a lab companion for your DIP course." },
        { icon: Users,         t: "Instructors", d: "Ready-made interactive demos for lectures and assignments." },
        { icon: Rocket,        t: "Self-learners", d: "Anyone curious about how image processing actually works." },
      ].map(({ icon: Icon, t, d }, i) => (
        <Card key={t} className={`space-y-2 animate-fade-up delay-${(i + 1) * 100}`}>
          <div className="w-10 h-10 rounded-lg bg-violet-50 text-violet-700 grid place-items-center">
            <Icon size={18} />
          </div>
          <h3 className="font-semibold text-slate-900">{t}</h3>
          <p className="text-sm text-slate-600">{d}</p>
        </Card>
      ))}
    </section>

    {/* ---------- Tech ---------- */}
    <section>
      <h2 className="text-2xl font-bold text-slate-900 text-center">
        Built with boring, reliable tools
      </h2>
      <p className="text-slate-600 mt-2 text-center max-w-2xl mx-auto">
        No server. No database. No login. Just static files served from a CDN.
      </p>

      <div className="mt-8 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {[
          "React 18",
          "TypeScript",
          "Vite",
          "Tailwind CSS",
          "Canvas 2D",
          "jsPDF",
        ].map((t, i) => (
          <div
            key={t}
            className={`text-center px-3 py-3 rounded-lg bg-slate-50 border border-slate-200 text-xs font-medium text-slate-700 animate-fade-up delay-${(i + 1) * 100}`}
          >
            {t}
          </div>
        ))}
      </div>
    </section>

    {/* ---------- FAQ ---------- */}
    <section>
      <h2 className="text-2xl font-bold text-slate-900 text-center">FAQ</h2>
      <div className="mt-6 space-y-3">
        {[
          {
            q: "Do I need to install anything?",
            a: "No. Everything runs in your browser. Just open a module and start experimenting.",
          },
          {
            q: "Does my image leave my device?",
            a: "No. All processing happens locally on your machine — nothing is uploaded anywhere.",
          },
          {
            q: "Can I download the lab report?",
            a: "Yes. Every experiment has a Download PDF button that generates a printable lab report with theory, code, and resources.",
          },
          {
            q: "Is the source code available?",
            a: "The Python reference code shown in each experiment is copy-paste ready and uses standard OpenCV / NumPy. Run it locally to reproduce the result on any image.",
          },
          {
            q: "Can I use this in a course?",
            a: "Yes. It's designed as a companion to any standard Digital Image Processing syllabus (Gonzalez & Woods, Jain, etc.).",
          },
        ].map(({ q, a }, i) => (
          <details
            key={q}
            className={`group rounded-lg border border-slate-200 bg-white animate-fade-up delay-${Math.min((i + 1) * 100, 500)}`}
          >
            <summary className="cursor-pointer list-none px-4 py-3 flex items-center justify-between">
              <span className="font-medium text-slate-800">{q}</span>
              <span className="text-slate-400 group-open:rotate-45 transition-transform">+</span>
            </summary>
            <div className="px-4 pb-4 text-sm text-slate-600">{a}</div>
          </details>
        ))}
      </div>
    </section>

    {/* ---------- Contact ---------- */}
    <section className="text-center">
      <h2 className="text-2xl font-bold text-slate-900">Get in touch</h2>
      <p className="text-slate-600 mt-2">
        Questions, feedback, or a new experiment you'd like to see? We'd love to hear from you.
      </p>
      <div className="mt-5 flex flex-wrap justify-center gap-3">
        <a href="mailto:hello@pixel-lab.app" className="btn-secondary">
          <Mail size={16} /> hello@pixel-lab.app
        </a>
        <a
          href="https://github.com/"
          target="_blank"
          rel="noopener noreferrer"
          className="btn-secondary"
        >
          <Github size={16} /> View on GitHub
        </a>
      </div>
    </section>

    {/* ---------- CTA ---------- */}
    <section className="text-center pt-4">
      <Link to="/modules" className="btn-primary">
        Start with Module 1 <ArrowRight size={16} />
      </Link>
    </section>
  </div>
);