import React from "react";

export const LabSlider: React.FC<{
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  unit?: string;
  displayValue?: string;
  onChange: (v: number) => void;
}> = ({
  label,
  value,
  min,
  max,
  step = 1,
  unit = "",
  displayValue,
  onChange,
}) => (
  <div className="space-y-1.5">
    <div className="flex justify-between items-baseline">
      <label className="text-sm font-medium text-slate-700">{label}</label>
      <span className="text-sm font-mono text-brand-700 tabular-nums">
        {displayValue ?? `${value}${unit}`}
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
  </div>
);