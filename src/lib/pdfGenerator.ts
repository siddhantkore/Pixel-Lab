import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import type { Experiment } from "../types";
import { inlineMath } from "./math";

/* ==================================================================
 * Config                                                             *
 * ================================================================== */

type RGB = [number, number, number];

const C = {
  brand: [30, 58, 120] as RGB, // deep navy (page chrome)
  gold: [196, 139, 22] as RGB, // fine accent lines
  dark: [15, 23, 42] as RGB,
  text: [45, 55, 72] as RGB,
  muted: [100, 116, 139] as RGB,
  rule: [203, 213, 225] as RGB,
  ruleSoft: [226, 232, 240] as RGB,
  panel: [244, 247, 251] as RGB,
  tint: [239, 246, 255] as RGB,
  codeBg: [250, 251, 253] as RGB,
  codeBar: [30, 41, 59] as RGB,
};

/** Section accents: a strong colour plus a soft tint of the same hue. */
type Accent = { main: RGB; tint: RGB };
const A = {
  navy: { main: [30, 58, 120], tint: [232, 238, 249] } as Accent,
  teal: { main: [15, 118, 110], tint: [227, 245, 243] } as Accent,
  indigo: { main: [79, 70, 200], tint: [237, 236, 250] } as Accent,
  amber: { main: [180, 100, 10], tint: [253, 242, 224] } as Accent,
  emerald: { main: [4, 120, 87], tint: [226, 245, 236] } as Accent,
  rose: { main: [157, 23, 77], tint: [252, 235, 242] } as Accent,
  slate: { main: [51, 65, 85], tint: [239, 242, 246] } as Accent,
};
const ACCENT_CYCLE: Accent[] = [A.navy, A.teal, A.indigo, A.amber, A.emerald, A.rose];

/** Stable colour per resource type (video, article, paper, ...). */
function typeAccent(type: string): Accent {
  const known: Record<string, Accent> = {
    video: A.rose,
    article: A.teal,
    paper: A.indigo,
    book: A.amber,
    docs: A.emerald,
    documentation: A.emerald,
    tutorial: A.emerald,
  };
  const k = type.toLowerCase();
  if (known[k]) return known[k];
  let h = 0;
  for (let i = 0; i < k.length; i++) h = (h * 31 + k.charCodeAt(i)) >>> 0;
  return ACCENT_CYCLE[h % ACCENT_CYCLE.length];
}

const PAGE = { unit: "pt" as const, format: "a4" as const };
const FRAME = 22; // inset of the outer page border
const M = { top: 88, right: 52, bottom: 68, left: 52 };
const LINE_H = 14.5;
const BODY_PT = 10.5;

/* ==================================================================
 * Text utilities                                                     *
 * ================================================================== */

function stripMarkdown(s: string): string {
  return inlineMath(s)
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/\*([^*]+)\*/g, "$1")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/^#+\s*/gm, "")
    .replace(/^\s*[-*]\s+/gm, "• ")
    .replace(/\|/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function slug(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

/**
 * Splits free text into paragraphs / bullets / numbered items / sub-headings so
 * multi-paragraph content keeps its structure instead of collapsing into one
 * block. Soft-wrapped lines inside a paragraph are still joined.
 */
type Block =
  | { kind: "h"; text: string }
  | { kind: "p"; text: string }
  | { kind: "ul"; text: string }
  | { kind: "ol"; label: string; text: string };

function toBlocks(raw: string): Block[] {
  const blocks: Block[] = [];
  for (const para of raw.replace(/\r/g, "").split(/\n\s*\n/)) {
    let cur: Block | null = null;
    for (const src of para.split("\n")) {
      const line = src.trim();
      if (!line) continue;
      let m: RegExpMatchArray | null;
      if ((m = line.match(/^#{1,6}\s+(.*)$/))) {
        cur = null;
        blocks.push({ kind: "h", text: m[1] });
      } else if ((m = line.match(/^[-*•]\s+(.*)$/))) {
        cur = { kind: "ul", text: m[1] };
        blocks.push(cur);
      } else if ((m = line.match(/^(\d+[.)])\s+(.*)$/))) {
        cur = { kind: "ol", label: m[1], text: m[2] };
        blocks.push(cur);
      } else if (cur) {
        cur.text += " " + line;
      } else {
        cur = { kind: "p", text: line };
        blocks.push(cur);
      }
    }
  }
  return blocks
    .map((b) => ({ ...b, text: stripMarkdown(b.text) }))
    .filter((b) => b.text.length > 0);
}

/* ==================================================================
 * Generator                                                          *
 * ================================================================== */

export function downloadExperimentPDF(experiment: Experiment) {
  const doc = new jsPDF(PAGE);
  doc.setProperties({
    title: `${experiment.id.toUpperCase()} - ${experiment.title}`,
    subject: "Digital Image Processing - Lab Report",
    creator: "Pixel-Lab",
  });

  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  const contentW = pageW - M.left - M.right;
  const contentTop = M.top;
  const contentBottom = pageH - M.bottom;

  let y = contentTop;
  let sectionNum = 0;
  let acc: Accent = A.navy; // accent of the section currently being written

  /* ---------------- small helpers ---------------- */

  const setFill = (c: RGB) => doc.setFillColor(c[0], c[1], c[2]);
  const setStroke = (c: RGB) => doc.setDrawColor(c[0], c[1], c[2]);
  const setInk = (c: RGB) => doc.setTextColor(c[0], c[1], c[2]);

  const useFont = (
    name: "helvetica" | "courier",
    style: "normal" | "bold",
    size: number,
    color: RGB
  ) => {
    doc.setFont(name, style);
    doc.setFontSize(size);
    setInk(color);
  };

  const hline = (x1: number, x2: number, yy: number, color: RGB, w: number) => {
    setStroke(color);
    doc.setLineWidth(w);
    doc.line(x1, yy, x2, yy);
  };

  const truncate = (s: string, maxW: number) => {
    if (doc.getTextWidth(s) <= maxW) return s;
    let t = s;
    while (t.length > 1 && doc.getTextWidth(t + "...") > maxW) t = t.slice(0, -1);
    return t + "...";
  };

  const wrap = (
    text: string,
    width: number,
    style: "normal" | "bold" = "normal",
    size = BODY_PT
  ): string[] => {
    doc.setFont("helvetica", style);
    doc.setFontSize(size);
    return doc.splitTextToSize(text, width) as string[];
  };

  /* ---------------- page furniture (drawn once, after content) ---------------- */

  const drawPageFurniture = (page: number, total: number) => {
    // Outer page border
    setStroke(C.rule);
    doc.setLineWidth(0.8);
    doc.rect(FRAME, FRAME, pageW - FRAME * 2, pageH - FRAME * 2, "S");

    // ---- Header ----
    setFill(C.brand);
    doc.roundedRect(M.left, 32, 24, 24, 4, 4, "F");
    useFont("helvetica", "bold", 10, [255, 255, 255]);
    doc.text("PL", M.left + 12, 47.5, { align: "center" });

    useFont("helvetica", "bold", 12.5, C.dark);
    doc.text("Pixel-Lab", M.left + 33, 43);
    useFont("helvetica", "normal", 8.5, C.muted);
    doc.text("Digital Image Processing Laboratory", M.left + 33, 54);

    useFont("helvetica", "bold", 8.5, A.teal.main);
    doc.text("LAB REPORT", pageW - M.right, 43, { align: "right" });
    useFont("helvetica", "normal", 8.5, C.muted);
    doc.text(truncate(experiment.title, 240), pageW - M.right, 54, { align: "right" });

    // Double rule under the header
    hline(M.left, pageW - M.right, 64, C.brand, 1);
    hline(M.left, pageW - M.right, 67.5, C.gold, 0.5);

    // ---- Footer ----
    hline(M.left, pageW - M.right, pageH - 52, C.rule, 0.6);
    hline(M.left, pageW - M.right, pageH - 49, C.ruleSoft, 0.4);

    useFont("helvetica", "normal", 8.5, C.muted);
    doc.text("Pixel-Lab  ·  Virtual DIP Laboratory", M.left, pageH - 36);
    doc.text(`Page ${page} of ${total}`, pageW / 2, pageH - 36, { align: "center" });
    doc.text(experiment.id.toUpperCase(), pageW - M.right, pageH - 36, { align: "right" });
  };

  const newPage = () => {
    doc.addPage();
    y = contentTop;
  };

  const ensurePage = (needed: number) => {
    if (y + needed > contentBottom) newPage();
  };

  /* ---------------- title block (first page) ---------------- */

  const titleBlock = () => {
    useFont("helvetica", "bold", 8.5, A.teal.main);
    doc.text("LAB REPORT  ·  DIGITAL IMAGE PROCESSING", M.left, y);
    y += 24;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(21);
    setInk(C.dark);
    const titleLines = doc.splitTextToSize(experiment.title, contentW) as string[];
    titleLines.forEach((ln, i) => {
      doc.text(ln, M.left, y);
      if (i < titleLines.length - 1) y += 26;
    });

    // Accent rule under the title
    y += 14;
    hline(M.left + 60, pageW - M.right, y, C.rule, 0.5);
    hline(M.left, M.left + 60, y, C.gold, 1.4);
    y += 20;

    // Meta card
    const dateStr = new Date().toLocaleDateString("en-GB", {
      year: "numeric",
      month: "short",
      day: "2-digit",
    });
    const meta: [string, string][] = [
      ["DIFFICULTY", experiment.difficulty],
      ["ESTIMATED TIME", experiment.estimatedTime],
      ["EXPERIMENT ID", experiment.id.toUpperCase()],
      ["DATE", dateStr],
    ];
    const cardH = 48;
    const colW = contentW / meta.length;

    setFill(C.panel);
    setStroke(C.rule);
    doc.setLineWidth(0.7);
    doc.rect(M.left, y, contentW, cardH, "FD");
    // Colour-coded top edge, one segment per cell
    const metaColors = [A.navy, A.teal, A.indigo, A.amber];
    meta.forEach((_, i) => {
      setFill(metaColors[i % metaColors.length].main);
      doc.rect(M.left + colW * i, y, colW, 2, "F");
    });

    meta.forEach(([label, value], i) => {
      const x = M.left + colW * i;
      if (i > 0) {
        setStroke(C.rule);
        doc.setLineWidth(0.6);
        doc.line(x, y + 11, x, y + cardH - 9);
      }
      useFont("helvetica", "bold", 7.5, C.muted);
      doc.text(label, x + 14, y + 21);
      useFont("helvetica", "bold", 11, C.dark);
      doc.text(truncate(value, colW - 24), x + 14, y + 37);
    });

    y += cardH + 16;
  };

  /* ---------------- section heading ---------------- */

  const sectionHeading = (title: string, accent: Accent = A.navy) => {
    ensurePage(72); // keep heading with at least a few lines of content
    y += 8;
    const n = ++sectionNum;
    acc = accent;

    // Number badge
    setFill(acc.main);
    doc.roundedRect(M.left, y - 14.5, 21, 21, 3, 3, "F");
    useFont("helvetica", "bold", 10, [255, 255, 255]);
    doc.text(String(n).padStart(2, "0"), M.left + 10.5, y - 0.5, { align: "center" });

    // Title
    useFont("helvetica", "bold", 13.5, acc.main);
    doc.text(title, M.left + 31, y);
    const tw = doc.getTextWidth(title);

    // Fine underline: full-width hairline + slightly heavier accent under the label
    hline(M.left, pageW - M.right, y + 10, C.rule, 0.4);
    hline(M.left, M.left + 31 + tw, y + 10, acc.main, 0.9);

    y += 30;
  };

  /* ---------------- rich text (paragraphs / bullets / callouts) ---------------- */

  const renderBlocks = (blocks: Block[], opts: { callout?: boolean } = {}) => {
    const callout = !!opts.callout;
    const padL = callout ? 16 : 0;
    const padR = callout ? 14 : 0;
    const textX = M.left + padL;
    const textW = contentW - padL - padR;

    const rowTop = () => y - 10.5;
    const paintRow = (top: number, h: number) => {
      setFill(acc.tint);
      doc.rect(M.left, top, contentW, h + 0.6, "F");
      setFill(acc.main);
      doc.rect(M.left, top, 3, h + 0.6, "F");
    };
    const gap = (h: number) => {
      if (callout) paintRow(rowTop(), h);
      y += h;
    };

    const writeLines = (
      lines: string[],
      x: number,
      style: "normal" | "bold",
      size: number,
      color: RGB,
      marker?: () => void
    ) => {
      lines.forEach((ln, li) => {
        ensurePage(LINE_H);
        if (callout) paintRow(rowTop(), LINE_H);
        if (li === 0 && marker) marker();
        useFont("helvetica", style, size, color);
        doc.text(ln, x, y);
        y += LINE_H;
      });
    };

    if (callout) {
      y += 5;
      ensurePage(LINE_H + 14);
      paintRow(rowTop() - 6, 6);
    }

    blocks.forEach((b, bi) => {
      if (b.kind === "h") {
        if (bi > 0) gap(5);
        ensurePage(LINE_H * 2 + 6);
        writeLines(wrap(b.text, textW, "bold", 11), textX, "bold", 11, acc.main);
        gap(2);
      } else if (b.kind === "p") {
        writeLines(wrap(b.text, textW), textX, "normal", BODY_PT, C.text);
        gap(5);
      } else if (b.kind === "ul") {
        const indent = 14;
        writeLines(wrap(b.text, textW - indent), textX + indent, "normal", BODY_PT, C.text, () => {
          setFill(acc.main);
          doc.circle(textX + 4, y - 3.6, 2.2, "F");
        });
        gap(3);
      } else {
        const indent = 22;
        writeLines(wrap(b.text, textW - indent), textX + indent, "normal", BODY_PT, C.text, () => {
          useFont("helvetica", "bold", BODY_PT, acc.main);
          doc.text(b.label, textX, y);
        });
        gap(3);
      }
    });

    if (callout) gap(6);
    y += callout ? 8 : 4;
  };

  const body = (text: string) => renderBlocks(toBlocks(text));

  /* ---------------- formula box ---------------- */

  const formulaBox = (formula: string) => {
    const padX = 16;
    const padY = 11;
    const lineH = 15;

    doc.setFont("courier", "normal");
    doc.setFontSize(10);
    const rows: string[] = [];
    inlineMath(formula)
      .split("\n")
      .filter(Boolean)
      .forEach((l) => {
        rows.push(...(doc.splitTextToSize(l, contentW - padX * 2 - 6) as string[]));
      });

    const boxH = rows.length * lineH + padY * 2 - 4;
    ensurePage(boxH + 12);
    const top = y - 6;

    setFill(acc.tint);
    setStroke(acc.main);
    doc.setLineWidth(0.5);
    doc.rect(M.left, top, contentW, boxH, "FD");
    setFill(acc.main);
    doc.rect(M.left, top, 3.5, boxH, "F");

    useFont("courier", "normal", 10, C.dark);
    let yy = top + padY + 6;
    rows.forEach((r) => {
      doc.text(r, M.left + padX, yy);
      yy += lineH;
    });

    y = top + boxH + 14;
  };

  /* ---------------- code box (line numbers, splits across pages) ---------------- */

  const codeBox = (code: string) => {
    const FS = 8.3;
    const lineH = 11.4;
    const padY = 8;
    const padX = 8;
    const gutterW = 30;
    const barH = 19;

    doc.setFont("courier", "normal");
    doc.setFontSize(FS);
    const charW = doc.getTextWidth("M");
    const maxChars = Math.max(20, Math.floor((contentW - gutterW - padX * 2) / charW));

    // Hard-wrap long lines on characters so indentation is preserved.
    type Row = { no: number | null; text: string };
    const rows: Row[] = [];
    code
      .replace(/\r/g, "")
      .replace(/\t/g, "    ")
      .replace(/\s+$/, "")
      .split("\n")
      .forEach((raw, idx) => {
        const line = raw.replace(/\s+$/, "");
        if (line.length <= maxChars) {
          rows.push({ no: idx + 1, text: line });
          return;
        }
        const lead = line.match(/^ */)?.[0].length ?? 0;
        const indent = Math.min(lead + 2, 16);
        rows.push({ no: idx + 1, text: line.slice(0, maxChars) });
        let rest = line.slice(maxChars);
        while (rest.length > 0) {
          const room = maxChars - indent;
          rows.push({ no: null, text: " ".repeat(indent) + rest.slice(0, room) });
          rest = rest.slice(room);
        }
      });

    let i = 0;
    let first = true;
    while (i < rows.length) {
      const bar = first ? barH : 0;
      const minNeeded = bar + padY * 2 + lineH * Math.min(3, rows.length - i);
      if (y + minNeeded > contentBottom) newPage();

      const availRows = Math.floor((contentBottom - y - 4 - bar - padY * 2) / lineH);
      const count = Math.max(1, Math.min(rows.length - i, availRows));
      const chunk = rows.slice(i, i + count);
      i += count;

      const boxH = bar + padY * 2 + count * lineH;
      const top = y;

      // Body + gutter
      setFill(C.codeBg);
      doc.rect(M.left, top, contentW, boxH, "F");
      setFill(C.panel);
      doc.rect(M.left, top + bar, gutterW, boxH - bar, "F");
      setStroke(C.rule);
      doc.setLineWidth(0.6);
      doc.line(M.left + gutterW, top + bar, M.left + gutterW, top + boxH);

      // Title bar (first chunk only)
      if (first) {
        setFill(C.codeBar);
        doc.rect(M.left, top, contentW, barH, "F");
        setFill(C.gold);
        doc.rect(M.left, top + barH - 1.5, 44, 1.5, "F");
        useFont("helvetica", "bold", 7.5, [255, 255, 255]);
        doc.text("PYTHON", M.left + 10, top + 12.5);
        useFont("helvetica", "normal", 7.5, [148, 163, 184]);
        doc.text("Reference implementation", pageW - M.right - 10, top + 12.5, { align: "right" });
      }

      // Outline
      setStroke(C.rule);
      doc.setLineWidth(0.6);
      doc.rect(M.left, top, contentW, boxH, "S");

      // Rows
      let yy = top + bar + padY + 6.5;
      chunk.forEach((r) => {
        if (r.no !== null) {
          useFont("courier", "normal", 7.5, C.muted);
          doc.text(String(r.no), M.left + gutterW - 6, yy, { align: "right" });
        }
        useFont("courier", "normal", FS, C.text);
        doc.text(r.text, M.left + gutterW + padX, yy);
        yy += lineH;
      });

      y = top + boxH + 12;
      first = false;
      if (i < rows.length) newPage();
    }
  };

  /* ---------------- lists ---------------- */

  const numberedList = (items: string[]) => {
    const indent = 30;
    items.forEach((item, i) => {
      const lines = wrap(stripMarkdown(item), contentW - indent);
      ensurePage(lines.length * LINE_H + 12);

      // Number badge
      setFill(acc.main);
      doc.circle(M.left + 9, y - 3.6, 9, "F");
      useFont("helvetica", "bold", 8.5, [255, 255, 255]);
      doc.text(String(i + 1), M.left + 9, y - 0.8, { align: "center" });

      useFont("helvetica", "normal", BODY_PT, C.text);
      lines.forEach((ln, li) => doc.text(ln, M.left + indent, y + li * LINE_H));

      const lastBase = y + (lines.length - 1) * LINE_H;
      if (i < items.length - 1) {
        hline(M.left + indent, pageW - M.right, lastBase + 8, C.ruleSoft, 0.6);
        y = lastBase + 24;
      } else {
        y = lastBase + LINE_H + 4;
      }
    });
    y += 4;
  };

  const bulletList = (items: string[]) => {
    const indent = 18;
    items.forEach((item) => {
      const lines = wrap(stripMarkdown(item), contentW - indent);
      ensurePage(lines.length * LINE_H + 6);

      setFill(acc.main);
      doc.circle(M.left + 5, y - 3.6, 2.3, "F");

      useFont("helvetica", "normal", BODY_PT, C.text);
      lines.forEach((ln, li) => doc.text(ln, M.left + indent, y + li * LINE_H));
      y += lines.length * LINE_H + 4;
    });
    y += 4;
  };

  /* ---------------- end-of-report marker ---------------- */

  const endMark = () => {
    ensurePage(40);
    y += 12;
    const label = "END OF EXPERIMENT (System Generated Document)";
    useFont("helvetica", "bold", 8, C.muted);
    const tw = doc.getTextWidth(label);
    const cx = pageW / 2;
    hline(M.left, cx - tw / 2 - 14, y - 2.5, C.rule, 0.6);
    hline(cx + tw / 2 + 14, pageW - M.right, y - 2.5, C.rule, 0.6);
    doc.text(label, cx, y, { align: "center" });
    y += 12;
  };

  /* ==================================================================
   * Content                                                          *
   * ================================================================== */

  titleBlock();

  sectionHeading("Aim", A.navy);
  body(experiment.aim);

  sectionHeading("Core Concept", A.teal);
  body(experiment.coreConcept);

  if (experiment.formula) {
    sectionHeading("Formula / Key Idea", A.indigo);
    formulaBox(experiment.formula);
  }

  if (experiment.intuition) {
    sectionHeading("Intuition", A.amber);
    renderBlocks(toBlocks(experiment.intuition), { callout: true });
  }

  if (experiment.theory) {
    sectionHeading("Theory", A.navy);
    body(experiment.theory);
  }

  if (experiment.procedure?.length) {
    sectionHeading("Procedure", A.emerald);
    numberedList(experiment.procedure);
  }

  if (experiment.pythonCode) {
    sectionHeading("Reference Python Code", A.slate);
    codeBox(experiment.pythonCode);
  }

  if (experiment.thinkAbout?.length) {
    sectionHeading("Think About It", A.rose);
    bulletList(experiment.thinkAbout);
  }

  if (experiment.applications?.length) {
    sectionHeading("Applications", A.teal);
    bulletList(experiment.applications);
  }

  if (experiment.resources?.length) {
    sectionHeading("Further Reading", A.navy);
    autoTable(doc, {
      startY: y - 4,
      theme: "grid",
      margin: { top: contentTop, bottom: M.bottom, left: M.left, right: M.right },
      head: [["Type", "Title", "Link"]],
      body: experiment.resources.map((r) => [
        r.type.toUpperCase(),
        r.title + (r.source ? ` — ${r.source}` : ""),
        r.url,
      ]),
      styles: {
        font: "helvetica",
        fontSize: 9,
        cellPadding: { top: 6, right: 8, bottom: 6, left: 8 },
        overflow: "linebreak",
        lineColor: C.rule,
        lineWidth: 0.4,
        textColor: C.text,
        valign: "middle",
      },
      headStyles: {
        fillColor: C.brand,
        textColor: 255,
        fontStyle: "bold",
        fontSize: 8.5,
        halign: "left",
      },
      alternateRowStyles: { fillColor: [248, 250, 252] },
      columnStyles: {
        0: { cellWidth: 58, fontStyle: "bold", fontSize: 8 },
        1: { cellWidth: 190 },
        2: { cellWidth: contentW - 248, fontSize: 8, textColor: A.navy.main },
      },
      didParseCell: (data) => {
        // Colour-code the Type column per resource type
        if (data.section === "body" && data.column.index === 0) {
          const a = typeAccent(String(data.cell.raw ?? ""));
          data.cell.styles.textColor = a.main;
          data.cell.styles.fillColor = a.tint;
        }
      },
      didDrawCell: (data) => {
        if (data.section === "body" && data.column.index === 2) {
          const url = String(data.cell.raw ?? "");
          if (/^https?:\/\//i.test(url)) {
            doc.link(data.cell.x, data.cell.y, data.cell.width, data.cell.height, { url });
          }
        }
      },
    });
    y =
      (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 14;
  }

  endMark();

  /* ---------------- finalize: header / footer / border on every page ---------------- */

  const total = doc.getNumberOfPages();
  for (let p = 1; p <= total; p++) {
    doc.setPage(p);
    drawPageFurniture(p, total);
  }

  doc.save(`${experiment.id}-${slug(experiment.title)}.pdf`);
}