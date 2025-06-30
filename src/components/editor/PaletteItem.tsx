"use client";

import React from "react";

export function PaletteItem({
  type,
  label,
  icon,
}: {
  type: string;
  label: string;
  icon: React.ReactNode;
}) {
  // All dnd-kit related code has been removed for debugging purposes.
  // This component will now render as a static div.

  return (
    <div
      className="flex flex-col items-center justify-center p-2 bg-gray-50 rounded-lg border border-gray-200 hover:bg-blue-50 hover:border-blue-400 cursor-grab transition-colors aspect-square"
    >
      {icon}
      <span className="text-xs mt-2 font-medium text-gray-700">{label}</span>
    </div>
  );
}