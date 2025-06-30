import React from "react";
export function HeadingWidget({ text, align = "left", children }: any) {
  return (
    <h2 style={{ textAlign: align }} className="text-2xl font-bold mb-2">
      {text}
      {children}
    </h2>
  );
}