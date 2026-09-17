import type { Experiment, Resource, ResourceType } from "../types";

/* --- Minimal YAML frontmatter parser (handles our use cases) --- */
type Frontmatter = Record<string, unknown>;

function parseValue(raw: string): unknown {
  const s = raw.trim();
  if (s === "" || s === "|" || s === ">") return "";
  // Block scalar (|) or (>) — we handle indented lines outside
  if (s.startsWith("[") && s.endsWith("]")) {
    return s
      .slice(1, -1)
      .split(",")
      .map((x) => x.trim().replace(/^["']|["']$/g, ""))
      .filter(Boolean);
  }
  if (s === "true") return true;
  if (s === "false") return false;
  if (/^-?\d+(\.\d+)?$/.test(s)) return Number(s);
  return s.replace(/^["']|["']$/g, "");
}

function parseFrontmatter(source: string): { data: Frontmatter; body: string } {
  const match = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/.exec(source);
  if (!match) return { data: {}, body: source };
  const [, fm, body] = match;

  const data: Frontmatter = {};
  const lines = fm.split(/\r?\n/);
  let i = 0;

  const readBlockScalar = (indent: number): string => {
    const out: string[] = [];
    while (i < lines.length) {
      const line = lines[i];
      if (line.trim() === "") {
        out.push("");
        i++;
        continue;
      }
      const lead = line.match(/^ */)![0].length;
      if (lead < indent) break;
      out.push(line.slice(indent));
      i++;
    }
    return out.join("\n").replace(/\s+$/, "");
  };

  const readList = (indent: number): unknown[] => {
    const items: unknown[] = [];
    while (i < lines.length) {
      const line = lines[i];
      const m = new RegExp(`^ {${indent}}-\\s?(.*)$`).exec(line);
      if (!m) break;
      const raw = m[1];
      i++;
      if (raw === "") continue;
      // Object item? (key: value on next indented lines)
      if (/^\w[\w-]*:\s/.test(raw)) {
        const obj: Record<string, unknown> = {};
        const [k, ...rest] = raw.split(":");
        obj[k.trim()] = parseValue(rest.join(":"));
        // read further indented keys
        while (i < lines.length) {
          const cont = new RegExp(`^ {${indent + 2}}(\\w[\\w-]*):\\s?(.*)$`).exec(lines[i]);
          if (!cont) break;
          obj[cont[1]] = parseValue(cont[2]);
          i++;
        }
        items.push(obj);
      } else {
        items.push(parseValue(raw));
      }
    }
    return items;
  };

  while (i < lines.length) {
    const line = lines[i];
    if (line.trim() === "" || line.trim().startsWith("#")) {
      i++;
      continue;
    }
    const m = /^(\w[\w-]*):\s*(.*)$/.exec(line);
    if (!m) {
      i++;
      continue;
    }
    const [, key, rest] = m;
    i++;

    if (rest === "|" || rest === ">") {
      // find indent of next non-empty line
      let indent = 2;
      for (let j = i; j < lines.length; j++) {
        if (lines[j].trim() === "") continue;
        indent = lines[j].match(/^ */)![0].length;
        break;
      }
      data[key] = readBlockScalar(indent);
      continue;
    }
    if (rest === "") {
      // list?
      if (i < lines.length && /^\s*-\s?/.test(lines[i])) {
        const indent = lines[i].match(/^ */)![0].length;
        data[key] = readList(indent);
        continue;
      }
      data[key] = "";
      continue;
    }
    data[key] = parseValue(rest);
  }

  return { data, body: body.trim() };
}

/* --- Load every experiment file at build time --- */
const rawFiles = import.meta.glob<string>("../content/experiments/*.md", {
  query: "?raw",
  import: "default",
  eager: true,
});

function coerceResources(input: unknown): Resource[] {
  if (!Array.isArray(input)) return [];
  return input.map((r) => {
    const o = r as Record<string, unknown>;
    return {
      type: (o.type as ResourceType) ?? "docs",
      title: String(o.title ?? ""),
      url: String(o.url ?? ""),
      source: o.source ? String(o.source) : undefined,
      year: typeof o.year === "number" ? o.year : undefined,
    };
  });
}

export const experiments: Experiment[] = Object.values(rawFiles).map((raw) => {
  const { data, body } = parseFrontmatter(raw);
  return {
    id: String(data.id),
    moduleId: String(data.moduleId),
    title: String(data.title),
    aim: String(data.aim ?? ""),
    difficulty: (data.difficulty as Experiment["difficulty"]) ?? "Beginner",
    estimatedTime: String(data.estimatedTime ?? "20 min"),
    sampleImage: data.sampleImage ? String(data.sampleImage) : undefined,
    operationIds: Array.isArray(data.operationIds)
      ? (data.operationIds as string[])
      : [],
    coreConcept: String(data.coreConcept ?? ""),
    formula: String(data.formula ?? ""),
    intuition: String(data.intuition ?? ""),
    procedure: Array.isArray(data.procedure) ? (data.procedure as string[]) : [],
    applications: Array.isArray(data.applications)
      ? (data.applications as string[])
      : [],
    pythonCode: String(data.pythonCode ?? ""),
    resources: coerceResources(data.resources),
    theoryMarkdown: body,
  };
});

export const getExperiment = (id: string) =>
  experiments.find((e) => e.id === id);

export const getExperimentsByModule = (moduleId: string) =>
  experiments.filter((e) => e.moduleId === moduleId);