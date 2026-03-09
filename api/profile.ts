import { apiClient } from "./client";

export type CreateProfileRequest = {
  first_name: string;
  last_name: string;
  age?: number;
  height?: number;
  weight?: number;
};

export const profileApi = {
  createProfile: (body: CreateProfileRequest, token: string) =>
    apiClient.post<void>("/profiles/me", body, token),
};
