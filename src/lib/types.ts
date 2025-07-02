export type AppPageProps<TParams = {}, TSearchParams = {}> = {
  params: Promise<TParams>;
  searchParams?: Promise<TSearchParams>;
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
  status: 'active' | 'inactive'; // Changed from string to specific literal types
  flow_data: any | null;
  settings: any | null;
  created_at: string;
  updated_at: string;
};

export type Discount = {
  id: string;
  profile_id: string;
  code: string;
  type: 'percentage' | 'fixed_amount' | 'free_shipping';
  value: number;
  min_purchase_amount: number | null;
  usage_limit: number | null;
  used_count: number;
  start_date: string | null;
  end_date: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  included_product_ids: string[] | null; // New
  excluded_product_ids: string[] | null; // New
  included_category_ids: string[] | null; // New
  excluded_category_ids: string[] | null; // New
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
  stock_status: 'in_stock' | 'out_of_stock' | 'on_backorder';
  product_specification: string | null;
  product_details: string | null;
  is_trending: boolean;
  is_downloadable: boolean; // New
};

export type AutomationCampaign = { // Renamed from Campaign to AutomationCampaign for clarity and consistency
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
  match_type: 'exact' | 'contains'; // Updated to match z.enum
  action: 'reply' | 'dm' | 'hide' | 'delete' | 'like'; // Updated to match z.enum and webhook
  comment_template_id: string | null; // Keep if still relevant for DB schema, even if not used in UI
  reply_template_id: string | null;
  reply_templates: { name: string; template_text: string | null; reply_type: 'public' | 'private' | 'ai'; } | null; // Joined data, added more fields for completeness
};

export type ReplyTemplate = {
  id: string;
  profile_id: string;
  name: string;
  template_text: string | null;
  reply_type: 'public' | 'private' | 'ai'; // Updated to match z.enum and webhook
  created_at: string;
};

export type CommentTemplate = {
  id: string;
  profile_id: string;
  name: string;
  template_text: string | null;
  created_at: string;
};

export type CampaignReport = {
  id: string;
  campaign_id: string | null;
  comment_id: string | null;
  reply_text: string | null;
  reply_type: string | null;
  action_taken: string | null;
  sent_at: string | null;
  associated_keyword: string | null;
  automation_campaigns: { name: string } | null; // Joined data
};

export type ConnectedAccount = {
  id: string;
  profile_id: string | null;
  fb_page_id: string | null;
  ig_business_id: string | null;
  access_token: string | null;
  refresh_token: string | null;
  bots?: Bot[]; // Optional, for when joined
};

export type FacebookPage = {
  id: string;
  name: string;
  category: string;
  access_token: string;
  tasks: string[]; // Facebook API returns this
};

export type FacebookPost = {
  id: string;
  message: string | null;
  created_time: string;
  full_picture: string | null;
  permalink_url: string;
};

export type ProfileCredentials = {
  id: string;
  profile_id: string;
  fb_app_id: string | null;
  fb_app_secret: string | null;
  created_at: string;
  updated_at: string;
};

export type Profile = {
  id: string;
  name: string | null;
  avatar: string | null;
  stripe_customer_id: string | null;
  role: 'super_admin' | 'store_admin';
  logo_url: string | null;
  seo_google_analytics_id: string | null;
  seo_facebook_pixel_id: string | null;
  seo_meta_keywords: string | null;
  seo_meta_description: string | null;
  seo_meta_image_url: string | null;
  custom_domain: string | null;
  subdomain: string | null;
  custom_css: string | null;
  custom_js: string | null;
  checkout_enable_notes: boolean | null;
  checkout_require_login: boolean | null;
  shipping_address: string | null;
  shipping_city: string | null;
  shipping_state: string | null;
  shipping_zip_code: string | null;
  shipping_country: string | null;
  guest_checkout_enabled?: boolean;
};

export type Subscription = {
  id: string;
  profile_id: string;
  stripe_customer_id: string;
  stripe_subscription_id: string;
  stripe_price_id: string;
  status: 'trialing' | 'active' | 'past_due' | 'canceled' | 'unpaid' | 'incomplete' | 'incomplete_expired';
  current_period_start: string | null;
  current_period_end: string | null;
  created_at: string;
  updated_at: string;
};

export type Plan = {
  id: string;
  name: string;
  description: string | null;
  price: number;
  currency: string;
  interval: 'month' | 'year' | 'lifetime';
  stripe_price_id: string | null;
  features: string[] | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type PlanCoupon = {
  id: string;
  code: string;
  type: 'percentage' | 'fixed_amount';
  value: number;
  expires_at: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type PlanRequest = {
  id: string;
  profile_id: string;
  plan_id: string;
  status: 'pending' | 'approved' | 'rejected';
  notes: string | null;
  requested_at: string;
  reviewed_by: string | null;
  reviewed_at: string | null;
  profiles: { name: string | null; email: string | null; } | null; // Joined data
  plans: { name: string | null; } | null; // Joined data
};

export type CampaignTag = {
  id: string;
  profile_id: string | null;
  tag_name: string;
  created_at: string | null;
};

export type UserProfileWithSubscription = Profile & {
  email: string;
  created_at: string;
  subscription_status: Subscription['status'] | null;
  subscription_end_date: string | null;
  plan_name: string | null; // Added plan_name
};

export type Order = {
  id: string;
  profile_id: string;
  order_number: string;
  customer_name: string;
  customer_email: string;
  total_amount: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  created_at: string;
  updated_at: string;
  customer_id: string | null;
  payment_type: string | null;
  stripe_payment_intent_id: string | null;
  stripe_charge_id: string | null;
  shipping_address_line1: string | null;
  shipping_address_line2: string | null;
  shipping_city: string | null;
  shipping_state: string | null;
  shipping_postal_code: string | null;
  shipping_country: string | null;
  shipping_phone: string | null;
  tracking_number: string | null; // Added tracking_number
  shipping_label_url: string | null; // Added shipping_label_url
  source: 'web' | 'pos'; // New: Differentiates online from POS sales
  shipping_charge: number; // New: For sales summary
  discount_amount: number; // New: For sales summary
};

export type OrderItem = {
  id: string;
  order_id: string;
  product_id: string;
  variant_id: number | null; // Added variant_id
  quantity: number;
  price_at_purchase: number;
  created_at: string;
};

export type Customer = {
  id: string;
  profile_id: string;
  name: string;
  email: string;
  created_at: string;
  updated_at: string;
  last_active: string | null;
  status: 'active' | 'inactive' | 'churned';
  orders_count: number; // From RPC
  total_spend: number; // From RPC
  aov: number; // From RPC
};

export type OrderRefundRequest = {
  id: string;
  order_id: string;
  profile_id: string; // Added profile_id (tenant_id)
  request_date: string;
  status: 'pending' | 'approved' | 'rejected';
  reason: string | null;
  customer_attachment_url: string | null; // Added customer_attachment_url
  created_at: string;
  updated_at: string;
  orders: { // Joined data from orders table
    order_number: string;
    customer_name: string;
    total_amount: number;
    status: Order['status']; // Added status for conditional rendering
  } | null;
};

export type OrderNote = {
  id: number;
  profile_id: string;
  order_id: string;
  note_text: string;
  is_customer_visible: boolean;
  created_at: string;
};

export type CustomerEvent = {
  id: number;
  profile_id: string;
  customer_id: string;
  event_type: 'registered' | 'last_login' | 'added_to_wishlist' | 'added_to_cart' | 'placed_order';
  event_details: Record<string, any> | null;
  created_at: string;
};

export type Country = {
  id: number;
  name: string;
  iso2: string;
  is_active: boolean;
};

export type State = {
  id: number;
  name: string;
  country_id: number;
  is_active: boolean;
};

export type Region = {
  id: number;
  name: string;
  state_id: number;
  is_active: boolean;
};

export type NewsletterSubscriber = {
  id: number;
  profile_id: string;
  email: string;
  subscribed_at: string;
};

export type FlashSale = {
  id: string;
  profile_id: string;
  name: string;
  start_date: string;
  end_date: string;
  discount_type: 'percentage' | 'fixed_amount';
  discount_value: number;
  target_rules: {
    included_product_ids?: string[];
    excluded_product_ids?: string[];
    included_category_ids?: string[];
    excluded_category_ids?: string[];
    min_purchase_amount?: number;
  } | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type Cart = {
  id: string;
  profile_id: string;
  customer_id: string | null;
  cart_items_json: any; // JSONB for cart items structure
  created_at: string;
  updated_at: string;
};

-- Report types for RPC functions
export type CustomerOrderReportData = {
  period: string; // YYYY-MM-DD or YYYY-MM
  customer_orders: number;
  guest_orders: number;
  total_orders: number;
};

export type TopPaymentMethodReportData = {
  payment_method: string;
  total_orders: number;
  total_amount: number;
};

export type TopSellingProductReportData = {
  product_id: string;
  product_name: string;
  total_sales_amount: number;
  total_quantity_sold: number;
  product_image_url: string | null;
};

export type TopSellingCategoryReportData = {
  category_name: string;
  total_sales_amount: number;
  total_quantity_sold: number;
};

export type TopSellingBrandReportData = {
  brand_name: string;
  total_sales_amount: number;
  total_quantity_sold: number;
};

export type MonthlyOrderTrendData = {
  period: string;
  total_orders: number;
};

export type MostUsedCouponData = {
  code: string;
  used_count: number;
  profile_id: string;
  profile_name: string;
};

export type PopularPlanData = {
  plan_id: string;
  plan_name: string;
  active_subscriptions: number;
};

export type TopCustomerData = {
  customer_id: string;
  customer_name: string;
  customer_email: string;
  total_spend: number;
  store_name: string;
};

export type DailyOrderCountData = {
  day: string;
  count: number;
};

export type SalesSummaryReportData = {
  total_gross_sales: number;
  total_net_sales: number;
  total_orders: number;
  total_items_sold: number;
  total_shipping_charges: number;
  total_coupons_used: number;
};

export type DownloadableProductSalesData = {
  product_id: string;
  product_name: string;
  total_sales_amount: number;
  total_quantity_sold: number;
  product_image_url: string | null;
};