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