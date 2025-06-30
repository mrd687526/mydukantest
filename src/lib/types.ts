import type { Node, Edge } from 'reactflow';

export interface AutomationCampaign {
  id: string;
  profile_id: string;
  name: string;
  is_active: boolean;
  start_date: string | null;
  end_date: string | null;
  created_at: string;
  post_id: string | null;
}

export interface CommentTemplate {
  id: string;
  profile_id: string;
  name: string;
  template_text: string | null;
  created_at: string;
}

export interface ReplyTemplate {
  id: string;
  profile_id: string;
  name: string;
  template_text: string | null;
  reply_type: 'public' | 'private' | 'ai' | null;
  created_at: string;
}

export interface FacebookPage {
  id: string;
  name: string;
  access_token: string;
  category: string;
}

export interface BotFlow {
  nodes: Node[];
  edges: Edge[];
}

export interface Bot {
  id:string;
  profile_id: string;
  connected_account_id: string;
  name: string;
  description: string | null;
  status: 'active' | 'inactive';
  flow_data: BotFlow | null;
  settings: any | null;
  created_at: string;
  updated_at: string;
}

// This represents the data from the connected_accounts table
export interface ConnectedAccount {
  id: string;
  profile_id: string;
  fb_page_id: string | null;
  ig_business_id: string | null;
  access_token: string | null;
  refresh_token: string | null;
  bots: Bot[];
}

export interface ProfileCredentials {
  id: string;
  profile_id: string;
  fb_app_id: string | null;
  fb_app_secret: string | null;
}

export interface CampaignReport {
  id: string;
  action_taken: string | null;
  associated_keyword: string | null;
  reply_text: string | null;
  sent_at: string;
  automation_campaigns: {
    name: string;
  } | null;
}

export interface CampaignRule {
    id: string;
    campaign_id: string;
    keyword: string | null;
    match_type: 'exact' | 'contains' | null;
    action: 'reply' | 'dm' | 'hide' | 'delete' | 'like' | null;
    reply_template_id: string | null;
    reply_templates: {
        name: string;
    } | null;
}

export interface FacebookPost {
  id: string;
  message?: string;
  created_time: string;
  full_picture?: string;
  permalink_url: string;
}

export interface Product {
  id: string;
  profile_id: string;
  name: string;
  description: string | null;
  price: number;
  sku: string | null;
  inventory_quantity: number;
  image_url: string | null;
  category: string | null;
  brand: string | null;
  label: string | null;
  variant: string | null;
  created_at: string;
  updated_at: string;
  subcategory: string | null;
  sale_price: number | null;
  weight_kg: number | null;
  tags: string[] | null;
  stock_status: 'in_stock' | 'out_of_stock' | 'on_backorder' | null;
  product_specification: string | null;
  product_details: string | null;
  is_trending: boolean | null;
}

export interface Customer {
  id: string;
  profile_id: string;
  name: string;
  email: string;
  created_at: string;
  updated_at: string;
  last_active: string | null; // New: Timestamp of last activity (e.g., last order)
  status: 'active' | 'inactive' | 'churned'; // New: Customer status
  orders_count: number; // Aggregated: Total number of orders
  total_spend: number; // Aggregated: Total amount spent
  aov: number; // Aggregated: Average Order Value
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  quantity: number;
  price_at_purchase: number;
  created_at: string;
  // Optionally, include product details if needed for display without another join
  products?: {
    name: string;
    image_url: string | null;
    category: string | null;
    brand: string | null;
  } | null;
}

export interface Order {
  id: string;
  profile_id: string;
  customer_id: string | null;
  order_number: string;
  customer_name: string;
  customer_email: string;
  total_amount: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  payment_type: string | null; // Added payment_type
  created_at: string;
  updated_at: string;
  stripe_payment_intent_id: string | null; // New: Stripe Payment Intent ID
  stripe_charge_id: string | null; // New: Stripe Charge ID
  shipping_address_line1: string | null; // New: Shipping address line 1
  shipping_address_line2: string | null; // New: Shipping address line 2
  shipping_city: string | null; // New: Shipping city
  shipping_state: string | null; // New: Shipping state
  shipping_postal_code: string | null; // New: Shipping postal code
  shipping_country: string | null; // New: Shipping country
  shipping_phone: string | null; // New: Shipping phone number
  order_items?: OrderItem[]; // Optional: to hold associated items
}

export interface OrderRefundRequest {
  id: string;
  order_id: string;
  profile_id: string;
  request_date: string;
  status: 'pending' | 'approved' | 'rejected';
  reason: string | null;
  created_at: string;
  updated_at: string;
  orders: { // Joined order details for display
    order_number: string;
    customer_name: string;
    total_amount: number;
  } | null;
}

export interface CampaignTag {
  id: string;
  profile_id: string;
  tag_name: string;
  created_at: string;
}

export interface CampaignTagAssociation {
  campaign_id: string;
  tag_id: string;
}

export interface Discount {
  id: string;
  profile_id: string;
  code: string;
  type: 'percentage' | 'fixed_amount' | 'free_shipping';
  value: number;
  min_purchase_amount: number | null;
  usage_limit: number | null;
  used_count: number;
  start_date: string;
  end_date: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CustomerOrderReportData {
  period: string;
  customer_orders: number;
  guest_orders: number;
  total_orders: number;
}

export interface TopPaymentMethodReportData {
  payment_method: string;
  total_orders: number;
  total_amount: number;
}

// Placeholders for other reports (since schema doesn't support them directly yet)
export interface TopSellingProductReportData {
  product_id: string;
  product_name: string;
  total_sales_amount: number;
  total_quantity_sold: number;
  product_image_url: string | null;
}

export interface TopSellingCategoryReportData {
  category_name: string;
  total_sales_amount: number;
  total_quantity_sold: number;
}

export interface TopSellingBrandReportData {
  brand_name: string;
  total_sales_amount: number;
  total_quantity_sold: number;
}

export interface Profile {
  id: string; // This is now the user_id from auth.users
  name: string | null;
  avatar: string | null;
  stripe_customer_id: string | null; // New: Stripe Customer ID
  role: 'super_admin' | 'store_admin'; // Added role
}

export interface Subscription {
  id: string;
  profile_id: string;
  stripe_customer_id: string;
  stripe_subscription_id: string;
  stripe_price_id: string;
  status: 'trialing' | 'active' | 'past_due' | 'canceled' | 'unpaid' | 'incomplete' | 'incomplete_expired';
  current_period_start: string;
  current_period_end: string;
  created_at: string;
  updated_at: string;
}

// New interface to represent the combined data from the RPC function
export interface UserProfileWithSubscription extends Profile {
  created_at: string; // From auth.users.created_at
  email: string; // Directly from auth.users
  subscription_status: string | null; // 'active', 'trialing', 'canceled', etc.
  subscription_end_date: string | null;
}

export interface Plan {
  id: string;
  name: string;
  description: string | null;
  price: number;
  currency: string;
  interval: 'month' | 'year' | 'lifetime'; // Assuming these intervals
  stripe_price_id: string | null;
  features: string[] | null; // Array of strings for features
  is_active: boolean;
  created_at: string;
  updated_at: string;
}