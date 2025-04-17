import axios from 'axios';
import { UserProfile } from '../../types/user';

const API_BASE_URL = '/api/users';

/**
 * Get the current user profile with all data including onboarding status
 */
export const getCurrentUser = async (): Promise<UserProfile | null> => {
  try {
    const response = await axios.get<UserProfile>(`${API_BASE_URL}/current`);
    return response.data;
  } catch (error) {
    console.error('Error fetching current user:', error);
    return null;
  }
};

/**
 * Update user profile and onboarding status
 * @param profileData Profile data to update
 */
export const updateUserProfile = async (profileData: Partial<UserProfile>): Promise<void> => {
  try {
    await axios.put(`${API_BASE_URL}/profile`, profileData);
  } catch (error) {
    console.error('Error updating user profile:', error);
    throw error;
  }
};

export const updateOnboardingStatus = async (status: OnboardingStatus): Promise<void> => {
  try {
    await axios.put(`${API_BASE_URL}/onboarding-status`, { status });
  } catch (error) {
    console.error('Error updating onboarding status:', error);
    throw error;
  }
};

export type OnboardingStatus = 'not_started' | 'partial' | 'completed';

/**
 * Check if user has completed onboarding
 * This is a helper function to determine if the user needs to go through onboarding
 */
export const hasCompletedOnboarding = async (): Promise<OnboardingStatus> => {
  try {
    const response = await axios.get('/api/user/onboarding-status');
    return response.data.status;
  } catch (error) {
    console.error('Error checking onboarding status:', error);
    return 'not_started';
  }
}; 