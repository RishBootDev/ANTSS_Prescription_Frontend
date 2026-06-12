import { apiClient } from "@/src/services/axios";
import { LoginRequest, AuthResponse, ApiResponse } from "../types/auth.types";

export const authService = {
  async login(request: LoginRequest): Promise<ApiResponse<AuthResponse>> {
    return apiClient.post<ApiResponse<AuthResponse>>("/api/auth/login", request);
  },

  async logout(): Promise<ApiResponse<void>> {
    return apiClient.post<ApiResponse<void>>("/api/auth/logout");
  },

  async refreshToken(refreshToken: string): Promise<ApiResponse<AuthResponse>> {
    return apiClient.post<ApiResponse<AuthResponse>>("/api/auth/refresh-token", { refreshToken });
  },
};
