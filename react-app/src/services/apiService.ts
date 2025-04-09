import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8028/api';

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Define API service class
class ApiService {
  // Generic GET request
  async get<T>(endpoint: string, config?: AxiosRequestConfig): Promise<T> {
    try {
      const response: AxiosResponse<T> = await apiClient.get(endpoint, config);
      return response.data;
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }

  // Generic POST request
  async post<T>(endpoint: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    try {
      const response: AxiosResponse<T> = await apiClient.post(endpoint, data, config);
      return response.data;
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }

  // Generic PUT request
  async put<T>(endpoint: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    try {
      const response: AxiosResponse<T> = await apiClient.put(endpoint, data, config);
      return response.data;
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }

  // Generic DELETE request
  async delete<T>(endpoint: string, config?: AxiosRequestConfig): Promise<T> {
    try {
      const response: AxiosResponse<T> = await apiClient.delete(endpoint, config);
      return response.data;
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }

  // File upload with FormData
  async uploadFile<T>(endpoint: string, formData: FormData, config?: AxiosRequestConfig): Promise<T> {
    try {
      const uploadConfig: AxiosRequestConfig = {
        ...config,
        headers: {
          'Content-Type': 'multipart/form-data',
          ...config?.headers,
        },
      };
      
      const response: AxiosResponse<T> = await apiClient.post(endpoint, formData, uploadConfig);
      return response.data;
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }

  // Error handling
  private handleError(error: any): void {
    if (axios.isAxiosError(error)) {
      const serverError = error.response?.data;
      console.error('API Error:', serverError || error.message);
    } else {
      console.error('Unexpected error:', error);
    }
  }
}

// Create and export a singleton instance
const apiService = new ApiService();
export default apiService; 