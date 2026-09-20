import React, { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  Sparkles,
  FlaskConical,
  BookOpen,
  Download,
  Cpu,
  Palette,
  Binary,
  Waves,
  Layers,
  Scissors,
} from "lucide-react";
import { APP_DESCRIPTION, APP_NAME, APP_TAGLINE } from "../lib/constants";
import { modules } from "../data/modules";
import { experiments } from "../lib/experiments";
import { Card } from "../components/common/Card";

/* ------------------------------------------------------------------
 * Fixed delay class map — every class name is a literal string so
 * Tailwind's scanner keeps them all in the build.
 * ---------------------------------------------------------------- */
const DELAY = [
  "delay-100",
  "delay-200",
  "delay-300",
  "delay-400",
  "delay-500",
  "delay-600",
  "delay-700",
] as const;

/* ==================================================================
 * Hero visual — a looping, light-themed image-processing animation.
 * No dark frame: background stays transparent; only strokes drawn.
 * ================================================================== */
const HeroCanvas: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const size = 340;
    const dpr = window.devicePixelRatio || 1;
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    canvas.style.width = `${size}px`;
    canvas.style.height = `${size}px`;
    ctx.scale(dpr, dpr);

    // -------- Build the pristine source pattern (light theme) --------
    const src = document.createElement("canvas");
    src.width = size;
    src.height = size;
    const sctx = src.getContext("2d")!;

    // Transparent background — let the section's gradient show through
    sctx.clearRect(0, 0, size, size);

    const cx = size / 2;
    const cy = size / 2;

    // Concentric rings — brand blue fading out
    for (let r = 30; r <= size / 2 - 24; r += 22) {
      sctx.beginPath();
      sctx.arc(cx, cy, r, 0, Math.PI * 2);
      sctx.strokeStyle =
        r % 66 === 0
          ? "rgba(28, 98, 245, 0.85)"
          : "rgba(148, 163, 184, 0.55)";
      sctx.lineWidth = r % 66 === 0 ? 4 : 2;
      sctx.stroke();
    }

    // A soft center dot
    sctx.beginPath();
    sctx.arc(cx, cy, 8, 0, Math.PI * 2);
    sctx.fillStyle = "rgba(28, 98, 245, 0.9)";
    sctx.fill();

    // Accent squares at diagonals (amber + emerald)
    const square = (x: number, y: number, color: string) => {
      sctx.fillStyle = color;
      sctx.beginPath();
      const r = 14;
      const rad = 6;
      sctx.moveTo(x - r + rad, y - r);
      sctx.arcTo(x + r, y - r, x + r, y + r, rad);
      sctx.arcTo(x + r, y + r, x - r, y + r, rad);
      sctx.arcTo(x - r, y + r, x - r, y - r, rad);
      sctx.arcTo(x - r, y - r, x + r, y - r, rad);
      sctx.closePath();
      sctx.fill();
    };
    square(size * 0.22, size * 0.22, "rgba(251, 191, 36, 0.9)");
    square(size * 0.78, size * 0.78, "rgba(16, 185, 129, 0.9)");

    // -------- Animation loop --------
    let t = 0;
    let raf = 0;

    // Helper: process a source canvas into a downsampled canvas
    const downsample = (source: HTMLCanvasElement, factor: number) => {
      const small = document.createElement("canvas");
      small.width = Math.max(1, Math.floor(size / factor));
      small.height = Math.max(1, Math.floor(size / factor));
      const smctx = small.getContext("2d")!;
      smctx.imageSmoothingEnabled = false;
      smctx.drawImage(source, 0, 0, small.width, small.height);
      return small;
    };

    // Helper: quantize a canvas in place, preserving alpha
    const quantizeInPlace = (target: HTMLCanvasElement, step: number) => {
      const tctx = target.getContext("2d")!;
      const img = tctx.getImageData(0, 0, target.width, target.height);
      const p = img.data;
      for (let i = 0; i < p.length; i += 4) {
        if (p[i + 3] === 0) continue; // skip fully transparent pixels
        p[i]     = Math.floor(p[i] / step) * step + step / 2;
        p[i + 1] = Math.floor(p[i + 1] / step) * step + step / 2;
        p[i + 2] = Math.floor(p[i + 2] / step) * step + step / 2;
      }
      tctx.putImageData(img, 0, 0);
    };

    // Helper: sobel-style edge detection on the alpha channel — keeps bg transparent
    const edgesOnly = (source: HTMLCanvasElement) => {
      const sctx2 = source.getContext("2d")!;
      const img = sctx2.getImageData(0, 0, source.width, source.height);
      const p = img.data;
      const W = source.width;
      const H = source.height;

      const gray = new Float32Array(W * H);
      const alpha = new Uint8Array(W * H);
      for (let i = 0, j = 0; i < p.length; i += 4, j++) {
        gray[j] =
          0.299 * p[i] + 0.587 * p[i + 1] + 0.114 * p[i + 2];
        alpha[j] = p[i + 3];
      }

      const out = new ImageData(W, H);
      const op = out.data;
      for (let y = 1; y < H - 1; y++) {
        for (let x = 1; x < W - 1; x++) {
          const idx = y * W + x;
          if (alpha[idx] === 0) continue;
          const gx =
            -gray[idx - W - 1] - 2 * gray[idx - 1] - gray[idx + W - 1] +
            gray[idx - W + 1] + 2 * gray[idx + 1] + gray[idx + W + 1];
          const gy =
            -gray[idx - W - 1] - 2 * gray[idx - W] - gray[idx - W + 1] +
            gray[idx + W - 1] + 2 * gray[idx + W] + gray[idx + W + 1];
          const mag = Math.min(255, Math.sqrt(gx * gx + gy * gy));
          const o = idx * 4;
          op[o] = 28;
          op[o + 1] = 98;
          op[o + 2] = 245;
          op[o + 3] = Math.min(255, mag * 1.5);
        }
      }
      const outCanvas = document.createElement("canvas");
      outCanvas.width = W;
      outCanvas.height = H;
      outCanvas.getContext("2d")!.putImageData(out, 0, 0);
      return outCanvas;
    };

    const draw = () => {
      t += 0.006;
      // 6 stages, 1.3 s each → smooth cross-fade
      const STAGES = 6;
      const raw = (t * 1.3) % STAGES;
      const stage = Math.floor(raw);
      const blend = raw - stage; // 0..1 fade into next stage

      // Compute the "current" and "next" rendered canvases
      const renderStage = (idx: number): HTMLCanvasElement => {
        switch (idx % STAGES) {
          case 0: {
            // Source
            return src;
          }
          case 1: {
            // Downsampled
            const c = document.createElement("canvas");
            c.width = size;
            c.height = size;
            const small = downsample(src, 6);
            const cctx = c.getContext("2d")!;
            cctx.imageSmoothingEnabled = false;
            cctx.drawImage(small, 0, 0, size, size);
            cctx.imageSmoothingEnabled = true;
            return c;
          }
          case 2: {
            // Quantized
            const c = document.createElement("canvas");
            c.width = size;
            c.height = size;
            c.getContext("2d")!.drawImage(src, 0, 0);
            quantizeInPlace(c, 96);
            return c;
          }
          case 3: {
            // Edges
            return edgesOnly(src);
          }
          case 4: {
            // Rotated 90°
            const c = document.createElement("canvas");
            c.width = size;
            c.height = size;
            const cctx = c.getContext("2d")!;
            cctx.translate(size / 2, size / 2);
            cctx.rotate(Math.PI / 2);
            cctx.translate(-size / 2, -size / 2);
            cctx.drawImage(src, 0, 0);
            return c;
          }
          case 5:
          default: {
            // Source again (close the loop smoothly)
            return src;
          }
        }
      };

      const a = renderStage(stage);
      const b = renderStage(stage + 1);

      // Crossfade
      ctx.clearRect(0, 0, size, size);
      ctx.globalAlpha = 1;
      ctx.drawImage(a, 0, 0, size, size);
      ctx.globalAlpha = blend;
      ctx.drawImage(b, 0, 0, size, size);
      ctx.globalAlpha = 1;

      // Phase label at bottom-center — light pill, dark text
      const labels = [
        "Source",
        "Downsampled",
        "Quantized",
        "Edges",
        "Rotate 90°",
        "Source",
      ];
      const label = labels[stage] ?? labels[0];
      const lw = ctx.measureText(label).width + 24;
      ctx.font =
        "600 11px ui-monospace, SFMono-Regular, Menlo, monospace";
      const textW = ctx.measureText(label).width;
      const pillW = textW + 24;
      const pillH = 22;
      const px = (size - pillW) / 2;
      const py = size - 34;

      ctx.fillStyle = "rgba(255, 255, 255, 0.92)";
      ctx.strokeStyle = "rgba(226, 232, 240, 1)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.roundRect(px, py, pillW, pillH, 999);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = "#1c62f5";
      ctx.font =
        "600 11px ui-monospace, SFMono-Regular, Menlo, monospace";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(label, size / 2, py + pillH / 2);

      void lw;

      raf = requestAnimationFrame(draw);
    };

    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <div className="relative">
      {/* Soft glow behind the animation */}
      <div className="absolute inset-4 rounded-full bg-gradient-to-br from-brand-400/40 via-violet-400/25 to-emerald-400/30 blur-3xl" />

      {/* Floating decorative orbits (purely decorative, no canvas) */}
      <div className="absolute inset-0 rounded-full border border-brand-200/60 animate-float-slow" />
      <div className="absolute inset-8 rounded-full border border-emerald-200/50 animate-float-med" />

      {/* Actual animation canvas — transparent bg */}
      <div className="relative">
        <canvas ref={canvasRef} className="block mx-auto" />
      </div>
    </div>
  );
};

/* ==================================================================
 * Floating chip
 * ================================================================== */
const Chip: React.FC<{
  icon: React.ElementType;
  label: string;
  position: string;
  float: "animate-float-slow" | "animate-float-med";
  delay?: string;
}> = ({ icon: Icon, label, position, float, delay = "" }) => (
  <div
    className={`absolute hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-slate-200 shadow-sm text-xs font-medium text-slate-700 ${position} ${float} ${delay}`}
  >
    <Icon size={12} className="text-brand-600" />
    {label}
  </div>
);

/* ==================================================================
 * Page
 * ================================================================== */
export const Home: React.FC = () => (
  <div>
    {/* ============== HERO ============== */}
    <section className="relative overflow-hidden bg-gradient-to-b from-brand-50 via-white to-white">
      <div
        className="absolute inset-0 opacity-[0.35] pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(#cbd5e1 1px, transparent 1px), linear-gradient(90deg, #cbd5e1 1px, transparent 1px)",
          backgroundSize: "32px 32px",
          maskImage:
            "radial-gradient(ellipse at center, black 30%, transparent 75%)",
          WebkitMaskImage:
            "radial-gradient(ellipse at center, black 30%, transparent 75%)",
        }}
      />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left: text */}
          <div>
            <span className="inline-flex items-center gap-2 text-xs font-semibold tracking-wide uppercase text-brand-700 bg-brand-100 px-3 py-1 rounded-full animate-fade-up">
              <Sparkles size={14} /> Interactive Learning · No setup required
            </span>

            <h1 className="mt-5 text-4xl sm:text-6xl font-extrabold tracking-tight text-slate-900 animate-fade-up delay-100">
              <span className="inline-block">Learn</span>{" "}
              <span className="relative inline-block">
                <span className="bg-gradient-to-r from-brand-600 via-violet-600 to-emerald-500 bg-clip-text text-transparent animate-gradient">
                  Digital Image Processing
                </span>
              </span>{" "}
              <span className="block mt-1 text-slate-700 text-2xl sm:text-4xl font-semibold">
                by doing.
              </span>
            </h1>

            <p className="mt-5 max-w-2xl text-slate-600 animate-fade-up delay-200">
              {APP_DESCRIPTION}
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-3 animate-fade-up delay-300">
              <Link to="/modules" className="btn-primary">
                Start exploring <ArrowRight size={16} />
              </Link>
              <Link to="/about" className="btn-secondary">
                How it works
              </Link>
            </div>

            <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-slate-500 animate-fade-in delay-500">
              <span className="inline-flex items-center gap-2">
                <span className="relative inline-flex w-2 h-2 rounded-full bg-emerald-500 pulse-dot" />
                <span>{experiments.length} experiments live</span>
              </span>
              <span>{modules.length} modules</span>
              <span>Browser-based · no install</span>
            </div>
          </div>

          {/* Right: animated canvas */}
          <div className="relative flex justify-center lg:justify-end animate-fade-up delay-300">
            <HeroCanvas />

            <Chip
              icon={Binary}
              label="Quantize"
              position="-top-2 left-6"
              float="animate-float-slow"
            />
            <Chip
              icon={Waves}
              label="Sobel"
              position="top-1/3 -right-2"
              float="animate-float-med"
              delay="delay-200"
            />
            <Chip
              icon={Palette}
              label="HSV"
              position="top-4 -left-4"
              float="animate-float-slow"
              delay="delay-300"
            />
            <Chip
              icon={Layers}
              label="Morphology"
              position="top-2/3 -left-2"
              float="animate-float-med"
              delay="delay-400"
            />
            <Chip
              icon={Scissors}
              label="Segment"
              position="bottom-4 right-2"
              float="animate-float-slow"
              delay="delay-500"
            />
            <Chip
              icon={Cpu}
              label="OpenCV ready"
              position="-top-3 right-12"
              float="animate-float-med"
              delay="delay-700"
            />
          </div>
        </div>
      </div>
    </section>

    {/* ============== STATS ============== */}
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid sm:grid-cols-3 gap-4 -mt-4">
      {[
        { n: modules.length, l: "Modules", icon: FlaskConical, tone: "text-brand-600 bg-brand-50" },
        { n: experiments.length, l: "Experiments", icon: BookOpen, tone: "text-violet-600 bg-violet-50" },
        { n: "PDF", l: "Downloadable reports", icon: Download, tone: "text-emerald-600 bg-emerald-50" },
      ].map(({ n, l, icon: Icon, tone }, i) => (
        <Card
          key={l}
          className={`flex items-center gap-4 animate-fade-up ${DELAY[i] ?? ""}`}
        >
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
  </div>
);