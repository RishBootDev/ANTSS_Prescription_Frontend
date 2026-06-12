import { useAuthStore } from "@/src/store/authStore";

export function useAuth() {
  const { user, token, isAuthenticated, login, logout, initialize } = useAuthStore();

  return {
    user,
    token,
    isAuthenticated,
    login,
    logout,
    initialize,
    isAdmin: user?.role === "ROLE_ADMIN",
    isDoctor: user?.userType === "DOCTOR",
    isClinic: user?.userType === "CLINIC",
    isHospital: user?.userType === "HOSPITAL",
  };
}
