import apiService from '../apiService/apiService';
import { updateUserProfile, getUserProfile, hasCompletedOnboarding } from './userService';
import { UserProfile } from '../../types/user';

// Mock the API service
jest.mock('../apiService/apiService', () => ({
  __esModule: true,
  default: {
    post: jest.fn(),
    put: jest.fn(),
    get: jest.fn(),
  },
}));

describe('User Service', () => {
  const mockedApiService = apiService as jest.Mocked<typeof apiService>;
  
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('updateUserProfile', () => {
    const mockProfileData = {
      first_name: 'John',
      last_name: 'Doe',
      location: 'San Francisco',
      job_title: 'Software Developer',
    };

    const mockResponse = {
      id: 123,
      email: 'john@example.com',
      created_at: '2023-02-01T00:00:00Z',
      profile: {
        id: 456,
        user_id: 123,
        first_name: 'John',
        last_name: 'Doe',
        location: 'San Francisco',
        job_title: 'Software Developer',
        is_student: false,
        is_employed: true
      }
    };

    test('updates user profile correctly', async () => {
      mockedApiService.put.mockResolvedValueOnce(mockResponse);
      
      const result = await updateUserProfile(mockProfileData);
      
      expect(mockedApiService.put).toHaveBeenCalledWith('/users/profile', mockProfileData);
      expect(result).toEqual(mockResponse);
    });

    test('handles update errors', async () => {
      const mockError = new Error('User not found');
      mockedApiService.put.mockRejectedValueOnce(mockError);
      
      await expect(updateUserProfile(mockProfileData)).rejects.toThrow('User not found');
    });
  });

  describe('getUserProfile', () => {
    const mockProfileResponse: UserProfile = {
      id: "123",
      email: 'john@example.com',
      created_at: '2023-02-01T00:00:00Z',
      updated_at: '2023-02-01T00:00:00Z',
      profile: {
        first_name: 'John',
        last_name: 'Doe',
        location: 'New York',
        linkedin: 'linkedin.com/johndoe',
        website: 'johndoe.com'
      }
    };

    test('gets current user profile correctly', async () => {
      mockedApiService.get.mockResolvedValueOnce(mockProfileResponse);
      
      const result = await getUserProfile();
      
      expect(mockedApiService.get).toHaveBeenCalledWith('/users/me');
      expect(result).toEqual(mockProfileResponse);
    });

    test('handles profile retrieval errors', async () => {
      const mockError = new Error('Profile not found');
      mockedApiService.get.mockRejectedValueOnce(mockError);
      
      await expect(getUserProfile()).rejects.toThrow('Profile not found');
    });
  });

  describe('hasCompletedOnboarding', () => {
    test('returns true when profile has first_name', async () => {
      const mockProfile: UserProfile = {
        id: "123",
        email: "test@example.com",
        created_at: '2023-01-01',
        updated_at: '2023-01-01',
        profile: {
          first_name: 'John'
        }
      };
      
      mockedApiService.get.mockResolvedValueOnce(mockProfile);
      
      const result = await hasCompletedOnboarding();
      
      expect(result).toBe(true);
    });

    test('returns false when profile has no first_name', async () => {
      const mockProfile: UserProfile = {
        id: "123",
        email: "test@example.com",
        created_at: '2023-01-01',
        updated_at: '2023-01-01',
        profile: {}
      };
      
      mockedApiService.get.mockResolvedValueOnce(mockProfile);
      
      const result = await hasCompletedOnboarding();
      
      expect(result).toBe(false);
    });

    test('returns false when error occurs', async () => {
      mockedApiService.get.mockRejectedValueOnce(new Error('API error'));
      
      const result = await hasCompletedOnboarding();
      
      expect(result).toBe(false);
    });
  });
}); 