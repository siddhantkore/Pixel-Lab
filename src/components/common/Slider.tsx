import React from "react";

type Props = {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  unit?: string;
  help?: string;
  onChange: (v: number) => void;
};

export const Slider: React.FC<Props> = ({
  label,
  value,
  min,
  max,
  step = 1,
  unit = "",
  help,
  onChange,
}) => (
  <div className="space-y-1">
    <div className="flex justify-between items-center">
      <label className="text-sm font-medium text-slate-700">{label}</label>
      <span className="text-sm font-mono text-brand-700">
        {value}
        {unit}
      </span>
    </div>
    <input
      type="range"
      min={min}
      max={max}
      step={step}
      value={value}
      onChange={(e) => onChange(Number(e.target.value))}
      className="w-full accent-brand-600"
      aria-label={label}
    />
    {help && <p className="text-xs text-slate-500">{help}</p>}
  </div>
);