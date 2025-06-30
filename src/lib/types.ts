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