import { apiClient } from "./client";

import { DailyAverage } from "@/types/metric";
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

  getDailyAverages: (
    patientId: number,
    token: string,
    params?: {
      start_date?: string; // "YYYY-MM-DD"
      end_date?: string;
    },
  ) => {
    const query = new URLSearchParams(params as any).toString();
    return apiClient.get<DailyAverage[]>(
      `/patients/${patientId}/daily-averages${query ? `?${query}` : ""}`,
      token,
    );
  },
};
export { PatientBrief, PatientProfile };
