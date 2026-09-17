import React from "react";
import type { ParameterDef } from "../../types";
import { Slider } from "../common/Slider";

export const ParameterSlider: React.FC<{
  def: ParameterDef;
  value: number | string | boolean;
  onChange: (v: number | string | boolean) => void;
}> = ({ def, value, onChange }) => {
  if (def.type === "range") {
    return (
      <Slider
        label={def.label}
        value={Number(value)}
        min={def.min ?? 0}
        max={def.max ?? 100}
        step={def.step ?? 1}
        unit={def.unit}
        help={def.help}
        onChange={onChange}
      />
    );
  }
  if (def.type === "select") {
    return (
      <div className="space-y-1">
        <label className="text-sm font-medium text-slate-700">{def.label}</label>
        <select
          value={String(value)}
          onChange={(e) => onChange(e.target.value)}
          className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white"
        >
          {def.options?.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        {def.help && <p className="text-xs text-slate-500">{def.help}</p>}
      </div>
    );
  }
  return (
    <label className="flex items-center gap-2 text-sm">
      <input
        type="checkbox"
        checked={Boolean(value)}
        onChange={(e) => onChange(e.target.checked)}
        className="accent-brand-600"
      />
      {def.label}
    </label>
  );
};