import React from "react";
export function ContainerWidget({ direction = "vertical", gap = 16, children }: any) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: direction === "vertical" ? "column" : "row",
        gap,
      }}
      className="mb-4"
    >
      {children}
    </div>
  );
}