import { apiClient } from "./client";

import { FallAnalysisResponse,
    DailyAverage,
    MonthlyAverage, 
    WeeklyAverage, 
    YearlyAverage } from "@/types/report";
import { PatientBrief, PatientProfile } from "@/types/patient";
import { AllMetricsBenchmarkSchema } from "@/types/compare";
import { AnomalyLogSchema } from "@/types/anomaly";

export const caregiverApi = {
  getPatients: (token: string) =>
    apiClient.get<PatientBrief[]>("/caregivers/patients", token),

  getPatient: (username: string, token: string) =>
    apiClient.get<PatientProfile>(`/caregivers/patients/${username}`, token),

  linkPatient: (username: string, token: string) =>
    apiClient.post<PatientBrief>("/caregivers/patients", { username }, token),

  unlinkPatient: (username: string, token: string) =>
    apiClient.delete<void>(`/caregivers/patients/${username}`, token),

  getDailyAverageByDate: (username: string, date: string, token: string) => {
    const path = `/caregivers/patients/dailyAverage/byDate/${username}?date_str=${date}`;
    return apiClient.get<DailyAverage | null>(path, token);
  },

  getFallAnalysis: (username: string, fallDate: string, token: string) =>
    apiClient.get<FallAnalysisResponse>(`/caregivers/patients/fallAnalysis/${username}?date_str=${fallDate}`, token),

  getPatientBenchmark: (username: string, token: string) =>
    apiClient.get<AllMetricsBenchmarkSchema>(`/caregivers/patients/benchmark/${username}`, token),

   // GET /patients/me/dailyAverage
  getPatientDailyAverages: (username: string, token: string) =>
    apiClient.get<DailyAverage[]>(`/caregivers/patients/dailyAverage/${username}`, token),
  
  // GET /patients/me/weeklyAverage
  getPatientWeeklyAverage: (username: string, token: string) =>
    apiClient.get<WeeklyAverage[]>(`/caregivers/patients/weeklyAverage/${username}`, token),
  
  // GET /patients/me/monthlyAverage
  getPatientMonthlyAverage: (username: string, token: string) =>
    apiClient.get<MonthlyAverage[]>(`/caregivers/patients/monthlyAverage/${username}`, token),
  
  // GET /patients/me/yearlyAverage
  getPatientYearlyAverage: (username: string, token: string) =>
      apiClient.get<YearlyAverage[]>(`/caregivers/patients/yearlyAverage/${username}`, token),

  // GET /caregivers/patients/anomalylog
  getPatientAnomalyLog: (username: string, token: string) =>
    apiClient.get<AnomalyLogSchema>(`/caregivers/patients/anomalyLog/${username}`, token),

};
export { PatientBrief, PatientProfile };
