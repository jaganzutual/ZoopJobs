import { AxiosInstance } from 'axios';

const mockAxios: AxiosInstance = {
  create: jest.fn(() => mockAxios),
  get: jest.fn(),
  post: jest.fn(),
  put: jest.fn(),
  delete: jest.fn(),
  patch: jest.fn(),
  defaults: {
    baseURL: '',
    headers: {
      common: {}
    }
  },
  interceptors: {
    request: { use: jest.fn(), eject: jest.fn(), clear: jest.fn() },
    response: { use: jest.fn(), eject: jest.fn(), clear: jest.fn() }
  },
  request: jest.fn(),
  head: jest.fn(),
  options: jest.fn()
} as any;

export default mockAxios; 