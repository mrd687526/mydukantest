import { createClient } from "@/integrations/supabase/server";

function RenderBlock({ block }: { block: any }) {
  if (block.type === "heading") {
    return <h2 className="text-2xl font-bold mb-2">{block.content}</h2>;
  }
  if (block.type === "text") {
    return <p className="mb-4">{block.content}</p>;
  }
  if (block.type === "image" && block.imageUrl) {
    return <img src={block.imageUrl} alt="Block" className="max-h-40 rounded mb-4" />;
  }
  if (block.type === "button") {
    return (
      <button className="px-4 py-2 bg-blue-600 text-white rounded font-semibold mb-4">
        {block.buttonLabel || "Click Me"}
      </button>
    );
  }
  return null;
}

export default async function StoreHomePage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("store_pages")
    .select("data")
    .eq("slug", "home")
    .single();

  const blocks = data?.data?.blocks || [
    { id: "1", type: "heading", content: "Welcome to your page!" },
    { id: "2", type: "text", content: "Drag and drop blocks to build your page." },
  ];

  return (
    <div>
      {blocks.map((block: any) => (
        <RenderBlock key={block.id} block={block} />
      ))}
      <div className="mt-8">
        <h3 className="text-lg font-semibold mb-2">Featured Products</h3>
        {/* ... existing product grid code ... */}
      </div>
    </div>
  );
}