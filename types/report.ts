export interface BaseAverage {
    patient_id: number;
    total_windows_analyzed: number | null;
    total_steps: number | null;
    total_calories: number | null;
    total_distance_m: number | null;
    avg_max_gyr_ms: number | null;
    avg_val_gyr_hs: number | null;
    avg_swing_time: number | null;
    avg_stance_time: number | null;
    avg_stride_cv: number | null;
    anomaly_count: number | null;
}

export interface DailyAverage extends BaseAverage {
    daily_report_id: string;
    report_date: string; // "YYYY-MM-DD"
}

export interface WeeklyAverage extends BaseAverage {
    weekly_report_id: string;
    report_week: string; // "YYYY-WW"
}

export interface MonthlyAverage extends BaseAverage {
    monthly_report_id: string;
    report_month: string; // "YYYY-MM"
}

export interface YearlyAverage extends BaseAverage {
    yearly_report_id: string;
    report_year: number; // YYYY
}

export interface ComparisonReport<T> {
    previous: T | null;
    latest: T | null;
}

export interface FallAnalysisResponse {
    week: ComparisonReport<WeeklyAverage>;
    month: ComparisonReport<MonthlyAverage>;
    year: ComparisonReport<YearlyAverage>;
}

/**
 * Used in CompareCard and SummaryBanner components.
 * 'previous' and 'latest' are received directly from the API.
 * 'deltaPercent' and 'evaluation' are calculated within the component.
 */
export interface CompareRow {
    label: string;
    unit: string;
    previous: number | null;
    latest: number | null;
    higherIsBetter: boolean;
    disclaimer?: string;
}