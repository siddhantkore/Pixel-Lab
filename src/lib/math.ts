const GREEK: Record<string, string> = {
  alpha: "α", beta: "β", gamma: "γ", delta: "δ", epsilon: "ε",
  zeta: "ζ", eta: "η", theta: "θ", iota: "ι", kappa: "κ",
  lambda: "λ", mu: "μ", nu: "ν", xi: "ξ", pi: "π", rho: "ρ",
  sigma: "σ", tau: "τ", phi: "φ", chi: "χ", psi: "ψ", omega: "ω",
  Gamma: "Γ", Delta: "Δ", Theta: "Θ", Lambda: "Λ", Xi: "Ξ",
  Pi: "Π", Sigma: "Σ", Phi: "Φ", Psi: "Ψ", Omega: "Ω",
};

const SYMBOLS: Array<[string, string]> = [
  ["\\text", "#TEXT#"], ["\\mathrm", "#TEXT#"],
  ["\\ominus", "⊖"], ["\\oplus", "⊕"], ["\\otimes", "⊗"],
  ["\\odot", "⊙"], ["\\bullet", "•"], ["\\circ", "∘"],
  ["\\cdot", "·"], ["\\times", "×"], ["\\div", "÷"],
  ["\\pm", "±"], ["\\mp", "∓"], ["\\ast", "∗"],
  ["\\sum", "∑"], ["\\prod", "∏"], ["\\int", "∫"],
  ["\\partial", "∂"], ["\\nabla", "∇"], ["\\infty", "∞"],
  ["\\sqrt", "√"],
  ["\\le", "≤"], ["\\leq", "≤"], ["\\ge", "≥"], ["\\geq", "≥"],
  ["\\neq", "≠"], ["\\ne", "≠"], ["\\approx", "≈"], ["\\equiv", "≡"],
  ["\\subset", "⊂"], ["\\subseteq", "⊆"], ["\\supset", "⊃"], ["\\supseteq", "⊇"],
  ["\\cup", "∪"], ["\\cap", "∩"], ["\\in", "∈"], ["\\notin", "∉"],
  ["\\emptyset", "∅"], ["\\varnothing", "∅"],
  ["\\land", "∧"], ["\\lor", "∨"], ["\\neg", "¬"],
  ["\\to", "→"], ["\\rightarrow", "→"], ["\\leftarrow", "←"],
  ["\\Rightarrow", "⇒"], ["\\Leftarrow", "⇐"], ["\\leftrightarrow", "↔"],
  ["\\mid", "|"], ["\\vert", "|"], ["\\Vert", "‖"],
  ["\\hat", "^"], ["\\bar", "‾"], ["\\overline", "‾"],
  ["\\left", ""], ["\\right", ""],
  ["\\quad", "  "], ["\\qquad", "    "],
  ["\\,", " "], ["\\;", " "], ["\\:", " "], ["\\!", ""],
];

/** Convert a LaTeX math expression to readable Unicode */
export function renderMath(expr: string): string {
  let s = expr.trim();

  // Handle \text{...} / \mathrm{...} first (recursive-safe)
  s = s.replace(/\\(?:text|mathrm)\{([^{}]*)\}/g, (_m, inner) => `«${inner.trim()}»`);

  // Remove common wrappers
  s = s.replace(/\\begin\{[^}]+\}/g, "").replace(/\\end\{[^}]+\}/g, "");
  s = s.replace(/\\frac\{([^{}]+)\}\{([^{}]+)\}/g, "($1)/($2)");
  s = s.replace(/\^\{([^{}]+)\}/g, "^$1");
  s = s.replace(/_\{([^{}]+)\}/g, "_$1");

  // Greek letters (longest first)
  const greekKeys = Object.keys(GREEK).sort((a, b) => b.length - a.length);
  for (const k of greekKeys) {
    s = s.replace(new RegExp(`\\\\${k}\\b`, "g"), GREEK[k]);
  }

  // Symbols (longest first)
  const sorted = [...SYMBOLS].sort((a, b) => b[0].length - a[0].length);
  for (const [pat, rep] of sorted) {
    s = s.split(pat).join(rep);
  }

  // Convert «text» back to plain text
  s = s.replace(/«([^»]*)»/g, "$1");

  // Leftover backslashes
  s = s.replace(/\\/g, "");

  return s.replace(/\s+/g, " ").trim();
}

/** Strip $...$ and $$...$$ from any string, replacing with rendered math */
export function inlineMath(text: string): string {
  return text
    .replace(/\$\$([^$]+)\$\$/g, (_m, e) => renderMath(e))
    .replace(/\$([^$]+)\$/g, (_m, e) => renderMath(e));
}