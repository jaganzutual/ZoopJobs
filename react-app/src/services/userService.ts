import apiService from './apiService';
import { UserProfile } from './resumeService';

// API endpoints
const USER_PROFILE_ENDPOINT = '/users/me';
const USER_UPDATE_PROFILE_ENDPOINT = '/users/profile';

/**
 * Get the current user profile with all data
 */
export const getUserProfile = async (): Promise<UserProfile> => {
  return apiService.get<UserProfile>(USER_PROFILE_ENDPOINT);
};

/**
 * Update user profile
 * @param profileData Profile data to update
 */
export const updateUserProfile = async (profileData: any): Promise<any> => {
  return apiService.put(USER_UPDATE_PROFILE_ENDPOINT, profileData);
};

/**
 * Check if user has completed onboarding
 * This is a helper function to determine if the user needs to go through onboarding
 */
export const hasCompletedOnboarding = async (): Promise<boolean> => {
  try {
    const profile = await getUserProfile();
    // Check if the user has basic profile information
    return !!(profile && profile.profile && profile.profile.first_name);
  } catch (error) {
    console.error('Error checking onboarding status:', error);
    return false;
  }
}; 