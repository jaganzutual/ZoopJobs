import { act } from 'react';
import apiService from '../apiService/apiService';
import { uploadResume, parseResume, ResumeParseResponse } from './resumeService';

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
  private data: Map<string, any>;

  constructor() {
    this.data = new Map();
  }

  append(key: string, value: any) {
    this.data.set(key, value);
  }

  get(key: string) {
    return this.data.get(key);
  }

  delete(key: string) {
    this.data.delete(key);
  }

  has(key: string) {
    return this.data.has(key);
  }
}

// Replace global FormData with mock
(global as any).FormData = MockFormData;

describe('resumeService', () => {
  const mockFile = new File(['test content'], 'resume.pdf', { type: 'application/pdf' });
  const mockUploadResponse = {
    id: '123',
    url: 'https://example.com/resume.pdf'
  };
  const mockedApiService = apiService as jest.Mocked<typeof apiService>;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('uploadResume', () => {
    it('should upload a resume file successfully', async () => {
      (apiService.uploadFile as jest.Mock).mockResolvedValueOnce(mockUploadResponse);

      await act(async () => {
        const response = await uploadResume(mockFile);
        expect(response).toEqual(mockUploadResponse);
        expect(apiService.uploadFile).toHaveBeenCalledWith(
          '/resumes/upload',
          expect.any(MockFormData)
        );
      });
    });

    it('should handle upload errors', async () => {
      const error = new Error('Upload failed');
      (apiService.uploadFile as jest.Mock).mockRejectedValueOnce(error);

      await act(async () => {
        await expect(uploadResume(mockFile)).rejects.toThrow('Upload failed');
      });
    });
  });

  describe('parseResume', () => {
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
        years: 5
      }]
    };

    test('should parse a resume file successfully', async () => {
      mockedApiService.post.mockResolvedValueOnce(mockParseResponse);

      const result = await parseResume("mock-file-id");
      
      expect(result).toEqual(mockParseResponse);
      expect(mockedApiService.post).toHaveBeenCalledWith(
        '/resumes/parse',
        { fileId: "mock-file-id" }
      );
    });

    test('should handle parsing errors', async () => {
      mockedApiService.post.mockRejectedValueOnce(new Error('Parsing failed'));
      
      await expect(parseResume("mock-file-id")).rejects.toThrow('Parsing failed');
    });

    test('should return default values for missing data', async () => {
      mockedApiService.post.mockResolvedValueOnce({});
      
      const result = await parseResume("mock-file-id");
      
      expect(result).toEqual({
        personal_info: {
          name: '',
          email: '',
          phone: '',
          location: ''
        },
        education: [],
        work_experience: [],
        skills: []
      });
    });
  });
}); 