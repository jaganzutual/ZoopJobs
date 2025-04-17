export interface UserProfile {
  id: string;
  email: string;
  profile?: {
    first_name?: string;
    last_name?: string;
    phone?: string;
    location?: string;
    linkedin?: string;
    website?: string;
  };
  created_at: string;
  updated_at: string;
} 