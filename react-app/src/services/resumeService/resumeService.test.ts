import { act } from 'react';
import apiService from '../apiService/apiService';
import { uploadResume, saveResume, ResumeParseResponse } from './resumeService';

// Mock the apiService
jest.mock('../apiService/apiService', () => ({
  __esModule: true,
  default: {
    post: jest.fn(),
    uploadFile: jest.fn()
  }
}));

// Mock FormData
class MockFormData {
  private data: Record<string, any> = {};
  append(key: string, value: any) {
    this.data[key] = value;
  }
}

// Replace global FormData with mock
(global as any).FormData = MockFormData;

describe('resumeService', () => {
  const mockFile = new File(['test content'], 'resume.pdf', { type: 'application/pdf' });
  const mockParseResponse: ResumeParseResponse = {
    personal_info: {
      name: 'John Doe',
      email: 'john@example.com',
      phone: '123-456-7890',
      location: 'San Francisco'
    },
    education: [{
      institution: 'University of Example',
      degree: 'BS',
      field_of_study: 'Computer Science',
      start_date: '2014',
      end_date: '2018'
    }],
    work_experience: [{
      company: 'Tech Co',
      job_title: 'Software Engineer',
      start_date: '2018',
      end_date: 'Present',
      description: 'Full stack development'
    }],
    skills: [{
      name: 'JavaScript',
      category: 'Programming',
      years: 5
    }]
  };

  const mockedApiService = apiService as jest.Mocked<typeof apiService>;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('uploadResume', () => {
    it('should upload and parse a resume file successfully', async () => {
      mockedApiService.uploadFile.mockResolvedValueOnce(mockParseResponse);

      await act(async () => {
        const response = await uploadResume(mockFile);
        expect(response).toEqual(mockParseResponse);
        expect(apiService.uploadFile).toHaveBeenCalledWith(
          '/resume/parse',
          expect.any(MockFormData)
        );
      });
    });

    it('should handle upload errors', async () => {
      const error = new Error('Upload failed');
      mockedApiService.uploadFile.mockRejectedValueOnce(error);

      await act(async () => {
        await expect(uploadResume(mockFile)).rejects.toThrow('Upload failed');
      });
    });
  });

  describe('saveResume', () => {
    it('should save parsed resume data successfully', async () => {
      const mockSaveResponse = {
        id: 1,
        file_name: 'resume.pdf',
        parsed_data: mockParseResponse
      };

      mockedApiService.post.mockResolvedValueOnce(mockSaveResponse);

      const result = await saveResume('resume.pdf', mockParseResponse);
      
      expect(result).toEqual(mockSaveResponse);
      expect(mockedApiService.post).toHaveBeenCalledWith(
        '/resume/save',
        expect.any(MockFormData)
      );
    });

    it('should handle save errors', async () => {
      mockedApiService.post.mockRejectedValueOnce(new Error('Save failed'));
      
      await expect(saveResume('resume.pdf', mockParseResponse)).rejects.toThrow('Save failed');
    });
  });
}); 