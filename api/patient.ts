import { FallAnalysisResponse, 
    DailyAverage, 
    WeeklyAverage, 
    MonthlyAverage, 
    YearlyAverage } from "@/types/report";
import { WindowReport } from "@/types/metric";
import { AllMetricsBenchmarkSchema } from "@/types/compare";
import { apiClient } from "./client";

export const patientApi = {
    
    // GET /patients/me/dailyAverage
    getDailyAverages: (token: string) =>
        apiClient.get<DailyAverage[]>("/patients/me/dailyAverage", token),

    // GET /patients/me/weeklyAverage
    getWeeklyAverage: (token: string) =>
        apiClient.get<WeeklyAverage[]>("/patients/me/weeklyAverage", token),

    // GET /patients/me/monthlyAverage
    getMonthlyAverage: (token: string) =>
        apiClient.get<MonthlyAverage[]>("/patients/me/monthlyAverage", token),

    // GET /patients/me/yearlyAverage
    getYearlyAverage: (token: string) =>
        apiClient.get<YearlyAverage[]>("/patients/me/yearlyAverage", token),

    // GET /patients/me/fallAnalysis
    getFallAnalysis: (fallDate: string, token: string) =>
        apiClient.get<FallAnalysisResponse>(`/patients/me/fallAnalysis?date_str=${fallDate}`, token),

    // GET /patients/me/dailyAverage/byDate
    getDailyAverageByDate: (date: string, token: string) =>
        apiClient.get<DailyAverage>(`/patients/me/dailyAverage/byDate?date_str=${date}`, token),

    // GET /patients/me/windowReport
    getWindowReport: (token: string) =>
        apiClient.get<WindowReport>("/patients/me/windowReport", token),

    getBenchmark: (token: string) =>
        apiClient.get<AllMetricsBenchmarkSchema>("/patients/me/benchmark", token),
};  