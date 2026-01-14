export interface Email {
  id: string;
  user_id: string;
  folder_id: string | null;
  from_email: string;
  from_name: string | null;
  to_emails: string[];
  cc_emails: string[];
  bcc_emails: string[];
  subject: string;
  body: string;
  status: 'draft' | 'sent' | 'received';
  is_read: boolean;
  is_starred: boolean;
  sent_at: string | null;
  received_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface Folder {
  id: string;
  user_id: string;
  name: string;
  icon: string;
  is_system: boolean;
  created_at: string;
}

export interface Contact {
  id: string;
  user_id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface Profile {
  id: string;
  user_id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface ComposeEmail {
  to: string[];
  cc: string[];
  bcc: string[];
  subject: string;
  body: string;
}
