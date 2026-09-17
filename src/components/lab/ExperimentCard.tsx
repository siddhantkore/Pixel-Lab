import React from "react";
import { Link } from "react-router-dom";
import { Clock, ArrowRight } from "lucide-react";
import type { Experiment } from "../../types";
import { Badge } from "../common/Badge";

export const ExperimentCard: React.FC<{ experiment: Experiment }> = ({
  experiment,
}) => (
  <Link
    to={`/experiments/${experiment.id}`}
    className="card p-5 flex flex-col gap-3 group hover:border-brand-300"
  >
    <div className="flex items-start justify-between gap-3">
      <h4 className="font-semibold text-slate-900 group-hover:text-brand-700">
        {experiment.title}
      </h4>
      <Badge>{experiment.difficulty}</Badge>
    </div>
    <p className="text-sm text-slate-600 line-clamp-2">{experiment.aim}</p>
    <div className="flex items-center justify-between text-xs text-slate-500 mt-auto pt-2">
      <span className="inline-flex items-center gap-1">
        <Clock size={13} /> {experiment.estimatedTime}
      </span>
      <span className="inline-flex items-center gap-1 text-brand-600 font-medium">
        Open <ArrowRight size={13} />
      </span>
    </div>
  </Link>
);