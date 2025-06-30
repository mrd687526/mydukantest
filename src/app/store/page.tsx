import { createClient } from "@/integrations/supabase/server";
import Link from "next/link";

export default async function StoreHomePage() {
  const supabase = await createClient();
  const { data: products } = await supabase
    .from("products")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(8);

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Welcome to MyShop</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
        {products?.map((product) => (
          <Link
            key={product.id}
            href={`/store/products/${product.id}`}
            className="bg-white rounded-lg shadow hover:shadow-lg transition p-4 flex flex-col"
          >
            {product.image_url && (
              <img
                src={product.image_url}
                alt={product.name}
                className="w-full h-40 object-cover rounded mb-3"
              />
            )}
            <div className="font-semibold text-lg">{product.name}</div>
            <div className="text-primary font-bold mt-1">${product.price}</div>
          </Link>
        ))}
      </div>
    </div>
  );
}