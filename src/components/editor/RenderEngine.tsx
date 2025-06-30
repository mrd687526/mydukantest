"use client";

import React from "react";
import { HeadingWidget } from "./widgets/HeadingWidget";
import { TextWidget } from "./widgets/TextWidget";
import { ImageWidget } from "./widgets/ImageWidget";
import { ButtonWidget } from "./widgets/ButtonWidget";
import { ContainerWidget } from "./widgets/ContainerWidget";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { SortableItem } from "./SortableItem";

function renderWidget(
  node: any,
  selectedId?: string | null,
  onSelect?: (id: string) => void
) {
  const widgetProps = { ...node.props, id: node.id };

  // Prepare children only for containers
  const children =
    node.type === "container" && node.children ? (
      <SortableContext
        items={node.children.map((c: any) => c.id)}
        strategy={verticalListSortingStrategy}
      >
        <div className="flex flex-col">
          {node.children.map((child: any) => (
            <SortableItem key={child.id} id={child.id}>
              <RenderEngine
                node={child}
                selectedId={selectedId}
                onSelect={onSelect}
              />
            </SortableItem>
          ))}
        </div>
      </SortableContext>
    ) : null;

  switch (node.type) {
    case "heading":
      return <HeadingWidget {...widgetProps} />;
    case "text":
      return <TextWidget {...widgetProps} />;
    case "image":
      return <ImageWidget {...widgetProps} />;
    case "button":
      return <ButtonWidget {...widgetProps} />;
    case "container":
      return <ContainerWidget {...widgetProps}>{children}</ContainerWidget>;
    default:
      return null;
  }
}

export function RenderEngine({
  node,
  selectedId,
  onSelect,
}: {
  node: any;
  selectedId?: string | null;
  onSelect?: (id: string) => void;
}) {
  if (!node) return null;
  const isSelected = selectedId === node.id;

  return (
    <div
      style={{
        outline: isSelected ? "2px solid #2563eb" : undefined,
        borderRadius: 4,
        padding: node.type === "container" && isSelected ? 4 : 0,
        marginBottom: 4,
        cursor: "pointer",
      }}
      onClick={(e) => {
        e.stopPropagation();
        onSelect?.(node.id);
      }}
    >
      {renderWidget(node, selectedId, onSelect)}
    </div>
  );
}