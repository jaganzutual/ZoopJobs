import { UserProfile } from '../../types/user';
import apiService from '../apiService/apiService';
import { 
  USER_CURRENT_ENDPOINT, 
  USER_UPDATE_PROFILE_ENDPOINT 
} from '../apiService/apiEndpoints';

export type OnboardingStatus = 'not_started' | 'partial' | 'completed';

/**
 * Get the current user profile with all data including onboarding status
 */
export const getCurrentUser = async (): Promise<UserProfile | null> => {
  try {
    const response = await apiService.get<UserProfile>(USER_CURRENT_ENDPOINT);
    return response;
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
    await apiService.put(USER_UPDATE_PROFILE_ENDPOINT, profileData);
  } catch (error) {
    console.error('Error updating user profile:', error);
    throw error;
  }
};

export const updateOnboardingStatus = async (status: OnboardingStatus): Promise<void> => {
  try {
    await apiService.put(USER_UPDATE_PROFILE_ENDPOINT, { onboardingStatus: status });
  } catch (error) {
    console.error('Error updating onboarding status:', error);
    throw error;
  }
};

/**
 * Check if user has completed onboarding
 * This is a helper function to determine if the user needs to go through onboarding
 */
export const hasCompletedOnboarding = async (): Promise<OnboardingStatus> => {
  try {
    const response = await apiService.get<{ status: OnboardingStatus }>(USER_CURRENT_ENDPOINT);
    return response.status;
  } catch (error) {
    console.error('Error checking onboarding status:', error);
    return 'not_started';
  }
}; 