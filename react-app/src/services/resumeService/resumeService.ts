import apiService from '../apiService/apiService';
import { RESUME_UPLOAD_ENDPOINT, RESUME_PARSE_ENDPOINT } from '../apiService/apiEndpoints';

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
  years?: number;
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
 * Upload and parse a resume file
 * @param file The resume file to upload
 * @returns The parsed resume data
 */
export const uploadResume = async (file: File): Promise<ResumeParseResponse> => {
  try {
    const formData = new FormData();
    formData.append('file', file);

    return await apiService.post<ResumeParseResponse>(
      RESUME_UPLOAD_ENDPOINT,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      }
    );
  } catch (error) {
    console.error('Error uploading resume:', error);
    throw error;
  }
};

/**
 * Save the parsed resume data
 * @param fileName The name of the uploaded file
 * @param parsedData The parsed resume data
 * @returns The saved resume data
 */
export const saveResume = async (fileName: string, parsedData: ResumeParseResponse): Promise<ResumeParseResponse> => {
  try {
    const formData = new FormData();
    formData.append('file_name', fileName);
    formData.append('personal_info', JSON.stringify(parsedData.personal_info));
    formData.append('education', JSON.stringify(parsedData.education));
    formData.append('work_experience', JSON.stringify(parsedData.work_experience));
    formData.append('skills', JSON.stringify(parsedData.skills));

    return await apiService.post<ResumeParseResponse>(
      RESUME_PARSE_ENDPOINT,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      }
    );
  } catch (error) {
    console.error('Error saving resume:', error);
    throw error;
  }
}; 