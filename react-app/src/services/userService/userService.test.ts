import { updateUserProfile, getCurrentUser } from './userService';
import { UserProfile } from '../../types/user';
import axios from 'axios';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('userService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getCurrentUser', () => {
    const mockUser: UserProfile = {
      id: 123,
      email: 'test@example.com',
      onboarding_status: 'not_started',
      created_at: '2023-01-01',
      updated_at: '2023-01-01',
      profile: {
        location: 'New York',
        job_title: 'Software Engineer',
        bio: 'Passionate developer',
        skills: ['React', 'TypeScript']
      }
    };

    it('should return user data when API call is successful', async () => {
      mockedAxios.get.mockResolvedValueOnce({ data: mockUser });
      const result = await getCurrentUser();
      expect(result).toEqual(mockUser);
      expect(mockedAxios.get).toHaveBeenCalledWith('/api/user');
    });

    it('should return null when API call fails', async () => {
      mockedAxios.get.mockRejectedValueOnce(new Error('API Error'));
      const result = await getCurrentUser();
      expect(result).toBeNull();
    });
  });

  describe('updateUserProfile', () => {
    const mockProfileUpdate: Partial<UserProfile> = {
      first_name: 'John',
      last_name: 'Doe',
      onboarding_status: 'partial',
      profile: {
        location: 'New York',
        job_title: 'Senior Developer'
      }
    };

    it('should update profile successfully', async () => {
      mockedAxios.put.mockResolvedValueOnce({ data: {} });
      await updateUserProfile(mockProfileUpdate);
      expect(mockedAxios.put).toHaveBeenCalledWith('/api/user', mockProfileUpdate);
    });

    it('should throw error when update fails', async () => {
      const error = new Error('Update failed');
      mockedAxios.put.mockRejectedValueOnce(error);
      await expect(updateUserProfile(mockProfileUpdate)).rejects.toThrow('Update failed');
    });
  });
}); 