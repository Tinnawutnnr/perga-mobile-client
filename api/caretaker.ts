import { apiClient } from "./client";

import { FallAnalysisResponse,
    DailyAverage,
    MonthlyAverage, 
    WeeklyAverage, 
    YearlyAverage } from "@/types/report";
import { PatientBrief, PatientProfile } from "@/types/patient";
import { AllMetricsBenchmarkSchema } from "@/types/compare";
import { AnomalyLogSchema } from "@/types/anomaly";

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

  getPatientBenchmark: (username: string, token: string) =>
    apiClient.get<AllMetricsBenchmarkSchema>(`/caretakers/patients/benchmark/${username}`, token),

   // GET /patients/me/dailyAverage
  getPatientDailyAverages: (username: string, token: string) =>
    apiClient.get<DailyAverage[]>(`/caretakers/patients/dailyAverage/${username}`, token),
  
  // GET /patients/me/weeklyAverage
  getPatientWeeklyAverage: (username: string, token: string) =>
    apiClient.get<WeeklyAverage[]>(`/caretakers/patients/weeklyAverage/${username}`, token),
  
  // GET /patients/me/monthlyAverage
  getPatientMonthlyAverage: (username: string, token: string) =>
    apiClient.get<MonthlyAverage[]>(`/caretakers/patients/monthlyAverage/${username}`, token),
  
  // GET /patients/me/yearlyAverage
  getPatientYearlyAverage: (username: string, token: string) =>
      apiClient.get<YearlyAverage[]>(`/caretakers/patients/yearlyAverage/${username}`, token),

  // GET /caretakers/patients/anomalylog
  getPatientAnomalyLog: (username: string, token: string) =>
    apiClient.get<AnomalyLogSchema>(`/caretakers/patients/anomalyLog/${username}`, token),

};
export { PatientBrief, PatientProfile };
