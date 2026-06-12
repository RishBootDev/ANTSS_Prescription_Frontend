"use client"

export type AuthUser = {
  id: string;
  fullName: string;
  email: string;
  mobileNumber: string;
  userType: string;
  status: string;
  role: string;
  registrationDate: string;
  createdAt: string;
};

export type AuthState = {
  isAuthenticated: boolean;
  user: AuthUser | null;
};

const ACCESS_TOKEN_KEY = "auth_token";
const REFRESH_TOKEN_KEY = "auth_refresh_token";
const USER_KEY = "auth_user";

export function getAuthState(): AuthState {
  if (typeof window === "undefined") return { isAuthenticated: false, user: null };
  const token = window.localStorage.getItem(ACCESS_TOKEN_KEY);
  const userJson = window.localStorage.getItem(USER_KEY);
  
  let user: AuthUser | null = null;
  if (userJson) {
    try {
      user = JSON.parse(userJson);
    } catch (e) {
      user = null;
    }
  }

  return { 
    isAuthenticated: Boolean(token), 
    user 
  };
}

export function loginUser(accessToken: string, refreshToken: string, user: AuthUser) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
  window.localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
  window.localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function logoutUser() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(ACCESS_TOKEN_KEY);
  window.localStorage.removeItem(REFRESH_TOKEN_KEY);
  window.localStorage.removeItem(USER_KEY);
}

export function getAccessToken(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(ACCESS_TOKEN_KEY);
}

export function getRefreshToken(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(REFRESH_TOKEN_KEY);
}

export function getUsername(): string | null {
  if (typeof window === "undefined") return null;
  const userJson = window.localStorage.getItem(USER_KEY);
  if (userJson) {
    try {
      const user = JSON.parse(userJson);
      return user.fullName || user.email;
    } catch (e) {
      return null;
    }
  }
  return null;
}
