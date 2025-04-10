import apiService from './apiService';

// API endpoints
const RESUME_PARSE_ENDPOINT = '/resume/parse';
const RESUME_SAVE_ENDPOINT = '/resume/save';

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
  name?: string;
  category?: string;
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

export interface UserProfile {
  id: number;
  email?: string;
  created_at: string;
  profile?: {
    id: number;
    user_id: number;
    first_name?: string;
    last_name?: string;
    location?: string;
    role?: string;
    experience?: string;
    is_student: boolean;
    job_title?: string;
    company?: string;
    linkedin?: string;
    website?: string;
    is_employed: boolean;
  };
  resume?: {
    id: number;
    user_id: number;
    file_name?: string;
    parsed_data?: any;
    education: Education[];
    work_experience: WorkExperience[];
    skills: Skill[];
  };
}

/**
 * Upload and parse a resume file
 * @param file The resume file to upload
 * @returns The parsed resume data
 */
export const uploadResume = async (file: File): Promise<string> => {
  // This is a placeholder function that doesn't do anything in the current implementation
  // We're keeping it to maintain compatibility with existing code
  return file.name;
};

/**
 * Parse a resume file using the FastAPI backend
 * @param file The resume file to parse
 * @returns The parsed resume data
 */
export const parseResume = async (fileNameOrId: string): Promise<ResumeParseResponse> => {
  try {
    // Get the file from the input element
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    if (!fileInput || !fileInput.files || fileInput.files.length === 0) {
      throw new Error("No file selected");
    }
    
    const file = fileInput.files[0];
    const formData = new FormData();
    formData.append('file', file);
    
    // Parse the resume using the apiService
    const parsedData = await apiService.uploadFile<ResumeParseResponse>(RESUME_PARSE_ENDPOINT, formData);
    
    // Save the parsed resume data
    const saveFormData = new FormData();
    saveFormData.append('file_name', file.name);
    saveFormData.append('personal_info', JSON.stringify(parsedData.personal_info || {}));
    saveFormData.append('education', JSON.stringify(parsedData.education || []));
    saveFormData.append('work_experience', JSON.stringify(parsedData.work_experience || []));
    saveFormData.append('skills', JSON.stringify(parsedData.skills || []));
    
    await apiService.uploadFile(RESUME_SAVE_ENDPOINT, saveFormData);
    
    return parsedData;
  } catch (error) {
    console.error('Error parsing resume:', error);
    throw error;
  }
}; 