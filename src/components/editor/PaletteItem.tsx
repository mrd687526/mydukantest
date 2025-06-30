"use client";

import { useDraggable } from "@dnd-kit/core";
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
  const { attributes, listeners, setNodeRef } = useDraggable({
    id: `palette-${type}`,
    data: { type },
  });

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      className="flex flex-col items-center justify-center p-2 bg-gray-50 rounded-lg border border-gray-200 hover:bg-blue-50 hover:border-blue-400 cursor-grab transition-colors aspect-square"
    >
      {icon}
      <span className="text-xs mt-2 font-medium text-gray-700">{label}</span>
    </div>
  );
}