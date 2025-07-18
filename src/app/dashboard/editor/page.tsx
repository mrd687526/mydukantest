"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { RenderEngine } from "@/components/editor/RenderEngine";
import { PropertiesPanel } from "@/components/editor/PropertiesPanel";
import PaletteItem from "@/components/editor/PaletteItem";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";
import { createBrowserClient } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  Heading1,
  Type,
  Image as ImageIcon,
  Pointer,
  Container,
  Trash2,
} from "lucide-react";

const supabase = createBrowserClient();

export type Node = {
  id: string;
  type: string;
  props: Record<string, any>;
  children?: Node[];
};

const DEFAULT_TREE: Node = {
  id: "root",
  type: "container",
  props: { direction: "vertical", gap: 24, padding: 32 },
  children: [
    {
      id: "heading-1",
      type: "heading",
      props: {
        text: "Welcome to Your Visually-Edited Site!",
        align: "center",
        fontSize: 36,
      },
    },
    {
      id: "text-1",
      type: "text",
      props: {
        content:
          "You can now drag widgets from the left panel, drop them here, and style them to create your perfect page.",
        align: "center",
        fontSize: 18,
      },
    },
  ],
};

const WIDGETS = [
  {
    type: "heading",
    label: "Heading",
    icon: <Heading1 className="h-8 w-8 text-gray-600" />,
  },
  {
    type: "text",
    label: "Text",
    icon: <Type className="h-8 w-8 text-gray-600" />,
  },
  {
    type: "image",
    label: "Image",
    icon: <ImageIcon className="h-8 w-8 text-gray-600" />,
  },
  {
    type: "button",
    label: "Button",
    icon: <Pointer className="h-8 w-8 text-gray-600" />,
  },
  {
    type: "container",
    label: "Container",
    icon: <Container className="h-8 w-8 text-gray-600" />,
  },
];

function createNewNode(type: string): Node {
  const baseNode = { id: `${type}-${Date.now()}`, type };
  switch (type) {
    case "container":
      return {
        ...baseNode,
        props: { direction: "vertical", gap: 16, padding: 16 },
        children: [],
      };
    case "heading":
      return {
        ...baseNode,
        props: { text: "New Heading", align: "left", fontSize: 24 },
      };
    case "text":
      return {
        ...baseNode,
        props: { content: "New text block.", align: "left", fontSize: 16 },
      };
    case "image":
      return { ...baseNode, props: { src: "", alt: "", href: "" } };
    case "button":
      return {
        ...baseNode,
        props: { label: "Click Me", variant: "default", href: "" },
      };
    default:
      return { ...baseNode, props: {} };
  }
}

function findNodeById(node: Node, id: string): Node | null {
  if (node.id === id) return node;
  if (!node.children) return null;
  for (const child of node.children) {
    const found = findNodeById(child, id);
    if (found) return found;
  }
  return null;
}

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

function deleteNodeById(node: Node, id: string): Node {
  if (!node.children) return node;
  return {
    ...node,
    children: node.children
      .filter((child) => child.id !== id)
      .map((child) => deleteNodeById(child, id)),
  };
}

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
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("You must be logged in to edit pages.");
        return;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("id")
        .eq("id", user.id)
        .single();

      if (!profile) {
        toast.error("Profile not found. Cannot load page.");
        return;
      }

      const res = await fetch(`/api/store-page?slug=home&profileId=${profile.id}`);
      if (res.ok) {
        const { data } = await res.json();
        if (data) setTree(data as Node);
      } else {
        const { error } = await res.json();
        console.error("Error loading page:", error);
        toast.error("Failed to load page data.");
      }
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
    const res = await fetch("/api/store-page", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slug: "home", data: tree }),
    });
    toast.dismiss(saveToast);
    if (!res.ok) {
      const { error } = await res.json();
      toast.error("Failed to save page.", { description: error });
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

    if (activeId.startsWith("palette-")) {
      const widgetType = active.data.current?.type;
      if (!widgetType) return;
      const newNode = createNewNode(widgetType);
      setTree((prevTree) => {
        const overNodeInfo = findNodeAndParent(prevTree, overId);
        if (!overNodeInfo) return prevTree;
        const { node: overNode, parent: overParent } = overNodeInfo;
        const targetContainerId =
          overNode.type === "container" ? overNode.id : overParent!.id;
        return updateNodeById(prevTree, targetContainerId, (container) => ({
          ...container,
          children: [...(container.children || []), newNode],
        }));
      });
      return;
    }

    if (activeId !== overId) {
      setTree((prevTree) => {
        const activeNodeInfo = findNodeAndParent(prevTree, activeId);
        const overNodeInfo = findNodeAndParent(prevTree, overId);
        if (
          !activeNodeInfo?.parent ||
          !overNodeInfo?.parent ||
          activeNodeInfo.parent.id !== overNodeInfo.parent.id
        ) {
          return prevTree;
        }
        const parentNode = activeNodeInfo.parent;
        const oldIndex = parentNode.children!.findIndex(
          (c) => c.id === activeId
        );
        const newIndex = parentNode.children!.findIndex(
          (c) => c.id === overId
        );
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
      <div className="flex h-screen bg-gray-200 font-sans">
        <aside className="w-[350px] bg-white border-r flex flex-col shadow-lg">
          <div className="p-4 border-b flex justify-between items-center">
            <h1 className="text-lg font-semibold">Elements</h1>
          </div>

          <div className="flex-1 overflow-y-auto">
            {selectedNode && selectedId !== "root" ? (
              <PropertiesPanel
                node={selectedNode}
                onUpdate={handleUpdateProperty}
                onBack={() => setSelectedId(null)}
              />
            ) : (
              <div className="p-4">
                <Input
                  placeholder="Search widgets..."
                  className="mb-4 bg-gray-50"
                />
                <div className="grid grid-cols-2 gap-2">
                  {WIDGETS.map((w) => (
                    <PaletteItem
                      key={w.type}
                      type={w.type}
                      label={w.label}
                      icon={w.icon}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>

          {selectedId && selectedId !== "root" && (
            <div className="p-4 mt-auto border-t">
              <Button
                variant="destructive"
                className="w-full"
                onClick={handleDelete}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Selected
              </Button>
            </div>
          )}
        </aside>

        <main className="flex-1 flex flex-col">
          <header className="bg-white border-b p-3 flex gap-2 justify-end items-center shadow-sm">
            <Button variant="outline" disabled>
              Preview
            </Button>
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving ? "Saving..." : "Save"}
            </Button>
          </header>

          <div className="flex-1 overflow-auto p-8">
            <div className="bg-white rounded-lg shadow-lg p-4 sm:p-8 max-w-4xl mx-auto min-h-full">
              <RenderEngine
                node={tree}
                selectedId={selectedId}
                onSelect={handleSelect}
              />
            </div>
          </div>
        </main>
      </div>
    </DndContext>
  );
}