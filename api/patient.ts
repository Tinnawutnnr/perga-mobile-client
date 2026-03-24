import { FallAnalysisResponse, DailyAverage } from "@/types/report";
import { apiClient } from "./client";

export const patientApi = {
    
    // GET /patients/me/dailyAverage
    getDailyAverages: (token: string) =>
        apiClient.get<DailyAverage[]>("/patients/me/dailyAverage", token),

    // GET /patients/me/fallAnalysis
    getFallAnalysis: (fallDate: string, token: string) =>
        apiClient.get<FallAnalysisResponse>(`/patients/me/fallAnalysis?date_str=${fallDate}`, token),

    // GET /patients/me/dailyAverage/byDate
    getDailyAverageByDate: (date: string, token: string) =>
        apiClient.get<DailyAverage>(`/patients/me/dailyAverage/byDate?date_str=${date}`, token),
};