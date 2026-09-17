import React from "react";

export const Card: React.FC<{
  className?: string;
  children: React.ReactNode;
  as?: React.ElementType;
}> = ({ className = "", children, as: Tag = "div" }) => (
  <Tag className={`card p-5 ${className}`}>{children}</Tag>
);