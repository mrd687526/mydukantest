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
  const widgetProps = { ...node.props, id: node.id };

  let widgetContent = null;

  switch (node.type) {
    case "heading":
      widgetContent = <HeadingWidget {...widgetProps} />;
      break;
    case "text":
      widgetContent = <TextWidget {...widgetProps} />;
      break;
    case "image":
      widgetContent = <ImageWidget {...widgetProps} />;
      break;
    case "button":
      widgetContent = <ButtonWidget {...widgetProps} />;
      break;
    case "container":
      widgetContent = (
        <ContainerWidget {...widgetProps}>
          {node.children && (
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
          )}
        </ContainerWidget>
      );
      break;
    default:
      return null;
  }

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
      {widgetContent}
    </div>
  );
}