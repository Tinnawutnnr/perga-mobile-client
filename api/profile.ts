import {
  CreateProfileRequest,
  MyProfile,
  ProfileStatus,
} from "@/types/profile";
import { apiClient } from "./client";

export const profileApi = {
  createProfile: (body: CreateProfileRequest, token: string) =>
    apiClient.post<void>("/profiles/me", body, token),

  getStatus: (token: string) =>
    apiClient.get<ProfileStatus>("/profiles/me/status", token),

  getMe: (token: string) => apiClient.get<MyProfile>("/profiles/me", token),

  updateMe: (body: Partial<MyProfile>, token: string) =>
    apiClient.put<MyProfile>("/profiles/me", body, token),
};
