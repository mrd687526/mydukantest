"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft } from "lucide-react";

// We will export this type from the editor page
type Node = {
  id: string;
  type: string;
  props: Record<string, any>;
  children?: Node[];
};

type PropertiesPanelProps = {
  node: Node | null;
  onUpdate: (id: string, prop: string, value: any) => void;
  onBack: () => void;
};

export function PropertiesPanel({
  node,
  onUpdate,
  onBack,
}: PropertiesPanelProps) {
  if (!node) return null;

  const renderControls = () => {
    switch (node.type) {
      case "heading":
        return (
          <div className="space-y-2">
            <Label htmlFor="text">Text</Label>
            <Input
              id="text"
              value={node.props.text || ""}
              onChange={(e) => onUpdate(node.id, "text", e.target.value)}
            />
          </div>
        );
      case "text":
        return (
          <div className="space-y-2">
            <Label htmlFor="content">Content</Label>
            <Textarea
              id="content"
              value={node.props.content || ""}
              onChange={(e) => onUpdate(node.id, "content", e.target.value)}
            />
          </div>
        );
      case "button":
        return (
          <div className="space-y-2">
            <Label htmlFor="label">Label</Label>
            <Input
              id="label"
              value={node.props.label || ""}
              onChange={(e) => onUpdate(node.id, "label", e.target.value)}
            />
          </div>
        );
      case "image":
        return (
          <div className="space-y-2">
            <Label htmlFor="src">Image URL</Label>
            <Input
              id="src"
              value={node.props.src || ""}
              onChange={(e) => onUpdate(node.id, "src", e.target.value)}
            />
            <Label htmlFor="alt">Alt Text</Label>
            <Input
              id="alt"
              value={node.props.alt || ""}
              onChange={(e) => onUpdate(node.id, "alt", e.target.value)}
            />
          </div>
        );
      case "container":
        return (
          <p className="text-sm text-gray-500">
            This is a container. Add widgets to it from the widget panel.
          </p>
        );
      default:
        return <p>No properties to edit for this widget.</p>;
    }
  };

  return (
    <div className="p-4 flex flex-col h-full">
      <div className="flex items-center gap-2 mb-4">
        <Button variant="ghost" size="icon" onClick={onBack}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h2 className="font-bold capitalize">{node.type} Properties</h2>
      </div>
      <div className="space-y-4 flex-1">{renderControls()}</div>
    </div>
  );
}