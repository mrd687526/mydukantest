"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

const initialBlocks = [
  { id: "1", type: "heading", content: "Welcome to your page!" },
  { id: "2", type: "text", content: "Drag and drop blocks to build your page." },
];

export default function DragDropEditorPage() {
  const [blocks, setBlocks] = useState(initialBlocks);

  const addBlock = (type: string) => {
    setBlocks([
      ...blocks,
      { id: Date.now().toString(), type, content: type === "heading" ? "New Heading" : "New Text" },
    ]);
  };

  const updateBlock = (id: string, content: string) => {
    setBlocks(blocks.map(b => b.id === id ? { ...b, content } : b));
  };

  // TODO: Save to Supabase and sync with storefront

  return (
    <div className="max-w-3xl mx-auto py-8">
      <h1 className="text-2xl font-bold mb-4">Drag and Drop Editor (Basic Demo)</h1>
      <div className="flex gap-2 mb-4">
        <Button onClick={() => addBlock("heading")}>Add Heading</Button>
        <Button onClick={() => addBlock("text")}>Add Text</Button>
      </div>
      <div className="space-y-4">
        {blocks.map(block => (
          <div key={block.id} className="bg-white p-4 rounded shadow">
            {block.type === "heading" ? (
              <input
                className="text-xl font-bold w-full"
                value={block.content}
                onChange={e => updateBlock(block.id, e.target.value)}
              />
            ) : (
              <textarea
                className="w-full"
                value={block.content}
                onChange={e => updateBlock(block.id, e.target.value)}
              />
            )}
          </div>
        ))}
      </div>
      <div className="mt-6">
        <Button variant="outline" disabled>
          Save (Demo Only)
        </Button>
      </div>
      <div className="mt-4 text-muted-foreground">
        <b>Note:</b> This is a basic starting point. A full Elementor clone would require a much larger system.
      </div>
    </div>
  );
}