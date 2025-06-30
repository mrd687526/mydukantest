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
  };
  return <div style={style}>{children}</div>;
};