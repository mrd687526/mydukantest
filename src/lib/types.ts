export type AppPageProps<TParams = {}, TSearchParams = {}> = {
  params: TParams;
  searchParams?: TSearchParams;
};

// Existing types in src/lib/types.ts would go here.
// For example, if you had:
// export type Bot = { id: string; name: string; /* ... */ };
// It would remain.
export type Bot = {
  id: string;
  profile_id: string;
  connected_account_id: string;
  name: string;
  description: string | null;
  status: string;
  flow_data: any | null;
  settings: any | null;
  created_at: string;
  updated_at: string;
};

export type Discount = {
  id: string;
  profile_id: string;
  code: string;
  type: 'percentage' | 'fixed_amount';
  value: number;
  min_purchase_amount: number | null;
  usage_limit: number | null;
  used_count: number;
  start_date: string | null;
  end_date: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type Product = {
  id: string;
  profile_id: string;
  name: string;
  description: string | null;
  price: number;
  sku: string | null;
  inventory_quantity: number;
  image_url: string | null;
  created_at: string;
  updated_at: string;
  category: string | null;
  brand: string | null;
  label: string | null;
  variant: string | null;
  subcategory: string | null;
  sale_price: number | null;
  weight_kg: number | null;
  tags: string[] | null;
  stock_status: 'in_stock' | 'out_of_stock' | 'low_stock';
  product_specification: string | null;
  product_details: string | null;
  is_trending: boolean;
};

export type Campaign = {
  id: string;
  profile_id: string;
  name: string;
  is_active: boolean;
  start_date: string | null;
  end_date: string | null;
  created_at: string;
  post_id: string | null;
};

export type CampaignRule = {
  id: string;
  campaign_id: string;
  keyword: string | null;
  match_type: 'exact' | 'contains' | 'starts_with' | 'ends_with';
  action: 'reply_comment' | 'send_message';
  comment_template_id: string | null;
  reply_template_id: string | null;
  reply_templates: { name: string } | null; // Joined data
};

export type ReplyTemplate = {
  id: string;
  profile_id: string;
  name: string;
  template_text: string | null;
  reply_type: 'comment' | 'message';
  created_at: string;
};