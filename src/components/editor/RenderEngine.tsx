import React from "react";
import { HeadingWidget } from "./widgets/HeadingWidget";
import { TextWidget } from "./widgets/TextWidget";
import { ImageWidget } from "./widgets/ImageWidget";
import { ButtonWidget } from "./widgets/ButtonWidget";
import { ContainerWidget } from "./widgets/ContainerWidget";

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

  return (
    <div
      style={{
        outline: isSelected ? "2px solid #2563eb" : undefined,
        borderRadius: 4,
        marginBottom: 4,
        cursor: "pointer",
      }}
      onClick={e => {
        e.stopPropagation();
        onSelect?.(node.id);
      }}
    >
      <Widget {...node.props}>
        {node.children &&
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