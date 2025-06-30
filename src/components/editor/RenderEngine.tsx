import React from "react";
import { HeadingWidget } from "./widgets/HeadingWidget";
import { TextWidget } from "./widgets/TextWidget";
import { ImageWidget } from "./widgets/ImageWidget";
import { ButtonWidget } from "./widgets/ButtonWidget";
import { ContainerWidget } from "./widgets/ContainerWidget";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { SortableItem } from "./SortableItem";

const componentMap: Record<string, React.FC<any>> = {
  heading: HeadingWidget,
  text: TextWidget,
  image: ImageWidget,
  button: ButtonWidget,
  container: ContainerWidget,
};

export function RenderEngine({
  node,
  selectedId,
  onSelect,
}: {
  node: any;
  selectedId?: string | null;
  onSelect?: (id: string) => void;
}) {
  const Widget = componentMap[node.type];
  if (!Widget) return null;

  const isSelected = selectedId === node.id;
  const isContainer = node.type === "container";

  return (
    <div
      style={{
        outline: isSelected ? "2px solid #2563eb" : undefined,
        borderRadius: 4,
        padding: isContainer && isSelected ? 4 : 0,
        marginBottom: 4,
        cursor: "pointer",
      }}
      onClick={(e) => {
        e.stopPropagation();
        onSelect?.(node.id);
      }}
    >
      <Widget {...node.props}>
        {node.children && isContainer && (
          <SortableContext
            items={node.children.map((c: any) => c.id)}
            strategy={verticalListSortingStrategy}
          >
            {node.children.map((child: any) => (
              <SortableItem key={child.id} id={child.id}>
                <RenderEngine
                  node={child}
                  selectedId={selectedId}
                  onSelect={onSelect}
                />
              </SortableItem>
            ))}
          </SortableContext>
        )}
        {node.children &&
          !isContainer &&
          node.children.map((child: any) => (
            <RenderEngine
              key={child.id}
              node={child}
              selectedId={selectedId}
              onSelect={onSelect}
            />
          ))}
      </Widget>
    </div>
  );
}