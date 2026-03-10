import type { AuthResponse, LoginRequest, RegisterRequest } from "@/types/auth";
import { apiClient } from "./client";

export type { AuthResponse, LoginRequest, RegisterRequest };

export const authApi = {
  register: (body: RegisterRequest) =>
    apiClient.post<AuthResponse>("/auth/register", body),
  login: (body: LoginRequest) =>
    apiClient.postForm<AuthResponse>("/auth/login", body),
};
