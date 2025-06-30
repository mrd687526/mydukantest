import Link from "next/link";

const demoBlocks = [
  { id: "1", type: "heading", content: "Welcome to your page!" },
  { id: "2", type: "text", content: "Drag and drop blocks to build your page." },
];

function RenderBlock({ block }: { block: any }) {
  if (block.type === "heading") {
    return <h2 className="text-2xl font-bold mb-2">{block.content}</h2>;
  }
  if (block.type === "text") {
    return <p className="mb-4">{block.content}</p>;
  }
  return null;
}

export default function StoreHomePage() {
  return (
    <div>
      {demoBlocks.map(block => (
        <RenderBlock key={block.id} block={block} />
      ))}
      <div className="mt-8">
        <h3 className="text-lg font-semibold mb-2">Featured Products</h3>
        {/* ... existing product grid code ... */}
      </div>
    </div>
  );
}