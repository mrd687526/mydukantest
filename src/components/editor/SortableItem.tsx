"use client";

import React from "react";

export function SortableItem({
  id,
  children,
}: {
  id: string;
  children: React.ReactNode;
}) {
  // All dnd-kit related code has been removed for debugging purposes.
  // This component will now render as a static div.

  return (
    <div>
      {children}
    </div>
  );
}