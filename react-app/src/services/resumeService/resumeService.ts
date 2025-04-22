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
    console.log('[uploadResume] Starting resume upload process');
    console.log('[uploadResume] File details:', {
      name: file.name,
      size: file.size,
      type: file.type
    });

    const formData = new FormData();
    formData.append('file', file);
    console.log('[uploadResume] FormData created and file appended');

    console.log('[uploadResume] Sending request to:', RESUME_UPLOAD_ENDPOINT);
    const response = await apiService.post<ResumeParseResponse>(
      RESUME_UPLOAD_ENDPOINT,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      }
    );
    console.log('[uploadResume] Upload successful. Response:', response);
    return response;
  } catch (error) {
    console.error('[uploadResume] Error uploading resume:', error);
    console.error('[uploadResume] Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    });
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
    console.log('[saveResume] Starting resume save process');
    console.log('[saveResume] Filename:', fileName);
    console.log('[saveResume] Parsed data summary:', {
      personalInfo: parsedData.personal_info,
      educationCount: parsedData.education.length,
      workExperienceCount: parsedData.work_experience.length,
      skillsCount: parsedData.skills.length
    });

    const formData = new FormData();
    formData.append('file_name', fileName);
    formData.append('personal_info', JSON.stringify(parsedData.personal_info));
    formData.append('education', JSON.stringify(parsedData.education));
    formData.append('work_experience', JSON.stringify(parsedData.work_experience));
    formData.append('skills', JSON.stringify(parsedData.skills));
    console.log('[saveResume] FormData created with all fields');

    console.log('[saveResume] Sending request to:', RESUME_PARSE_ENDPOINT);
    const response = await apiService.post<ResumeParseResponse>(
      RESUME_PARSE_ENDPOINT,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      }
    );
    console.log('[saveResume] Save successful. Response:', response);
    return response;
  } catch (error) {
    console.error('[saveResume] Error saving resume:', error);
    console.error('[saveResume] Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    });
    throw error;
  }
}; 