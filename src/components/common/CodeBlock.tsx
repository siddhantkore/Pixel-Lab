import React, { useState } from "react";
import { Copy, Check } from "lucide-react";

export const CodeBlock: React.FC<{ code: string; language?: string }> = ({
  code,
  language = "python",
}) => {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };
  return (
    <div className="relative rounded-lg overflow-hidden border border-slate-800 bg-slate-900">
      <div className="flex items-center justify-between px-3 py-2 bg-slate-800 text-slate-300 text-xs">
        <span className="font-mono">{language}</span>
        <button
          onClick={copy}
          className="inline-flex items-center gap-1 hover:text-white"
          aria-label="Copy code"
        >
          {copied ? <Check size={14} /> : <Copy size={14} />}
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
      <pre className="p-4 text-sm text-slate-100 overflow-x-auto">
        <code>{code}</code>
      </pre>
    </div>
  );
};