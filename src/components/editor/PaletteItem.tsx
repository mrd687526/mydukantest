"use client";

import { useDraggable } from "@dnd-kit/core";
import { Button } from "@/components/ui/button";
import React from "react";

export function PaletteItem({ type, label }: { type: string; label: string }) {
  const { attributes, listeners, setNodeRef } = useDraggable({
    id: `palette-${type}`,
    data: { type },
  });

  return (
    <div ref={setNodeRef} {...listeners} {...attributes}>
      <Button variant="outline" className="w-full cursor-grab">
        {label}
      </Button>
    </div>
  );
}