"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { RenderEngine } from "@/components/editor/RenderEngine";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";

type Node = {
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
  const [selectedId, setSelectedId] = useState<string>("root");
  const sensors = useSensors(useSensor(PointerSensor));

  const addWidget = (type: string) => {
    const newNode: Node =
      type === "container"
        ? {
            id: `container-${Date.now()}`,
            type: "container",
            props: { direction: "vertical", gap: 16 },
            children: [],
          }
        : type === "heading"
        ? {
            id: `heading-${Date.now()}`,
            type: "heading",
            props: { text: "New Heading", align: "left" },
          }
        : type === "text"
        ? {
            id: `text-${Date.now()}`,
            type: "text",
            props: { content: "New text block." },
          }
        : type === "image"
        ? {
            id: `image-${Date.now()}`,
            type: "image",
            props: { src: "", alt: "" },
          }
        : type === "button"
        ? {
            id: `button-${Date.now()}`,
            type: "button",
            props: { label: "Click Me" },
          }
        : {
            id: `unknown-${Date.now()}`,
            type,
            props: {},
          };

    const selectedNode = findNodeById(tree, selectedId);
    if (selectedNode && selectedNode.type === "container") {
      setTree(
        updateNodeById(tree, selectedId, (n) => ({
          ...n,
          children: [...(n.children || []), newNode],
        }))
      );
    } else {
      setTree({
        ...tree,
        children: [...(tree.children || []), newNode],
      });
    }
  };

  const handleSelect = (id: string) => setSelectedId(id);

  const handleDelete = () => {
    if (selectedId === "root") return;
    setTree(deleteNodeById(tree, selectedId));
    setSelectedId("root");
  };

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;

    if (!over || active.id === over.id) {
      return;
    }

    setTree((prevTree) => {
      const activeNodeInfo = findNodeAndParent(prevTree, active.id as string);
      const overNodeInfo = findNodeAndParent(prevTree, over.id as string);

      if (
        !activeNodeInfo ||
        !overNodeInfo ||
        !activeNodeInfo.parent ||
        !overNodeInfo.parent
      ) {
        return prevTree;
      }

      // Handle reordering within the same container
      if (activeNodeInfo.parent.id === overNodeInfo.parent.id) {
        const parentNode = activeNodeInfo.parent;
        const oldIndex = parentNode.children!.findIndex(
          (child) => child.id === active.id
        );
        const newIndex = parentNode.children!.findIndex(
          (child) => child.id === over.id
        );

        const newChildren = arrayMove(parentNode.children!, oldIndex, newIndex);

        return updateNodeById(prevTree, parentNode.id, (n) => ({
          ...n,
          children: newChildren,
        }));
      }

      // Note: Moving between containers would be handled here in the future.

      return prevTree;
    });
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <div className="flex h-screen">
        {/* Palette */}
        <aside className="w-64 bg-gray-50 border-r p-4 flex flex-col">
          <h2 className="font-bold mb-4">Widgets</h2>
          <div className="space-y-2 mb-8">
            {WIDGETS.map((w) => (
              <Button
                key={w.type}
                variant="outline"
                className="w-full"
                onClick={() => addWidget(w.type)}
              >
                {w.label}
              </Button>
            ))}
          </div>
          <div className="mt-auto space-y-2">
            <Button
              variant="destructive"
              className="w-full"
              onClick={handleDelete}
              disabled={selectedId === "root"}
            >
              Delete Selected
            </Button>
            <Button variant="secondary" className="w-full" disabled>
              Site Settings
            </Button>
          </div>
        </aside>

        {/* Canvas */}
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
          {/* Control Bar */}
          <footer className="border-t bg-white p-3 flex gap-2 justify-end">
            <Button variant="outline" disabled>
              Undo
            </Button>
            <Button variant="outline" disabled>
              Redo
            </Button>
            <Button variant="default" disabled>
              Save
            </Button>
          </footer>
        </main>
      </div>
    </DndContext>
  );
}