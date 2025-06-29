"use client";

import { MessageSquare } from 'lucide-react';

export function EditorSidebar() {
  const onDragStart = (event: React.DragEvent, nodeType: string) => {
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.effectAllowed = 'move';
  };

  return (
    <aside className="w-64 p-4 border-r bg-gray-50 dark:bg-gray-900">
      <h2 className="text-lg font-semibold mb-4">Nodes</h2>
      <div
        className="p-3 border rounded-md flex items-center gap-2 cursor-grab bg-white dark:bg-gray-800 shadow-sm"
        onDragStart={(event) => onDragStart(event, 'messageNode')}
        draggable
      >
        <MessageSquare className="h-5 w-5" />
        <span>Message</span>
      </div>
    </aside>
  );
}