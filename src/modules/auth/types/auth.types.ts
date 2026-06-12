export interface UserResponse {
  id: string;
  fullName: string;
  email: string;
  mobileNumber: string;
  userType: "DOCTOR" | "CLINIC" | "HOSPITAL" | "ADMIN" | string;
  status: "PENDING" | "APPROVED" | "REJECTED" | "EXPIRED" | "INACTIVE" | string;
  role: "ROLE_USER" | "ROLE_ADMIN" | string;
  registrationDate?: string;
  createdAt?: string;
  doctorId?: string;
  hospitalId?: number | null;
  clinicId?: number | null;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  user: UserResponse;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface LoginRequest {
  email: string;
  password?: string;
  deviceInfo?: string;
}
