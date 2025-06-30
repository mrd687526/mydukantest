"use client";

import { useEffect, useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/sonner";

type Block = { id: string; type: string; content: string; imageUrl?: string; buttonLabel?: string };

const DEFAULT_BLOCKS: Block[] = [
  { id: "1", type: "heading", content: "Welcome to your page!" },
  { id: "2", type: "text", content: "Drag and drop blocks to build your page." },
];

export default function DragDropEditorPage() {
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const dragItem = useRef<number | null>(null);
  const dragOverItem = useRef<number | null>(null);

  // Load blocks from Supabase
  useEffect(() => {
    fetch("/api/store-page?slug=home")
      .then(res => res.json())
      .then(res => {
        if (res.data && Array.isArray(res.data.blocks)) setBlocks(res.data.blocks);
        else setBlocks(DEFAULT_BLOCKS);
      })
      .finally(() => setLoading(false));
  }, []);

  const addBlock = (type: string) => {
    if (type === "image") {
      setBlocks([
        ...blocks,
        { id: Date.now().toString(), type, content: "", imageUrl: "" },
      ]);
    } else if (type === "button") {
      setBlocks([
        ...blocks,
        { id: Date.now().toString(), type, content: "", buttonLabel: "Click Me" },
      ]);
    } else {
      setBlocks([
        ...blocks,
        { id: Date.now().toString(), type, content: type === "heading" ? "New Heading" : "New Text" },
      ]);
    }
  };

  const updateBlock = (id: string, content: string, extra?: Partial<Block>) => {
    setBlocks(blocks.map(b => b.id === id ? { ...b, content, ...extra } : b));
  };

  const deleteBlock = (id: string) => {
    setBlocks(blocks.filter(b => b.id !== id));
  };

  // Drag and drop handlers
  const handleDragStart = (index: number) => {
    dragItem.current = index;
  };

  const handleDragEnter = (index: number) => {
    dragOverItem.current = index;
  };

  const handleDragEnd = () => {
    const from = dragItem.current;
    const to = dragOverItem.current;
    if (from === null || to === null || from === to) {
      dragItem.current = null;
      dragOverItem.current = null;
      return;
    }
    const updatedBlocks = [...blocks];
    const [removed] = updatedBlocks.splice(from, 1);
    updatedBlocks.splice(to, 0, removed);
    setBlocks(updatedBlocks);
    dragItem.current = null;
    dragOverItem.current = null;
  };

  const saveBlocks = async () => {
    setSaving(true);
    const res = await fetch("/api/store-page", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slug: "home", data: { blocks } }),
    });
    setSaving(false);
    if (res.ok) {
      toast.success("Page saved!");
    } else {
      toast.error("Failed to save page.");
    }
  };

  return (
    <div className="max-w-3xl mx-auto py-8">
      <h1 className="text-2xl font-bold mb-4">Drag and Drop Editor</h1>
      <div className="flex gap-2 mb-4 flex-wrap">
        <Button onClick={() => addBlock("heading")}>Add Heading</Button>
        <Button onClick={() => addBlock("text")}>Add Text</Button>
        <Button onClick={() => addBlock("image")}>Add Image</Button>
        <Button onClick={() => addBlock("button")}>Add Button</Button>
      </div>
      {loading ? (
        <div>Loading...</div>
      ) : (
        <div className="space-y-4">
          {blocks.map((block, idx) => (
            <div
              key={block.id}
              className="bg-white p-4 rounded shadow flex items-start gap-2 group"
              draggable
              onDragStart={() => handleDragStart(idx)}
              onDragEnter={() => handleDragEnter(idx)}
              onDragEnd={handleDragEnd}
              style={{ opacity: dragItem.current === idx ? 0.5 : 1, cursor: "grab" }}
            >
              <div className="flex-1">
                {block.type === "heading" ? (
                  <input
                    className="text-xl font-bold w-full"
                    value={block.content}
                    onChange={e => updateBlock(block.id, e.target.value)}
                  />
                ) : block.type === "text" ? (
                  <textarea
                    className="w-full"
                    value={block.content}
                    onChange={e => updateBlock(block.id, e.target.value)}
                  />
                ) : block.type === "image" ? (
                  <div>
                    <input
                      className="w-full mb-2"
                      placeholder="Image URL"
                      value={block.imageUrl || ""}
                      onChange={e => updateBlock(block.id, block.content, { imageUrl: e.target.value })}
                    />
                    {block.imageUrl && (
                      <img src={block.imageUrl} alt="Block" className="max-h-40 rounded" />
                    )}
                  </div>
                ) : block.type === "button" ? (
                  <div className="flex gap-2 items-center">
                    <input
                      className="w-full"
                      value={block.buttonLabel || ""}
                      onChange={e => updateBlock(block.id, block.content, { buttonLabel: e.target.value })}
                      placeholder="Button Label"
                    />
                  </div>
                ) : null}
              </div>
              <Button
                variant="destructive"
                size="icon"
                className="opacity-0 group-hover:opacity-100 transition"
                onClick={() => deleteBlock(block.id)}
                title="Delete block"
              >
                ×
              </Button>
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
            ) : block.type === "text" ? (
              <p key={block.id} className="mb-4">{block.content}</p>
            ) : block.type === "image" ? (
              block.imageUrl ? (
                <img key={block.id} src={block.imageUrl} alt="Block" className="max-h-40 rounded mb-4" />
              ) : null
            ) : block.type === "button" ? (
              <button
                key={block.id}
                className="px-4 py-2 bg-blue-600 text-white rounded font-semibold mb-4"
              >
                {block.buttonLabel || "Click Me"}
              </button>
            ) : null
          )}
        </div>
      </div>
    </div>
  );
}