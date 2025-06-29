export interface AutomationCampaign {
  id: string;
  profile_id: string;
  name: string;
  is_active: boolean;
  start_date: string | null;
  end_date: string | null;
  created_at: string;
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

// This represents the data from the connected_accounts table
export interface ConnectedAccount {
  id: string;
  profile_id: string;
  fb_page_id: string | null;
  ig_business_id: string | null;
  access_token: string | null;
  refresh_token: string | null;
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
  }[] | null;
}