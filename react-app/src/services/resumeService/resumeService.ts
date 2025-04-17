import apiService from '../apiService/apiService';

// API endpoints
const RESUME_UPLOAD_ENDPOINT = '/resumes/upload';
const RESUME_PARSE_ENDPOINT = '/resumes/parse';

export interface Education {
  institution?: string;
  degree?: string;
  field_of_study?: string;
  start_date?: string;
  end_date?: string;
  description?: string;
}

export interface WorkExperience {
  company?: string;
  job_title?: string;
  start_date?: string;
  end_date?: string;
  description?: string;
}

export interface Skill {
  name: string;
  category?: string;
  years: number;
}

export interface PersonalInfo {
  name?: string;
  email?: string;
  phone?: string;
  location?: string;
  linkedin?: string;
  website?: string;
  summary?: string;
}

export interface ResumeParseResponse {
  personal_info: PersonalInfo;
  education: Education[];
  work_experience: WorkExperience[];
  skills: Skill[];
}

export interface UploadResponse {
  id: string;
  url: string;
}

/**
 * Upload a resume file
 * @param file The resume file to upload
 * @returns The response from the API
 */
export const uploadResume = async (file: File): Promise<UploadResponse> => {
  try {
    const formData = new FormData();
    formData.append('file', file);
    return await apiService.uploadFile(RESUME_UPLOAD_ENDPOINT, formData);
  } catch (error) {
    console.error('Error uploading resume:', error);
    throw error;
  }
};

/**
 * Parse a resume file
 * @param fileId The ID of the uploaded resume file
 * @returns The parsed resume data
 */
export const parseResume = async (fileId: string): Promise<ResumeParseResponse> => {
  try {
    // Send the fileId for parsing
    const parsedData = await apiService.post<ResumeParseResponse>(RESUME_PARSE_ENDPOINT, {
      fileId
    });
    
    // Return the parsed data
    return {
      personal_info: parsedData.personal_info || {
        name: '',
        email: '',
        phone: '',
        location: ''
      },
      education: parsedData.education || [],
      work_experience: parsedData.work_experience || [],
      skills: parsedData.skills || []
    };
  } catch (error) {
    console.error('Error parsing resume:', error);
    throw error;
  }
}; 