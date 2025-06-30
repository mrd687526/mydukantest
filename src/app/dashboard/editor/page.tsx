"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

type Block = { id: string; type: string; content: string };

export default function DragDropEditorPage() {
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Load blocks from Supabase
  useEffect(() => {
    fetch("/api/store-page?slug=home")
      .then(res => res.json())
      .then(res => {
        if (res.data && Array.isArray(res.data.blocks)) setBlocks(res.data.blocks);
        else setBlocks([
          { id: "1", type: "heading", content: "Welcome to your page!" },
          { id: "2", type: "text", content: "Drag and drop blocks to build your page." },
        ]);
      })
      .finally(() => setLoading(false));
  }, []);

  const addBlock = (type: string) => {
    setBlocks([
      ...blocks,
      { id: Date.now().toString(), type, content: type === "heading" ? "New Heading" : "New Text" },
    ]);
  };

  const updateBlock = (id: string, content: string) => {
    setBlocks(blocks.map(b => b.id === id ? { ...b, content } : b));
  };

  const saveBlocks = async () => {
    setSaving(true);
    await fetch("/api/store-page", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slug: "home", data: { blocks } }),
    });
    setSaving(false);
  };

  return (
    <div className="max-w-3xl mx-auto py-8">
      <h1 className="text-2xl font-bold mb-4">Drag and Drop Editor</h1>
      <div className="flex gap-2 mb-4">
        <Button onClick={() => addBlock("heading")}>Add Heading</Button>
        <Button onClick={() => addBlock("text")}>Add Text</Button>
      </div>
      {loading ? (
        <div>Loading...</div>
      ) : (
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
      )}
      <div className="mt-6 flex gap-2">
        <Button onClick={saveBlocks} disabled={saving}>
          {saving ? "Saving..." : "Save"}
        </Button>
        <Button variant="outline" onClick={() => window.open("/store", "_blank")}>
          View Storefront
        </Button>
      </div>
      <div className="mt-8">
        <h2 className="text-lg font-semibold mb-2">Live Preview</h2>
        <div className="border rounded bg-white p-4">
          {blocks.map(block =>
            block.type === "heading" ? (
              <h2 key={block.id} className="text-2xl font-bold mb-2">{block.content}</h2>
            ) : (
              <p key={block.id} className="mb-4">{block.content}</p>
            )
          )}
        </div>
      </div>
    </div>
  );
}