import { UserResponse } from "../types/auth.types";

const ACCESS_TOKEN_KEY = "auth_token";
const REFRESH_TOKEN_KEY = "auth_refresh_token";
const USER_KEY = "auth_user";

export const tokenService = {
  getAccessToken(): string | null {
    if (typeof window === "undefined") return null;
    return localStorage.getItem(ACCESS_TOKEN_KEY);
  },

  setAccessToken(token: string): void {
    if (typeof window === "undefined") return;
    localStorage.setItem(ACCESS_TOKEN_KEY, token);
  },

  getRefreshToken(): string | null {
    if (typeof window === "undefined") return null;
    return localStorage.getItem(REFRESH_TOKEN_KEY);
  },

  setRefreshToken(token: string): void {
    if (typeof window === "undefined") return;
    localStorage.setItem(REFRESH_TOKEN_KEY, token);
  },

  getUser(): UserResponse | null {
    if (typeof window === "undefined") return null;
    const userStr = localStorage.getItem(USER_KEY);
    if (!userStr) return null;
    try {
      return JSON.parse(userStr) as UserResponse;
    } catch {
      return null;
    }
  },

  setUser(user: UserResponse): void {
    if (typeof window === "undefined") return;
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  },

  clearAuth(): void {
    if (typeof window === "undefined") return;
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  },
};
