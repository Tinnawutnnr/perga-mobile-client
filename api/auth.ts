import type {
  AuthResponse,
  ForgotPasswordRequest,
  ForgotPasswordResponse,
  LoginRequest,
  RegisterRequest,
  ResetPasswordRequest,
  ResetPasswordResponse,
} from "@/types/auth";
import { apiClient } from "./client";

export type {
  AuthResponse,
  ForgotPasswordRequest,
  ForgotPasswordResponse,
  LoginRequest,
  RegisterRequest,
  ResetPasswordRequest,
  ResetPasswordResponse,
};

export const authApi = {
  register: (body: RegisterRequest) =>
    apiClient.post<AuthResponse>("/auth/register", body),
  login: (body: LoginRequest) =>
    apiClient.postForm<AuthResponse>("/auth/login", body),
  forgotPassword: (body: ForgotPasswordRequest) =>
    apiClient.post<ForgotPasswordResponse>("/auth/forgot-password", body),
  resetPassword: (body: ResetPasswordRequest) =>
    apiClient.post<ResetPasswordResponse>("/auth/reset-password", body),
};
