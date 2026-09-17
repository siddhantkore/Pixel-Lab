import React, { useEffect, useMemo, useState } from "react";
import { Play, RotateCcw, Terminal } from "lucide-react";
import type { Operation } from "../../types";
import { Button } from "../common/Button";
import { ParameterSlider } from "./ParameterSlider";
import { CodeBlock } from "../common/CodeBlock";

type Props = {
  operation: Operation;
  onApply: (params: Record<string, any>) => Promise<void> | void;
  onReset: () => void;
  busy?: boolean;
};

export const OperationPanel: React.FC<Props> = ({
  operation,
  onApply,
  onReset,
  busy,
}) => {
  const defaults = useMemo(
    () =>
      Object.fromEntries(operation.parameters.map((p) => [p.id, p.default])),
    [operation]
  );
  const [params, setParams] = useState<Record<string, any>>(defaults);

  // Reset params whenever the operation changes
  useEffect(() => {
    setParams(defaults);
  }, [defaults]);

  const update = (k: string, v: any) => setParams((p) => ({ ...p, [k]: v }));

  return (
    <div className="space-y-5">
      <div>
        <h3 className="text-lg font-semibold text-slate-900">{operation.name}</h3>
        <p className="text-sm text-slate-600 mt-1">{operation.description}</p>
      </div>

      {operation.parameters.length > 0 && (
        <div className="space-y-4">
          {operation.parameters.map((p) => (
            <ParameterSlider
              key={p.id}
              def={p}
              value={params[p.id]}
              onChange={(v) => update(p.id, v)}
            />
          ))}
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        <Button onClick={() => onApply(params)} disabled={busy}>
          <Play size={14} /> {busy ? "Processing…" : "Apply operation"}
        </Button>
        <Button
          variant="secondary"
          onClick={() => {
            setParams(defaults);
            onReset();
          }}
        >
          <RotateCcw size={14} /> Reset
        </Button>
      </div>

      <div>
        <div className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-2">
          <Terminal size={14} /> Reference Python code
        </div>
        <CodeBlock code={operation.pythonCode} />
      </div>
    </div>
  );
};