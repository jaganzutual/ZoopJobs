import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8038/api';
const RESUME_UPLOAD_ENDPOINT = process.env.REACT_APP_RESUME_UPLOAD_ENDPOINT || '/resume/upload';
const RESUME_PARSE_ENDPOINT = process.env.REACT_APP_RESUME_PARSE_ENDPOINT || '/resume/parse';

export interface ResumeParseResponse {
  name?: string;
  email?: string;
  phone?: string;
  skills?: string[];
  experience?: {
    company?: string;
    title?: string;
    duration?: string;
    description?: string;
  }[];
  education?: {
    institution?: string;
    degree?: string;
    year?: string;
  }[];
  location?: string;
  linkedIn?: string;
  github?: string;
}

/**
 * Upload a resume file to the server
 * @param file The resume file to upload
 * @returns The response from the server
 */
export const uploadResume = async (file: File): Promise<string> => {
  const formData = new FormData();
  formData.append('resume', file);

  try {
    const response = await axios.post(`${API_URL}${RESUME_UPLOAD_ENDPOINT}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data.fileId || '';
  } catch (error) {
    console.error('Error uploading resume:', error);
    throw error;
  }
};

/**
 * Parse a resume file that was previously uploaded
 * @param fileId The ID of the file to parse
 * @returns The parsed resume data
 */
export const parseResume = async (fileId: string): Promise<ResumeParseResponse> => {
  try {
    const response = await axios.post(`${API_URL}${RESUME_PARSE_ENDPOINT}`, { fileId });
    return response.data;
  } catch (error) {
    console.error('Error parsing resume:', error);
    throw error;
  }
}; 