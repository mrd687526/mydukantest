import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

export async function fetchShopData() {
  // Fetch products
  const { data: products, error: productsError } = await supabase
    .from('products')
    .select('*')
    .limit(10);

  // Fetch shop info (customize as needed)
  const shop = {
    name: "Your Store",
    domain: "yourstore.com",
  };

  return {
    shop,
    products: products || [],
    collections: [],
    cart: {
      items: [],
      total_price: 0,
    },
  };
}