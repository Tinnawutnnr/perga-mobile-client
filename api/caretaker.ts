import { apiClient } from "./client";

import { DailyAverage } from "@/types/metric";
import { FallAnalysisResponse } from "@/types/report";
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

  getDailyAverageByDate: (username: string, date: string, token: string) => {
    const path = `/caretakers/patients/dailyAverage/byDate/${username}?date_str=${date}`;
    return apiClient.get<DailyAverage | null>(path, token);
  },

  getFallAnalysis: (username: string, fallDate: string, token: string) =>
    apiClient.get<FallAnalysisResponse>(`/caretakers/patients/fallAnalysis/${username}?date_str=${fallDate}`, token),

};
export { PatientBrief, PatientProfile };
