"use client";

import React from "react";

export const ContainerWidget = ({
  direction = "vertical",
  gap = 16,
  padding = 16,
  children,
}: {
  direction?: "vertical" | "horizontal";
  gap?: number;
  padding?: number;
  children?: React.ReactNode;
}) => {
  const style: React.CSSProperties = {
    display: "flex",
    flexDirection: direction === "vertical" ? "column" : "row",
    gap: `${gap}px`,
    padding: `${padding}px`,
  };
  return <div style={style}>{children}</div>;
};