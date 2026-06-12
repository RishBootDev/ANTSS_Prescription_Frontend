import { create } from "zustand";
import { UserResponse } from "../modules/auth/types/auth.types";
import { tokenService } from "../modules/auth/services/token.service";
import { authService } from "../modules/auth/services/auth.service";

// Extend UserResponse to include backward compatible optional name field
export interface AuthUser extends UserResponse {
  name?: string;
}

interface AuthState {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (user: UserResponse, token: string, refreshToken: string) => void;
  logout: () => Promise<void>;
  initialize: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  isAuthenticated: false,

  login: (user, token, refreshToken) => {
    const mappedUser: AuthUser = {
      ...user,
      name: user.fullName,
    };
    tokenService.setAccessToken(token);
    tokenService.setRefreshToken(refreshToken);
    tokenService.setUser(mappedUser);
    set({ user: mappedUser, token, isAuthenticated: true });
  },

  logout: async () => {
    try {
      await authService.logout().catch(() => {});
    } catch {
      // Ignore network errors during logout
    }
    tokenService.clearAuth();
    set({ user: null, token: null, isAuthenticated: false });
    if (typeof window !== "undefined") {
      window.location.href = "/login";
    }
  },

  initialize: () => {
    if (typeof window === "undefined") return;
    const token = tokenService.getAccessToken();
    const user = tokenService.getUser();
    if (token && user) {
      const mappedUser: AuthUser = {
        ...user,
        name: (user as any).name || user.fullName,
      };
      set({ user: mappedUser, token, isAuthenticated: true });
    } else {
      set({ user: null, token: null, isAuthenticated: false });
    }
  },
}));
