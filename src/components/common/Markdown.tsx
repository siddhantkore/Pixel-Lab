import React from "react";

/**
 * Very small markdown subset renderer:
 *  - paragraphs split on blank lines
 *  - **bold**, *italic*, `code`
 *  - lines starting with "- " become <li>
 *  - tables are NOT supported (keep it simple)
 */
function renderInline(text: string, keyPrefix: string): React.ReactNode[] {
  const nodes: React.ReactNode[] = [];
  const regex = /(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`)/g;
  let last = 0;
  let m: RegExpExecArray | null;
  let k = 0;
  while ((m = regex.exec(text))) {
    if (m.index > last) nodes.push(text.slice(last, m.index));
    const tok = m[0];
    if (tok.startsWith("**"))
      nodes.push(<strong key={`${keyPrefix}-b-${k++}`}>{tok.slice(2, -2)}</strong>);
    else if (tok.startsWith("`"))
      nodes.push(
        <code
          key={`${keyPrefix}-c-${k++}`}
          className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-800 text-[0.9em] font-mono"
        >
          {tok.slice(1, -1)}
        </code>
      );
    else nodes.push(<em key={`${keyPrefix}-i-${k++}`}>{tok.slice(1, -1)}</em>);
    last = m.index + tok.length;
  }
  if (last < text.length) nodes.push(text.slice(last));
  return nodes;
}

export const Markdown: React.FC<{ source: string; className?: string }> = ({
  source,
  className = "",
}) => {
  const blocks = source.split(/\n{2,}/);
  return (
    <div className={`prose-slate space-y-3 text-slate-700 leading-relaxed ${className}`}>
      {blocks.map((block, i) => {
        const lines = block.split("\n");
        const isList = lines.every((l) => l.trim().startsWith("- "));
        if (isList) {
          return (
            <ul key={i} className="list-disc list-inside space-y-1 text-sm">
              {lines.map((l, j) => (
                <li key={j}>{renderInline(l.replace(/^-\s?/, ""), `l${i}-${j}`)}</li>
              ))}
            </ul>
          );
        }
        if (block.startsWith("### ")) {
          return (
            <h4 key={i} className="text-base font-semibold text-slate-900 mt-4">
              {renderInline(block.slice(4), `h4-${i}`)}
            </h4>
          );
        }
        if (block.startsWith("## ")) {
          return (
            <h3 key={i} className="text-lg font-semibold text-slate-900 mt-4">
              {renderInline(block.slice(3), `h3-${i}`)}
            </h3>
          );
        }
        // Handle simple pipe tables
        if (lines.length >= 2 && lines[0].includes("|")) {
          const headers = lines[0].split("|").map((s) => s.trim()).filter(Boolean);
          const rows = lines.slice(2).map((l) =>
            l.split("|").map((s) => s.trim()).filter(Boolean)
          );
          return (
            <div key={i} className="overflow-x-auto">
              <table className="min-w-full text-sm border border-slate-200 rounded-lg overflow-hidden">
                <thead className="bg-slate-50">
                  <tr>
                    {headers.map((h, j) => (
                      <th key={j} className="text-left px-3 py-2 font-semibold text-slate-700 border-b">
                        {renderInline(h, `th${i}-${j}`)}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r, j) => (
                    <tr key={j} className="border-b last:border-0">
                      {r.map((c, k) => (
                        <td key={k} className="px-3 py-2 text-slate-700">
                          {renderInline(c, `td${i}-${j}-${k}`)}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          );
        }
        return (
          <p key={i} className="text-sm">
            {renderInline(block, `p-${i}`)}
          </p>
        );
      })}
    </div>
  );
};