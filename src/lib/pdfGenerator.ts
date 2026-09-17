import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import type { Experiment, Operation } from "../types";
import { getOperation } from "../data/operations";

export function downloadExperimentPDF(experiment: Experiment) {
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const pageW = doc.internal.pageSize.getWidth();
  const margin = 40;
  let y = margin;

  // Header
  doc.setFillColor(28, 98, 245);
  doc.rect(0, 0, pageW, 60, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(18);
  doc.text("Pixel-Lab — Digital Image Processing Virtual Lab", margin, 38);
  doc.setTextColor(20, 20, 20);
  y = 90;

  // Title
  doc.setFontSize(16);
  doc.text(experiment.title, margin, y);
  y += 8;
  doc.setDrawColor(200);
  doc.line(margin, y, pageW - margin, y);
  y += 20;

  // Meta
  doc.setFontSize(11);
  doc.text(`Difficulty: ${experiment.difficulty}   |   Estimated time: ${experiment.estimatedTime}`, margin, y);
  y += 24;

  // Aim
  doc.setFontSize(13);
  doc.text("Aim", margin, y);
  y += 16;
  doc.setFontSize(11);
  y = writeWrapped(doc, experiment.aim, margin, y, pageW - 2 * margin);
  y += 10;

  // Theory
  doc.setFontSize(13);
  doc.text("Theory", margin, y);
  y += 16;
  doc.setFontSize(11);
  y = writeWrapped(doc, experiment.theory, margin, y, pageW - 2 * margin);
  y += 10;

  // Operations
  doc.setFontSize(13);
  doc.text("Operations & Parameters", margin, y);
  y += 16;

  experiment.operationIds.forEach((opId, idx) => {
    const op = getOperation(opId) as Operation | undefined;
    if (!op) return;
    if (y > 720) { doc.addPage(); y = margin; }
    doc.setFontSize(12);
    doc.text(`${idx + 1}. ${op.name}`, margin, y);
    y += 14;
    doc.setFontSize(10);
    y = writeWrapped(doc, op.description, margin + 12, y, pageW - 2 * margin - 12);
    y += 6;

    if (op.parameters.length) {
      autoTable(doc, {
        startY: y,
        margin: { left: margin + 12 },
        head: [["Parameter", "Type", "Default", "Range / Options"]],
        body: op.parameters.map((p) => [
          p.label,
          p.type,
          String(p.default),
          p.type === "range"
            ? `${p.min} – ${p.max} (step ${p.step})`
            : p.type === "select"
            ? (p.options ?? []).map((o) => o.label).join(", ")
            : "—",
        ]),
        styles: { fontSize: 9 },
        headStyles: { fillColor: [28, 98, 245] },
      });
      // @ts-expect-error lastAutoTable is injected
      y = (doc as any).lastAutoTable.finalY + 12;
    }
  });

  // Python code
  if (y > 640) { doc.addPage(); y = margin; }
  doc.setFontSize(13);
  doc.text("Reference Python Code", margin, y);
  y += 14;
  experiment.operationIds.forEach((opId) => {
    const op = getOperation(opId) as Operation | undefined;
    if (!op) return;
    if (y > 720) { doc.addPage(); y = margin; }
    doc.setFont("courier", "normal");
    doc.setFontSize(9);
    const lines = doc.splitTextToSize(op.pythonCode, pageW - 2 * margin);
    doc.text(lines, margin, y);
    y += lines.length * 11 + 10;
    doc.setFont("helvetica", "normal");
  });

  // Resources
  if (experiment.resources.length) {
    if (y > 680) { doc.addPage(); y = margin; }
    doc.setFontSize(13);
    doc.text("Further Reading & Resources", margin, y);
    y += 14;
    autoTable(doc, {
      startY: y,
      margin: { left: margin },
      head: [["Type", "Title", "Link"]],
      body: experiment.resources.map((r) => [r.type.toUpperCase(), r.title, r.url]),
      styles: { fontSize: 9, cellWidth: "wrap" },
      columnStyles: { 2: { cellWidth: 220 } },
      headStyles: { fillColor: [28, 98, 245] },
    });
  }

  // Footer
  const total = doc.getNumberOfPages();
  for (let i = 1; i <= total; i++) {
    doc.setPage(i);
    doc.setFontSize(9);
    doc.setTextColor(120);
    doc.text(
      `Pixel-Lab · Experiment ${experiment.id.toUpperCase()} · Page ${i} of ${total}`,
      margin,
      doc.internal.pageSize.getHeight() - 20
    );
  }

  doc.save(`${experiment.id}-${slug(experiment.title)}.pdf`);
}

function writeWrapped(doc: jsPDF, text: string, x: number, y: number, width: number) {
  const lines = doc.splitTextToSize(text, width);
  doc.text(lines, x, y);
  return y + lines.length * 14;
}

function slug(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}