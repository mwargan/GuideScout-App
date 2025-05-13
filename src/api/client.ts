import axios from "axios";
import { handle401Error, handle403Error, handle500Error } from "./errorHandler";
export interface ApiClientInterface {
  get<T = any>(url: string, params?: any): Promise<T>;
  post<T = any>(url: string, data?: any, params?: any): Promise<T>;
  put<T = any>(url: string, data?: any, params?: any): Promise<T>;
  delete<T = any>(url: string, params?: any): Promise<T>;
  defaults: {
    headers: {
      common: {
        [key: string]: string;
      };
    };
  };
}

const ApiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
    "X-Requested-With": "XMLHttpRequest",
    "Accept-Language": navigator.language,
  },
  withCredentials: true,
  withXSRFToken: true,
});

ApiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      return handle401Error(error);
    }

    if (error.response?.status === 403) {
      return handle403Error(error);
    }

    if (error.response?.status === 500) {
      return handle500Error(error);
    }

    return Promise.reject(error);
  }
);

export default ApiClient as ApiClientInterface;

export interface ApiFunction<RequestPayload = void, ResponsePayload = void> {
  (data?: RequestPayload): Promise<ResponsePayload>;
}
