import axios from "axios";
import { tokenService } from "../modules/auth/services/token.service";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || (process.env.NODE_ENV === "development" ? "https://api.antss.in" : "");

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

export const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request Interceptor: attach token
axiosInstance.interceptors.request.use(
  (config) => {
    const token = tokenService.getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Automatically let the browser set the boundary for multipart/form-data
    if (config.data instanceof FormData) {
      delete config.headers["Content-Type"];
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor: handle 401 and auto refresh
let isRefreshing = false;
let failedQueue: any[] = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // Check if error response is 401 and request has not already been retried
    if (error.response?.status === 401 && !originalRequest._retry) {
      // Don't refresh token if the 401 was on login or refresh endpoint
      if (originalRequest.url?.includes("/api/auth/login") || originalRequest.url?.includes("/api/auth/refresh-token")) {
        return Promise.reject(error);
      }

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return axiosInstance(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = tokenService.getRefreshToken();
      if (!refreshToken) {
        isRefreshing = false;
        tokenService.clearAuth();
        if (typeof window !== "undefined") {
          window.location.href = "/login";
        }
        return Promise.reject(error);
      }

      try {
        const response = await axios.post(`${API_BASE_URL}/api/auth/refresh-token`, {
          refreshToken,
        });

        if (response.data?.success && response.data?.data) {
          const { accessToken, refreshToken: newRefreshToken, user } = response.data.data;
          tokenService.setAccessToken(accessToken);
          tokenService.setRefreshToken(newRefreshToken);
          if (user) {
            tokenService.setUser(user);
          }
          axiosInstance.defaults.headers.common["Authorization"] = `Bearer ${accessToken}`;
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          processQueue(null, accessToken);
          return axiosInstance(originalRequest);
        } else {
          throw new Error("Invalid token refresh payload");
        }
      } catch (refreshError) {
        processQueue(refreshError, null);
        tokenService.clearAuth();
        if (typeof window !== "undefined") {
          window.location.href = "/login";
        }
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    // Map Axios error message format to custom ApiError
    const message = error.response?.data?.message || error.message || "Network request failed";
    const status = error.response?.status || 500;
    return Promise.reject(new ApiError(message, status));
  }
);

export const apiClient = {
  async get<T>(path: string, options?: any): Promise<T> {
    try {
      const response = await axiosInstance.get<T>(path, options);
      return response.data;
    } catch (err: any) {
      throw err;
    }
  },

  async post<T>(path: string, body?: any, options?: any): Promise<T> {
    try {
      const response = await axiosInstance.post<T>(path, body, options);
      return response.data;
    } catch (err: any) {
      throw err;
    }
  },

  async put<T>(path: string, body?: any, options?: any): Promise<T> {
    try {
      const response = await axiosInstance.put<T>(path, body, options);
      return response.data;
    } catch (err: any) {
      throw err;
    }
  },

  async patch<T>(path: string, body?: any, options?: any): Promise<T> {
    try {
      const response = await axiosInstance.patch<T>(path, body, options);
      return response.data;
    } catch (err: any) {
      throw err;
    }
  },

  async delete<T>(path: string, options?: any): Promise<T> {
    try {
      const response = await axiosInstance.delete<T>(path, options);
      return response.data;
    } catch (err: any) {
      throw err;
    }
  },
};
