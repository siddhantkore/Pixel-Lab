import React from "react";

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary";
  size?: "sm" | "md";
};

export const Button: React.FC<Props> = ({
  variant = "primary",
  size = "md",
  className = "",
  children,
  ...rest
}) => {
  const base = "btn";
  const v = variant === "primary" ? "btn-primary" : "btn-secondary";
  const s = size === "sm" ? "text-sm px-3 py-1.5" : "";
  return (
    <button className={`${base} ${v} ${s} ${className}`} {...rest}>
      {children}
    </button>
  );
};