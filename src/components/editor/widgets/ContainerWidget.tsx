"use client";

import React from "react";

export const ContainerWidget = ({
  direction = "vertical",
  gap = 16,
  children,
}: {
  direction?: "vertical" | "horizontal";
  gap?: number;
  children?: React.ReactNode;
}) => {
  const style: React.CSSProperties = {
    display: "flex",
    flexDirection: direction === "vertical" ? "column" : "row",
    gap: `${gap}px`,
    padding: "1rem",
    border: "1px dashed #ccc",
    borderRadius: "4px",
    minHeight: "50px",
  };
  return <div style={style}>{children}</div>;
};