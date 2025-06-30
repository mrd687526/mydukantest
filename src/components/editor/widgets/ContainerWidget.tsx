"use client";

import React from "react";
import { useDroppable } from "@dnd-kit/core";

export const ContainerWidget = ({
  id,
  direction = "vertical",
  gap = 16,
  children,
}: {
  id: string;
  direction?: "vertical" | "horizontal";
  gap?: number;
  children?: React.ReactNode;
}) => {
  const { setNodeRef } = useDroppable({ id });

  const style: React.CSSProperties = {
    display: "flex",
    flexDirection: direction === "vertical" ? "column" : "row",
    gap: `${gap}px`,
    padding: "1rem",
    border: "1px dashed #ccc",
    borderRadius: "4px",
    minHeight: "50px",
  };
  return (
    <div ref={setNodeRef} style={style}>
      {children}
    </div>
  );
};