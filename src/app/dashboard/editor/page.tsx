"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { RenderEngine } from "@/components/editor/RenderEngine";
import { PropertiesPanel } from "@/components/editor/PropertiesPanel";
import { PaletteItem } from "@/components/editor/PaletteItem";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export type Node = {
  id: string;
  type: string;
  props: Record<string, any>;
  children?: Node[];
};

const DEFAULT_TREE: Node = {
  id: "root",
  type: "container",
  props: { direction: "vertical", gap: 24 },
  children: [
    {
      id: "heading-1",
      type: "heading",
      props: { text: "Welcome to your site!", align: "center" },
    },
    {
      id: "text-1",
      type: "text",
      props: { content: "Drag widgets from the left to build your page." },
    },
  ],
};

const WIDGETS = [
  { type: "heading", label: "Heading" },
  { type: "text", label: "Text" },
  { type: "image", label: "Image" },
  { type: "button", label: "Button" },
  { type: "container", label: "Container" },
];

// Helper: Create a new node of a given type
function createNewNode(type: string): Node {
  const baseNode = { id: `${type}-${Date.now()}`, type };
  switch (type) {
    case "container":
      return {
        ...baseNode,
        props: { direction: "vertical", gap: 16 },
        children: [],
      };
    case "heading":
      return { ...baseNode, props: { text: "New Heading", align: "left" } };
    case "text":
      return { ...baseNode, props: { content: "New text block." } };
    case "image":
      return { ...baseNode, props: { src: "", alt: "" } };
    case "button":
      return { ...baseNode, props: { label: "Click Me" } };
    default:
      return { ...baseNode, props: {} };
  }
}

// Helper: Recursively find a node by id
function findNodeById(node: Node, id: string): Node | null {
  if (node.id === id) return node;
  if (!node.children) return null;
  for (const child of node.children) {
    const found = findNodeById(child, id);
    if (found) return found;
  }
  return null;
}

// Helper: Recursively update a node by id
function updateNodeById(
  node: Node,
  id: string,
  updater: (n: Node) => Node
): Node {
  if (node.id === id) return updater(node);
  if (!node.children) return node;
  return {
    ...node,
    children: node.children.map((child) => updateNodeById(child, id, updater)),
  };
}

// Helper: Recursively delete a node by id (except root)
function deleteNodeById(node: Node, id: string): Node {
  if (!node.children) return node;
  return {
    ...node,
    children: node.children
      .filter((child) => child.id !== id)
      .map((child) => deleteNodeById(child, id)),
  };
}

// Helper: Find a node and its parent
function findNodeAndParent(
  node: Node,
  id: string,
  parent: Node | null = null
): { node: Node; parent: Node | null } | null {
  if (node.id === id) return { node, parent };
  if (!node.children) return null;
  for (const child of node.children) {
    const found = findNodeAndParent(child, id, node);
    if (found) return found;
  }
  return null;
}

export default function EditorPage() {
  const [tree, setTree] = useState<Node>(DEFAULT_TREE);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const sensors = useSensors(useSensor(PointerSensor));

  const selectedNode = selectedId ? findNodeById(tree, selectedId) : null;

  useEffect(() => {
    const loadPage = async () => {
      const { data, error } = await supabase
        .from("editor_pages")
        .select("content")
        .eq("slug", "home")
        .single();
      if (error && error.code !== "PGRST116") {
        console.error("Error loading page:", error);
        toast.error("Failed to load page data.");
      }
      if (data?.content) setTree(data.content as Node);
    };
    loadPage();
  }, []);

  const handleSelect = (id: string) => setSelectedId(id);

  const handleDelete = () => {
    if (!selectedId || selectedId === "root") return;
    setTree(deleteNodeById(tree, selectedId));
    setSelectedId(null);
  };

  const handleUpdateProperty = (id: string, propName: string, value: any) => {
    setTree((prevTree) =>
      updateNodeById(prevTree, id, (node) => ({
        ...node,
        props: { ...node.props, [propName]: value },
      }))
    );
  };

  const handleSave = async () => {
    setIsSaving(true);
    const saveToast = toast.loading("Saving page...");
    const { error } = await supabase
      .from("editor_pages")
      .upsert({ slug: "home", content: tree }, { onConflict: "slug" });
    toast.dismiss(saveToast);
    if (error) {
      toast.error("Failed to save page.");
    } else {
      toast.success("Page saved successfully!");
    }
    setIsSaving(false);
  };

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    // Scenario 1: Dragging a new widget from the palette
    if (activeId.startsWith("palette-")) {
      const widgetType = active.data.current?.type;
      if (!widgetType) return;

      const newNode = createNewNode(widgetType);

      setTree((prevTree) => {
        const overNodeInfo = findNodeAndParent(prevTree, overId);
        if (!overNodeInfo) return prevTree;

        const overNode = overNodeInfo.node;
        const targetContainerId =
          overNode.type === "container" ? overNode.id : overNodeInfo.parent!.id;

        return updateNodeById(prevTree, targetContainerId, (container) => ({
          ...container,
          children: [...(container.children || []), newNode],
        }));
      });
      return;
    }

    // Scenario 2: Reordering an existing widget
    if (activeId !== overId) {
      setTree((prevTree) => {
        const activeNodeInfo = findNodeAndParent(prevTree, activeId);
        const overNodeInfo = findNodeAndParent(prevTree, overId);

        if (
          !activeNodeInfo?.parent ||
          !overNodeInfo?.parent ||
          activeNodeInfo.parent.id !== overNodeInfo.parent.id
        ) {
          return prevTree; // Only allow reordering within the same container for now
        }

        const parentNode = activeNodeInfo.parent;
        const oldIndex = parentNode.children!.findIndex((c) => c.id === activeId);
        const newIndex = parentNode.children!.findIndex((c) => c.id === overId);
        const newChildren = arrayMove(parentNode.children!, oldIndex, newIndex);

        return updateNodeById(prevTree, parentNode.id, (n) => ({
          ...n,
          children: newChildren,
        }));
      });
    }
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <div className="flex h-screen">
        <aside className="w-64 bg-gray-50 border-r flex flex-col">
          {selectedNode && selectedId !== "root" ? (
            <PropertiesPanel
              node={selectedNode}
              onUpdate={handleUpdateProperty}
              onBack={() => setSelectedId(null)}
            />
          ) : (
            <div className="p-4">
              <h2 className="font-bold mb-4">Widgets</h2>
              <div className="space-y-2">
                {WIDGETS.map((w) => (
                  <PaletteItem key={w.type} type={w.type} label={w.label} />
                ))}
              </div>
            </div>
          )}
          <div className="p-4 mt-auto border-t space-y-2">
            <Button
              variant="destructive"
              className="w-full"
              onClick={handleDelete}
              disabled={!selectedId || selectedId === "root"}
            >
              Delete Selected
            </Button>
            <Button variant="secondary" className="w-full" disabled>
              Site Settings
            </Button>
          </div>
        </aside>

        <main className="flex-1 flex flex-col bg-gray-100">
          <div className="flex-1 flex items-center justify-center overflow-auto">
            <div className="bg-white rounded shadow p-8 min-w-[600px] max-w-2xl w-full">
              <RenderEngine
                node={tree}
                selectedId={selectedId}
                onSelect={handleSelect}
              />
            </div>
          </div>
          <footer className="border-t bg-white p-3 flex gap-2 justify-end">
            <Button variant="outline" disabled>Undo</Button>
            <Button variant="outline" disabled>Redo</Button>
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving ? "Saving..." : "Save"}
            </Button>
          </footer>
        </main>
      </div>
    </DndContext>
  );
}