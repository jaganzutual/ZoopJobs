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

// Default empty implementation of ResumeParseResponse
const createEmptyResumeResponse = (): ResumeParseResponse => ({
  personal_info: {
    name: '',
    email: '',
    phone: '',
    location: '',
    linkedin: '',
    website: '',
    summary: ''
  },
  education: [],
  work_experience: [],
  skills: []
});

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
    const response = await apiService.post<any>(
      RESUME_UPLOAD_ENDPOINT,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      }
    );
    console.log('[uploadResume] Upload successful. Raw response:', JSON.stringify(response, null, 2));
    
    // Validate the response structure
    if (!response) {
      console.error('[uploadResume] Response is null or undefined');
      throw new Error('Empty response from server');
    }
    
    // Extract the actual data from the response structure
    // The API returns { status, message, data, error } where data contains the actual resume data
    const actualData = response.data || response;
    console.log('[uploadResume] Extracted data from response:', JSON.stringify(actualData, null, 2));
    
    // Create a valid ResumeParseResponse object with default values for missing fields
    const emptyResponse = createEmptyResumeResponse();
    const validatedResponse: ResumeParseResponse = {
      personal_info: {
        ...emptyResponse.personal_info,
        ...(actualData.personal_info || {})
      },
      education: Array.isArray(actualData.education) ? actualData.education : [],
      work_experience: Array.isArray(actualData.work_experience) ? actualData.work_experience : [],
      skills: Array.isArray(actualData.skills) ? actualData.skills : []
    };
    
    console.log('[uploadResume] Validated response structure:', JSON.stringify(validatedResponse, null, 2));
    return validatedResponse;
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
    console.log('[saveResume] Full parsedData:', JSON.stringify(parsedData, null, 2));
    
    // Validate the structure of parsedData
    if (!parsedData) {
      console.error('[saveResume] parsedData is null or undefined');
      throw new Error('Resume data is missing');
    }
    
    // Check and log each property with safe access
    console.log('[saveResume] Parsed data summary:', {
      personalInfo: parsedData.personal_info || 'missing',
      education: Array.isArray(parsedData.education) ? `${parsedData.education.length} items` : 'not an array',
      workExperience: Array.isArray(parsedData.work_experience) ? `${parsedData.work_experience.length} items` : 'not an array',
      skills: Array.isArray(parsedData.skills) ? `${parsedData.skills.length} items` : 'not an array'
    });

    // Ensure we have valid arrays even if the API returned null/undefined
    const emptyResponse = createEmptyResumeResponse();
    const education = Array.isArray(parsedData.education) ? parsedData.education : [];
    const workExperience = Array.isArray(parsedData.work_experience) ? parsedData.work_experience : [];
    const skills = Array.isArray(parsedData.skills) ? parsedData.skills : [];
    const personalInfo = {
      ...emptyResponse.personal_info,
      ...(parsedData.personal_info || {})
    };

    const formData = new FormData();
    formData.append('file_name', fileName);
    formData.append('personal_info', JSON.stringify(personalInfo));
    formData.append('education', JSON.stringify(education));
    formData.append('work_experience', JSON.stringify(workExperience));
    formData.append('skills', JSON.stringify(skills));
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
    console.log('[saveResume] Save successful. Response:', JSON.stringify(response, null, 2));
    
    // Validate the response and ensure it has the correct structure
    const validatedResponse: ResumeParseResponse = {
      personal_info: {
        ...emptyResponse.personal_info,
        ...(response.personal_info || {})
      },
      education: Array.isArray(response.education) ? response.education : [],
      work_experience: Array.isArray(response.work_experience) ? response.work_experience : [],
      skills: Array.isArray(response.skills) ? response.skills : []
    };
    
    return validatedResponse;
  } catch (error) {
    console.error('[saveResume] Error saving resume:', error);
    console.error('[saveResume] Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    });
    throw error;
  }
}; 