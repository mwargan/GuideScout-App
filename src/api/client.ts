import axios from "axios";
import { handle401Error, handle403Error } from "./errorHandler";
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
  xsrfCookieName: "XSRF-TOKEN",
  xsrfHeaderName: "X-XSRF-TOKEN",
});

ApiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 403) {
      return handle403Error(error);
    }

    if (error.response?.status === 401) {
      return handle401Error(error);
    }
    return Promise.reject(error);
  }
);

export default ApiClient;
