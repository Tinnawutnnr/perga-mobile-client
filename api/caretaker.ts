import { apiClient } from "./client";

import { PatientBrief, PatientProfile } from "@/types/patient";

export const caretakerApi = {
  getPatients: (token: string) =>
    apiClient.get<PatientBrief[]>("/caretakers/patients", token),

  getPatient: (username: string, token: string) =>
    apiClient.get<PatientProfile>(`/caretakers/patients/${username}`, token),

  linkPatient: (username: string, token: string) =>
    apiClient.post<PatientBrief>("/caretakers/patients", { username }, token),
  unlinkPatient: (username: string, token: string) =>
    apiClient.delete<void>(`/caretakers/patients/${username}`, token),
};
export { PatientProfile, PatientBrief };

