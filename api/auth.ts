import { apiClient } from "./client";

export type RegisterRequest = {
  username: string;
  password: string;
  role: string;
};

export type LoginRequest = {
  username: string;
  password: string;
};

export type AuthResponse = {
  access_token: string;
  token_type: string;
};

export const authApi = {
  register: (body: RegisterRequest) =>
    apiClient.post<AuthResponse>("/auth/register", body),

  login: (body: LoginRequest) =>
    apiClient.postForm<AuthResponse>("/auth/login", body),
};
