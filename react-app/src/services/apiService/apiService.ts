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
    console.log(`[API] GET Request: ${endpoint}`, config);
    try {
      const response: AxiosResponse<T> = await apiClient.get(endpoint, config);
      console.log(`[API] GET Response: ${endpoint}`, response.status, response.statusText);
      return response.data;
    } catch (error) {
      console.error(`[API] GET Error: ${endpoint}`, error);
      this.handleError(error);
      throw error;
    }
  }

  // Generic POST request
  async post<T>(endpoint: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    console.log(`[API] POST Request: ${endpoint}`, { data, config });
    try {
      const response: AxiosResponse<T> = await apiClient.post(endpoint, data, config);
      console.log(`[API] POST Response: ${endpoint}`, response.status, response.statusText);
      return response.data;
    } catch (error) {
      console.error(`[API] POST Error: ${endpoint}`, error);
      this.handleError(error);
      throw error;
    }
  }

  // Generic PUT request
  async put<T>(endpoint: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    console.log(`[API] PUT Request: ${endpoint}`, { data, config });
    try {
      const response: AxiosResponse<T> = await apiClient.put(endpoint, data, config);
      console.log(`[API] PUT Response: ${endpoint}`, response.status, response.statusText);
      return response.data;
    } catch (error) {
      console.error(`[API] PUT Error: ${endpoint}`, error);
      this.handleError(error);
      throw error;
    }
  }

  // Generic DELETE request
  async delete<T>(endpoint: string, config?: AxiosRequestConfig): Promise<T> {
    console.log(`[API] DELETE Request: ${endpoint}`, config);
    try {
      const response: AxiosResponse<T> = await apiClient.delete(endpoint, config);
      console.log(`[API] DELETE Response: ${endpoint}`, response.status, response.statusText);
      return response.data;
    } catch (error) {
      console.error(`[API] DELETE Error: ${endpoint}`, error);
      this.handleError(error);
      throw error;
    }
  }

  // File upload with FormData
  async uploadFile<T>(endpoint: string, formData: FormData, config?: AxiosRequestConfig): Promise<T> {
    console.log(`[API] UPLOAD Request: ${endpoint}`, { 
      formDataEntries: Array.from(formData.entries()).map(([key]) => key),
      config 
    });
    try {
      // Create a new config that preserves the FormData boundary
      const uploadConfig: AxiosRequestConfig = {
        ...config,
        headers: {
          'accept': 'application/json',
          'Content-Type': 'multipart/form-data',
          ...config?.headers,
        },
        // Important: Let the browser set the Content-Type header with boundary
        transformRequest: [(data) => data],
      };
      
      const response: AxiosResponse<T> = await apiClient.post(endpoint, formData, uploadConfig);
      console.log(`[API] UPLOAD Response: ${endpoint}`, response.status, response.statusText);
      return response.data;
    } catch (error) {
      console.error(`[API] UPLOAD Error: ${endpoint}`, error);
      this.handleError(error);
      throw error;
    }
  }

  // Error handling
  private handleError(error: any): void {
    if (axios.isAxiosError(error)) {
      const serverError = error.response?.data;
      console.error('[API] Error Details:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: serverError,
        message: error.message,
        url: error.config?.url,
        method: error.config?.method,
        headers: error.config?.headers,
      });
    } else {
      console.error('[API] Unexpected error:', error);
    }
  }
}

// Create and export a singleton instance
const apiService = new ApiService();
export default apiService; 