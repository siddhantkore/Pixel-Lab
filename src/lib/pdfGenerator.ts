import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import type { Experiment } from "../types";

export function downloadExperimentPDF(experiment: Experiment) {
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const pageW = doc.internal.pageSize.getWidth();
  const margin = 40;
  let y = margin;

  const ensurePage = (needed = 60) => {
    if (y + needed > doc.internal.pageSize.getHeight() - 40) {
      doc.addPage();
      y = margin;
    }
  };

  const heading = (t: string) => {
    ensurePage(40);
    doc.setFontSize(13);
    doc.setTextColor(20);
    doc.text(t, margin, y);
    y += 16;
  };

  const body = (t: string) => {
    doc.setFontSize(11);
    const lines = doc.splitTextToSize(t, pageW - 2 * margin);
    ensurePage(lines.length * 14 + 10);
    doc.text(lines, margin, y);
    y += lines.length * 14 + 8;
  };

  const mono = (t: string) => {
    doc.setFont("courier", "normal");
    doc.setFontSize(9);
    const lines = doc.splitTextToSize(t, pageW - 2 * margin);
    ensurePage(lines.length * 11 + 10);
    doc.text(lines, margin, y);
    y += lines.length * 11 + 10;
    doc.setFont("helvetica", "normal");
  };

  // Header
  doc.setFillColor(28, 98, 245);
  doc.rect(0, 0, pageW, 60, "F");
  doc.setTextColor(255);
  doc.setFontSize(16);
  doc.text("Pixel-Lab — Digital Image Processing Virtual Lab", margin, 38);

  doc.setTextColor(20);
  y = 90;

  // Title
  doc.setFontSize(18);
  doc.text(experiment.title, margin, y);
  y += 8;
  doc.setDrawColor(200);
  doc.line(margin, y, pageW - margin, y);
  y += 22;

  doc.setFontSize(11);
  doc.text(
    `Difficulty: ${experiment.difficulty}   |   Estimated time: ${experiment.estimatedTime}`,
    margin,
    y
  );
  y += 20;

  heading("Aim");
  body(experiment.aim);

  heading("Core Concept");
  body(experiment.coreConcept);

  if (experiment.formula) {
    heading("Formula / Key Idea");
    mono(experiment.formula);
  }

  if (experiment.intuition) {
    heading("Intuition");
    body(experiment.intuition);
  }

  if (experiment.theoryMarkdown) {
    heading("Theory");
    body(stripMarkdown(experiment.theoryMarkdown));
  }

  if (experiment.procedure.length) {
    heading("Procedure");
    experiment.procedure.forEach((s, i) => body(`${i + 1}. ${stripMarkdown(s)}`));
  }

  heading("Reference Python Code");
  mono(experiment.pythonCode);

  if (experiment.applications.length) {
    heading("Applications");
    experiment.applications.forEach((a) => body(`• ${stripMarkdown(a)}`));
  }

  if (experiment.resources.length) {
    heading("Further Reading");
    autoTable(doc, {
      startY: y,
      margin: { left: margin },
      head: [["Type", "Title", "Link"]],
      body: experiment.resources.map((r) => [r.type.toUpperCase(), r.title, r.url]),
      styles: { fontSize: 9, cellWidth: "wrap" },
      columnStyles: { 2: { cellWidth: 220 } },
      headStyles: { fillColor: [28, 98, 245] },
    });
    // @ts-expect-error autoTable adds this
    y = (doc as any).lastAutoTable.finalY + 10;
  }

  // Page footers
  const total = doc.getNumberOfPages();
  for (let i = 1; i <= total; i++) {
    doc.setPage(i);
    doc.setFontSize(9);
    doc.setTextColor(120);
    doc.text(
      `Pixel-Lab · ${experiment.id} · Page ${i} of ${total}`,
      margin,
      doc.internal.pageSize.getHeight() - 20
    );
  }

  doc.save(`${experiment.id}-${slug(experiment.title)}.pdf`);
}

function stripMarkdown(s: string) {
  return s
    .replace(/[`*_]/g, "")
    .replace(/^#+\s*/gm, "")
    .trim();
}

function slug(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}