export interface SingleMetricPeriod {
    patient_value: number | null;
    cohort_avg: number | null;
    cohort_size: number | null;
    percentile: number | null;
    lower_bound?: number | null;
    upper_bound?: number | null;
    lable: string | null;
}

export interface AllMetricsBenchmarkSchema extends SingleMetricPeriod {
    patient_age: number;
    cohort_age_range: string;
    metrics: Record<string, SingleMetricPeriod>;
}