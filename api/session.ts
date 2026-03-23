import { apiClient } from "@/api/client";

export const sessionApi = {
  stopSession: (token: string) =>
    apiClient.post<string>("/patients/me/sessions/stop", {}, token),
};
