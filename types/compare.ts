export interface SingleMetricPeriod {
    patient_value: number | null;
    cohort_avg: number | null;
    cohort_size: number;
    percentile: number | null;
    lower_bound?: number | null;
    upper_bound?: number | null;
    label: string | null;
}

export interface SingleMetricBenchmark extends SingleMetricPeriod {
    metric: string;
    patient_age: number;
    cohort_age_range: string;
    daily: SingleMetricPeriod;
    weekly: SingleMetricPeriod;
    monthly: SingleMetricPeriod;
    yearly: SingleMetricPeriod;
}