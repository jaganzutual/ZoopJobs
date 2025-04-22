export type OnboardingStatus = 'not_started' | 'partial' | 'completed';

export interface UserProfile {
  id: number;
  email: string;
  first_name?: string;
  last_name?: string;
  onboarding_status: OnboardingStatus;
  created_at: string;
  updated_at: string;
  profile?: {
    location?: string;
    job_title?: string;
    bio?: string;
    skills?: string[];
  };
} 