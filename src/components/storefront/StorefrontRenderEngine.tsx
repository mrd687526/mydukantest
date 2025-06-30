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

export function StorefrontRenderEngine({ node }: { node: any }) {
  const Widget = componentMap[node.type];
  if (!Widget) return null;

  return (
    <div className="mb-4">
      <Widget {...node.props}>
        {node.children?.map((child: any) => (
          <StorefrontRenderEngine key={child.id} node={child} />
        ))}
      </Widget>
    </div>
  );
}