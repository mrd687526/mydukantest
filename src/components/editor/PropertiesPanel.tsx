"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Slider } from "@/components/ui/slider";

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

  const updateProp = (prop: string, value: any) => {
    onUpdate(node.id, prop, value);
  };

  const renderContentControls = () => {
    switch (node.type) {
      case "heading":
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="text">Text</Label>
              <Input
                id="text"
                value={node.props.text || ""}
                onChange={(e) => updateProp("text", e.target.value)}
              />
            </div>
          </div>
        );
      case "text":
        return (
          <div className="space-y-2">
            <Label htmlFor="content">Content</Label>
            <Textarea
              id="content"
              value={node.props.content || ""}
              onChange={(e) => updateProp("content", e.target.value)}
            />
          </div>
        );
      case "button":
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="label">Label</Label>
              <Input
                id="label"
                value={node.props.label || ""}
                onChange={(e) => updateProp("label", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="href">Link URL</Label>
              <Input
                id="href"
                value={node.props.href || ""}
                onChange={(e) => updateProp("href", e.target.value)}
                placeholder="https://example.com"
              />
            </div>
          </div>
        );
      case "image":
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="src">Image URL</Label>
              <Input
                id="src"
                value={node.props.src || ""}
                onChange={(e) => updateProp("src", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="alt">Alt Text</Label>
              <Input
                id="alt"
                value={node.props.alt || ""}
                onChange={(e) => updateProp("alt", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="href">Link URL</Label>
              <Input
                id="href"
                value={node.props.href || ""}
                onChange={(e) => updateProp("href", e.target.value)}
                placeholder="https://example.com"
              />
            </div>
          </div>
        );
      default:
        return (
          <p className="text-sm text-gray-500">
            No content properties for this widget.
          </p>
        );
    }
  };

  const renderStyleControls = () => {
    switch (node.type) {
      case "heading":
      case "text":
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Alignment</Label>
              <Select
                value={node.props.align || "left"}
                onValueChange={(v) => updateProp("align", v)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="left">Left</SelectItem>
                  <SelectItem value="center">Center</SelectItem>
                  <SelectItem value="right">Right</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="fontSize">Font Size (px)</Label>
              <Input
                id="fontSize"
                type="number"
                value={node.props.fontSize || ""}
                onChange={(e) =>
                  updateProp("fontSize", parseInt(e.target.value, 10) || 0)
                }
              />
            </div>
          </div>
        );
      case "button":
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Variant</Label>
              <Select
                value={node.props.variant || "default"}
                onValueChange={(v) => updateProp("variant", v)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="default">Default</SelectItem>
                  <SelectItem value="destructive">Destructive</SelectItem>
                  <SelectItem value="outline">Outline</SelectItem>
                  <SelectItem value="secondary">Secondary</SelectItem>
                  <SelectItem value="ghost">Ghost</SelectItem>
                  <SelectItem value="link">Link</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        );
      case "container":
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Direction</Label>
              <Select
                value={node.props.direction || "vertical"}
                onValueChange={(v) => updateProp("direction", v)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="vertical">Vertical</SelectItem>
                  <SelectItem value="horizontal">Horizontal</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Gap ({node.props.gap || 0}px)</Label>
              <Slider
                defaultValue={[node.props.gap || 0]}
                max={100}
                step={1}
                onValueChange={(v) => updateProp("gap", v[0])}
              />
            </div>
            <div className="space-y-2">
              <Label>Padding ({node.props.padding || 0}px)</Label>
              <Slider
                defaultValue={[node.props.padding || 0]}
                max={100}
                step={1}
                onValueChange={(v) => updateProp("padding", v[0])}
              />
            </div>
          </div>
        );
      default:
        return (
          <p className="text-sm text-gray-500">
            No style properties for this widget.
          </p>
        );
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-2 p-4 border-b">
        <Button variant="ghost" size="icon" onClick={onBack}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h2 className="font-semibold capitalize">{node.type}</h2>
      </div>
      <Tabs defaultValue="content" className="flex-1">
        <TabsList className="w-full grid grid-cols-2 rounded-none">
          <TabsTrigger value="content">Content</TabsTrigger>
          <TabsTrigger value="style">Style</TabsTrigger>
        </TabsList>
        <TabsContent value="content" className="p-4 space-y-4">
          {renderContentControls()}
        </TabsContent>
        <TabsContent value="style" className="p-4 space-y-4">
          {renderStyleControls()}
        </TabsContent>
      </Tabs>
    </div>
  );
}