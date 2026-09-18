import React from "react";
import { renderMath, inlineMath } from "../../lib/math";

/* =========================================================================
 * Tiny inline renderer: **bold**, *italic*, `code`, $math$
 * ========================================================================= */
const MATH_MAP: Array<[RegExp, string]> = [
  // Greek letters
  [/\\alpha\b/g, "α"], [/\\beta\b/g, "β"], [/\\gamma\b/g, "γ"],
  [/\\delta\b/g, "δ"], [/\\epsilon\b/g, "ε"], [/\\theta\b/g, "θ"],
  [/\\lambda\b/g, "λ"], [/\\mu\b/g, "μ"], [/\\nu\b/g, "ν"],
  [/\\pi\b/g, "π"], [/\\rho\b/g, "ρ"], [/\\sigma\b/g, "σ"],
  [/\\tau\b/g, "τ"], [/\\phi\b/g, "φ"], [/\\omega\b/g, "ω"],
  [/\\Delta\b/g, "Δ"], [/\\Sigma\b/g, "Σ"], [/\\Omega\b/g, "Ω"],
  [/\\sigma_B\b/g, "σ_B"],
  // Operators
  [/\\ominus\b/g, "⊖"], [/\\oplus\b/g, "⊕"], [/\\circ\b/g, "∘"],
  [/\\bullet\b/g, "•"], [/\\cdot\b/g, "·"], [/\\times\b/g, "×"],
  [/\\div\b/g, "÷"], [/\\pm\b/g, "±"], [/\\mp\b/g, "∓"],
  [/\\sum\b/g, "∑"], [/\\prod\b/g, "∏"], [/\\int\b/g, "∫"],
  [/\\partial\b/g, "∂"], [/\\nabla\b/g, "∇"],
  [/\\in\b/g, "∈"], [/\\notin\b/g, "∉"], [/\\subset(eq)?\b/g, "⊆"],
  [/\\supset(eq)?\b/g, "⊇"], [/\\cup\b/g, "∪"], [/\\cap\b/g, "∩"],
  [/\\land\b/g, "∧"], [/\\lor\b/g, "∨"], [/\\neg\b/g, "¬"],
  [/\\le(q)?\b/g, "≤"], [/\\ge(q)?\b/g, "≥"], [/\\neq\b/g, "≠"],
  [/\\approx\b/g, "≈"], [/\\to\b/g, "→"], [/\\rightarrow\b/g, "→"],
  [/\\leftarrow\b/g, "←"], [/\\Rightarrow\b/g, "⇒"], [/\\infty\b/g, "∞"],
  [/\\sqrt\b/g, "√"], [/\\overline\b/g, ""], [/\\hat\{B\}/g, "B̂"],
  [/\\hat\{f\}/g, "f̂"], [/\\hat\b/g, "^"],
  // Delimiters
  [/\\left\(/g, "("], [/\\right\)/g, ")"],
  [/\\left\[/g, "["], [/\\right\]/g, "]"],
  [/\\left\\\{/g, "{"], [/\\right\\\}/g, "}"],
  [/\\\{/g, "{"], [/\\\}/g, "}"],
  [/\\mid\b/g, "|"],
  // Text commands
  [/\\text\{([^}]*)\}/g, "$1"],
  [/\\mathrm\{([^}]*)\}/g, "$1"],
  [/\\quad\b/g, "  "], [/\\,?\b/g, " "],
  // Cleanup
  [/\\/g, ""],
];

// function renderMath(expr: string): string {
//   let out = expr;
//   for (const [re, rep] of MATH_MAP) out = out.replace(re, rep);
//   return out;
// }

function renderInline(text: string, key: string): React.ReactNode[] {
  const nodes: React.ReactNode[] = [];
  // Order matters: $$...$$ before $...$, then bold/italic/code
  const regex =
    /(\$\$[^$]+\$\$|\$[^$]+\$|\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`)/g;
  let last = 0;
  let m: RegExpExecArray | null;
  let k = 0;

  while ((m = regex.exec(text))) {
    if (m.index > last) nodes.push(text.slice(last, m.index));
    const tok = m[0];

    if (tok.startsWith("$$")) {
      nodes.push(
        <code
          key={`${key}-m-${k++}`}
          className="px-1.5 py-0.5 mx-0.5 rounded bg-brand-50 text-brand-800 text-[0.9em] font-mono"
        >
          {renderMath(tok.slice(2, -2))}
        </code>
      );
    } else if (tok.startsWith("$")) {
      nodes.push(
        <code
          key={`${key}-m-${k++}`}
          className="px-1.5 py-0.5 mx-0.5 rounded bg-brand-50 text-brand-800 text-[0.9em] font-mono"
        >
          {renderMath(tok.slice(1, -1))}
        </code>
      );
    } else if (tok.startsWith("**")) {
      nodes.push(
        <strong key={`${key}-b-${k++}`}>{tok.slice(2, -2)}</strong>
      );
    } else if (tok.startsWith("`")) {
      nodes.push(
        <code
          key={`${key}-c-${k++}`}
          className="px-1.5 py-0.5 mx-0.5 rounded bg-slate-100 text-slate-800 text-[0.9em] font-mono"
        >
          {tok.slice(1, -1)}
        </code>
      );
    } else {
      nodes.push(<em key={`${key}-i-${k++}`}>{tok.slice(1, -1)}</em>);
    }
    last = m.index + tok.length;
  }
  if (last < text.length) nodes.push(text.slice(last));
  return nodes;
}

/* =========================================================================
 * Block-level parser — handles headings, lists, tables, paragraphs, hr
 * ========================================================================= */
type Block =
  | { kind: "h2" | "h3" | "h4"; text: string }
  | { kind: "p"; text: string }
  | { kind: "ul"; items: string[] }
  | { kind: "ol"; items: string[] }
  | { kind: "table"; headers: string[]; rows: string[][] }
  | { kind: "hr" };

function parseBlocks(source: string): Block[] {
  const lines = source.replace(/\r\n/g, "\n").split("\n");
  const blocks: Block[] = [];
  let i = 0;

  const flushParagraph = (buf: string[]) => {
    if (buf.length) {
      blocks.push({ kind: "p", text: buf.join(" ").trim() });
      buf.length = 0;
    }
  };

  let paraBuf: string[] = [];

  while (i < lines.length) {
    const line = lines[i];
    const trimmed = line.trim();

    // Blank line — flush paragraph
    if (trimmed === "") {
      flushParagraph(paraBuf);
      i++;
      continue;
    }

    // Horizontal rule
    if (/^---+$/.test(trimmed)) {
      flushParagraph(paraBuf);
      blocks.push({ kind: "hr" });
      i++;
      continue;
    }

    // Headings
    let m: RegExpMatchArray | null;
    if ((m = /^###\s+(.+)$/.exec(trimmed))) {
      flushParagraph(paraBuf);
      blocks.push({ kind: "h4", text: m[1] });
      i++;
      continue;
    }
    if ((m = /^##\s+(.+)$/.exec(trimmed))) {
      flushParagraph(paraBuf);
      blocks.push({ kind: "h3", text: m[1] });
      i++;
      continue;
    }
    if ((m = /^#\s+(.+)$/.exec(trimmed))) {
      flushParagraph(paraBuf);
      blocks.push({ kind: "h2", text: m[1] });
      i++;
      continue;
    }

    // Table (a header line then a separator line of ---)
    if (
      trimmed.includes("|") &&
      i + 1 < lines.length &&
      /^\s*\|?\s*-{3,}/.test(lines[i + 1])
    ) {
      flushParagraph(paraBuf);
      const splitRow = (l: string) =>
        l
          .replace(/^\s*\|/, "")
          .replace(/\|\s*$/, "")
          .split("|")
          .map((s) => s.trim());
      const headers = splitRow(trimmed);
      i += 2; // skip header + separator
      const rows: string[][] = [];
      while (i < lines.length && lines[i].trim().includes("|")) {
        rows.push(splitRow(lines[i]));
        i++;
      }
      blocks.push({ kind: "table", headers, rows });
      continue;
    }

    // Unordered list
    if (/^[-*]\s+/.test(trimmed)) {
      flushParagraph(paraBuf);
      const items: string[] = [];
      while (i < lines.length && /^\s*[-*]\s+/.test(lines[i])) {
        items.push(lines[i].replace(/^\s*[-*]\s+/, "").trim());
        i++;
      }
      blocks.push({ kind: "ul", items });
      continue;
    }

    // Ordered list
    if (/^\d+\.\s+/.test(trimmed)) {
      flushParagraph(paraBuf);
      const items: string[] = [];
      while (i < lines.length && /^\s*\d+\.\s+/.test(lines[i])) {
        items.push(lines[i].replace(/^\s*\d+\.\s+/, "").trim());
        i++;
      }
      blocks.push({ kind: "ol", items });
      continue;
    }

    // Otherwise accumulate into the paragraph buffer
    paraBuf.push(trimmed);
    i++;
  }

  flushParagraph(paraBuf);
  return blocks;
}

/* =========================================================================
 * Public component
 * ========================================================================= */
export const Markdown: React.FC<{ source: string; className?: string }> = ({
  source,
  className = "",
}) => {
  if (!source) return null;

  // Strip a leading "## Theory" since SectionBlock already titles it
  const cleaned = source.replace(/^\s*##\s+Theory\s*\n+/, "").trim();
  const blocks = parseBlocks(cleaned);

  return (
    <div className={`space-y-3 text-slate-700 leading-relaxed ${className}`}>
      {blocks.map((b, idx) => {
        switch (b.kind) {
          case "h2":
            return (
              <h2 key={idx} className="text-xl font-bold text-slate-900 mt-5">
                {renderInline(b.text, `h2-${idx}`)}
              </h2>
            );
          case "h3":
            return (
              <h3 key={idx} className="text-lg font-semibold text-slate-900 mt-4">
                {renderInline(b.text, `h3-${idx}`)}
              </h3>
            );
          case "h4":
            return (
              <h4 key={idx} className="text-base font-semibold text-slate-900 mt-3">
                {renderInline(b.text, `h4-${idx}`)}
              </h4>
            );
          case "hr":
            return <hr key={idx} className="border-slate-200 my-4" />;
          case "p":
            return (
              <p key={idx} className="text-sm">
                {renderInline(b.text, `p-${idx}`)}
              </p>
            );
          case "ul":
            return (
              <ul key={idx} className="list-disc list-outside pl-5 space-y-1 text-sm">
                {b.items.map((it, j) => (
                  <li key={j}>{renderInline(it, `ul-${idx}-${j}`)}</li>
                ))}
              </ul>
            );
          case "ol":
            return (
              <ol key={idx} className="list-decimal list-outside pl-5 space-y-1 text-sm">
                {b.items.map((it, j) => (
                  <li key={j}>{renderInline(it, `ol-${idx}-${j}`)}</li>
                ))}
              </ol>
            );
          case "table":
            return (
              <div key={idx} className="overflow-x-auto my-3">
                <table className="min-w-full text-sm border border-slate-200 rounded-lg overflow-hidden">
                  <thead className="bg-slate-50">
                    <tr>
                      {b.headers.map((h, j) => (
                        <th
                          key={j}
                          className="text-left px-3 py-2 font-semibold text-slate-700 border-b border-slate-200 align-top"
                        >
                          {renderInline(h, `th-${idx}-${j}`)}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {b.rows.map((r, j) => (
                      <tr key={j} className="border-b last:border-0 border-slate-100">
                        {r.map((c, k) => (
                          <td
                            key={k}
                            className="px-3 py-2 text-slate-700 align-top"
                          >
                            {renderInline(c, `td-${idx}-${j}-${k}`)}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            );
        }
      })}
    </div>
  );
};

/** Exported so other components (PDF, cards) can reuse math stripping */
export function stripInlineMathForExport(s: string): string {
  return s
    .replace(/\$\$([^$]+)\$\$/g, (_m, expr) => renderMath(expr))
    .replace(/\$([^$]+)\$/g, (_m, expr) => renderMath(expr));
}